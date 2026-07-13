"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import RichTextEditorClient from "./RichTextEditorClient";

type NewsFormData = {
  title: string;
  excerpt: string;
  coverImage: string;
  category: string;
  status: "draft" | "published";
  contentHtml: string;
  // Nepali (नेपाली) translations — optional.
  titleNe: string;
  excerptNe: string;
  categoryNe: string;
  contentHtmlNe: string;
};

export default function NewsEditorClient({
  mode,
  newsId,
  initial,
}: {
  mode: "create" | "edit";
  newsId?: string;
  initial?: Partial<NewsFormData>;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title || "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt || "");
  const [coverImage, setCoverImage] = useState(initial?.coverImage || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [status, setStatus] = useState<"draft" | "published">(initial?.status || "draft");
  const [contentHtml, setContentHtml] = useState(initial?.contentHtml || "");
  const [titleNe, setTitleNe] = useState(initial?.titleNe || "");
  const [excerptNe, setExcerptNe] = useState(initial?.excerptNe || "");
  const [categoryNe, setCategoryNe] = useState(initial?.categoryNe || "");
  const [contentHtmlNe, setContentHtmlNe] = useState(initial?.contentHtmlNe || "");
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  async function uploadCover(file: File) {
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("folder", "ecom_news");
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Upload failed");
      setCoverImage(json.url);
      toast.success("Cover image uploaded");
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");
    if (!contentHtml.trim()) return toast.error("Content is required");

    setSaving(true);
    try {
      const payload = {
        title,
        excerpt,
        coverImage,
        category,
        status,
        contentHtml,
        titleNe,
        excerptNe,
        categoryNe,
        contentHtmlNe,
      };
      const res = await fetch(mode === "create" ? "/api/admin/news" : `/api/admin/news/${newsId}`, {
        method: mode === "create" ? "POST" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || JSON.stringify(json));
      toast.success(mode === "create" ? "News created" : "News updated");
      router.push("/admin/news");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content — 2 cols */}
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white/90 border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Article details</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">English</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">Title and summary for the news post.</p>

            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700">Title</label>
                <input
                  className="mt-2 w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400"
                  placeholder="News headline"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">Excerpt</label>
                <textarea
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 min-h-22.5"
                  placeholder="Short summary shown on the news list"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Nepali article details */}
          <section className="bg-emerald-50/40 border border-emerald-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">लेख विवरण</h2>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">नेपाली</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Nepali title and summary (optional). Left blank, the English version is shown.
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700">शीर्षक (Title)</label>
                <input
                  className="mt-2 w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400"
                  placeholder="समाचारको शीर्षक"
                  value={titleNe}
                  onChange={(e) => setTitleNe(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">सारांश (Excerpt)</label>
                <textarea
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 min-h-22.5"
                  placeholder="समाचार सूचीमा देखिने छोटो सारांश"
                  value={excerptNe}
                  onChange={(e) => setExcerptNe(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="bg-white/90 border border-slate-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Content</h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">English</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">Write or paste the full article body.</p>
            <div className="mt-6">
              <RichTextEditorClient value={contentHtml} onChange={setContentHtml} />
            </div>
          </section>

          <section className="bg-emerald-50/40 border border-emerald-100 rounded-3xl p-6 shadow-sm">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">सामग्री (Content)</h2>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">नेपाली</span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Nepali article body (optional). Left blank, the English content is shown.
            </p>
            <div className="mt-6">
              <RichTextEditorClient value={contentHtmlNe} onChange={setContentHtmlNe} />
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <div className="bg-white/90 border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Publish settings</h3>
            <div className="mt-1 text-xs text-slate-400">Control visibility and category.</div>
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm text-slate-500">Status</label>
                <select
                  className="mt-2 block w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-slate-500">Category (English)</label>
                <input
                  className="mt-2 w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400"
                  placeholder="e.g. Company, Technology"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm text-slate-500">श्रेणी (Category · Nepali)</label>
                <input
                  className="mt-2 w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400"
                  placeholder="उदाहरण: कम्पनी, प्रविधि"
                  value={categoryNe}
                  onChange={(e) => setCategoryNe(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-white/90 border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-slate-900">Cover image</h3>
            <div className="mt-1 text-xs text-slate-400">Upload or paste a URL for the cover.</div>
            <div className="mt-6 space-y-4">
              {coverImage ? (
                <div className="rounded-2xl overflow-hidden border border-slate-100">
                  <img src={coverImage} alt="Cover" className="w-full h-48 object-cover" />
                </div>
              ) : (
                <div className="h-40 rounded-2xl border border-dashed border-slate-200 bg-slate-50 flex items-center justify-center text-sm text-slate-400">
                  No cover selected
                </div>
              )}

              <label className="block">
                <div className="relative rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm text-center cursor-pointer hover:bg-slate-50 transition-colors text-slate-700">
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void uploadCover(file);
                      if (e.currentTarget) e.currentTarget.value = "";
                    }}
                    disabled={uploadingCover}
                  />
                  {uploadingCover ? "Uploading…" : "Upload cover image"}
                </div>
              </label>
              <input
                className="w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400"
                placeholder="Or paste image URL"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-full bg-slate-900 text-white px-4 py-2.5 text-sm font-medium"
            disabled={saving}
          >
            {saving ? "Saving…" : mode === "create" ? "Publish news" : "Save changes"}
          </button>
        </aside>
      </div>
    </form>
  );
}
