"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

type Stat = { value: string; label: string };

type Settings = {
  heroTitle: string; heroAccent: string; heroDescription: string;
  heroImage: string; heroImagePublicId: string;
  heroStats: Stat[];
  infoCompanyLabel: string; infoHeading: string; infoSubheading: string;
  phones: string[];
  email: string;
  addressLines: string[];
  supportEmail: string; openHours: string;
  mapEmbedUrl: string;
  formHeading: string; formSubheading: string;
};

const EMPTY: Settings = {
  heroTitle: "", heroAccent: "", heroDescription: "", heroImage: "", heroImagePublicId: "",
  heroStats: [{ value: "", label: "" }],
  infoCompanyLabel: "", infoHeading: "", infoSubheading: "",
  phones: [""],
  email: "",
  addressLines: [""],
  supportEmail: "", openHours: "",
  mapEmbedUrl: "",
  formHeading: "", formSubheading: "",
};

async function uploadToCloudinary(file: File): Promise<{ url: string; publicId: string }> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", "contact-hero");
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || "Upload failed");
  return { url: json.url, publicId: json.public_id };
}

export default function AdminContactClient() {
  const [s, setS] = useState<Settings>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/contact")
      .then((r) => r.json())
      .then((j) => setS({ ...EMPTY, ...j.settings }))
      .catch((e) => toast.error(e.message || "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  async function onHeroImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; e.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const { url, publicId } = await uploadToCloudinary(file);
      setS((p) => ({ ...p, heroImage: url, heroImagePublicId: publicId }));
      toast.success("Uploaded — remember to save");
    } catch (err: any) { toast.error(err.message); } finally { setUploading(false); }
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/contact", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to save");
      setS({ ...EMPTY, ...json.settings });
      toast.success("Saved");
    } catch (err: any) { toast.error(err.message); } finally { setSaving(false); }
  }

  // helpers
  const set = (key: keyof Settings) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setS((p) => ({ ...p, [key]: e.target.value }));

  function setPhone(i: number, v: string) { setS((p) => { const a = [...p.phones]; a[i] = v; return { ...p, phones: a }; }); }
  function addPhone() { setS((p) => ({ ...p, phones: [...p.phones, ""] })); }
  function removePhone(i: number) { setS((p) => ({ ...p, phones: p.phones.filter((_, x) => x !== i) })); }

  function setAddr(i: number, v: string) { setS((p) => { const a = [...p.addressLines]; a[i] = v; return { ...p, addressLines: a }; }); }
  function addAddr() { setS((p) => ({ ...p, addressLines: [...p.addressLines, ""] })); }
  function removeAddr(i: number) { setS((p) => ({ ...p, addressLines: p.addressLines.filter((_, x) => x !== i) })); }

  function setStat(i: number, key: "value" | "label", v: string) {
    setS((p) => { const a = [...p.heroStats]; a[i] = { ...a[i], [key]: v }; return { ...p, heroStats: a }; });
  }
  function addStat() { setS((p) => ({ ...p, heroStats: [...p.heroStats, { value: "", label: "" }] })); }
  function removeStat(i: number) { setS((p) => ({ ...p, heroStats: p.heroStats.filter((_, x) => x !== i) })); }

  if (loading) return <div className="text-sm text-slate-500 py-8">Loading…</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Contact Us</h1>
        <p className="text-sm text-slate-500 mt-1">Manage all content on the public Contact page.</p>
      </div>

      {/* ── Hero ─────────────────────────────────── */}
      <Card title="Hero Banner">
        <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-5">
          <div>
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
              {s.heroImage
                ? <img src={s.heroImage} alt="Hero" className="h-full w-full object-cover" />
                : <div className="grid h-full place-items-center text-xs text-slate-400">No image</div>}
              {uploading && <div className="absolute inset-0 grid place-items-center bg-white/60 text-xs font-medium">Uploading…</div>}
            </div>
            <label className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors">
              <input type="file" accept="image/*" className="hidden" onChange={onHeroImage} disabled={uploading} />
              {s.heroImage ? "Change photo" : "Upload photo"}
            </label>
          </div>
          <div className="space-y-3">
            <Field label="Title" value={s.heroTitle} onChange={set("heroTitle")} placeholder="Contact Us" />
            <Field label="Highlighted word (optional)" value={s.heroAccent} onChange={set("heroAccent")} placeholder="" />
            <Field label="Description" value={s.heroDescription} onChange={set("heroDescription")} placeholder="Connect with our team…" textarea />
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-600">Hero Stats</label>
            <button type="button" onClick={addStat} className="text-xs font-semibold text-cyan-600 hover:text-cyan-700">+ Add stat</button>
          </div>
          <div className="space-y-2">
            {s.heroStats.map((st, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text" value={st.value} onChange={(e) => setStat(i, "value", e.target.value)}
                  placeholder="753" className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none"
                />
                <input
                  type="text" value={st.label} onChange={(e) => setStat(i, "label", e.target.value)}
                  placeholder="Sales Centers" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none"
                />
                {s.heroStats.length > 1 && (
                  <button type="button" onClick={() => removeStat(i)} className="text-red-400 hover:text-red-600 text-xs font-medium px-1">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* ── Info Panel ───────────────────────────── */}
      <Card title="Info Panel (left dark section)">
        <div className="space-y-3">
          <Field label="Company label" value={s.infoCompanyLabel} onChange={set("infoCompanyLabel")} placeholder="Himalaya Nepal Krishi Company Limited" />
          <Field label="Heading" value={s.infoHeading} onChange={set("infoHeading")} placeholder="Let's talk" />
          <Field label="Subheading" value={s.infoSubheading} onChange={set("infoSubheading")} placeholder="Share your needs and our team will reach out within 24 hours." textarea />
        </div>

        {/* Phones */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-600">Phone numbers</label>
            <button type="button" onClick={addPhone} className="text-xs font-semibold text-cyan-600 hover:text-cyan-700">+ Add phone</button>
          </div>
          <div className="space-y-2">
            {s.phones.map((ph, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text" value={ph} onChange={(e) => setPhone(i, e.target.value)}
                  placeholder="+977-9851227052" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none"
                />
                {s.phones.length > 1 && (
                  <button type="button" onClick={() => removePhone(i)} className="text-red-400 hover:text-red-600 text-xs font-medium px-1">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Email + Address */}
        <div className="mt-3 space-y-3">
          <Field label="Email" value={s.email} onChange={set("email")} placeholder="info@himalayaagronepal.com" />
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-slate-600">Address lines</label>
            <button type="button" onClick={addAddr} className="text-xs font-semibold text-cyan-600 hover:text-cyan-700">+ Add line</button>
          </div>
          <div className="space-y-2">
            {s.addressLines.map((ln, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text" value={ln} onChange={(e) => setAddr(i, e.target.value)}
                  placeholder="Pokhara 33700" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none"
                />
                {s.addressLines.length > 1 && (
                  <button type="button" onClick={() => removeAddr(i)} className="text-red-400 hover:text-red-600 text-xs font-medium px-1">✕</button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-3 space-y-3">
          <Field label="Support email (footer of info panel)" value={s.supportEmail} onChange={set("supportEmail")} placeholder="info@himalayaagronepal.com" />
          <Field label="Open hours" value={s.openHours} onChange={set("openHours")} placeholder="Mon - Fri" />
        </div>
      </Card>

      {/* ── Map ──────────────────────────────────── */}
      <Card title="Google Maps Embed">
        <Field label="Embed URL (from Google Maps → Share → Embed a map → copy src)" value={s.mapEmbedUrl} onChange={set("mapEmbedUrl")} placeholder="https://www.google.com/maps/embed?pb=…" textarea rows={3} />
        {s.mapEmbedUrl && (
          <div className="mt-3 w-full h-40 overflow-hidden rounded-xl border border-slate-200">
            <iframe src={s.mapEmbedUrl} width="100%" height="100%" style={{ border: 0 }} loading="lazy" title="Map preview" />
          </div>
        )}
      </Card>

      {/* ── Form heading ─────────────────────────── */}
      <Card title="Form Section">
        <div className="space-y-3">
          <Field label="Heading" value={s.formHeading} onChange={set("formHeading")} placeholder="Send us a message" />
          <Field label="Subheading" value={s.formSubheading} onChange={set("formSubheading")} placeholder="We will get back to you shortly." />
        </div>
      </Card>

      <div className="flex justify-end">
        <button type="button" onClick={save} disabled={saving} className="rounded-lg bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700 transition-colors disabled:opacity-60">
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm space-y-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, placeholder, textarea, rows }: {
  label: string; value: string; onChange: any; placeholder?: string; textarea?: boolean; rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {textarea
        ? <textarea rows={rows || 3} value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none resize-y" />
        : <input type="text" value={value} onChange={onChange} placeholder={placeholder} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 focus:border-cyan-400 focus:outline-none" />}
    </div>
  );
}
