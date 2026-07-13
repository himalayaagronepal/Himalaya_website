import React from "react";
import { redirect } from "next/navigation";
import ProductForm from "../../../../../../components/admin/ProductForm";
import { resolveOutletEmployeeRoute, outletEmployeeBasePath } from "../../_utils";

export default async function NewOutletEmployeeProductPage({ params }: { params: { slug: string; role: string } } | { params: Promise<{ slug: string; role: string }> }) {
  const resolved = await resolveOutletEmployeeRoute(params);
  if ("redirectTo" in resolved) return redirect(resolved.redirectTo);

  const { slug, role, outlet } = resolved;
  if (role !== "shopkeeper") return redirect(outletEmployeeBasePath(slug, "shopkeeper"));

  return (
    <main className="pb-16">
      <div className="max-w-7xl mx-auto py-16 px-6 lg:px-8">
        <div>
          <a href={`${outletEmployeeBasePath(slug, role)}/product`} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium mb-4 inline-block">
            ← Back to Products
          </a>
          <h1 className="text-4xl font-black">Create product</h1>
          <p className="mt-2 text-sm text-slate-500">Add a new product to {(outlet as any).name}</p>
        </div>

        <div className="mt-8 bg-white/90 border border-slate-100 rounded-3xl p-6 shadow-sm">
          <ProductForm redirectTo={`${outletEmployeeBasePath(slug, role)}/product`} />
        </div>
      </div>
    </main>
  );
}
