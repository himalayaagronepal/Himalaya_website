import React from "react";
import { redirect } from "next/navigation";
import connectToDatabase from "../../../../../../lib/mongodb";
import Product from "../../../../../../models/Product";
import Category from "../../../../../../models/Category";
import { serializeMany } from "../../../../../../lib/serialize";
import OutletProductManagementClient from "../../../../../components/admin/OutletProductManagementClient";
import { resolveOutletEmployeeRoute, outletEmployeeBasePath } from "../_utils";

export default async function OutletEmployeeProductsPage({ params }: { params: { slug: string; role: string } } | { params: Promise<{ slug: string; role: string }> }) {
  const resolved = await resolveOutletEmployeeRoute(params);
  if ("redirectTo" in resolved) return redirect(resolved.redirectTo);

  const { slug, role, outlet } = resolved;
  if (role !== "shopkeeper") return redirect(outletEmployeeBasePath(slug, "shopkeeper"));

  await connectToDatabase();
  const [products, categories] = await Promise.all([
    Product.find({ outlet: (outlet as any)._id }).sort({ createdAt: -1 }).lean(),
    Category.find().sort({ name: 1 }).lean(),
  ]);

  return (
    <main className="pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <a href={outletEmployeeBasePath(slug, role)} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium mb-4 inline-block">
              ← Back to Workspace
            </a>
            <h1 className="text-3xl font-bold text-slate-900">Products</h1>
            <p className="mt-2 text-sm text-slate-500">Manage products for {(outlet as any).name}</p>
          </div>
          <a
            href={`${outletEmployeeBasePath(slug, role)}/product/new`}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 text-sm font-medium transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Product
          </a>
        </div>

        <OutletProductManagementClient
          initialProducts={serializeMany(products as any[])}
          categories={serializeMany(categories as any[])}
          outletSlug={slug}
          basePath={`${outletEmployeeBasePath(slug, role)}/product`}
        />
      </div>
    </main>
  );
}
