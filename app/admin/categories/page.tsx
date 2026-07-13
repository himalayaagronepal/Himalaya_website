import React from "react";
import connectToDatabase from "../../../lib/mongodb";
import Category from "../../../models/Category";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../lib/auth";
import { serializeMany } from "../../../lib/serialize";
import CategoryForm from "../../components/admin/CategoryForm";
import CategoryRow from "../../components/admin/CategoryRow";
import { hasPermission } from "../../../lib/permissions";

export default async function AdminCategoriesPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "categories:read")) return <div className="p-12">Unauthorized</div>;

  await connectToDatabase();
  const categories = await Category.find().sort({ name: 1 }).lean();
  const safe = serializeMany(categories as any[]);

  const totalProducts = safe.reduce((sum: number, c: any) => sum + (c.products || []).length, 0);
  const emptyCategories = safe.filter((c: any) => !(c.products || []).length).length;

  return (
    <main className="pb-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full mb-3">Catalog</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Categories</h1>
            <p className="mt-1 text-sm text-slate-500">Create and maintain product categories.</p>
          </div>
          <a href="/admin/categories" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition-colors shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            Refresh
          </a>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{safe.length}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">All categories</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Products</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalProducts}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Across all categories</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{safe.length - emptyCategories}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">With products assigned</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Empty</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{emptyCategories}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">No products assigned</p>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <section className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Create category</h2>
              <p className="text-xs text-slate-400 mt-0.5">Add a new product category.</p>
            </div>
            <div className="p-5">
              <CategoryForm />
            </div>
          </section>
          <section className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Existing categories</h2>
              <p className="text-xs text-slate-400 mt-0.5">{safe.length} categories in the catalog.</p>
            </div>
            <div className="p-5 space-y-2.5">
              {safe.length === 0 ? (
                <div className="py-8 text-center text-sm text-slate-400">No categories yet</div>
              ) : (
                safe.map((c: any) => (
                  <CategoryRow key={c._id} category={c} />
                ))
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
