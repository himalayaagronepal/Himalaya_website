"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function CategoryForm({ initial = null, onSaved }: { initial?: any; onSaved?: (cat: any) => void }) {
  const [name, setName] = useState(initial?.name || "");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name };
      const method = initial ? "PATCH" : "POST";
      const url = initial ? `/api/admin/categories/${initial._id}` : `/api/admin/categories`;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).message || "Save failed");
      const data = await res.json();
      toast.success("Category saved");
      if (onSaved) onSaved(data);
      else router.refresh();
      setName("");
    } catch (err: any) {
      toast.error(err.message || "Unable to save category");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4 max-w-sm">
      <div>
        <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider mb-1.5">Category name</label>
        <input
          className="block w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
          placeholder="e.g. Organic Seeds"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <button className="rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2 text-sm font-medium transition-colors disabled:opacity-50" disabled={loading}>
          {loading ? 'Saving…' : initial ? 'Save' : 'Create category'}
        </button>
      </div>
    </form>
  );
}
