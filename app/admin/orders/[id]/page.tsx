import React from "react";
import connectToDatabase from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../lib/auth";
import { hasPermission } from "../../../../lib/permissions";

import AdminOrderActions from "../../../components/admin/AdminOrderActions";

export default async function AdminOrderDetail({ params }: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  // `params` can be a Promise in some Next.js runtimes — unwrap safely.
  const resolvedParams = params instanceof Promise ? await params : params;
  const id = resolvedParams.id;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "orders")) return <div className="p-12 bg-white text-slate-900 rounded-3xl shadow-sm">Unauthorized</div>;

  await connectToDatabase();
  const order = await Order.findById(id).populate("user", "email name").lean();
  if (!order) return <div className="p-12 bg-white text-slate-900 rounded-3xl shadow-sm">Order not found</div>;

  function statusColor(s: string) {
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
    <main className="pb-16">
      <div className="max-w-7xl mx-auto py-16 px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-sky-600">Order detail</span>
            <h1 className="mt-3 text-4xl font-black text-slate-900">Order #{String(order._id).slice(-8)}</h1>
            <p className="mt-3 text-sm text-slate-500">
              {order.items.length} item{order.items.length !== 1 ? 's' : ''} ·{' '}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColor(order.orderStatus)}`}>{order.orderStatus}</span>{' '}
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${paymentColor(order.paymentStatus)}`}>{order.paymentStatus}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a href="/admin/orders" className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm text-slate-700">← Back to orders</a>
          </div>
        </div>

        {/* Content */}
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main — 2 cols */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <section className="bg-white/90 border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-slate-900">Order items</h2>
              <p className="mt-1 text-xs text-slate-400">{order.items.length} product{order.items.length !== 1 ? 's' : ''} in this order.</p>

              <div className="mt-6 space-y-3">
                {order.items.map((it: any) => (
                  <div key={String(it.product)} className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white px-4 py-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 truncate">{it.name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">Qty: {it.quantity} × ₹{it.price.toFixed(2)}</div>
                    </div>
                    <div className="text-right font-extrabold text-slate-900">₹{(it.price * it.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </section>

            {/* Customer & Shipping */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Customer */}
              <section className="bg-white/90 border border-slate-100 rounded-3xl p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Customer</h3>
                <dl className="mt-4 grid grid-cols-1 gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Name</dt>
                    <dd className="font-semibold text-slate-900">{(order.user as any)?.name || '—'}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Email</dt>
                    <dd className="font-semibold text-slate-900">{(order.user as any)?.email || '—'}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-slate-500">Payment</dt>
                    <dd className="font-semibold text-slate-900">{order.paymentMethod || 'cod'}</dd>
                  </div>
                </dl>
              </section>

              {/* Shipping */}
              {order.shippingAddress && (
                <section className="bg-white/90 border border-slate-100 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-base font-semibold text-slate-900">Shipping address</h3>
                  <div className="mt-4 text-sm text-slate-600 space-y-1">
                    <div className="font-semibold text-slate-900">{order.shippingAddress.name}</div>
                    <div>{order.shippingAddress.line1}</div>
                    <div>{order.shippingAddress.city} {order.shippingAddress.postalCode}</div>
                    <div className="text-slate-500">Phone: {order.shippingAddress.phone}</div>
                  </div>
                </section>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside id="actions">
            <AdminOrderActions orderId={String(order._id)} initialOrderStatus={order.orderStatus} initialPaymentStatus={order.paymentStatus} />
          </aside>
        </div>
      </div>
    </main>
  );
}
