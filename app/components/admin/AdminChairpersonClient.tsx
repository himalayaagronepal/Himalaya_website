"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import RichTextEditorClient from "./RichTextEditorClient";

type Settings = {
  name: string;
  role: string;
  subRole: string;
  cardTitle: string;
  image: string;
  imagePublicId: string;
  contentHtml: string;
};

const EMPTY: Settings = {
  name: "", role: "", subRole: "", cardTitle: "", image: "", imagePublicId: "", contentHtml: "",
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

export default function AdminChairpersonClient() {
  const [settings, setSettings] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imgUploading, setImgUploading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/home/chairperson")
      .then((r) => r.json())
      .then((j) => setSettings({ ...EMPTY, ...j.settings }))
      .catch((e) => toast.error(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  async function onPortraitChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    setImgUploading(true);
    try {
      const { url, publicId } = await uploadToCloudinary(file, "chairperson");
      setSettings((s) => ({ ...s, image: url, imagePublicId: publicId }));
      toast.success("Portrait uploaded — remember to save");
    } catch (err: any) { toast.error(err.message); } finally { setImgUploading(false); }
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/home/chairperson", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save");
      setSettings({ ...EMPTY, ...json.settings });
      toast.success("Saved");
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  }

  if (loading) return <div className="text-sm text-slate-500 py-8">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Message From The Chairperson</h1>
        <p className="text-sm text-slate-500 mt-1">Edit the hero banner and the chairperson message shown on the home page.</p>
      </div>

      {/* Chairperson details */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Chairperson Details</h2>
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
          <div>
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {settings.image
                ? <img src={settings.image} alt="Portrait" className="h-full w-full object-cover" />
                : <div className="grid h-full place-items-center text-xs text-slate-400">No portrait</div>}
              {imgUploading && <div className="absolute inset-0 grid place-items-center bg-white/60 text-xs font-medium">Uploading…</div>}
            </div>
            <label className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={onPortraitChange} disabled={imgUploading} />
              {settings.image ? "Change portrait" : "Upload portrait"}
            </label>
          </div>
          <div className="space-y-3">
            <Field label="Full Name" value={settings.name} onChange={(e) => setSettings((s) => ({ ...s, name: e.target.value }))} placeholder="Prof. Dr. Chandika Pandit" />
            <Field label="Role" value={settings.role} onChange={(e) => setSettings((s) => ({ ...s, role: e.target.value }))} placeholder="Chairperson" />
            <Field label="Sub Role / Credentials" value={settings.subRole} onChange={(e) => setSettings((s) => ({ ...s, subRole: e.target.value }))} placeholder="OB/GYN · Gandaki Medical College" />
            <Field label="Card Title (on image nameplate)" value={settings.cardTitle} onChange={(e) => setSettings((s) => ({ ...s, cardTitle: e.target.value }))} placeholder="Chairperson" />
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
