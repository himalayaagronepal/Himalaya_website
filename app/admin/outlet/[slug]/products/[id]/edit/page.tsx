import React from "react";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../../../lib/auth";
import { redirect } from "next/navigation";
import connectToDatabase from "../../../../../../../lib/mongodb";
import Product from "../../../../../../../models/Product";
import Outlet from "../../../../../../../models/Outlet";
import { serialize } from "../../../../../../../lib/serialize";
import ProductForm from "../../../../../../components/admin/ProductForm";

export default async function EditOutletProductPage(
  { params }: { params: { slug: string; id: string } } | { params: Promise<{ slug: string; id: string }> }
) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug, id } = resolvedParams;

  const session = (await getServerSession(authOptions as any)) as any;
  // A global admin may view any outlet's console; an outlet-admin only their own.
  if (
    !session ||
    (session.user?.role !== "admin" &&
      !(session.user?.role === "outlet-admin" && session.user?.outletSlug === slug))
  ) {
    return redirect("/login");
  }

  await connectToDatabase();

  const outlet = await Outlet.findOne({ slug }).lean();
  if (!outlet) {
    return redirect("/login");
  }

  const product = await Product.findOne({ _id: id, outlet: outlet._id }).lean();
  if (!product) {
    return <div className="p-12">Product not found</div>;
  }

  const safeProduct = serialize(product);

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
          <ProductForm initial={safeProduct} redirectTo={`/admin/outlet/${slug}/products`} />
        </div>
      </div>
    </main>
  );
}