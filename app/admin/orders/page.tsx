import React from "react";
import connectToDatabase from "../../../lib/mongodb";
import Order from "../../../models/Order";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../lib/auth";
import AdminOrdersClient from "../../components/admin/AdminOrdersClient";
import { serializeMany } from "../../../lib/serialize";
import { filterOrdersForOutlet } from "../../../lib/order-access";
import { hasPermission } from "../../../lib/permissions";

export default async function AdminOrdersPage() {
  const session = (await getServerSession(authOptions as any)) as any;

  // Authorized: global admins, admin-employees granted the "orders" section
  // (plain section name), and outlet "employee" accounts granted "orders:read"
  // (colon-style). hasPermission() bridges both styles.
  const isAuthorized = hasPermission(session?.user, "orders:read");
  const isOutletEmployee = session?.user?.role === "employee";

  if (!isAuthorized) return <div className="p-12">Unauthorized</div>;

  await connectToDatabase();
  let orders = await Order.find({}).sort({ createdAt: -1 }).limit(200).lean();

  // Outlet employees only see orders relevant to their outlet.
  if (isOutletEmployee && session?.user?.outletId) {
    orders = await filterOrdersForOutlet(orders, String(session.user.outletId));
  }

  const safe = serializeMany(orders as any[]);

  const pendingCount = safe.filter((o: any) => o.orderStatus === 'pending').length;
  const processingCount = safe.filter((o: any) => o.orderStatus === 'processing').length;
  const deliveredCount = safe.filter((o: any) => o.orderStatus === 'delivered').length;

  return (
    <main className="pb-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full mb-3">Operations</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Orders</h1>
            <p className="mt-1 text-sm text-slate-500">Manage and fulfill recent orders — search, filter and review.</p>
          </div>
          <a href="/admin/orders" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition-colors shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            Refresh
          </a>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-5-5z"/><path d="M15 3v5h5"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{safe.length}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">All time orders</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{pendingCount}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Awaiting action</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-600 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Processing</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{processingCount}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">In progress</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Delivered</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{deliveredCount}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Successfully fulfilled</p>
          </div>
        </div>

        {/* Orders Table */}
        <AdminOrdersClient initialOrders={safe} />
      </div>
    </main>
  );
}