import React from "react";
import connectToDatabase from "../../../../../lib/mongodb";
import Product from "../../../../../models/Product";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../lib/auth";
import ProductForm from "../../../../components/admin/ProductForm";
import { hasPermission } from "../../../../../lib/permissions";

export default async function EditProductPage({ params }: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  // `params` can be a Promise in some Next.js runtimes — unwrap it safely.
  const resolvedParams = params instanceof Promise ? await params : params;
  const id = resolvedParams.id;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "products:write")) return <div className="p-12">Unauthorized</div>;

  await connectToDatabase();
  const product = await Product.findById(id).lean();
  if (!product) return <div className="p-12">Product not found</div>;
  const { serialize } = await import('../../../../../lib/serialize');
  const safeProduct = serialize(product);

  return (
    <main className="pb-16">
      <div className="max-w-7xl mx-auto py-16 px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-sky-600">Catalog</span>
            <h1 className="mt-3 text-4xl font-black">Edit product</h1>
          </div>
        </div>
        <div className="mt-6 bg-white/90 border border-slate-100 rounded-3xl p-6 shadow-sm">
          <ProductForm initial={safeProduct} />
        </div>
      </div>
    </main>
  );
}