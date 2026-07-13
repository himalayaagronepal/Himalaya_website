"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";

export default function CategoryRow({ category }: { category: any }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(category.name || "");
  const [loading, setLoading] = useState(false);

  async function save() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${category._id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
      if (!res.ok) throw new Error((await res.json()).message || 'Save failed');
      toast.success('Saved');
      setEditing(false);
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Unable to save');
    } finally {
      setLoading(false);
    }
  }

  async function remove() {
    if (!confirm(`Delete category "${category.name}"? This will unset the category on its products.`)) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${category._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json()).message || 'Delete failed');
      toast.success('Deleted');
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Unable to delete');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 border border-slate-100 bg-slate-50/40 hover:bg-slate-50 rounded-xl px-4 py-3 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-100 text-cyan-600 flex-shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
        </div>
        {editing ? (
          <input className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-900 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none" value={name} onChange={(e) => setName(e.target.value)} />
        ) : (
          <div className="font-medium text-sm text-slate-800 truncate">
            {category.name} <span className="text-xs text-slate-400 ml-1">({(category.products || []).length})</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {editing ? (
          <>
            <button className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors" onClick={save} disabled={loading}>{loading ? 'Saving…' : 'Save'}</button>
            <button className="text-xs text-slate-400 hover:text-slate-600 transition-colors" onClick={() => setEditing(false)}>Cancel</button>
          </>
        ) : (
          <>
            <button className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors" onClick={() => setEditing(true)}>Edit</button>
            <button className="text-xs text-rose-500 hover:text-rose-600 transition-colors" onClick={remove} disabled={loading}>Delete</button>
          </>
        )}
      </div>
    </div>
  );
}
