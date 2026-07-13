import React from "react";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../lib/auth";
import { redirect, notFound } from "next/navigation";
import connectToDatabase from "../../../../../lib/mongodb";
import Product from "../../../../../models/Product";
import ProductLog from "../../../../../models/ProductLog";
import Outlet from "../../../../../models/Outlet";
import { serialize, serializeMany } from "../../../../../lib/serialize";
import OutletProductDetailsClient from "../../../../components/admin/OutletProductDetailsClient";

export default async function OutletProductDetailPage({ params }: { params: { slug: string; id: string } } | { params: Promise<{ slug: string; id: string }> }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug, id } = resolvedParams;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || session.user?.role !== "outlet-admin") {
    return redirect("/login");
  }

  if (session.user?.outletSlug !== slug) {
    return redirect("/login");
  }

  await connectToDatabase();

  const outlet = await Outlet.findOne({ slug }).lean();
  if (!outlet) return notFound();

  const product = await Product.findOne({ _id: id, outlet: outlet._id }).lean();
  if (!product) return notFound();

  const logs = await ProductLog.find({ product: product._id }).sort({ createdAt: -1 }).lean();

  const safeProduct = serialize(product);
  const safeLogs = serializeMany(logs as any[]);

  return (
    <main className="pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <a href={`/admin/outlet-${slug}/products`} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium inline-flex items-center gap-2">
            ← Back to products
          </a>
        </div>
        <OutletProductDetailsClient product={safeProduct as any} initialLogs={safeLogs as any} outletSlug={slug} />
      </div>
    </main>
  );
}
