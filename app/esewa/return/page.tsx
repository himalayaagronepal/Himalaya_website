"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { CheckCircle, AlertCircle, Package, Clock, MapPin, Phone, Loader } from "lucide-react";

type OrderItem = {
  name: string;
  quantity: number;
  price: number;
};

type VerifyResponse = {
  paymentStatus?: string;
  orderStatus?: string;
  message?: string;
  order?: {
    _id: string;
    totalAmount: number;
    items: OrderItem[];
    shippingAddress?: {
      name?: string;
      line1?: string;
      city?: string;
      phone?: string;
    };
  };
};

function EsewaReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<VerifyResponse>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pid = searchParams.get("pid") || searchParams.get("transaction_uuid");
    const refId = searchParams.get("refId") || searchParams.get("ref_id");
    const amt = searchParams.get("amt") || searchParams.get("total_amount");
    const scd = searchParams.get("scd") || searchParams.get("product_code");
    let response = searchParams.get("response") || searchParams.get("data");
    
    if (!response && typeof window !== "undefined") {
      const href = window.location.href || "";
      const marker = "?data=";
      const idx = href.indexOf(marker);
      if (idx !== -1) {
        response = href.substring(idx + marker.length);
      }
    }

    if (response) {
      try {
        const decoded = JSON.parse(atob(response));
        const paymentStatus = decoded.status || decoded.paymentStatus || "unknown";
        const orderStatus = decoded.status === "COMPLETE" ? "processing" : decoded.status === "FULL_REFUND" ? "cancelled" : decoded.status || "unknown";
        setResult({ paymentStatus, orderStatus, message: `eSewa response received: ${decoded.status}` });

        (async () => {
          try {
            setLoading(true);
            const pidFromData = decoded.transaction_uuid || decoded.pid || decoded.orderId || decoded.transactionId;
            const refIdFromData = decoded.transaction_code || decoded.rid || decoded.refId || decoded.ref || decoded.reference;
            const amtFromData = decoded.total_amount || decoded.amt || decoded.amount;
            const scdFromData = decoded.product_code || decoded.scd;

            if (pidFromData && refIdFromData && amtFromData) {
              const res = await fetch("/api/esewa/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  pid: pidFromData,
                  refId: refIdFromData,
                  amt: String(amtFromData),
                  scd: scdFromData,
                  responseData: decoded,
                }),
              });
              const data = await res.json().catch(() => ({}));
              if (res.ok) {
                setResult(data);
                toast.success("eSewa payment verified successfully!");
              } else {
                setResult((r) => ({ ...r, message: data.message || "Verification failed" }));
                toast.error(data.message || "Verification failed");
              }
            }
          } catch (e: unknown) {
            const m = e instanceof Error ? e.message : "Verification failed";
            toast.error(m);
          } finally {
            setLoading(false);
          }
        })();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unable to decode eSewa response");
        setLoading(false);
      }
      return;
    }

    if (!pid || !refId || !amt || !scd) {
      setError("Missing eSewa response parameters.");
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/esewa/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pid, refId, amt, scd }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Unable to verify payment");
        setResult(data);
        toast.success("eSewa payment verified successfully!");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unable to verify payment";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  const isSuccess = !error && (result.paymentStatus === "COMPLETE" || result.paymentStatus === "paid");
  const order = result.order;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg p-12 text-center">
            <Loader className="w-12 h-12 text-[#0891b2] mx-auto mb-4 animate-spin" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Verifying Payment</h2>
            <p className="text-slate-600">Please wait while we verify your eSewa payment...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-8">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-12 h-12 text-white flex-shrink-0" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Payment Error</h1>
                  <p className="text-red-100 mt-1">There was an issue processing your payment</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                <p className="text-red-800 font-medium">{error}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className="px-6 py-3 rounded-lg bg-[#0891b2] text-white font-semibold hover:bg-[#0b78be] transition-colors"
                  onClick={() => router.push("/cart")}
                >
                  Back to Cart
                </button>
                <button
                  className="px-6 py-3 rounded-lg border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                  onClick={() => router.push("/")}
                >
                  Home
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Success State */}
        {!loading && isSuccess && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-8">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-12 h-12 text-white flex-shrink-0" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Payment Successful!</h1>
                  <p className="text-emerald-100 mt-1">Your order has been confirmed</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Payment Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Payment Status</p>
                  <p className="text-lg font-bold text-emerald-600 mt-2">Completed</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Order Status</p>
                  <p className="text-lg font-bold text-blue-600 mt-2 capitalize">{result.orderStatus || "Processing"}</p>
                </div>
              </div>

              {/* Order Details */}
              {order && (
                <div className="space-y-6">
                  {/* Order Total */}
                  <div className="bg-gradient-to-br from-[#0891b2] to-[#0b78be] rounded-lg p-6 text-white">
                    <p className="text-sm opacity-90">Order Total</p>
                    <p className="text-4xl font-bold mt-2">NPR {order.totalAmount?.toFixed(2) || "0.00"}</p>
                  </div>

                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Package className="w-5 h-5 text-[#0891b2]" />
                        Order Items
                      </h3>
                      <div className="space-y-3 bg-slate-50 rounded-lg p-4 border border-slate-200">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
                            <div>
                              <p className="font-semibold text-slate-900">{item.name}</p>
                              <p className="text-sm text-slate-600">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-bold text-slate-900">NPR {(item.price * item.quantity).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Shipping Address */}
                  {order.shippingAddress && (
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#0891b2]" />
                        Delivery Address
                      </h3>
                      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                        {order.shippingAddress.name && (
                          <p className="font-semibold text-slate-900">{order.shippingAddress.name}</p>
                        )}
                        {order.shippingAddress.line1 && (
                          <p className="text-slate-700">{order.shippingAddress.line1}</p>
                        )}
                        {order.shippingAddress.city && (
                          <p className="text-slate-700">{order.shippingAddress.city}</p>
                        )}
                        {order.shippingAddress.phone && (
                          <p className="flex items-center gap-2 mt-3 text-slate-700">
                            <Phone className="w-4 h-4" /> {order.shippingAddress.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Estimated Delivery */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">Estimated Delivery</p>
                      <p className="text-sm text-blue-700 mt-1">Your order will be delivered within 2-3 business days</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
                <Link
                  href="/my-orders"
                  className="px-6 py-3 rounded-lg bg-[#0891b2] text-white font-semibold hover:bg-[#0b78be] transition-colors inline-block"
                >
                  View My Orders
                </Link>
                <Link
                  href="/shop"
                  className="px-6 py-3 rounded-lg border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors inline-block"
                >
                  Continue Shopping
                </Link>
                <Link
                  href="/"
                  className="px-6 py-3 rounded-lg border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors inline-block"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Pending/Other Status */}
        {!loading && !error && !isSuccess && result.paymentStatus && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8">
              <div className="flex items-center gap-4">
                <Clock className="w-12 h-12 text-white flex-shrink-0" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Payment Pending</h1>
                  <p className="text-orange-100 mt-1">Your payment is being processed</p>
                </div>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                <p className="text-orange-800 font-medium">
                  Status: <span className="font-bold">{result.paymentStatus}</span>
                </p>
                <p className="text-sm text-orange-700 mt-2">{result.message || "Please wait while we process your payment."}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className="px-6 py-3 rounded-lg bg-[#0891b2] text-white font-semibold hover:bg-[#0b78be] transition-colors"
                  onClick={() => router.push("/my-orders")}
                >
                  Check Order Status
                </button>
                <button
                  className="px-6 py-3 rounded-lg border-2 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                  onClick={() => router.push("/")}
                >
                  Home
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EsewaReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 px-4 flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 text-[#0891b2] mx-auto mb-4 animate-spin" />
            <p className="text-slate-600">Loading...</p>
          </div>
        </div>
      }
    >
      <EsewaReturnContent />
    </Suspense>
  );
}
