"use client";

import React, { useState } from "react";
import { toast } from "react-toastify";

export default function DistributorPaymentClient({ distributorId, initialLimit = 0, initialUsed = 0 }: { distributorId: string; initialLimit?: number; initialUsed?: number }) {
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentUsed, setCurrentUsed] = useState(Number(initialUsed || 0));
  const [currentLimit] = useState(Number(initialLimit || 0));
  const [selectedId, setSelectedId] = useState(distributorId);

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`/api/outlet-admin/distributors/${selectedId}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount), note }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to record payment");
      setCurrentUsed(Number(json?.distributor?.creditUsedNpr ?? 0));
      toast.success(json?.message || "Payment recorded");
      setAmount("");
      setNote("");
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  const available = Math.max(0, currentLimit - currentUsed);

  return (
    <form onSubmit={submitPayment} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-600">Receive payment</p>
        <h2 className="mt-2 text-xl font-bold text-slate-900">Update distributor credit</h2>
        <p className="mt-1 text-sm text-slate-500">Use this after receiving payment at an outlet. 1 credit point = NPR 1.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
          <div className="text-slate-500 text-xs uppercase tracking-wider">Credit limit</div>
          <div className="mt-1 font-bold text-slate-900">NPR {currentLimit.toFixed(0)}</div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
          <div className="text-slate-500 text-xs uppercase tracking-wider">Used credit</div>
          <div className="mt-1 font-bold text-slate-900">NPR {currentUsed.toFixed(0)}</div>
        </div>
        <div className="rounded-2xl bg-cyan-50 p-4 border border-cyan-100">
          <div className="text-cyan-700 text-xs uppercase tracking-wider">Available</div>
          <div className="mt-1 font-bold text-cyan-900">NPR {available.toFixed(0)}</div>
        </div>
      </div>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Distributor ID</span>
        <input value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none" placeholder="Paste distributor id" required />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Payment amount</span>
        <input type="number" min={1} step="1" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none" placeholder="e.g. 50000" required />
      </label>

      <label className="block">
        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">Note</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 outline-none" placeholder="Optional receipt note" />
      </label>

      <button disabled={loading} className="w-full rounded-xl bg-cyan-600 px-4 py-3 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60">
        {loading ? "Recording…" : "Record payment"}
      </button>
    </form>
  );
}
