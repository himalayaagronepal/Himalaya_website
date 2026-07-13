"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

type Slide = {
  image: string;
  imagePublicId: string;
  mobileImage: string;
  mobileImagePublicId: string;
  alt: string;
};

type Feature = {
  title: string;
  desc: string;
};

type Settings = {
  headingMain: string;
  headingAccent: string;
  paragraph: string;
  primaryButtonLabel: string;
  primaryButtonHref: string;
  secondaryButtonLabel: string;
  secondaryButtonHref: string;
  slides: Slide[];
  features: Feature[];
};

const EMPTY: Settings = {
  headingMain: "",
  headingAccent: "",
  paragraph: "",
  primaryButtonLabel: "",
  primaryButtonHref: "",
  secondaryButtonLabel: "",
  secondaryButtonHref: "",
  slides: [],
  features: [],
};

const EMPTY_SLIDE: Slide = { image: "", imagePublicId: "", mobileImage: "", mobileImagePublicId: "", alt: "" };

async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", "hero");
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Upload failed");
  return { url: json.url, publicId: json.public_id };
}

export default function AdminHeroClient() {
  const [settings, setSettings] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/home/hero")
      .then((r) => r.json())
      .then((j) => setSettings({ ...EMPTY, ...j.settings }))
      .catch((e) => toast.error(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  function updateSlide(index: number, patch: Partial<Slide>) {
    setSettings((s) => ({
      ...s,
      slides: s.slides.map((slide, i) => (i === index ? { ...slide, ...patch } : slide)),
    }));
  }

  function addSlide() {
    setSettings((s) => ({ ...s, slides: [...s.slides, { ...EMPTY_SLIDE }] }));
  }

  function removeSlide(index: number) {
    setSettings((s) => ({ ...s, slides: s.slides.filter((_, i) => i !== index) }));
  }

  function updateFeature(index: number, patch: Partial<Feature>) {
    setSettings((s) => ({
      ...s,
      features: s.features.map((feature, i) => (i === index ? { ...feature, ...patch } : feature)),
    }));
  }

  async function onSlideImageChange(index: number, key: "image" | "mobileImage", e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const uploadKey = `${index}-${key}`;
    setUploadingKey(uploadKey);
    try {
      const { url, publicId } = await uploadToCloudinary(file);
      if (key === "image") updateSlide(index, { image: url, imagePublicId: publicId });
      else updateSlide(index, { mobileImage: url, mobileImagePublicId: publicId });
      toast.success("Image uploaded — remember to save");
    } catch (err: any) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploadingKey(null);
    }
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/home/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save");
      setSettings({ ...EMPTY, ...json.settings });
      toast.success("Saved");
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="text-sm text-slate-500 py-8">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hero Section</h1>
        <p className="text-sm text-slate-500 mt-1">Edit the homepage hero banner — slideshow images, headline, call-to-action buttons, and feature highlights.</p>
      </div>

      {/* Headline & copy */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Headline &amp; Copy</h2>
        <Field label="Heading" value={settings.headingMain} onChange={(e) => setSettings((s) => ({ ...s, headingMain: e.target.value }))} placeholder="From our farms to world market for a" />
        <Field label="Heading Accent (highlighted in green)" value={settings.headingAccent} onChange={(e) => setSettings((s) => ({ ...s, headingAccent: e.target.value }))} placeholder="Sustainable Development" />
        <Field label="Paragraph" value={settings.paragraph} onChange={(e) => setSettings((s) => ({ ...s, paragraph: e.target.value }))} placeholder="We are a modern integrated agro-company…" textarea />
      </section>

      {/* Buttons */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Call-to-Action Buttons</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500">Primary button</p>
            <Field label="Label" value={settings.primaryButtonLabel} onChange={(e) => setSettings((s) => ({ ...s, primaryButtonLabel: e.target.value }))} placeholder="Our Projects" />
            <Field label="Link" value={settings.primaryButtonHref} onChange={(e) => setSettings((s) => ({ ...s, primaryButtonHref: e.target.value }))} placeholder="#integrated-business" />
          </div>
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500">Secondary button</p>
            <Field label="Label" value={settings.secondaryButtonLabel} onChange={(e) => setSettings((s) => ({ ...s, secondaryButtonLabel: e.target.value }))} placeholder="Explore Opportunities" />
            <Field label="Link" value={settings.secondaryButtonHref} onChange={(e) => setSettings((s) => ({ ...s, secondaryButtonHref: e.target.value }))} placeholder="/contact" />
          </div>
        </div>
      </section>

      {/* Slideshow */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Background Slideshow</h2>
          <button type="button" onClick={addSlide} className="text-xs font-medium text-cyan-600 hover:text-cyan-700">+ Add slide</button>
        </div>
        <div className="space-y-5">
          {settings.slides.map((slide, index) => (
            <div key={index} className="rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-500">Slide {index + 1}</p>
                {settings.slides.length > 1 && (
                  <button type="button" onClick={() => removeSlide(index)} className="text-xs font-medium text-red-600 hover:text-red-700">Remove</button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SlideImagePicker
                  label="Desktop image"
                  imageUrl={slide.image}
                  uploading={uploadingKey === `${index}-image`}
                  onChange={(e) => onSlideImageChange(index, "image", e)}
                />
                <SlideImagePicker
                  label="Mobile image (optional)"
                  imageUrl={slide.mobileImage}
                  uploading={uploadingKey === `${index}-mobileImage`}
                  onChange={(e) => onSlideImageChange(index, "mobileImage", e)}
                />
              </div>
              <Field label="Alt text" value={slide.alt} onChange={(e) => updateSlide(index, { alt: e.target.value })} placeholder="Himalaya Agro farm landscape" />
            </div>
          ))}
        </div>
      </section>

      {/* Feature highlights */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Feature Highlights</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {settings.features.map((feature, index) => (
            <div key={index} className="rounded-xl border border-slate-200 p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500">Feature {index + 1}</p>
              <Field label="Title" value={feature.title} onChange={(e) => updateFeature(index, { title: e.target.value })} placeholder="Sustainable Agriculture" />
              <Field label="Description" value={feature.desc} onChange={(e) => updateFeature(index, { desc: e.target.value })} placeholder="High quality production for food security" textarea />
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, textarea }: { label: string; value: string; onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>; placeholder?: string; textarea?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {textarea
        ? <textarea rows={3} value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none resize-y" />
        : <input type="text" value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none" />}
    </div>
  );
}

function SlideImagePicker({ label, imageUrl, uploading, onChange }: { label: string; imageUrl: string; uploading: boolean; onChange: React.ChangeEventHandler<HTMLInputElement> }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
        {imageUrl
          ? <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          : <div className="grid h-full place-items-center text-xs text-slate-400">No image</div>}
        {uploading && <div className="absolute inset-0 grid place-items-center bg-white/60 text-xs font-medium">Uploading…</div>}
      </div>
      <label className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
        <input type="file" accept="image/*" className="hidden" onChange={onChange} disabled={uploading} />
        {imageUrl ? "Change image" : "Upload image"}
      </label>
    </div>
  );
}
