"use client";

import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";

type NewsItem = {
  _id: string;
  title: string;
  slug: string;
  status: string;
  category?: string;
  coverImage?: string;
  updatedAt?: string | null;
  publishedAt?: string | null;
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function statusColor(s: string) {
  if (s === "published") return "bg-emerald-50 text-emerald-700";
  if (s === "draft") return "bg-amber-50 text-amber-700";
  return "bg-gray-100 text-gray-700";
}

export default function AdminNewsClient({ initialItems }: { initialItems: NewsItem[] }) {
  const [items, setItems] = useState<NewsItem[]>(initialItems || []);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");

  const filtered = useMemo(() => {
    const term = (q || "").trim().toLowerCase();
    return items.filter((n) => {
      if (status && n.status !== status) return false;
      if (!term) return true;
      if (n.title.toLowerCase().includes(term)) return true;
      if (n.slug.toLowerCase().includes(term)) return true;
      if ((n.category || "").toLowerCase().includes(term)) return true;
      return false;
    });
  }, [items, q, status]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this news item? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/news/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Delete failed");
      setItems((prev) => prev.filter((n) => n._id !== id));
      toast.success("News deleted");
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="text-slate-900 space-y-5">
      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <label htmlFor="admin-news-search" className="sr-only">Search news</label>
            <div className="relative w-full sm:w-72">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8" strokeWidth="2"/><path strokeLinecap="round" d="M21 21l-4.35-4.35" strokeWidth="2"/></svg>
              <input
                id="admin-news-search"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                placeholder="Search by title, slug, category..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <select
              className="rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of <span className="font-semibold text-slate-700">{items.length}</span>
            </div>
            <a href="/admin/news" className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition-colors shadow-sm">Refresh</a>
          </div>
        </div>
      </div>

      {/* News Table */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-slate-800">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Article</th>
              <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Category</th>
              <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Status</th>
              <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Date</th>
              <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((item) => (
              <tr key={item._id} className="align-top hover:bg-cyan-50/30 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 overflow-hidden shrink-0">
                      {item.coverImage ? (
                        <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="h-4 w-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg>
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate text-sm">{item.title}</div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">{item.slug}</div>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-3.5">
                  {item.category ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {item.category}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>

                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${statusColor(item.status)}`}>
                    {item.status === "published" ? "Published" : "Draft"}
                  </span>
                </td>

                <td className="px-5 py-3.5 text-sm text-slate-500">
                  {formatDate(item.publishedAt || item.updatedAt)}
                </td>

                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <a href={`/admin/news/${item._id}/edit`} className="text-sm font-medium text-cyan-600 hover:text-cyan-700">Edit</a>
                    <a href={`/news/${item.slug}`} target="_blank" rel="noreferrer" className="text-sm text-slate-500 hover:text-slate-700">View</a>
                    <button
                      className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                      onClick={() => handleDelete(item._id)}
                      disabled={deletingId === item._id}
                    >
                      {deletingId === item._id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">No news articles match your filters.</td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
