import React from "react";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../lib/auth";
import ProductForm from "../../../components/admin/ProductForm";
import connectToDatabase from "../../../../lib/mongodb";
import Product from "../../../../models/Product";
import { hasPermission } from "../../../../lib/permissions";

export default async function NewProductPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "products:write")) return <div className="p-12">Unauthorized</div>;

  await connectToDatabase();
  const recent = await Product.find({}).sort({ createdAt: -1 }).limit(3).lean();

  return (
    <main className="pb-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 text-cyan-600 text-xs font-semibold tracking-wide uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
              Catalog
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">New Product</h1>
            <p className="mt-2 text-sm text-slate-500 max-w-lg">
              Add a product to the catalog — fill required fields and upload clear photos.
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-400 bg-slate-50 px-3 py-2 rounded-lg">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="font-medium text-slate-600">{session.user?.email}</span>
          </div>
        </div>

        {/* Form + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProductForm />
          </div>

          {/* Right sidebar */}
          <aside className="order-first lg:order-last space-y-5">
            {/* Quick tips */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="bg-cyan-500 px-5 py-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  Quick Tips
                </h3>
              </div>
              <ul className="p-5 space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                  Use high-quality square images (800×800 or larger).
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                  Keep description short and benefit-focused.
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1 w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                  Set accurate stock to avoid oversells.
                </li>
              </ul>
              <div className="px-5 pb-4">
                <a href="/admin/categories" className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors">
                  Manage Categories
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </a>
              </div>
            </div>

            {/* Recent products */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-semibold text-slate-900">Recent Products</h4>
                <a className="text-xs font-medium text-cyan-600 hover:text-cyan-700 transition-colors" href="/admin/products">View all</a>
              </div>

              <div className="space-y-3">
                {recent.map((r: any) => (
                  <div key={String(r._id)} className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0">
                      <img src={(r.images && r.images[0]) || '/placeholder.png'} alt={r.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-900 truncate">{r.name}</div>
                      <div className="text-xs text-slate-500">₹{Number(r.price || 0).toFixed(2)}</div>
                    </div>
                  </div>
                ))}

                {recent.length === 0 && (
                  <div className="text-sm text-slate-400 text-center py-4">No recent products</div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}