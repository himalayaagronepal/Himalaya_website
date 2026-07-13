import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import authOptions from "../../../../../lib/auth";
import connectToDatabase from "../../../../../lib/mongodb";
import Product from "../../../../../models/Product";
import ProductLog from "../../../../../models/ProductLog";
import Outlet from "../../../../../models/Outlet";
import { serialize, serializeMany } from "../../../../../lib/serialize";
import OutletProductDetailsClient from "../../../../components/admin/OutletProductDetailsClient";

export default async function AdminOutletProductDetailPage({ params }: { params: { slug: string; id: string } } | { params: Promise<{ slug: string; id: string }> }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug, id } = resolvedParams;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session) return redirect(`/login?from=/admin/${slug}/products/${id}`);

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

  const logs = await ProductLog.find({ product: product._id }).sort({ createdAt: -1 }).lean();

  return (
    <main className="pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href={`/admin/${slug}/products`} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium inline-flex items-center gap-2">
            ← Back to products
          </Link>
        </div>
        <OutletProductDetailsClient product={serialize(product) as any} initialLogs={serializeMany(logs as any[])} outletSlug={slug} />
      </div>
    </main>
  );
}