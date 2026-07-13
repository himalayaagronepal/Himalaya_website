import React from "react";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../lib/auth";
import { redirect } from "next/navigation";
import connectToDatabase from "../../../../../lib/mongodb";
import Category from "../../../../../models/Category";
import Outlet from "../../../../../models/Outlet";
import { serializeMany, serialize } from "../../../../../lib/serialize";
import OutletProductFormClient from "../../../../components/admin/OutletProductFormClient";

export default async function NewOutletProductPage({ params }: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug } = resolvedParams;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || session.user?.role !== "outlet-admin") {
    return redirect("/login");
  }

  // Verify the outlet slug matches the session
  if (session.user?.outletSlug !== slug) {
    return redirect("/login");
  }

  await connectToDatabase();

  const outlet = await Outlet.findOne({ slug }).lean();
  if (!outlet) {
    return redirect("/login");
  }

  const categories = await Category.find().sort({ name: 1 }).lean();
  const safeCategories = serializeMany(categories as any[]);
  const safeOutlet = serialize(outlet);

  return (
    <main className="pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div>
          <a href={`/admin/${slug}/products`} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium mb-4 inline-block">
            ← Back to Products
          </a>
          <h1 className="text-3xl font-bold text-slate-900">Create New Product</h1>
          <p className="mt-2 text-sm text-slate-500">Add a new product to {outlet.name}</p>
        </div>

        {/* Form */}
        <div className="mt-8">
          <OutletProductFormClient categories={safeCategories} outletSlug={slug} />
        </div>
      </div>
    </main>
  );
}
