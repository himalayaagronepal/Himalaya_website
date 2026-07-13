"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

type Order = {
  _id: string;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  orderStatus?: string;
};

function EsewaTestContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/orders/${encodeURIComponent(orderId)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Unable to load order");
        setOrder(data as Order);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unable to load order";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [orderId]);

  async function submitPayment(action: "pay" | "fail") {
    if (!orderId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/esewa/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Unable to process payment");
      toast.success(action === "pay" ? "Payment successful" : "Payment cancelled");
      router.push("/my-orders");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unable to process payment";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <div className="p-8 text-gray-900">Loading eSewa payment...</div>;
  }

  if (!orderId) {
    return <div className="p-8 text-gray-900">Missing order ID. Please return to checkout.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">eSewa Sandbox Payment</h1>
        <p className="mt-2 text-sm text-gray-600">This is a test eSewa payment simulator for order <span className="font-medium">{orderId}</span>.</p>
      </div>

      {order ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
          <div>
            <div className="text-sm text-gray-500">Order total</div>
            <div className="mt-1 text-3xl font-bold text-[#0891b2]">NPR {order.totalAmount.toFixed(2)}</div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-gray-100 bg-[#f8faf9] p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Payment method</div>
              <div className="mt-1 font-semibold">eSewa</div>
            </div>
            <div className="rounded-xl border border-gray-100 bg-[#f8faf9] p-4">
              <div className="text-xs uppercase tracking-wide text-gray-500">Order status</div>
              <div className="mt-1 font-semibold">{order.orderStatus || "pending"}</div>
            </div>
          </div>

          <div className="space-y-3">
            <button
              className="w-full rounded-2xl bg-[#0891b2] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0b78be] transition"
              onClick={() => submitPayment("pay")}
              disabled={submitting}
            >
              {submitting ? "Processing…" : "Simulate eSewa Payment Success"}
            </button>
            <button
              className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
              onClick={() => submitPayment("fail")}
              disabled={submitting}
            >
              {submitting ? "Processing…" : "Simulate eSewa Payment Failure"}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">Unable to load order details.</div>
      )}
    </div>
  );
}

export default function EsewaTestPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-900">Loading eSewa payment...</div>}>
      <EsewaTestContent />
    </Suspense>
  );
}
