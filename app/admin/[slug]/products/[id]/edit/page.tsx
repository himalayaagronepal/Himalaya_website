import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import authOptions from "../../../../../../lib/auth";
import connectToDatabase from "../../../../../../lib/mongodb";
import Product from "../../../../../../models/Product";
import Outlet from "../../../../../../models/Outlet";
import { serialize } from "../../../../../../lib/serialize";
import ProductForm from "../../../../../components/admin/ProductForm";

export default async function AdminEditOutletProductPage({ params }: { params: { slug: string; id: string } } | { params: Promise<{ slug: string; id: string }> }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug, id } = resolvedParams;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session) return redirect(`/login?from=/admin/${slug}/products/${id}/edit`);

  if (session.user?.role !== "admin" && session.user?.role !== "outlet-admin") {
    return redirect("/admin/dashboard");
  }

  if (session.user?.role === "outlet-admin" && session.user?.outletSlug !== slug) {
    return redirect(`/admin/${session.user?.outletSlug || "dashboard"}`);
  }

  await connectToDatabase();

  const outlet = await Outlet.findOne({ slug }).lean();
  if (!outlet) return notFound();

  const product = await Product.findOne({ _id: id, outlet: outlet._id }).lean();
  if (!product) return notFound();

  return (
    <main className="pb-16">
      <div className="max-w-7xl mx-auto py-16 px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-sky-600">Outlet Catalog</span>
            <h1 className="mt-3 text-4xl font-black">Edit product</h1>
          </div>
        </div>
        <div className="mt-6 bg-white/90 border border-slate-100 rounded-3xl p-6 shadow-sm">
          <ProductForm initial={serialize(product)} redirectTo={`/admin/${slug}/products`} />
        </div>
      </div>
    </main>
  );
}