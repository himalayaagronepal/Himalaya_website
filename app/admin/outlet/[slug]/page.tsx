import React from "react";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../lib/auth";
import { redirect } from "next/navigation";
import connectToDatabase from "../../../../lib/mongodb";
import Outlet from "../../../../models/Outlet";
import Product from "../../../../models/Product";
import Category from "../../../../models/Category";
import { serialize } from "../../../../lib/serialize";
import { hasOutletSectionAccess } from "../../../../lib/permissions";

export default async function OutletAdminDashboard({ params }: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug } = resolvedParams;

  const session = (await getServerSession(authOptions as any)) as any;
  const user = session?.user;
  // A global admin may view any outlet's console; an outlet-admin (or a
  // section-granted outlet employee) only their own.
  const canView =
    user?.role === "admin" ||
    (user?.role === "outlet-admin" && user?.outletSlug === slug) ||
    (user?.role === "employee" && user?.outletSlug === slug);
  if (!session || !canView) {
    return redirect("/login");
  }

  await connectToDatabase();

  const outlet = await Outlet.findOne({ slug }).lean();
  if (!outlet) {
    return redirect("/login");
  }

  const [totalProducts, activeProducts, outOfStock, categories] = await Promise.all([
    Product.countDocuments({ outlet: outlet._id }),
    Product.countDocuments({ outlet: outlet._id, isActive: true }),
    Product.countDocuments({ outlet: outlet._id, stock: { $lte: 0 } }),
    Category.find().sort({ name: 1 }).lean(),
  ]);

  serialize(outlet);

  return (
    <main className="pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{outlet.name}</h1>
          <p className="mt-2 text-sm text-slate-500">Outlet Management Dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Products</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{totalProducts}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active</p>
            <p className="text-3xl font-bold text-emerald-600 mt-2">{activeProducts}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Out of Stock</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{outOfStock}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Categories</p>
            <p className="text-3xl font-bold text-cyan-600 mt-2">{categories.length}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {hasOutletSectionAccess(user, slug, "products:read") && (
            <a
              href={`/admin/outlet/${slug}/products`}
              className="bg-cyan-600 hover:bg-cyan-700 text-white p-6 rounded-2xl font-semibold transition-colors"
            >
              Manage Products
            </a>
          )}
          {hasOutletSectionAccess(user, slug, "orders:read") && (
            <a
              href={`/admin/outlet/${slug}/orders`}
              className="bg-indigo-600 hover:bg-indigo-700 text-white p-6 rounded-2xl font-semibold transition-colors"
            >
              Manage Orders
            </a>
          )}
          {hasOutletSectionAccess(user, slug, "categories:read") && (
            <a
              href={`/admin/outlet/${slug}/categories`}
              className="bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-2xl font-semibold transition-colors"
            >
              Manage Categories
            </a>
          )}
          {hasOutletSectionAccess(user, slug, "outlet:read") && (
            <a
              href={`/admin/outlet/${slug}/settings`}
              className="bg-slate-700 hover:bg-slate-800 text-white p-6 rounded-2xl font-semibold transition-colors"
            >
              Outlet Info
            </a>
          )}
          {user?.role === "outlet-admin" && (
            <a
              href={`/admin/outlet/${slug}/employees`}
              className="bg-purple-600 hover:bg-purple-700 text-white p-6 rounded-2xl font-semibold transition-colors"
            >
              Manage Employees
            </a>
          )}
        </div>
      </div>
    </main>
  );
}