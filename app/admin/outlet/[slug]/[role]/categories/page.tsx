import React from "react";
import { redirect } from "next/navigation";
import connectToDatabase from "../../../../../../lib/mongodb";
import Category from "../../../../../../models/Category";
import { serializeMany } from "../../../../../../lib/serialize";
import OutletCategoryManagementClient from "../../../../../components/admin/OutletCategoryManagementClient";
import { resolveOutletEmployeeRoute, outletEmployeeBasePath } from "../_utils";

export default async function OutletEmployeeCategoriesPage({ params }: { params: { slug: string; role: string } } | { params: Promise<{ slug: string; role: string }> }) {
  const resolved = await resolveOutletEmployeeRoute(params);
  if ("redirectTo" in resolved) return redirect(resolved.redirectTo);

  const { slug, role, outlet } = resolved;
  if (role !== "shopkeeper") return redirect(outletEmployeeBasePath(slug, "shopkeeper"));

  await connectToDatabase();
  const categories = await Category.find().sort({ name: 1 }).lean();

  return (
    <main className="pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <a href={outletEmployeeBasePath(slug, role)} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium mb-4 inline-block">
              ← Back to Workspace
            </a>
            <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
            <p className="mt-2 text-sm text-slate-500">Manage categories for {(outlet as any).name}</p>
          </div>
        </div>

        <OutletCategoryManagementClient initialCategories={serializeMany(categories as any[])} outletSlug={slug} />
      </div>
    </main>
  );
}
