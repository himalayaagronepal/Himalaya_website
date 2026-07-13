import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import authOptions from "../../../../../lib/auth";
import connectToDatabase from "../../../../../lib/mongodb";
import Outlet from "../../../../../models/Outlet";
import CategoryForm from "../../../../components/admin/CategoryForm";

export default async function AdminOutletCategoryCreatePage({ params }: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug } = resolvedParams;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session) return redirect(`/login?from=/admin/${slug}/categories/new`);

  if (session.user?.role !== "admin" && session.user?.role !== "outlet-admin") {
    return redirect("/admin/dashboard");
  }

  if (session.user?.role === "outlet-admin" && session.user?.outletSlug !== slug) {
    return redirect(`/admin/${session.user?.outletSlug || "dashboard"}`);
  }

  await connectToDatabase();

  const outlet = await Outlet.findOne({ slug }).lean();
  if (!outlet) return notFound();

  return (
    <main className="pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href={`/admin/${slug}/categories`} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium mb-4 inline-block">
          ← Back to Categories
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Create Category</h1>
        <p className="mt-2 text-sm text-slate-500">Add a new category for {outlet.name}</p>

        <div className="mt-8">
          <CategoryForm />
        </div>
      </div>
    </main>
  );
}