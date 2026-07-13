"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import RichTextEditorClient from "./RichTextEditorClient";

type Settings = {
  heroTitle: string; heroAccent: string; heroDescription: string;
  heroImage: string; heroImagePublicId: string;
  mdName: string; mdRole: string; mdImage: string; mdImagePublicId: string;
  eyebrow: string; heading: string; contentHtml: string;
};

const EMPTY: Settings = {
  heroTitle: "", heroAccent: "", heroDescription: "", heroImage: "", heroImagePublicId: "",
  mdName: "", mdRole: "", mdImage: "", mdImagePublicId: "", eyebrow: "", heading: "", contentHtml: "",
};

async function uploadToCloudinary(file: File, folder: string): Promise<{ url: string; publicId: string }> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Upload failed");
  return { url: json.url, publicId: json.public_id };
}

export default function AdminHearFromMDClient() {
  const [settings, setSettings] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const [mdImgUploading, setMdImgUploading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/about/hear-from-md")
      .then((r) => r.json())
      .then((j) => setSettings({ ...EMPTY, ...j.settings }))
      .catch((e) => toast.error(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  async function onHeroImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    setHeroUploading(true);
    try {
      const { url, publicId } = await uploadToCloudinary(file, "hear-from-md-hero");
      setSettings((s) => ({ ...s, heroImage: url, heroImagePublicId: publicId }));
      toast.success("Uploaded — remember to save");
    } catch (err: any) { toast.error(err.message); } finally { setHeroUploading(false); }
  }

  async function onMDImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    setMdImgUploading(true);
    try {
      const { url, publicId } = await uploadToCloudinary(file, "managing-director");
      setSettings((s) => ({ ...s, mdImage: url, mdImagePublicId: publicId }));
      toast.success("Uploaded — remember to save");
    } catch (err: any) { toast.error(err.message); } finally { setMdImgUploading(false); }
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/about/hear-from-md", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save");
      setSettings({ ...EMPTY, ...json.settings });
      toast.success("Saved");
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  }

  const set = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setSettings((s) => ({ ...s, [key]: e.target.value }));

  if (loading) return <div className="text-sm text-slate-500 py-8">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Hear From the MD</h1>
        <p className="text-sm text-slate-500 mt-1">Edit the hero banner and MD message for the Hear From MD page.</p>
      </div>

      {/* Hero */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Hero Banner</h2>
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
          <div>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {settings.heroImage ? <img src={settings.heroImage} alt="Hero" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-slate-400">No image</div>}
              {heroUploading && <div className="absolute inset-0 grid place-items-center bg-white/60 text-xs font-medium">Uploading…</div>}
            </div>
            <label className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={onHeroImage} disabled={heroUploading} />
              {settings.heroImage ? "Change photo" : "Upload photo"}
            </label>
          </div>
          <div className="space-y-3">
            <Field label="Title" value={settings.heroTitle} onChange={set("heroTitle")} placeholder="Hear From the MD" />
            <Field label="Highlighted word (optional)" value={settings.heroAccent} onChange={set("heroAccent")} placeholder="MD" />
            <Field label="Description" value={settings.heroDescription} onChange={set("heroDescription")} placeholder="" textarea />
          </div>
        </div>
      </section>

      {/* MD Details */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Managing Director Details</h2>
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
          <div>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {settings.mdImage ? <img src={settings.mdImage} alt="MD" className="h-full w-full object-cover object-top" /> : <div className="grid h-full place-items-center text-xs text-slate-400">No portrait</div>}
              {mdImgUploading && <div className="absolute inset-0 grid place-items-center bg-white/60 text-xs font-medium">Uploading…</div>}
            </div>
            <label className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={onMDImage} disabled={mdImgUploading} />
              {settings.mdImage ? "Change portrait" : "Upload portrait"}
            </label>
          </div>
          <div className="space-y-3">
            <Field label="Name" value={settings.mdName} onChange={set("mdName")} placeholder="Dolindra Paudel Sharma" />
            <Field label="Role" value={settings.mdRole} onChange={set("mdRole")} placeholder="Managing Director" />
            <Field label="Eyebrow text" value={settings.eyebrow} onChange={set("eyebrow")} placeholder="Message From the Managing Director" />
            <Field label="Heading" value={settings.heading} onChange={set("heading")} placeholder="Building a modern, resilient Nepalese agriculture" />
          </div>
        </div>
      </section>

      {/* Message — rich text editor */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Message</h2>
        <RichTextEditorClient
          value={settings.contentHtml}
          onChange={(html) => setSettings((s) => ({ ...s, contentHtml: html }))}
        />
      </section>

      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, textarea }: { label: string; value: string; onChange: any; placeholder?: string; textarea?: boolean }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {textarea
        ? <textarea rows={3} value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none resize-y" />
        : <input type="text" value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none" />}
    </div>
  );
}
