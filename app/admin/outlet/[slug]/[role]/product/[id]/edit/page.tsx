import React from "react";
import { redirect, notFound } from "next/navigation";
import connectToDatabase from "../../../../../../../../lib/mongodb";
import Product from "../../../../../../../../models/Product";
import Outlet from "../../../../../../../../models/Outlet";
import { serialize } from "../../../../../../../../lib/serialize";
import ProductForm from "../../../../../../../components/admin/ProductForm";
import { resolveOutletEmployeeRoute, outletEmployeeBasePath } from "../../../_utils";

export default async function EditOutletEmployeeProductPage({ params }: { params: { slug: string; role: string; id: string } } | { params: Promise<{ slug: string; role: string; id: string }> }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { id } = resolvedParams;
  const resolved = await resolveOutletEmployeeRoute(resolvedParams as any);
  if ("redirectTo" in resolved) return redirect(resolved.redirectTo);

  const { slug, role, outlet } = resolved;
  if (role !== "shopkeeper") return redirect(outletEmployeeBasePath(slug, "shopkeeper"));

  await connectToDatabase();
  const outletDoc = await Outlet.findOne({ slug }).lean();
  if (!outletDoc) return notFound();

  const product = await Product.findOne({ _id: id, outlet: outletDoc._id }).lean();
  if (!product) return notFound();

  return (
    <main className="pb-16">
      <div className="max-w-7xl mx-auto py-16 px-6 lg:px-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.3em] text-sky-600">Outlet Catalog</span>
          <h1 className="mt-3 text-4xl font-black">Edit product</h1>
          <p className="mt-2 text-sm text-slate-500">Update the product for {(outlet as any).name}</p>
        </div>
        <div className="mt-6 bg-white/90 border border-slate-100 rounded-3xl p-6 shadow-sm">
          <ProductForm initial={serialize(product)} redirectTo={`${outletEmployeeBasePath(slug, role)}/product`} />
        </div>
      </div>
    </main>
  );
}
