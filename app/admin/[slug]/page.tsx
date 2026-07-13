import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import authOptions from "../../../lib/auth";
import connectToDatabase from "../../../lib/mongodb";
import Outlet from "../../../models/Outlet";
import Product from "../../../models/Product";
import Order from "../../../models/Order";
import Category from "../../../models/Category";
import Employee from "../../../models/Employee";
import { serializeMany } from "../../../lib/serialize";
import { filterOrdersForOutlet } from "../../../lib/order-access";

function StatCard({
  label,
  value,
  colorClass,
  icon,
}: {
  label: string;
  value: string | number;
  colorClass: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl flex-shrink-0 ${colorClass}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        </div>
      </div>
    </div>
  );
}

function QuickLink({
  href,
  label,
  description,
  colorClass,
  icon,
}: {
  href: string;
  label: string;
  description: string;
  colorClass: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-3 rounded-2xl p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg ${colorClass}`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
          {icon}
        </div>
        <span className="font-bold text-white text-base">{label}</span>
      </div>
      <p className="text-sm text-white/75 leading-snug">{description}</p>
    </Link>
  );
}

export default async function AdminOutletDashboard({
  params,
}: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug } = resolvedParams;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session) return redirect(`/login?from=/admin/${slug}`);

  if (session.user?.role !== "admin" && session.user?.role !== "outlet-admin") {
    return redirect("/admin/dashboard");
  }
  if (session.user?.role === "outlet-admin" && session.user?.outletSlug !== slug) {
    return redirect(`/admin/${session.user?.outletSlug || "dashboard"}`);
  }

  await connectToDatabase();

  const outlet = await Outlet.findOne({ slug }).lean();
  if (!outlet) return notFound();

  const outletId = String(outlet._id);

  const [
    totalProducts,
    activeProducts,
    outOfStockProducts,
    categories,
    employees,
    recentProductsRaw,
    allOrdersRaw,
  ] = await Promise.all([
    Product.countDocuments({ outlet: outletId }),
    Product.countDocuments({ outlet: outletId, isActive: true }),
    Product.countDocuments({ outlet: outletId, stock: { $lte: 0 } }),
    Category.find().sort({ name: 1 }).lean(),
    Employee.countDocuments({ outlet: outletId }),
    Product.find({ outlet: outletId }).sort({ createdAt: -1 }).limit(5).lean(),
    Order.find({}).sort({ createdAt: -1 }).limit(200).lean(),
  ]);

  const outletOrders = await filterOrdersForOutlet(
    serializeMany(allOrdersRaw as any[]),
    outletId
  );

  const pendingOrders = outletOrders.filter(
    (o: any) => o.orderStatus === "pending" || o.orderStatus === "processing"
  ).length;
  const totalRevenue = outletOrders
    .filter((o: any) => o.paymentStatus === "paid")
    .reduce((sum: number, o: any) => sum + (o.totalAmount ?? 0), 0);

  const recentOrders = outletOrders.slice(0, 5);
  const recentProducts = serializeMany(recentProductsRaw as any[]);

  const statusColor: Record<string, string> = {
    pending: "bg-amber-50 text-amber-700",
    processing: "bg-blue-50 text-blue-700",
    shipped: "bg-cyan-50 text-cyan-700",
    delivered: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-rose-50 text-rose-700",
  };

  return (
    <main className="bg-slate-50/50 min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            {session.user?.role === "admin" && (
              <Link
                href="/admin/outlets"
                className="inline-flex items-center gap-1.5 text-sm text-cyan-600 hover:text-cyan-700 font-medium mb-3"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                All Outlets
              </Link>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{outlet.name}</h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${outlet.isActive ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${outlet.isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                {outlet.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            {outlet.address && (
              <p className="mt-1 text-sm text-slate-500 flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {outlet.address}
              </p>
            )}
          </div>
          {outlet.profileImage && (
            <div className="h-16 w-16 rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={outlet.profileImage} alt={outlet.name} className="h-full w-full object-cover" />
            </div>
          )}
        </div>

        {/* KPI stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            label="Products"
            value={totalProducts}
            colorClass="bg-cyan-100 text-cyan-600"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>}
          />
          <StatCard
            label="Active"
            value={activeProducts}
            colorClass="bg-emerald-100 text-emerald-600"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>}
          />
          <StatCard
            label="Out of Stock"
            value={outOfStockProducts}
            colorClass="bg-rose-100 text-rose-600"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>}
          />
          <StatCard
            label="Orders"
            value={outletOrders.length}
            colorClass="bg-indigo-100 text-indigo-600"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
          />
          <StatCard
            label="Pending"
            value={pendingOrders}
            colorClass="bg-amber-100 text-amber-600"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
          />
          <StatCard
            label="Revenue"
            value={`₹${totalRevenue.toLocaleString("en-NP")}`}
            colorClass="bg-violet-100 text-violet-600"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>}
          />
        </div>

        {/* Quick links */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Manage</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <QuickLink
              href={`/admin/${slug}/products`}
              label="Products"
              description="Add, edit and manage all outlet products"
              colorClass="bg-cyan-600 hover:bg-cyan-700"
              icon={<svg className="text-white" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>}
            />
            <QuickLink
              href={`/admin/${slug}/orders`}
              label="Orders"
              description={`${pendingOrders} pending order${pendingOrders === 1 ? "" : "s"} to fulfil`}
              colorClass="bg-indigo-600 hover:bg-indigo-700"
              icon={<svg className="text-white" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>}
            />
            <QuickLink
              href={`/admin/${slug}/categories`}
              label="Categories"
              description={`${categories.length} categor${categories.length === 1 ? "y" : "ies"} available`}
              colorClass="bg-emerald-600 hover:bg-emerald-700"
              icon={<svg className="text-white" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>}
            />
            <QuickLink
              href={`/admin/${slug}/employees`}
              label="Employees"
              description={`${employees} staff member${employees === 1 ? "" : "s"} assigned`}
              colorClass="bg-amber-600 hover:bg-amber-700"
              icon={<svg className="text-white" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>}
            />
            <QuickLink
              href={`/admin/${slug}/outlet-info`}
              label="Outlet Info"
              description="Update outlet details and settings"
              colorClass="bg-slate-700 hover:bg-slate-800"
              icon={<svg className="text-white" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41"/></svg>}
            />
          </div>
        </div>

        {/* Recent activity — two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent Orders */}
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Recent Orders</h2>
              <Link href={`/admin/${slug}/orders`} className="text-xs font-medium text-cyan-600 hover:text-cyan-700">
                View all →
              </Link>
            </div>
            {recentOrders.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-400">No orders yet.</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentOrders.map((order: any) => (
                  <li key={order._id}>
                    <Link
                      href={`/admin/${slug}/orders/${order._id}`}
                      className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          #{String(order._id).slice(-8).toUpperCase()}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-NP", { day: "numeric", month: "short", year: "numeric" })}
                          {" · "}
                          {order.items?.length ?? 0} item{(order.items?.length ?? 0) === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                        <span className="font-semibold text-sm text-slate-900">
                          ₹{(order.totalAmount ?? 0).toLocaleString("en-NP")}
                        </span>
                        <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${statusColor[order.orderStatus] ?? "bg-slate-100 text-slate-600"}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Recent Products */}
          <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Recent Products</h2>
              <Link href={`/admin/${slug}/products`} className="text-xs font-medium text-cyan-600 hover:text-cyan-700">
                View all →
              </Link>
            </div>
            {recentProducts.length === 0 ? (
              <div className="px-5 py-10 text-center text-sm text-slate-400">No products yet.</div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {recentProducts.map((product: any) => (
                  <li key={product._id} className="flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50 transition-colors">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={product.images?.[0] || "/placeholder.png"}
                      alt={product.name}
                      className="h-10 w-10 rounded-xl object-cover flex-shrink-0 border border-slate-100"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{product.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        ₹{product.price?.toFixed(2)} · {product.stock} {product.unit || "units"}
                      </p>
                    </div>
                    <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full flex-shrink-0 ${product.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                      {product.isActive ? "Active" : "Off"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="px-5 py-3 border-t border-slate-100">
              <Link
                href={`/admin/${slug}/products/new`}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-cyan-600 hover:text-cyan-700"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Add new product
              </Link>
            </div>
          </div>
        </div>

        {/* Outlet contact info footer */}
        {(outlet.contactEmail || outlet.contactPhone || outlet.description) && (
          <div className="bg-white border border-slate-200/60 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4">Outlet Info</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              {outlet.description && (
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-1">Description</p>
                  <p className="text-slate-700">{outlet.description}</p>
                </div>
              )}
              {outlet.contactEmail && (
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-1">Email</p>
                  <a href={`mailto:${outlet.contactEmail}`} className="text-cyan-600 hover:underline">{outlet.contactEmail}</a>
                </div>
              )}
              {outlet.contactPhone && (
                <div>
                  <p className="text-xs text-slate-400 font-medium mb-1">Phone</p>
                  <a href={`tel:${outlet.contactPhone}`} className="text-slate-700">{outlet.contactPhone}</a>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
