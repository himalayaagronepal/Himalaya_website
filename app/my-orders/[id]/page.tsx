import React from "react";
import Link from "next/link";
import mongoose from "mongoose";
import connectToDatabase from "../../../lib/mongodb";
import Order from "../../../models/Order";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../lib/auth";
import CancelOrderButton from "../../components/CancelOrderButton";
import PrintInvoiceButton from "../../components/PrintInvoiceButton";

export default async function MyOrderDetail({ params }: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  const formatCurrency = (value: number | string | undefined | null) => `₹${Number(value || 0).toFixed(2)}`;
  const statusTone = (status: string) => status === "delivered"
    ? "bg-emerald-50 text-emerald-700"
    : status === "processing"
      ? "bg-amber-50 text-amber-700"
      : status === "cancelled"
        ? "bg-rose-50 text-rose-700"
        : "bg-cyan-50 text-cyan-700";

  // `params` can be a Promise in some Next.js runtimes — unwrap it safely.
  const resolvedParams = params instanceof Promise ? await params : params;
  const id = resolvedParams.id;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session) {
    return (
      <div className="max-w-3xl mx-auto py-24 px-4 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Please sign in</h2>
        <p className="mt-4 text-gray-600">You must be signed in to view your order details.</p>
      </div>
    );
  }

  await connectToDatabase();
  const order = await Order.findById(id).populate("items.product", "images").lean();
  if (!order) {
    return (
      <div className="max-w-3xl mx-auto py-24 px-4 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Order not found</h2>
        <p className="mt-4 text-gray-600">The order you are looking for may have been removed.</p>
        <Link
          href="/my-orders"
          className="mt-6 inline-flex items-center rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:border-[#059669] hover:text-[#059669] transition-colors"
        >
          Back to My Orders
        </Link>
      </div>
    );
  }
  // Allow env-based admin (id "admin") to view any order; otherwise check ownership
  const isAdmin = (session.user as any).role === "admin";
  if (!isAdmin && String(order.user) !== String((session.user as any).id)) {
    return (
      <div className="max-w-3xl mx-auto py-24 px-4 text-center">
        <h2 className="text-xl font-semibold text-gray-900">Unauthorized</h2>
        <p className="mt-4 text-gray-600">You do not have access to this order.</p>
      </div>
    );
  }

  const invoiceContainerId = `invoice-download-${String(order._id)}`;

  return (
    <main className="bg-white text-gray-900 min-h-screen">
      <div className="bg-[#f8faf9] border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <nav className="text-sm" aria-label="breadcrumb">
            <ol className="flex items-center gap-1.5 text-gray-500">
              <li><Link href="/" className="hover:text-[#059669] transition-colors">Home</Link></li>
              <li><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></li>
              <li><Link href="/my-orders" className="hover:text-[#059669] transition-colors">My Orders</Link></li>
              <li><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></li>
              <li className="text-gray-900 font-medium">Order #{String(order._id).slice(-8)}</li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#0891b2] uppercase tracking-widest mb-1">Order Details</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>Order #{String(order._id).slice(-8)}</h1>
            <p className="mt-2 text-sm text-gray-600">Placed {new Date(order.createdAt).toLocaleString()}</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${statusTone(order.orderStatus)}`}>
              {order.orderStatus}
            </span>
            <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">Payment: {order.paymentStatus}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6 items-start">
          <div className="min-w-0">
            <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-gray-900">Items</h2>
              <div className="mt-5 divide-y divide-gray-100 rounded-xl border border-gray-100 bg-white">
                {order.items.map((it: any) => (
                  <div key={String(it.product?._id || it.product)} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4">
                    <img
                      src={String(it.image || it.product?.images?.[0] || "/placeholder.png").trim() || "/placeholder.png"}
                      alt={it.name}
                      className="w-20 h-20 rounded-md object-cover border bg-gray-50"
                      loading="lazy"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">{it.name}</div>
                      <div className="text-sm text-gray-500">{it.brand || ""}{it.category ? ` • ${it.category}` : ""}</div>
                      <div className="mt-2 text-sm text-gray-600 inline-flex items-center rounded-md bg-gray-100 px-2 py-0.5">Qty: {it.quantity}</div>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="font-semibold text-gray-900">{formatCurrency(it.price * it.quantity)}</div>
                      <div className="text-sm text-gray-500">{formatCurrency(it.price)} each</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
                <h3 className="text-sm font-semibold text-gray-900">Shipping Address</h3>
                {order.shippingAddress ? (
                  <address className="mt-3 not-italic text-sm text-gray-600 space-y-1">
                    <div>{order.shippingAddress.name}</div>
                    <div>{order.shippingAddress.line1}</div>
                    <div>{order.shippingAddress.city} {order.shippingAddress.postalCode}</div>
                    <div>Phone: {order.shippingAddress.phone}</div>
                  </address>
                ) : (
                  <div className="mt-3 text-sm text-gray-500">No shipping address provided.</div>
                )}
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6">
                <h3 className="text-sm font-semibold text-gray-900">Order Progress</h3>
                <div className="mt-4">
                  <ol className="flex items-center gap-4 text-xs sm:text-sm text-gray-500">
                    <li className={`${["processing", "shipped", "delivered"].indexOf(order.orderStatus) >= 0 ? "text-gray-900 font-semibold" : ""}`}>Processing</li>
                    <li className={`flex-1 border-t ${["shipped", "delivered"].indexOf(order.orderStatus) >= 0 ? "border-cyan-400" : "border-gray-200"}`} />
                    <li className={`${["shipped", "delivered"].indexOf(order.orderStatus) >= 0 ? "text-gray-900 font-semibold" : ""}`}>Shipped</li>
                    <li className={`flex-1 border-t ${order.orderStatus === "delivered" ? "border-cyan-400" : "border-gray-200"}`} />
                    <li className={`${order.orderStatus === "delivered" ? "text-gray-900 font-semibold" : ""}`}>Delivered</li>
                  </ol>
                </div>

                <div className="mt-4 text-sm text-gray-600">Estimated delivery: <span className="font-medium">{order.estimatedDelivery || "TBD"}</span></div>
              </div>
            </section>

          </div>

          <aside className="w-full xl:w-auto xl:sticky xl:top-24 self-start">
            <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-900">Order Summary</h3>

              <dl className="mt-4 text-sm text-gray-600 space-y-3">
                <div className="flex items-center justify-between"><dt>Subtotal</dt><dd className="font-medium text-gray-900">{formatCurrency(order.subTotal ?? Number(order.totalAmount))}</dd></div>
                <div className="flex items-center justify-between"><dt>Shipping</dt><dd className="font-medium text-gray-900">{formatCurrency(order.shippingCost ?? 0)}</dd></div>
                <div className="flex items-center justify-between"><dt>Tax</dt><dd className="font-medium text-gray-900">{formatCurrency(order.tax ?? 0)}</dd></div>
                <div className="border-t border-gray-200 pt-3 flex items-center justify-between"><dt className="text-sm">Total</dt><dd className="text-lg font-extrabold text-gray-900">{formatCurrency(order.totalAmount)}</dd></div>
              </dl>

              <div className="mt-6 space-y-3">
                <CancelOrderButton orderId={String(order._id)} currentStatus={order.orderStatus} />
                <PrintInvoiceButton invoiceContainerId={invoiceContainerId} fileName={`invoice-${String(order._id).slice(-8)}`} />
                <Link className="block text-center text-sm text-cyan-700 hover:underline" href="/contact">Contact support</Link>
              </div>
            </div>

            <div className="mt-4 text-xs text-gray-500">If you need help with this order, contact support and include the order number.</div>
          </aside>
        </div>

        <div className="mt-8">
          <Link className="inline-flex items-center text-sm font-medium text-cyan-700 hover:underline" href="/my-orders">← Back to your orders</Link>
        </div>

        <section id={invoiceContainerId} className="hidden">
          <style>{`
            .invoice-export {
              width: 1000px;
              background: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 20px;
              overflow: hidden;
              font-family: "Segoe UI", Tahoma, sans-serif;
              color: #0f172a;
              box-shadow: 0 24px 60px rgba(2, 6, 23, 0.08);
            }
            .invoice-export-header {
              padding: 30px 34px;
              background: linear-gradient(140deg, #064e3b 0%, #059669 55%, #10b981 100%);
              color: #ecfeff;
              display: flex;
              justify-content: space-between;
              gap: 16px;
              align-items: flex-start;
            }
            .invoice-export-brand {
              font-size: 28px;
              line-height: 1;
              font-weight: 800;
              letter-spacing: 0.3px;
            }
            .invoice-export-brand-wrap {
              display: inline-flex;
              align-items: center;
              gap: 12px;
            }
            .invoice-export-logo-badge {
              background: rgba(255, 255, 255, 0.95);
              border: 1px solid rgba(255, 255, 255, 0.5);
              border-radius: 12px;
              padding: 8px 10px;
              box-shadow: 0 8px 24px rgba(2, 6, 23, 0.16);
            }
            .invoice-export-logo {
              width: 200px;
              height: auto;
              display: block;
              object-fit: contain;
            }
            .invoice-export-tag {
              margin-top: 10px;
              font-size: 13px;
              opacity: 0.95;
              letter-spacing: 0.4px;
            }
            .invoice-export-head-right {
              text-align: right;
            }
            .invoice-export-title {
              font-size: 22px;
              font-weight: 700;
              line-height: 1;
            }
            .invoice-export-code {
              margin-top: 8px;
              font-size: 15px;
              font-weight: 600;
            }
            .invoice-export-date {
              margin-top: 6px;
              font-size: 12px;
              opacity: 0.95;
            }
            .invoice-export-body {
              padding: 28px 32px 30px;
              background:
                radial-gradient(circle at 95% 0%, rgba(16, 185, 129, 0.08), transparent 35%),
                radial-gradient(circle at 0% 100%, rgba(6, 182, 212, 0.09), transparent 30%),
                #ffffff;
            }
            .invoice-export-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 16px;
            }
            .invoice-export-card {
              border: 1px solid #dbeafe;
              background: #f8fafc;
              border-radius: 14px;
              padding: 14px 16px;
            }
            .invoice-export-card h4 {
              margin: 0;
              font-size: 12px;
              color: #334155;
              text-transform: uppercase;
              letter-spacing: 1.1px;
            }
            .invoice-export-card p {
              margin: 7px 0 0;
              font-size: 14px;
              color: #1e293b;
            }
            .invoice-export-chip {
              display: inline-flex;
              margin-top: 8px;
              padding: 2px 10px;
              border-radius: 999px;
              font-size: 12px;
              font-weight: 700;
              text-transform: capitalize;
              letter-spacing: 0.3px;
              background: #ecfeff;
              color: #0f766e;
            }
            .invoice-export-table-wrap {
              margin-top: 20px;
              border: 1px solid #e2e8f0;
              border-radius: 14px;
              overflow: hidden;
            }
            .invoice-export-table {
              width: 100%;
              border-collapse: collapse;
              background: #ffffff;
            }
            .invoice-export-table thead th {
              background: #f1f5f9;
              color: #334155;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              text-align: left;
              padding: 12px 14px;
            }
            .invoice-export-table tbody td {
              border-top: 1px solid #f1f5f9;
              padding: 12px 14px;
              font-size: 14px;
              color: #0f172a;
            }
            .invoice-export-table .right {
              text-align: right;
            }
            .invoice-export-line-name {
              font-weight: 600;
              color: #0f172a;
            }
            .invoice-export-line-meta {
              margin-top: 2px;
              font-size: 12px;
              color: #64748b;
            }
            .invoice-export-footer {
              margin-top: 18px;
              display: flex;
              justify-content: space-between;
              gap: 14px;
              align-items: flex-end;
            }
            .invoice-export-note {
              max-width: 430px;
              font-size: 12px;
              color: #64748b;
              line-height: 1.5;
            }
            .invoice-export-total {
              width: 320px;
              border: 1px solid #dbeafe;
              border-radius: 14px;
              background: #ffffff;
              padding: 12px 14px;
            }
            .invoice-export-total-row {
              display: flex;
              justify-content: space-between;
              gap: 10px;
              font-size: 14px;
              color: #334155;
              padding: 6px 0;
            }
            .invoice-export-total-row strong {
              color: #0f172a;
            }
            .invoice-export-grand {
              border-top: 1px solid #e2e8f0;
              margin-top: 8px;
              padding-top: 10px;
              font-size: 20px;
              font-weight: 800;
              color: #065f46;
            }
          `}</style>

          <div className="invoice-export">
            <header className="invoice-export-header">
              <div>
                <div className="invoice-export-brand-wrap">
                  <div className="invoice-export-logo-badge">
                    <img className="invoice-export-logo" src="/logo.jpeg" alt="Himalaya Agro" />
                  </div>
                  <div className="invoice-export-brand">Himalaya Agro</div>
                </div>
                <div className="invoice-export-tag">Premium Nepalese Agricultural Products</div>
              </div>

              <div className="invoice-export-head-right">
                <div className="invoice-export-title">Tax Invoice</div>
                <div className="invoice-export-code">Order #{String(order._id).slice(-8)}</div>
                <div className="invoice-export-date">Issued {new Date(order.createdAt).toLocaleString()}</div>
              </div>
            </header>

            <div className="invoice-export-body">
              <div className="invoice-export-grid">
                <section className="invoice-export-card">
                  <h4>Bill To</h4>
                  <p>{order.shippingAddress?.name || "N/A"}</p>
                  <p>{order.shippingAddress?.line1 || "N/A"}</p>
                  <p>{order.shippingAddress?.city || ""} {order.shippingAddress?.postalCode || ""}</p>
                  <p>Phone: {order.shippingAddress?.phone || "N/A"}</p>
                </section>

                <section className="invoice-export-card">
                  <h4>Order Snapshot</h4>
                  <p>Payment: {order.paymentStatus}</p>
                  <p>Estimated delivery: {order.estimatedDelivery || "TBD"}</p>
                  <span className="invoice-export-chip">{order.orderStatus}</span>
                </section>
              </div>

              <div className="invoice-export-table-wrap">
                <table className="invoice-export-table">
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th className="right">Qty</th>
                      <th className="right">Price</th>
                      <th className="right">Line Total</th>
                    </tr>
                  </thead>

                  <tbody>
                    {order.items.map((it: any) => (
                      <tr key={`invoice-${String(it.product?._id || it.product)}`}>
                        <td>
                          <div className="invoice-export-line-name">{it.name}</div>
                          <div className="invoice-export-line-meta">{it.brand || "Himalaya Agro"}{it.category ? ` • ${it.category}` : ""}</div>
                        </td>
                        <td className="right">{it.quantity}</td>
                        <td className="right">{formatCurrency(it.price)}</td>
                        <td className="right"><strong>{formatCurrency(it.price * it.quantity)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="invoice-export-footer">
                <div className="invoice-export-note">
                  Thank you for shopping with Himalaya Agro. For order support, contact our team and mention your order number.
                </div>

                <div className="invoice-export-total">
                  <div className="invoice-export-total-row"><span>Subtotal</span><strong>{formatCurrency(order.subTotal ?? Number(order.totalAmount))}</strong></div>
                  <div className="invoice-export-total-row"><span>Shipping</span><strong>{formatCurrency(order.shippingCost ?? 0)}</strong></div>
                  <div className="invoice-export-total-row"><span>Tax</span><strong>{formatCurrency(order.tax ?? 0)}</strong></div>
                  <div className="invoice-export-total-row invoice-export-grand"><span>Total</span><span>{formatCurrency(order.totalAmount)}</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}