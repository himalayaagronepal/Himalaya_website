"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

type Order = {
  _id: string;
  totalAmount: number;
  paymentMethod?: string;
  orderStatus?: string;
  paymentStatus?: string;
};

const MERCHANT_CODE = process.env.NEXT_PUBLIC_ESEWA_MERCHANT_CODE || "";

function EsewaPayContent() {
  const params = useSearchParams();
  const orderId = params.get("orderId");
  const formRef = useRef<HTMLFormElement | null>(null);
  const [fields, setFields] = useState<Record<string, string> | null>(null);
  const [endpoint, setEndpoint] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [merchantError, setMerchantError] = useState<string | null>(null);

  useEffect(() => {
    if (!MERCHANT_CODE) {
      setMerchantError("eSewa merchant code is not configured. Set NEXT_PUBLIC_ESEWA_MERCHANT_CODE in your environment.");
      setLoading(false);
      return;
    }

    if (!orderId) {
      setError("Missing orderId");
      setLoading(false);
      return;
    }

    const loadPayload = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/esewa/payload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Unable to prepare eSewa payment');
        setEndpoint(data.endpoint);
        setFields(data.fields);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Unable to prepare eSewa payment');
      } finally {
        setLoading(false);
      }
    };

    loadPayload();
  }, [orderId, MERCHANT_CODE]);

  useEffect(() => {
    if (!loading && fields && endpoint && !error && formRef.current) {
      formRef.current.submit();
    }
  }, [loading, fields, endpoint, error]);

  if (loading) {
    return <div className="p-8 text-gray-900">Preparing eSewa payment...</div>;
  }

  if (merchantError) {
    return <div className="p-8 text-red-700">{merchantError}</div>;
  }

  if (error || !orderId || !fields || !endpoint) {
    return <div className="p-8 text-red-700">{error || "Unable to prepare eSewa payment."}</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Redirecting to eSewa</h1>
        <p className="mt-2 text-sm text-gray-600">Your order is being sent to the eSewa sandbox payment gateway.</p>
        <p className="mt-4 text-sm text-gray-700">Order ID: <span className="font-medium">{orderId}</span></p>
        <p className="mt-1 text-sm text-gray-700">Amount: <span className="font-medium">NPR {fields.total_amount}</span></p>
        <p className="mt-1 text-sm text-gray-700">Merchant code: <span className="font-medium">{MERCHANT_CODE || "(not configured)"}</span></p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-[#f8faf9] p-6 shadow-sm">
        <form ref={formRef} method="POST" action={endpoint} className="space-y-4">
          {Object.entries(fields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
          <div>
            <button type="submit" className="rounded-2xl bg-[#0891b2] px-4 py-3 text-sm font-semibold text-white hover:bg-[#0b78be] transition">
              Continue to eSewa
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EsewaPayPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-900">Preparing eSewa payment...</div>}>
      <EsewaPayContent />
    </Suspense>
  );
}
