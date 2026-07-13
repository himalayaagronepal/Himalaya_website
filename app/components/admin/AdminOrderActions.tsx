"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed"];

export default function AdminOrderActions({ orderId, initialOrderStatus, initialPaymentStatus }: { orderId: string; initialOrderStatus: string; initialPaymentStatus: string }) {
  const [orderStatus, setOrderStatus] = useState(initialOrderStatus);
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  async function save() {
    if (!confirm('Apply status changes?')) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus, paymentStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Update failed');
      toast.success('Order updated');
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || 'Unable to update order');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="bg-white/90 border border-slate-100 rounded-3xl p-6 text-slate-900 shadow-sm">
      <h3 className="text-base font-semibold text-slate-900">Order actions</h3>
      <div className="mt-1 text-xs text-slate-400">Update order and payment status.</div>
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm text-slate-500">Order status</label>
          <select className="mt-2 block w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900" value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)}>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm text-slate-500">Payment status</label>
          <select className="mt-2 block w-full rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
            {PAYMENT_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="pt-2">
          <button className="w-full rounded-full bg-slate-900 text-white py-2.5 text-sm font-medium" disabled={saving} onClick={save}>{saving ? 'Saving…' : 'Save changes'}</button>
        </div>
      </div>
    </div>
  );
}