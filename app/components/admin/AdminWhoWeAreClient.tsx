"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import RichTextEditorClient from "./RichTextEditorClient";

type Settings = {
  heroTitle: string; heroAccent: string; heroDescription: string;
  heroImage: string; heroImagePublicId: string;
  mainHeading: string; mainAccent: string;
  paragraph1: string; paragraph2: string;
  contentHtml: string;
};

type Objective = { name: string; desc: string; icon: string };

type ObjSettings = {
  badgeText: string;
  heading: string;
  description: string;
  objectives: Objective[];
};

const EMPTY_SETTINGS: Settings = {
  heroTitle: "", heroAccent: "", heroDescription: "", heroImage: "", heroImagePublicId: "",
  mainHeading: "", mainAccent: "", paragraph1: "", paragraph2: "", contentHtml: "",
};

const EMPTY_OBJ: ObjSettings = { badgeText: "", heading: "", description: "", objectives: [] };

const ICON_OPTIONS = [
  { value: "cog", label: "Cog (Modernization)" },
  { value: "trending-up", label: "Trending Up (Growth)" },
  { value: "grid", label: "Grid (Land)" },
  { value: "beaker", label: "Beaker (Testing)" },
  { value: "users", label: "Users (People)" },
  { value: "truck", label: "Truck (Supply Chain)" },
  { value: "globe", label: "Globe (Export)" },
  { value: "bulb", label: "Bulb (Innovation)" },
  { value: "phone", label: "Phone (Digital)" },
  { value: "sun", label: "Sun (Tourism)" },
  { value: "leaf", label: "Leaf (Nature)" },
  { value: "chart", label: "Chart (Analytics)" },
  { value: "shield", label: "Shield (Quality)" },
  { value: "star", label: "Star (Excellence)" },
  { value: "lightning", label: "Lightning (Energy)" },
];

async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", "who-we-are");
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Upload failed");
  return { url: json.url, publicId: json.public_id };
}

export default function AdminWhoWeAreClient() {
  const [settings, setSettings] = useState<Settings>(EMPTY_SETTINGS);
  const [objSettings, setObjSettings] = useState<ObjSettings>(EMPTY_OBJ);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/about/who-we-are").then((r) => r.json()),
      fetch("/api/admin/about/strategic-objectives").then((r) => r.json()),
    ])
      .then(([wwa, obj]) => {
        setSettings({ ...EMPTY_SETTINGS, ...wwa.settings });
        setObjSettings({ ...EMPTY_OBJ, ...obj.settings });
      })
      .catch((e) => toast.error(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  async function onHeroImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { url, publicId } = await uploadToCloudinary(file);
      setSettings((s) => ({ ...s, heroImage: url, heroImagePublicId: publicId }));
      toast.success("Uploaded — remember to save");
    } catch (err: any) { toast.error(err.message); } finally { setUploading(false); }
  }

  async function save() {
    setSaving(true);
    try {
      const [res1, res2] = await Promise.all([
        fetch("/api/admin/about/who-we-are", {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(settings),
        }),
        fetch("/api/admin/about/strategic-objectives", {
          method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(objSettings),
        }),
      ]);
      const [j1, j2] = await Promise.all([res1.json(), res2.json()]);
      if (!res1.ok) throw new Error(j1.message || "Failed to save");
      if (!res2.ok) throw new Error(j2.message || "Failed to save objectives");
      setSettings({ ...EMPTY_SETTINGS, ...j1.settings });
      setObjSettings({ ...EMPTY_OBJ, ...j2.settings });
      toast.success("Saved");
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  }

  const set = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setSettings((s) => ({ ...s, [key]: e.target.value }));

  function addObjective() {
    setObjSettings((s) => ({ ...s, objectives: [...s.objectives, { name: "", desc: "", icon: "cog" }] }));
  }

  function removeObjective(i: number) {
    setObjSettings((s) => ({ ...s, objectives: s.objectives.filter((_, idx) => idx !== i) }));
  }

  function moveUp(i: number) {
    if (i === 0) return;
    setObjSettings((s) => {
      const arr = [...s.objectives];
      [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
      return { ...s, objectives: arr };
    });
  }

  function moveDown(i: number) {
    setObjSettings((s) => {
      if (i >= s.objectives.length - 1) return s;
      const arr = [...s.objectives];
      [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
      return { ...s, objectives: arr };
    });
  }

  function updateObjective(i: number, key: keyof Objective, value: string) {
    setObjSettings((s) => {
      const arr = [...s.objectives];
      arr[i] = { ...arr[i], [key]: value };
      return { ...s, objectives: arr };
    });
  }

  if (loading) return <div className="text-sm text-slate-500 py-8">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Who We Are</h1>
        <p className="text-sm text-slate-500 mt-1">Edit the hero banner, intro section, and strategic objectives for the "Who We Are" page.</p>
      </div>

      {/* Hero */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Hero Banner</h2>
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
          <div>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {settings.heroImage ? <img src={settings.heroImage} alt="Hero" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-xs text-slate-400">No image</div>}
              {uploading && <div className="absolute inset-0 grid place-items-center bg-white/60 text-xs font-medium">Uploading…</div>}
            </div>
            <label className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={onHeroImage} disabled={uploading} />
              {settings.heroImage ? "Change photo" : "Upload photo"}
            </label>
          </div>
          <div className="space-y-3">
            <Field label="Title" value={settings.heroTitle} onChange={set("heroTitle")} placeholder="Who We Are" />
            <Field label="Highlighted word (optional)" value={settings.heroAccent} onChange={set("heroAccent")} placeholder="" />
            <Field label="Description" value={settings.heroDescription} onChange={set("heroDescription")} placeholder="One progressive Nepalese platform…" textarea />
          </div>
        </div>
      </section>

      {/* Intro section */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Intro Section</h2>
        <Field label="Main Heading" value={settings.mainHeading} onChange={set("mainHeading")} placeholder="An integrated agricultural enterprise…" />
        <Field label="Highlighted accent in heading (optional)" value={settings.mainAccent} onChange={set("mainAccent")} placeholder="self-reliant Nepal" />
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">Body Content</label>
          <RichTextEditorClient
            value={settings.contentHtml || `<p>${settings.paragraph1}</p><p>${settings.paragraph2}</p>`}
            onChange={(html) => setSettings((s) => ({ ...s, contentHtml: html }))}
          />
        </div>
      </section>

      {/* Strategic Objectives */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Strategic Objectives</h2>

        <Field label="Badge Text (small label above heading)" value={objSettings.badgeText} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setObjSettings((s) => ({ ...s, badgeText: e.target.value }))} placeholder="Our Blueprint" />
        <Field label="Section Heading" value={objSettings.heading} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setObjSettings((s) => ({ ...s, heading: e.target.value }))} placeholder="Ten Strategic Objectives" />
        <Field label="Section Description" value={objSettings.description} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setObjSettings((s) => ({ ...s, description: e.target.value }))} placeholder="The commitments that guide every decision…" textarea />

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Objectives ({objSettings.objectives.length})</span>
            <button
              type="button"
              onClick={addObjective}
              className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
            >
              + Add Objective
            </button>
          </div>

          {objSettings.objectives.length === 0 && (
            <p className="text-sm text-slate-400 py-4 text-center">No objectives yet. Click "Add Objective" to get started.</p>
          )}

          {objSettings.objectives.map((obj, i) => (
            <div key={i} className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-emerald-600">#{i + 1}</span>
                <div className="flex items-center gap-1 ml-auto">
                  <button type="button" onClick={() => moveUp(i)} disabled={i === 0} className="rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors" title="Move up">↑</button>
                  <button type="button" onClick={() => moveDown(i)} disabled={i === objSettings.objectives.length - 1} className="rounded p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors" title="Move down">↓</button>
                  <button type="button" onClick={() => removeObjective(i)} className="rounded p-1 text-red-400 hover:text-red-600 transition-colors" title="Remove">✕</button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_180px] gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Name</label>
                  <input type="text" value={obj.name} onChange={(e) => updateObjective(i, "name", e.target.value)} placeholder="Modernization" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Short Description</label>
                  <input type="text" value={obj.desc} onChange={(e) => updateObjective(i, "desc", e.target.value)} placeholder="Mechanised, ICT-led smart farming." className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Icon</label>
                  <select value={obj.icon} onChange={(e) => updateObjective(i, "icon", e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none bg-white">
                    {ICON_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}

          {objSettings.objectives.length > 0 && (
            <button type="button" onClick={addObjective} className="w-full rounded-xl border border-dashed border-slate-200 py-2.5 text-xs font-semibold text-slate-400 hover:border-emerald-300 hover:text-emerald-600 transition-colors">
              + Add another objective
            </button>
          )}
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
