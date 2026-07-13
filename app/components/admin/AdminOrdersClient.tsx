"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

export default function AdminOrdersClient({
  initialOrders = [],
  orderBasePath = "/admin/orders",
}: {
  initialOrders?: any[];
  orderBasePath?: string;
}) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string | "">("");

  const orders = initialOrders || [];

  const filtered = useMemo(() => {
    const term = (q || "").trim().toLowerCase();
    return orders.filter((o: any) => {
      if (status && String(o.orderStatus) !== String(status)) return false;
      if (!term) return true;
      if (String(o._id).toLowerCase().includes(term)) return true;
      if ((o.shippingAddress?.name || "").toLowerCase().includes(term)) return true;
      if ((o.shippingAddress?.email || "").toLowerCase().includes(term)) return true;
      if ((o.items || []).some((it: any) => (it.name || "").toLowerCase().includes(term))) return true;
      return false;
    });
  }, [orders, q, status]);

  function statusColor(s: string) {
    if (!s) return "bg-gray-100 text-gray-700";
    if (s === "delivered") return "bg-emerald-50 text-emerald-700";
    if (s === "processing") return "bg-amber-50 text-amber-700";
    if (s === "shipped") return "bg-sky-50 text-sky-700";
    if (s === "cancelled") return "bg-red-50 text-red-700";
    return "bg-gray-100 text-gray-700";
  }

  function paymentColor(s: string) {
    if (s === "paid") return "bg-emerald-50 text-emerald-700";
    if (s === "failed") return "bg-red-50 text-red-700";
    return "bg-amber-50 text-amber-700";
  }

  return (
    <div className="text-slate-900">
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 shadow-sm mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <label htmlFor="admin-order-search" className="sr-only">Search orders</label>
            <div className="relative w-full sm:w-72">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <input
                id="admin-order-search"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                placeholder="Search by id, customer, item..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <select className="rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-700 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs text-slate-500">Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of <span className="font-semibold text-slate-700">{orders.length}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Order</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Customer</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Items</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Total</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Payment</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Status</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Date</th>
                <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((o: any) => (
                <tr key={o._id} className="align-top hover:bg-cyan-50/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-900 text-xs">#{String(o._id).slice(-8)}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{o.items.length} item{o.items.length !== 1 ? 's' : ''}</p>
                  </td>

                  <td className="px-4 py-3.5">
                    <p className="font-medium text-slate-800 text-sm">{o.shippingAddress?.name || o.email || '—'}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate max-w-[180px]">{o.shippingAddress?.phone || o.shippingAddress?.email || ''}</p>
                  </td>

                  <td className="px-4 py-3.5 text-sm text-slate-700">{o.items.length}</td>

                  <td className="px-4 py-3.5 font-bold text-slate-900 text-sm">{typeof o.totalAmount === 'number' ? `₹${o.totalAmount.toFixed(2)}` : o.totalAmount}</td>

                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${paymentColor(o.paymentStatus)}`}>
                      {o.paymentStatus}
                    </span>
                  </td>

                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${statusColor(o.orderStatus)}`}>
                      {o.orderStatus}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-xs text-slate-500">{new Date(o.createdAt).toLocaleString()}</td>

                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <a href={`${orderBasePath}/${o._id}`} className="text-xs font-semibold text-cyan-600 hover:text-cyan-700 transition-colors">View</a>
                      <a href={`${orderBasePath}/${o._id}#actions`} className="text-xs text-slate-400 hover:text-slate-600 transition-colors">Actions</a>
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center">
                    <p className="text-sm text-slate-400">No orders match your filters.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
