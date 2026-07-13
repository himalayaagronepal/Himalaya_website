"use client";

import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";

// Kept in sync with NOTICE_TYPES in models/Notice.ts. Defined locally so the
// Mongoose model (a server-only module) is never pulled into the client bundle.
const NOTICE_TYPES = ["Notice", "Tender", "Vacancy", "Circular", "Result"] as const;

const noticeColors: Record<string, string> = {
  Notice: "bg-emerald-100 text-emerald-700",
  Tender: "bg-amber-100 text-amber-700",
  Vacancy: "bg-sky-100 text-sky-700",
  Circular: "bg-violet-100 text-violet-700",
  Result: "bg-rose-100 text-rose-700",
};

type NoticeItem = {
  _id: string;
  title: string;
  titleNe?: string;
  type: string;
  status: string;
  fileUrl: string;
  publishedAt: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type FormState = {
  title: string;
  titleNe: string;
  type: string;
  date: string; // yyyy-mm-dd for the date input
  status: "draft" | "published";
  fileUrl: string;
};

function todayInput() {
  return new Date().toISOString().slice(0, 10);
}

function toDateInput(iso: string | null) {
  if (!iso) return todayInput();
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return todayInput();
  return d.toISOString().slice(0, 10);
}

function dateParts(iso: string | null) {
  const d = iso ? new Date(iso) : new Date();
  return {
    day: d.toLocaleDateString("en-GB", { day: "2-digit" }),
    month: d.toLocaleDateString("en-US", { month: "short" }),
    year: String(d.getFullYear()),
  };
}

const emptyForm: FormState = {
  title: "",
  titleNe: "",
  type: "Notice",
  date: todayInput(),
  status: "published",
  fileUrl: "",
};

export default function AdminNoticesClient({ initialItems }: { initialItems: NoticeItem[] }) {
  const [items, setItems] = useState<NoticeItem[]>(initialItems || []);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const counts = useMemo(() => {
    const published = items.filter((n) => n.status === "published").length;
    return { total: items.length, published, draft: items.length - published };
  }, [items]);

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  function startEdit(item: NoticeItem) {
    setEditingId(item._id);
    setForm({
      title: item.title,
      titleNe: item.titleNe || "",
      type: item.type || "Notice",
      date: toDateInput(item.publishedAt),
      status: item.status === "published" ? "published" : "draft",
      fileUrl: item.fileUrl || "",
    });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/notices/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Upload failed");
      setForm((f) => ({ ...f, fileUrl: json.url }));
      toast.success("File uploaded");
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) return toast.error("Title is required");

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        titleNe: form.titleNe.trim(),
        type: form.type,
        status: form.status,
        fileUrl: form.fileUrl.trim(),
        publishedAt: new Date(form.date).toISOString(),
      };
      const res = await fetch(editingId ? `/api/admin/notices/${editingId}` : "/api/admin/notices", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to save notice");

      if (editingId) {
        setItems((prev) => prev.map((n) => (n._id === editingId ? json.item : n)));
        toast.success("Notice updated");
      } else {
        setItems((prev) => [json.item, ...prev]);
        toast.success("Notice created");
      }
      resetForm();
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(item: NoticeItem) {
    const next = item.status === "published" ? "draft" : "published";
    setBusyId(item._id);
    try {
      const res = await fetch(`/api/admin/notices/${item._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to update");
      setItems((prev) => prev.map((n) => (n._id === item._id ? json.item : n)));
      toast.success(next === "published" ? "Notice published" : "Moved to draft");
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this notice? This cannot be undone.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/notices/${id}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Delete failed");
      setItems((prev) => prev.filter((n) => n._id !== id));
      if (editingId === id) resetForm();
      toast.success("Notice deleted");
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Manage notices</h2>
          <p className="text-sm text-slate-500">
            Published notices appear on the public Notices board when “Notices dummy data” is turned off.
          </p>
        </div>
        <div className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{counts.total}</span> total ·{" "}
          <span className="font-semibold text-emerald-600">{counts.published}</span> published ·{" "}
          <span className="font-semibold text-amber-600">{counts.draft}</span> draft
        </div>
      </div>

      {/* Create / edit form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-800">{editingId ? "Edit notice" : "Add a notice"}</h3>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-xs font-medium text-slate-500 hover:text-slate-700">
              Cancel edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">Title (English)</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Annual General Meeting 2026 — Date & Venue Announced"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              शीर्षक (Title · Nepali) <span className="text-slate-400">— optional, falls back to English</span>
            </label>
            <input
              type="text"
              value={form.titleNe}
              onChange={(e) => setForm((f) => ({ ...f, titleNe: e.target.value }))}
              placeholder="उदाहरण: वार्षिक साधारण सभा २०२६ — मिति र स्थान घोषणा"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
            >
              {NOTICE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Attachment <span className="text-slate-400">(optional — opened by the download icon)</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={form.fileUrl}
                onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
                placeholder="Upload a PDF/image or paste a link"
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
              />
              <label className="relative inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors whitespace-nowrap">
                <input
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadFile(file);
                    if (e.currentTarget) e.currentTarget.value = "";
                  }}
                  disabled={uploading}
                />
                {uploading ? "Uploading…" : "Upload file"}
              </label>
            </div>
            {form.fileUrl ? (
              <a
                href={form.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 inline-block text-xs text-cyan-600 hover:underline break-all"
              >
                {form.fileUrl}
              </a>
            ) : (
              <p className="mt-1.5 text-xs text-slate-400">PDF or image, up to 10MB.</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as FormState["status"] }))}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
            >
              <option value="published">Published (visible)</option>
              <option value="draft">Draft (hidden)</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || uploading}
            className="rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 text-sm font-medium transition-colors disabled:opacity-60"
          >
            {saving ? "Saving…" : editingId ? "Save changes" : "Add notice"}
          </button>
        </div>
      </form>

      {/* Notices list */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-800">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Notice</th>
                <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Type</th>
                <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Status</th>
                <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((item) => {
                const parts = dateParts(item.publishedAt);
                return (
                  <tr key={item._id} className="align-top hover:bg-cyan-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                          <span className="text-base font-black leading-none">{parts.day}</span>
                          <span className="text-[9px] font-bold uppercase tracking-wide">{parts.month}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-900 text-sm">{item.title}</div>
                          {item.titleNe ? (
                            <div className="text-xs text-emerald-700/80 mt-0.5">{item.titleNe}</div>
                          ) : null}
                          <div className="text-xs text-slate-400 mt-0.5">
                            {parts.day} {parts.month} {parts.year}
                            {item.fileUrl ? (
                              <>
                                {" · "}
                                <a href={item.fileUrl} target="_blank" rel="noreferrer" className="text-cyan-600 hover:underline">
                                  attachment
                                </a>
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${noticeColors[item.type] || "bg-slate-100 text-slate-700"}`}>
                        {item.type}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${item.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        {item.status === "published" ? "Published" : "Draft"}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => toggleStatus(item)}
                          disabled={busyId === item._id}
                          className="text-sm font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                        >
                          {item.status === "published" ? "Unpublish" : "Publish"}
                        </button>
                        <button
                          type="button"
                          onClick={() => startEdit(item)}
                          disabled={busyId === item._id}
                          className="text-sm font-medium text-cyan-600 hover:text-cyan-700 disabled:opacity-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item._id)}
                          disabled={busyId === item._id}
                          className="text-sm font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50"
                        >
                          {busyId === item._id ? "…" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {items.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center text-sm text-slate-400">
                    No notices yet. Add your first notice above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
