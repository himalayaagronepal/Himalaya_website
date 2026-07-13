import React from "react";
import Link from "next/link";
import mongoose from "mongoose";
import connectToDatabase from "../../lib/mongodb";
import Order from "../../models/Order";
import { getServerSession } from "next-auth/next";
import authOptions from "../../lib/auth";

import CancelOrderButton from "../components/CancelOrderButton";

export default async function MyOrdersPage() {
  const formatCurrency = (value: number | string | undefined | null) => `₹${Number(value || 0).toFixed(2)}`;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session) {
    return (
      <div className="max-w-3xl mx-auto py-24 px-4 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Please sign in</h2>
        <p className="mt-4 text-gray-600">You must be signed in to view your orders.</p>
      </div>
    );
  }

  await connectToDatabase();

  // Guard: env-based admin has id "admin" which is not a valid ObjectId
  const userId = session.user.id;
  const orders = mongoose.Types.ObjectId.isValid(userId)
    ? await Order.find({ user: userId }).sort({ createdAt: -1 }).lean()
    : [];

  return (
    <main className="bg-white text-gray-900 min-h-screen">
      <div className="bg-[#f8faf9] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="text-sm" aria-label="breadcrumb">
            <ol className="flex items-center gap-1.5 text-gray-500">
              <li><Link href="/" className="hover:text-[#059669] transition-colors">Home</Link></li>
              <li><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></li>
              <li className="text-gray-900 font-medium">My Orders</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl pt-6 sm:pt-8 pb-10 sm:pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#0891b2] uppercase tracking-widest mb-1">Order History</p>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>My Orders</h1>
            <p className="mt-2 text-sm text-gray-600">Track recent purchases, view details, and cancel eligible orders.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-[#059669] hover:text-[#059669] transition-colors"
            >
              Continue shopping
            </Link>
            <div className="text-sm text-gray-500">{orders.length} orders</div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {orders.map((o: any) => (
            <article key={String(o._id)} className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-16 shrink-0">
                      <div className="text-xs uppercase tracking-wide text-gray-500">Order</div>
                      <div className="font-semibold text-gray-900">#{String(o._id).slice(-8)}</div>
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="text-sm text-gray-600">{o.items.length} items</div>
                        <div className="h-4 w-px bg-gray-200" />
                        <div className="text-sm text-gray-600">Placed {new Date(o.createdAt).toLocaleDateString()}</div>
                        <div className="h-4 w-px bg-gray-200" />
                        <div className="text-sm text-gray-600">Payment: <span className="font-semibold text-gray-800">{o.paymentStatus}</span></div>
                      </div>

                      <div className="mt-3 flex items-center gap-3">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${o.orderStatus === "delivered" ? "bg-emerald-50 text-emerald-700" : o.orderStatus === "processing" ? "bg-amber-50 text-amber-700" : o.orderStatus === "cancelled" ? "bg-rose-50 text-rose-700" : "bg-cyan-50 text-cyan-700"}`}>
                          {o.orderStatus}
                        </span>

                        <div className="text-sm text-gray-600">Total: <span className="font-semibold text-gray-900">{formatCurrency(o.totalAmount)}</span></div>
                      </div>

                      <div className="mt-4 text-sm text-gray-600 line-clamp-2">{o.items.map((it: any) => it.name).slice(0, 3).join(" • ")}{o.items.length > 3 ? ` • +${o.items.length - 3} more` : ""}</div>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-start md:items-end gap-3">
                  <Link
                    href={`/my-orders/${o._id}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#059669] px-4 py-2 text-sm font-semibold text-white hover:bg-[#047857] transition-colors"
                  >
                    View details
                  </Link>
                  <CancelOrderButton orderId={String(o._id)} currentStatus={o.orderStatus} />
                </div>
              </div>
            </article>
          ))}

          {orders.length === 0 && (
            <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-8 h-8 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5A1.5 1.5 0 014.5 6h15A1.5 1.5 0 0121 7.5v9a1.5 1.5 0 01-1.5 1.5h-15A1.5 1.5 0 013 16.5v-9z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 9h18" /></svg>
              </div>
              <p className="text-gray-700 font-medium">You have no orders yet</p>
              <p className="text-sm text-gray-500 mt-1">Start shopping to place your first order.</p>
              <Link
                href="/shop"
                className="mt-5 inline-flex items-center rounded-lg bg-[#059669] px-4 py-2 text-sm font-semibold text-white hover:bg-[#047857] transition-colors"
              >
                Explore products
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}