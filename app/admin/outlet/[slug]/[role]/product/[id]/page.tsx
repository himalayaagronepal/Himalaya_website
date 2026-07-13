import React from "react";
import { redirect, notFound } from "next/navigation";
import connectToDatabase from "../../../../../../../lib/mongodb";
import Product from "../../../../../../../models/Product";
import ProductLog from "../../../../../../../models/ProductLog";
import { serialize, serializeMany } from "../../../../../../../lib/serialize";
import OutletProductDetailsClient from "../../../../../../components/admin/OutletProductDetailsClient";
import { resolveOutletEmployeeRoute, outletEmployeeBasePath } from "../../_utils";

export default async function OutletEmployeeProductDetailPage({ params }: { params: { slug: string; role: string; id: string } } | { params: Promise<{ slug: string; role: string; id: string }> }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { id } = resolvedParams;
  const resolved = await resolveOutletEmployeeRoute(resolvedParams as any);
  if ("redirectTo" in resolved) return redirect(resolved.redirectTo);

  const { slug, role, outlet } = resolved;
  if (role !== "shopkeeper") return redirect(outletEmployeeBasePath(slug, "shopkeeper"));

  await connectToDatabase();
  const product = await Product.findOne({ _id: id, outlet: (outlet as any)._id }).lean();
  if (!product) return notFound();

  const logs = await ProductLog.find({ product: product._id }).sort({ createdAt: -1 }).lean();

  return (
    <main className="pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <a href={`${outletEmployeeBasePath(slug, role)}/product`} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium inline-flex items-center gap-2">
            ← Back to products
          </a>
        </div>
        <OutletProductDetailsClient product={serialize(product) as any} initialLogs={serializeMany(logs as any[])} outletSlug={slug} />
      </div>
    </main>
  );
}
