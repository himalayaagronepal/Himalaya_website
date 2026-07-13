import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import authOptions from "../../../../lib/auth";
import connectToDatabase from "../../../../lib/mongodb";
import Product from "../../../../models/Product";
import Category from "../../../../models/Category";
import Outlet from "../../../../models/Outlet";
import { serializeMany } from "../../../../lib/serialize";
import OutletProductManagementClient from "../../../components/admin/OutletProductManagementClient";

export default async function AdminOutletProductsPage({ params }: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug } = resolvedParams;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session) return redirect(`/login?from=/admin/${slug}/products`);

  if (session.user?.role !== "admin" && session.user?.role !== "outlet-admin") {
    return redirect("/admin/dashboard");
  }

  if (session.user?.role === "outlet-admin" && session.user?.outletSlug !== slug) {
    return redirect(`/admin/${session.user?.outletSlug || "dashboard"}`);
  }

  await connectToDatabase();

  const outlet = await Outlet.findOne({ slug }).lean();
  if (!outlet) return notFound();

  const [products, categories] = await Promise.all([
    Product.find({ outlet: outlet._id }).sort({ createdAt: -1 }).lean(),
    Category.find().sort({ name: 1 }).lean(),
  ]);

  const safeProducts = serializeMany(products as any[]);
  const safeCategories = serializeMany(categories as any[]);

  return (
    <main className="pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <Link href={`/admin/${slug}`} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Products</h1>
            <p className="mt-2 text-sm text-slate-500">Manage products for {outlet.name}</p>
          </div>
          <Link
            href={`/admin/${slug}/products/new`}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 text-sm font-medium transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Product
          </Link>
        </div>

        <OutletProductManagementClient initialProducts={safeProducts} categories={safeCategories} outletSlug={slug} basePath={`/admin/${slug}/products`} />
      </div>
    </main>
  );
}