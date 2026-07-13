import React from "react";
import connectToDatabase from "../../../lib/mongodb";
import User from "../../../models/User";
import Product from "../../../models/Product";
import Order from "../../../models/Order";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../lib/auth";
import { redirect } from "next/navigation";
import { adminLandingForPermissions } from "../../../lib/permissions";

export default async function AdminDashboardPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session) {
    return <div className="p-12">Unauthorized</div>;
  }

  if (session.user?.role !== "admin") {
    const permissions = Array.isArray(session.user?.permissions) ? session.user.permissions : [];
    const landing = adminLandingForPermissions(permissions);
    if (landing && landing !== "/admin/dashboard") {
      redirect(landing);
    }
    return <div className="p-12">Unauthorized</div>;
  }

  await connectToDatabase();
  const now = new Date();
  const start30 = new Date(now);
  start30.setDate(now.getDate() - 30);
  const start60 = new Date(now);
  start60.setDate(now.getDate() - 60);
  const start8w = new Date(now);
  start8w.setDate(now.getDate() - 56);

  const [
    users,
    products,
    orders,
    ordersLast8Weeks,
    revenueNowAgg,
    revenuePrevAgg,
    cancelledLast30,
    statusRevenueAgg,
  ] = await Promise.all([
    User.countDocuments({}),
    Product.countDocuments({}),
    Order.countDocuments({}),
    Order.find({ createdAt: { $gte: start8w } }).select("totalAmount createdAt").lean(),
    Order.aggregate([
      { $match: { createdAt: { $gte: start30 } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: start60, $lt: start30 } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]),
    Order.countDocuments({ createdAt: { $gte: start30 }, orderStatus: "cancelled" }),
    Order.aggregate([
      { $match: { createdAt: { $gte: start30 } } },
      { $group: { _id: "$orderStatus", total: { $sum: "$totalAmount" } } },
    ]),
  ]);

  const revenueNow = revenueNowAgg[0]?.total ?? 0;
  const ordersNow = revenueNowAgg[0]?.count ?? 0;
  const revenuePrev = revenuePrevAgg[0]?.total ?? 0;
  const ordersPrev = revenuePrevAgg[0]?.count ?? 0;
  const revenueChange = revenuePrev ? ((revenueNow - revenuePrev) / revenuePrev) * 100 : null;
  const ordersChange = ordersPrev ? ((ordersNow - ordersPrev) / ordersPrev) * 100 : null;
  const avgOrder = ordersNow ? revenueNow / ordersNow : 0;
  const refundRate = ordersNow ? (cancelledLast30 / ordersNow) * 100 : 0;

  const statusPalette = [
    { key: "delivered", label: "Delivered", color: "#0f172a" },
    { key: "shipped", label: "Shipped", color: "#1e293b" },
    { key: "processing", label: "Processing", color: "#334155" },
    { key: "pending", label: "Pending", color: "#64748b" },
    { key: "cancelled", label: "Cancelled", color: "#dc2626" },
  ];

  const statusTotals = statusPalette.map((item) => {
    const match = statusRevenueAgg.find((row: any) => row._id === item.key);
    return { ...item, total: match?.total ?? 0 };
  });

  const statusTotalRevenue = statusTotals.reduce((sum, item) => sum + item.total, 0);
  let cumulative = 0;
  const pieStops = statusTotals
    .filter((item) => item.total > 0)
    .map((item) => {
      const percent = statusTotalRevenue ? (item.total / statusTotalRevenue) * 100 : 0;
      const start = cumulative;
      cumulative += percent;
      return `${item.color} ${start.toFixed(2)}% ${cumulative.toFixed(2)}%`;
    });
  const pieBackground = pieStops.length
    ? `conic-gradient(${pieStops.join(", ")})`
    : "conic-gradient(#e5e7eb 0% 100%)";

  const weekBuckets = Array.from({ length: 8 }, (_, index) => {
    const start = new Date(start8w);
    start.setDate(start8w.getDate() + index * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return { start, end, total: 0, label: `W${index + 1}` };
  });

  ordersLast8Weeks.forEach((order: any) => {
    const createdAt = new Date(order.createdAt);
    const diffDays = Math.floor((createdAt.getTime() - start8w.getTime()) / (1000 * 60 * 60 * 24));
    const index = Math.min(7, Math.max(0, Math.floor(diffDays / 7)));
    weekBuckets[index].total += order.totalAmount ?? 0;
  });

  const maxWeekTotal = Math.max(1, ...weekBuckets.map((bucket) => bucket.total));
  const formatNPR = new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  });

  return (
    <main className="pb-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full mb-3">Overview</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
            <p className="mt-1 text-sm text-slate-500">Real-time analytics &amp; performance metrics.</p>
          </div>
          <a href="/admin/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition-colors shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            Refresh
          </a>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Users</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{users}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Total registered accounts</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Products</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{products}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Active product listings</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-5-5z"/><path d="M15 3v5h5"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Orders</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{orders}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">All-time orders placed</p>
          </div>

        </div>

        {/* Revenue & Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
          {/* Revenue Mix */}
          <section className="lg:col-span-2 bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between px-5 pt-5 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Revenue mix</h2>
                <p className="text-xs text-slate-400 mt-0.5">Last 30 days by order status</p>
              </div>
              <span className="text-sm font-semibold text-cyan-600">{formatNPR.format(revenueNow)}</span>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
                <div className="relative h-52 w-52 mx-auto">
                  <div className="h-full w-full rounded-full" style={{ background: pieBackground }} />
                  <div className="absolute inset-5 rounded-full bg-white shadow-sm flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Revenue</p>
                    <p className="text-lg font-bold text-slate-900 mt-1">{formatNPR.format(revenueNow)}</p>
                    <p className="text-[10px] text-slate-400">Last 30 days</p>
                  </div>
                </div>

                <div className="grid gap-2.5">
                  {statusTotals.map((item) => (
                    <div key={item.key} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                        <div>
                          <p className="text-sm font-medium text-slate-700">{item.label}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">{formatNPR.format(item.total)}</p>
                        <p className="text-[10px] text-slate-400">
                          {statusTotalRevenue ? `${((item.total / statusTotalRevenue) * 100).toFixed(1)}%` : "0.0%"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Sales Performance */}
          <aside className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">Sales trend</h3>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">8 weeks</span>
            </div>

            <div className="p-5">
              <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-4">
                <div className="flex h-36 items-end gap-2">
                  {weekBuckets.map((bucket, index) => (
                    <div
                      key={`bar-${index}`}
                      className="flex-1 rounded-md bg-gradient-to-t from-cyan-700 to-cyan-500"
                      style={{ height: `${Math.max(16, (bucket.total / maxWeekTotal) * 130)}px` }}
                      title={formatNPR.format(bucket.total)}
                    />
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between text-[9px] uppercase tracking-widest text-slate-400 font-medium">
                  {weekBuckets.map((bucket) => (
                    <span key={bucket.label}>{bucket.label}</span>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Revenue</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{formatNPR.format(revenueNow)}</p>
                  <p className={`mt-0.5 text-xs font-medium ${revenueChange === null || revenueChange >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {revenueChange === null ? "No prior data" : `${revenueChange >= 0 ? "+" : ""}${revenueChange.toFixed(1)}%`}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Orders</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{ordersNow}</p>
                  <p className={`mt-0.5 text-xs font-medium ${ordersChange === null || ordersChange >= 0 ? "text-emerald-500" : "text-rose-500"}`}>
                    {ordersChange === null ? "No prior data" : `${ordersChange >= 0 ? "+" : ""}${ordersChange.toFixed(1)}%`}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Avg Order</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{formatNPR.format(avgOrder)}</p>
                  <p className="mt-0.5 text-xs text-slate-400">Last 30 days</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-3.5">
                  <p className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Refunds</p>
                  <p className="text-xl font-bold text-slate-900 mt-1">{refundRate.toFixed(1)}%</p>
                  <p className="mt-0.5 text-xs text-slate-400">Cancelled (30d)</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}