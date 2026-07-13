import React from "react";
import connectToDatabase from "../../../lib/mongodb";
import Product from "../../../models/Product";
import AdminProductsClient from "../../components/admin/AdminProductsClient";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../lib/auth";
import { hasPermission } from "../../../lib/permissions";

export default async function AdminProductsPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "products:read")) return <div className="p-12">Unauthorized</div>;
  const user = session.user as any;
  const isOutletScopedUser = (user?.role === "employee" || user?.role === "outlet-admin");
  if (isOutletScopedUser && !user?.outletId) return <div className="p-12">Unauthorized</div>;

  await connectToDatabase();
  const productFilter: any = isOutletScopedUser ? { outlet: user.outletId } : {};
  const products = await Product.find(productFilter).sort({ createdAt: -1 }).lean();
  const { serializeMany } = await import('../../../lib/serialize');
  const safeProducts = serializeMany(products as any[]);

  // categories for filter dropdown
  const Category = (await import('../../../models/Category')).default;
  const cats = await Category.find().sort({ name: 1 }).lean();
  const allowedCategoryNames = new Set(safeProducts.map((p: any) => p.category).filter(Boolean));
  const publicCats = cats
    .filter((c: any) => !isOutletScopedUser || allowedCategoryNames.has(c.name))
    .map((c: any) => ({ _id: String(c._id), name: c.name, productsCount: (c.products || []).length }));

  const outOfStock = safeProducts.filter((p: any) => (p.stock ?? 0) <= 0).length;
  const activeCount = safeProducts.filter((p: any) => p.isActive).length;

  return (
    <main className="pb-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full mb-3">Catalog</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Products</h1>
            <p className="mt-1 text-sm text-slate-500">Manage catalog — create, edit and publish products.</p>
          </div>
          <div className="flex items-center gap-2">
            <a className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 text-sm font-medium transition-colors shadow-sm" href="/admin/products/new">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New product
            </a>
            <a className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition-colors shadow-sm" href="/shop">View store</a>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{safeProducts.length}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">All product listings</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{activeCount}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Published &amp; visible</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Categories</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{publicCats.length}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Product categories</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Out of Stock</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{outOfStock}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Needs restocking</p>
          </div>
        </div>

        <AdminProductsClient
          initialProducts={safeProducts}
          initialTotal={safeProducts.length}
          initialPage={1}
          initialPerPage={20}
          categories={publicCats}
        />
      </div>
    </main>
  );
}