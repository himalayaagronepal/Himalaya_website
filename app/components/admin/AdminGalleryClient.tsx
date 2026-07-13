"use client";

import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import GalleryCarousel from "../GalleryCarousel";
import SubHeroSection from "../SubHeroSection";
import { browserSafeVideoUrl } from "../../../lib/videoDelivery";

type GalleryItem = {
  _id: string;
  url: string;
  publicId: string;
  mediaType: "image" | "video";
  caption: string;
  order: number;
  createdAt: string | null;
};

type HeroSettings = {
  heroTitle: string;
  heroAccent: string;
  heroDescription: string;
  heroImage: string;
  heroImagePublicId: string;
  carouselLabel: string;
  carouselTitle: string;
  carouselDescription: string;
};

// Cloudinary free-plan hard cap per video file. Bigger files are compressed
// in the browser first so any size can be added to the gallery.
const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024;
// Compression target, with headroom under the Cloudinary cap.
const COMPRESS_TARGET_BYTES = 85 * 1024 * 1024;
// Cloudinary chunked-upload parts must be >= 5 MB (except the last one).
const UPLOAD_CHUNK_BYTES = 20 * 1024 * 1024;

// Re-encodes an oversized video in the browser (WebCodecs via mediabunny) to
// H.264/MP4 at <=1080p, budgeting the bitrate so the result lands under the
// Cloudinary cap regardless of how long the video is.
async function compressVideo(file: File, onStatus: (s: string) => void): Promise<Blob> {
  if (typeof VideoEncoder === "undefined") {
    throw new Error(
      `"${file.name}" is over 100 MB and this browser can't compress videos. Use Chrome or Edge, or compress it manually first.`
    );
  }
  const { ALL_FORMATS, BlobSource, BufferTarget, Conversion, Input, Mp4OutputFormat, Output } = await import("mediabunny");

  const input = new Input({ formats: ALL_FORMATS, source: new BlobSource(file) });
  const duration = await input.computeDuration();
  const videoTrack = await input.getPrimaryVideoTrack();
  // Cap at 1080p but never upscale.
  const height = Math.min(1080, videoTrack?.displayHeight || 1080);
  // ~320 kbps allowance for the (passed-through) audio track, which keeps its
  // original bitrate — phone recordings are typically 128-256 kbps AAC.
  const videoBitrate = Math.max(
    400_000,
    Math.min(6_000_000, Math.floor((COMPRESS_TARGET_BYTES * 8) / Math.max(duration, 1)) - 320_000)
  );

  const output = new Output({ format: new Mp4OutputFormat(), target: new BufferTarget() });
  const conversion = await Conversion.init({
    input,
    output,
    video: { codec: "avc", height, bitrate: videoBitrate, forceTranscode: true },
    // Audio is intentionally left to mediabunny: it copies the original track
    // when MP4-compatible and only re-encodes (or drops) it when it must.
  });
  conversion.onProgress = (p) => onStatus(`Compressing… ${Math.round(p * 100)}%`);
  await conversion.execute();
  const buffer = (output.target as InstanceType<typeof BufferTarget>).buffer;
  if (!buffer) throw new Error("Video compression produced no output");
  return new Blob([buffer], { type: "video/mp4" });
}

// Uploads a video straight from the browser to Cloudinary using their
// chunked-upload protocol, authorized by a server-issued signature.
// Proxying video bytes through our own API truncated large files (the body
// stream ended early and the partial file got stored as "complete").
async function uploadVideoDirect(file: File, onStatus: (s: string) => void): Promise<{ url: string; publicId: string }> {
  let payload: Blob = file;
  if (file.size > MAX_VIDEO_SIZE_BYTES) {
    onStatus(`Compressing "${file.name}"…`);
    payload = await compressVideo(file, onStatus);
    if (payload.size > MAX_VIDEO_SIZE_BYTES) {
      throw new Error(`"${file.name}" is still over 100 MB after compression — please shorten it and try again.`);
    }
  }

  const sigRes = await fetch("/api/admin/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: "gallery" }),
  });
  const sig = await sigRes.json().catch(() => ({}));
  if (!sigRes.ok) throw new Error(sig.message || "Could not authorize the upload");

  const endpoint = `https://api.cloudinary.com/v1_1/${sig.cloudName}/video/upload`;
  const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  let json: any = null;
  for (let start = 0; start < payload.size; start += UPLOAD_CHUNK_BYTES) {
    const end = Math.min(start + UPLOAD_CHUNK_BYTES, payload.size);
    onStatus(`Uploading… ${Math.round((start / payload.size) * 100)}%`);
    const fd = new FormData();
    fd.append("file", payload.slice(start, end));
    fd.append("api_key", sig.apiKey);
    fd.append("timestamp", String(sig.timestamp));
    fd.append("signature", sig.signature);
    fd.append("folder", sig.folder);
    fd.append("eager", sig.eager);
    fd.append("eager_async", "true");
    const res = await fetch(endpoint, {
      method: "POST",
      // Single-chunk uploads don't need the chunked protocol headers.
      headers:
        payload.size > UPLOAD_CHUNK_BYTES
          ? {
              "X-Unique-Upload-Id": uploadId,
              "Content-Range": `bytes ${start}-${end - 1}/${payload.size}`,
            }
          : undefined,
      body: fd,
    });
    json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.error?.message || "Video upload failed");
  }
  return { url: json.secure_url, publicId: json.public_id };
}

async function uploadToCloudinary(
  file: File,
  resourceType: "image" | "video" = "image",
  onStatus: (s: string) => void = () => {}
): Promise<{ url: string; publicId: string }> {
  if (resourceType === "video") {
    return uploadVideoDirect(file, onStatus);
  }

  // Images go through the standard multipart route (small files, no body-size issue).
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", "gallery");
  fd.append("resource_type", resourceType);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || "Upload failed");
  return { url: json.url, publicId: json.public_id };
}

export default function AdminGalleryClient() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);
  const replaceVideoInputRef = useRef<HTMLInputElement | null>(null);
  const [replaceTarget, setReplaceTarget] = useState<string | null>(null);
  const [replaceTargetType, setReplaceTargetType] = useState<"image" | "video">("image");

  // Hero editor state
  const [hero, setHero] = useState<HeroSettings>({
    heroTitle: "",
    heroAccent: "",
    heroDescription: "",
    heroImage: "",
    heroImagePublicId: "",
    carouselLabel: "",
    carouselTitle: "",
    carouselDescription: "",
  });
  const [heroUploading, setHeroUploading] = useState(false);
  const [heroSaving, setHeroSaving] = useState(false);

  async function loadImages() {
    try {
      const res = await fetch("/api/admin/gallery");
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load gallery");
      setItems(json.items || []);
    } catch (err: any) {
      toast.error(err.message || "Failed to load gallery");
    } finally {
      setLoading(false);
    }
  }

  async function loadHero() {
    try {
      const res = await fetch("/api/admin/gallery/hero");
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to load hero");
      setHero(json.settings);
    } catch (err: any) {
      toast.error(err.message || "Failed to load hero");
    }
  }

  useEffect(() => {
    loadImages();
    loadHero();
  }, []);

  // ---- Hero handlers ----
  async function onHeroImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setHeroUploading(true);
    try {
      const { url, publicId } = await uploadToCloudinary(file);
      setHero((h) => ({ ...h, heroImage: url, heroImagePublicId: publicId }));
      toast.success("Hero image uploaded — remember to save");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setHeroUploading(false);
    }
  }

  async function saveHero() {
    setHeroSaving(true);
    try {
      const res = await fetch("/api/admin/gallery/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(hero),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save hero");
      setHero(json.settings);
      toast.success("Hero saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save hero");
    } finally {
      setHeroSaving(false);
    }
  }

  // ---- Gallery image handlers ----
  async function onAddFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !files.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const { url, publicId } = await uploadToCloudinary(file, "image");
        const res = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, publicId, mediaType: "image" }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to save image");
      }
      toast.success("Image(s) added to gallery");
      await loadImages();
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function onAddVideos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !files.length) return;
    setVideoUploading(true);
    const tid = toast.loading("Preparing video upload…");
    try {
      const list = Array.from(files);
      for (let i = 0; i < list.length; i++) {
        const label = list.length > 1 ? `Video ${i + 1}/${list.length}: ` : "";
        const { url, publicId } = await uploadToCloudinary(list[i], "video", (s) =>
          toast.update(tid, { render: label + s })
        );
        const res = await fetch("/api/admin/gallery", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, publicId, mediaType: "video" }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Failed to save video");
      }
      toast.update(tid, { render: "Video(s) added to gallery", type: "success", isLoading: false, autoClose: 4000 });
      await loadImages();
    } catch (err: any) {
      toast.update(tid, { render: err.message || "Upload failed", type: "error", isLoading: false, autoClose: 8000 });
    } finally {
      setVideoUploading(false);
      e.target.value = "";
    }
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this image? It will also be removed from Cloudinary.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || "Failed to delete");
      toast.success("Image deleted");
      setItems((prev) => prev.filter((it) => it._id !== id));
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    } finally {
      setBusyId(null);
    }
  }

  function triggerReplace(id: string, mediaType: "image" | "video") {
    setReplaceTarget(id);
    setReplaceTargetType(mediaType);
    if (mediaType === "video") {
      replaceVideoInputRef.current?.click();
    } else {
      replaceInputRef.current?.click();
    }
  }

  async function onReplaceFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const id = replaceTarget;
    const mediaType = replaceTargetType;
    e.target.value = "";
    if (!file || !id) return;
    setBusyId(id);
    const tid = toast.loading(`Replacing ${mediaType}…`);
    try {
      const { url, publicId } = await uploadToCloudinary(file, mediaType, (s) =>
        toast.update(tid, { render: s })
      );
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, publicId, mediaType }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to replace");
      toast.update(tid, {
        render: `${mediaType === "video" ? "Video" : "Image"} replaced`,
        type: "success",
        isLoading: false,
        autoClose: 4000,
      });
      setItems((prev) => prev.map((it) => (it._id === id ? json.item : it)));
    } catch (err: any) {
      toast.update(tid, { render: err.message || "Replace failed", type: "error", isLoading: false, autoClose: 8000 });
    } finally {
      setBusyId(null);
      setReplaceTarget(null);
    }
  }

  async function saveCaption(id: string, caption: string) {
    try {
      const res = await fetch(`/api/admin/gallery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save caption");
      setItems((prev) => prev.map((it) => (it._id === id ? json.item : it)));
      toast.success("Caption saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save caption");
    }
  }

  const previewImages = items.map((it) => ({
    src: it.mediaType === "video" ? browserSafeVideoUrl(it.url) : it.url,
    caption: it.caption || undefined,
    mediaType: it.mediaType,
  }));

  return (
    <div className="space-y-8">
      <input ref={replaceInputRef} type="file" accept="image/*" className="hidden" onChange={onReplaceFile} />
      <input ref={replaceVideoInputRef} type="file" accept="video/*" className="hidden" onChange={onReplaceFile} />

      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Gallery</h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage the hero banner and photos shown on the public{" "}
          <span className="font-medium text-slate-700">/gallery</span> page. Images are stored on Cloudinary.
        </p>
      </div>

      {/* ── Hero editor ───────────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-4">Hero section</h2>
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          {/* Hero image */}
          <div>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {hero.heroImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hero.heroImage} alt="Hero" className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-xs text-slate-400">No image</div>
              )}
              {heroUploading && (
                <div className="absolute inset-0 grid place-items-center bg-white/60 text-xs font-medium text-slate-600">
                  Uploading…
                </div>
              )}
            </div>
            <label className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={onHeroImage} disabled={heroUploading} />
              {hero.heroImage ? "Change photo" : "Upload photo"}
            </label>
          </div>

          {/* Hero text fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Title</label>
              <input
                type="text"
                value={hero.heroTitle}
                onChange={(e) => setHero((h) => ({ ...h, heroTitle: e.target.value }))}
                placeholder="Our Gallery"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Highlighted word <span className="text-slate-400">(optional — shown in green inside the title)</span>
              </label>
              <input
                type="text"
                value={hero.heroAccent}
                onChange={(e) => setHero((h) => ({ ...h, heroAccent: e.target.value }))}
                placeholder="Gallery"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Description</label>
              <textarea
                value={hero.heroDescription}
                onChange={(e) => setHero((h) => ({ ...h, heroDescription: e.target.value }))}
                rows={3}
                placeholder="Highlights from our farms, facilities, field operations…"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none resize-y"
              />
            </div>

            {/* Carousel section text */}
            <div className="pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Carousel section</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Label <span className="text-slate-400">(small eyebrow text above heading)</span>
                  </label>
                  <input
                    type="text"
                    value={hero.carouselLabel}
                    onChange={(e) => setHero((h) => ({ ...h, carouselLabel: e.target.value }))}
                    placeholder="Photo Carousel"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Heading</label>
                  <input
                    type="text"
                    value={hero.carouselTitle}
                    onChange={(e) => setHero((h) => ({ ...h, carouselTitle: e.target.value }))}
                    placeholder="Swipe, click, and explore"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Sub-description</label>
                  <textarea
                    value={hero.carouselDescription}
                    onChange={(e) => setHero((h) => ({ ...h, carouselDescription: e.target.value }))}
                    rows={2}
                    placeholder="Click any photo to open it in a fullscreen lightbox…"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none resize-y"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={saveHero}
                disabled={heroSaving || heroUploading}
                className="rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors disabled:opacity-60"
              >
                {heroSaving ? "Saving…" : "Save hero"}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Gallery images ────────────────────────────────────────── */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Gallery images {items.length > 0 && <span className="text-slate-400">({items.length})</span>}
          </h2>
          <div className="flex gap-2">
            <label className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer hover:bg-cyan-700 transition-colors">
              <input type="file" className="hidden" multiple accept="image/*" onChange={onAddFiles} disabled={uploading || videoUploading} />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              {uploading ? "Uploading…" : "Add images"}
            </label>
            <label className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white cursor-pointer hover:bg-violet-700 transition-colors">
              <input type="file" className="hidden" multiple accept="video/*" onChange={onAddVideos} disabled={uploading || videoUploading} />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5,3 19,12 5,21" />
              </svg>
              {videoUploading ? "Uploading…" : "Add videos"}
            </label>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-slate-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center">
            <p className="text-sm text-slate-500">No images yet. Click “Add images” to upload your first photo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((it) => (
              <div key={it._id} className="group rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
                <div className="relative aspect-[4/3] bg-slate-100">
                  {it.mediaType === "video" ? (
                    <video
                      src={browserSafeVideoUrl(it.url)}
                      muted
                      playsInline
                      preload="metadata"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={it.url} alt={it.caption || "Gallery image"} className="w-full h-full object-cover" />
                  )}
                  {it.mediaType === "video" && (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                          <polygon points="5,3 19,12 5,21" />
                        </svg>
                      </div>
                    </div>
                  )}
                  {it.mediaType === "video" && (
                    <div className="absolute top-1.5 left-1.5 rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Video
                    </div>
                  )}
                  {busyId === it._id && (
                    <div className="absolute inset-0 grid place-items-center bg-white/60 text-xs font-medium text-slate-600">
                      Working…
                    </div>
                  )}
                </div>
                <div className="p-2.5 space-y-2">
                  <input
                    type="text"
                    defaultValue={it.caption}
                    placeholder="Caption (optional)"
                    onBlur={(e) => {
                      if (e.target.value.trim() !== (it.caption || "")) saveCaption(it._id, e.target.value.trim());
                    }}
                    className="w-full rounded-md border border-slate-200 px-2 py-1.5 text-xs text-slate-700 focus:border-cyan-400 focus:outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => triggerReplace(it._id, it.mediaType)}
                      disabled={busyId === it._id}
                      className="flex-1 rounded-md bg-slate-100 px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors disabled:opacity-50"
                    >
                      Replace
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(it._id)}
                      disabled={busyId === it._id}
                      className="flex-1 rounded-md bg-red-50 px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Live preview — mirrors the public /gallery page ──────────── */}
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 mb-3">
          Preview <span className="text-slate-400">— how it looks on /gallery</span>
        </h2>
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {/* Dynamic hero */}
          <SubHeroSection
            title={hero.heroTitle || "Our Gallery"}
            accent={hero.heroAccent || undefined}
            description={hero.heroDescription || undefined}
            image={hero.heroImage || "/hero_images/second_image.jpeg"}
          />

          {/* Gallery carousel */}
          <section className="py-12 sm:py-16">
            <div className="mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-10 xl:px-12">
              <div className="mb-8 sm:mb-12 flex flex-col gap-3 text-center">
                <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.35em] text-emerald-700">
                  {hero.carouselLabel || "Photo Carousel"}
                </p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[2.75rem] font-bold tracking-tight text-slate-900 px-2">
                  {hero.carouselTitle || "Swipe, click, and explore"}
                </h2>
                <p className="mx-auto max-w-2xl text-sm sm:text-base text-slate-500 leading-relaxed">
                  {hero.carouselDescription || "Click any photo to open it in a fullscreen lightbox. Use the arrows, swipe, or your keyboard to navigate."}
                </p>
              </div>

              {previewImages.length > 0 ? (
                <GalleryCarousel images={previewImages} interval={5000} />
              ) : (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-12 text-center text-slate-500">
                  Add images above to see the live preview.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
