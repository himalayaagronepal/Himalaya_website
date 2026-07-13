"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

type Member = { _id?: string; name: string; role: string; image: string; imagePublicId: string; phone: string; email: string; address: string; };
type Settings = {
  heroTitle: string; heroAccent: string; heroTag: string; heroDescription: string;
  heroImage: string; heroImagePublicId: string;
  eyebrow: string; sectionTitle: string; sectionDescription: string;
  members: Member[];
};

const EMPTY_MEMBER: Member = { name: "", role: "Officer", image: "", imagePublicId: "", phone: "", email: "", address: "" };
const EMPTY: Settings = {
  heroTitle: "", heroAccent: "", heroTag: "", heroDescription: "", heroImage: "", heroImagePublicId: "",
  eyebrow: "", sectionTitle: "", sectionDescription: "", members: [],
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

export default function AdminExecutiveTeamClient() {
  const [settings, setSettings] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const [memberImgUploading, setMemberImgUploading] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetch("/api/admin/about/executive-team")
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
      const { url, publicId } = await uploadToCloudinary(file, "executive-hero");
      setSettings((s) => ({ ...s, heroImage: url, heroImagePublicId: publicId }));
      toast.success("Uploaded — remember to save");
    } catch (err: any) { toast.error(err.message); } finally { setHeroUploading(false); }
  }

  async function onMemberImage(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    setMemberImgUploading((p) => ({ ...p, [idx]: true }));
    try {
      const { url, publicId } = await uploadToCloudinary(file, "executive-members");
      setSettings((s) => {
        const members = [...s.members];
        members[idx] = { ...members[idx], image: url, imagePublicId: publicId };
        return { ...s, members };
      });
      toast.success("Uploaded — remember to save");
    } catch (err: any) { toast.error(err.message); } finally { setMemberImgUploading((p) => ({ ...p, [idx]: false })); }
  }

  function setMember(idx: number, key: keyof Member, val: string) {
    setSettings((s) => {
      const members = [...s.members];
      members[idx] = { ...members[idx], [key]: val };
      return { ...s, members };
    });
  }

  function addMember() { setSettings((s) => ({ ...s, members: [...s.members, { ...EMPTY_MEMBER }] })); }
  function removeMember(idx: number) { setSettings((s) => ({ ...s, members: s.members.filter((_, i) => i !== idx) })); }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/about/executive-team", {
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
        <h1 className="text-2xl font-bold text-slate-900">Executive Team</h1>
        <p className="text-sm text-slate-500 mt-1">Edit the hero, section headings, and executive member profiles.</p>
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
            <Field label="Title" value={settings.heroTitle} onChange={set("heroTitle")} placeholder="Executive Team" />
            <Field label="Highlighted word (accent — must appear in the title)" value={settings.heroAccent} onChange={set("heroAccent")} placeholder="Team" />
            <Field label="Description" value={settings.heroDescription} onChange={set("heroDescription")} placeholder="" textarea />
          </div>
        </div>
      </section>

      {/* Section labels */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Section Labels</h2>
        <Field label="Eyebrow" value={settings.eyebrow} onChange={set("eyebrow")} placeholder="Management Grid" />
        <Field label="Section Title" value={settings.sectionTitle} onChange={set("sectionTitle")} placeholder="Executive leadership" />
        <Field label="Section Description" value={settings.sectionDescription} onChange={set("sectionDescription")} placeholder="" textarea />
      </section>

      {/* Members */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Executive Members <span className="text-slate-400">({settings.members.length})</span>
          </h2>
          <button type="button" onClick={addMember} className="rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white hover:bg-cyan-700 transition-colors">
            + Add member
          </button>
        </div>
        {settings.members.length === 0
          ? <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-500">No members yet. Click "Add member" to start.</div>
          : settings.members.map((m, idx) => (
            <div key={idx} className="rounded-xl border border-slate-200 p-4 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-slate-500">Member {idx + 1}</span>
                <button type="button" onClick={() => removeMember(idx)} className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors">Remove</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4">
                <div>
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                    {m.image ? <img src={m.image} alt={m.name} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-slate-400">No photo</div>}
                    {memberImgUploading[idx] && <div className="absolute inset-0 grid place-items-center bg-white/60 text-xs">Uploading…</div>}
                  </div>
                  <label className="mt-1.5 inline-flex w-full items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => onMemberImage(e, idx)} disabled={!!memberImgUploading[idx]} />
                    {m.image ? "Change" : "Upload"}
                  </label>
                </div>
                <div className="space-y-2">
                  {(["name","role","phone","email","address"] as (keyof Member)[]).map((key) => (
                    <div key={key}>
                      <label className="block text-[11px] font-medium text-slate-500 mb-0.5 capitalize">{key}</label>
                      <input type="text" value={m[key] as string} onChange={(e) => setMember(idx, key, e.target.value)} className="w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-800 focus:border-cyan-400 focus:outline-none" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))
        }
      </section>

      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder, textarea, rows }: { label: string; value: string; onChange: any; placeholder?: string; textarea?: boolean; rows?: number }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {textarea
        ? <textarea rows={rows || 3} value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none resize-y" />
        : <input type="text" value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none" />}
    </div>
  );
}
