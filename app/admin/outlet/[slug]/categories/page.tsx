import React from "react";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../lib/auth";
import { redirect } from "next/navigation";
import connectToDatabase from "../../../../../lib/mongodb";
import Category from "../../../../../models/Category";
import Outlet from "../../../../../models/Outlet";
import { serializeMany } from "../../../../../lib/serialize";
import { hasOutletSectionAccess } from "../../../../../lib/permissions";
import OutletCategoryManagementClient from "../../../../components/admin/OutletCategoryManagementClient";

export default async function OutletCategoriesPage({ params }: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug } = resolvedParams;

  const session = (await getServerSession(authOptions as any)) as any;
  // A global admin may view any outlet's console; an outlet-admin (or a
  // section-granted outlet employee) may manage categories for their own outlet.
  if (!session || !hasOutletSectionAccess(session.user, slug, "categories:read")) {
    return redirect("/login");
  }

  await connectToDatabase();

  const outlet = await Outlet.findOne({ slug }).lean();
  if (!outlet) {
    return redirect("/login");
  }

  const categories = await Category.find().sort({ name: 1 }).lean();
  const safeCategories = serializeMany(categories as any[]);

  return (
    <main className="pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <a href={`/admin/outlet/${slug}`} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium mb-4 inline-block">
              ← Back to Dashboard
            </a>
            <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
            <p className="mt-2 text-sm text-slate-500">Manage product categories for {outlet.name}</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 text-white px-4 py-2 text-sm font-medium transition-colors opacity-80 cursor-default">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Category
          </div>
        </div>

        <OutletCategoryManagementClient initialCategories={safeCategories} outletSlug={slug} />
      </div>
    </main>
  );
}