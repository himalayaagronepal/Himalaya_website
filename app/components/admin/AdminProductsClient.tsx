"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import ProductRow from "./ProductRow";
import { toast } from "react-toastify";

export default function AdminProductsClient({
  initialProducts = [],
  initialTotal = 0,
  initialPage = 1,
  initialPerPage = 20,
  categories = [],
}: {
  initialProducts?: any[];
  initialTotal?: number;
  initialPage?: number;
  initialPerPage?: number;
  categories?: any[];
}) {
  const [products, setProducts] = useState(initialProducts || []);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(initialPage || 1);
  const [perPage, setPerPage] = useState(initialPerPage || 20);
  const [total, setTotal] = useState(initialTotal || 0);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.max(1, Math.ceil((total || 0) / perPage));

  const fetchProducts = useCallback(async (opts: { page?: number; q?: string; category?: string } = {}) => {
    setLoading(true);
    try {
      const url = new URL('/api/admin/products', window.location.origin);
      url.searchParams.set('page', String(opts.page ?? page));
      url.searchParams.set('perPage', String(perPage));
      if ((opts.q ?? q) as string) url.searchParams.set('q', (opts.q ?? q) as string);
      if ((opts.category ?? category) as string) url.searchParams.set('category', (opts.category ?? category) as string);
      const res = await fetch(url.toString(), { credentials: 'same-origin' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to fetch products');
      setProducts((json.items || []).map((p: any) => ({ ...p, _id: String(p._id) })));
      setTotal(json.meta?.total || 0);
      setPage(json.meta?.page || 1);
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [page, perPage, q, category]);

  useEffect(() => {
    if (!initialProducts || initialProducts.length === 0) fetchProducts({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    await fetchProducts({ page: 1, q, category });
  }

  const empty = !loading && (!products || products.length === 0);

  return (
    <div>
      {/* Toolbar */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm mb-5">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-60">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                aria-label="Search products"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                placeholder="Search by name, brand or SKU"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <select className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c: any) => (
                <option key={c._id} value={c.name}>{c.name} ({c.productsCount || 0})</option>
              ))}
            </select>
            <button className="rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors" type="submit">Search</button>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-500">Showing <span className="font-semibold text-slate-700">{products.length}</span> of <span className="font-semibold text-slate-700">{total}</span></p>
            <a className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors" href="/admin/products/new">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New product
            </a>
          </div>
        </form>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <label className="flex items-center gap-2"><input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300" disabled /> Bulk select (coming soon)</label>
          <div>Show <select className="ml-1.5 rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1 text-xs text-slate-700 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none" value={perPage} onChange={(e) => { setPerPage(Number(e.target.value)); fetchProducts({ page: 1 }); }}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select> per page</div>
        </div>
      </div>

      {/* Product table */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Product</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Category</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Price</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Stock</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-sm text-slate-400">Loading…</td></tr>
              )}
              {empty && (
                <tr><td colSpan={6} className="px-4 py-16 text-center text-sm text-slate-400">No products found.</td></tr>
              )}
              {!loading && products.map((p: any) => (
                <ProductRow key={p._id} product={p} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-5 flex items-center justify-between">
        <p className="text-xs text-slate-500">Page <span className="font-semibold text-slate-700">{page}</span> of <span className="font-semibold text-slate-700">{totalPages}</span></p>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs text-slate-700 font-medium transition-colors disabled:opacity-40" disabled={page <= 1} onClick={() => { const np = Math.max(1, page-1); setPage(np); fetchProducts({ page: np }); }}>Prev</button>
          <button className="rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 text-xs font-medium transition-colors disabled:opacity-40" disabled={page >= totalPages} onClick={() => { const np = Math.min(totalPages, page+1); setPage(np); fetchProducts({ page: np }); }}>Next</button>
        </div>
      </div>
    </div>
  );
}
