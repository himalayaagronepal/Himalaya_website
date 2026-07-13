"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

type Product = {
  _id: string;
  name: string;
  brand?: string;
  description?: string;
  category?: string;
  price: number;
  stock: number;
  unit?: string;
  images?: string[];
  isActive?: boolean;
};

type ProductLog = {
  _id: string;
  type: "sale" | "add" | "expiry" | "adjust";
  quantity: number;
  before: number;
  after: number;
  note?: string;
  actorName?: string;
  createdAt: string;
};

export default function OutletProductDetailsClient({
  product,
  initialLogs,
  outletSlug,
}: {
  product: Product;
  initialLogs: ProductLog[];
  outletSlug: string;
}) {
  const router = useRouter();
  const [logs, setLogs] = useState<ProductLog[]>(initialLogs);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ type: "sale", quantity: "", note: "" });

  const title = useMemo(() => product.name, [product.name]);

  async function submitLog(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const res = await fetch(`/api/products/${product._id}/logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          quantity: Number(form.quantity),
          note: form.note,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to update stock log");

      setLogs((prev) => [data.log, ...prev]);
      toast.success("Stock log updated");
      router.refresh();
      setForm({ type: form.type, quantity: "", note: "" });
    } catch (error: any) {
      toast.error(error.message || "Unable to update log");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-600">Outlet Product</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">{title}</h2>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-600">
              {product.brand && <span>Brand: {product.brand}</span>}
              {product.category && <span>Category: {product.category}</span>}
              <span>Price: Rs. {product.price.toFixed(2)}</span>
              <span>Stock: {product.stock} {product.unit || "units"}</span>
            </div>
            {product.description && <p className="mt-4 text-slate-600 leading-relaxed">{product.description}</p>}
          </div>
          <div className="w-full md:w-80 rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Quick Log Update</p>
            <form onSubmit={submitLog} className="mt-4 space-y-3">
              <select
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              >
                <option value="sale">Sold</option>
                <option value="add">Add stock</option>
                <option value="expiry">Expired</option>
                <option value="adjust">Adjust stock</option>
              </select>
              <input
                type="number"
                min="1"
                step="1"
                required
                value={form.quantity}
                onChange={(e) => setForm((prev) => ({ ...prev, quantity: e.target.value }))}
                placeholder="Quantity"
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <textarea
                value={form.note}
                onChange={(e) => setForm((prev) => ({ ...prev, note: e.target.value }))}
                rows={3}
                placeholder="Optional note"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 resize-none"
              />
              <button
                disabled={busy}
                className="w-full rounded-lg bg-cyan-600 text-white font-medium px-4 py-2 disabled:opacity-50"
              >
                {busy ? "Updating..." : "Update Log"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Product Log</h3>
            <span className="text-sm text-slate-500">{logs.length} entries</span>
          </div>
          <div className="space-y-3">
            {logs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-slate-500">
                No stock logs yet.
              </div>
            ) : (
              logs.map((log) => {
                const actionLabel =
                  log.type === "sale"
                    ? `Sold ${log.quantity} ${product.unit || "units"}`
                    : log.type === "add"
                      ? `Added ${log.quantity} ${product.unit || "units"}`
                      : log.type === "expiry"
                        ? `Expired ${log.quantity} ${product.unit || "units"}`
                        : `Adjusted by ${log.quantity} ${product.unit || "units"}`;

                return (
                  <div key={log._id} className="rounded-xl border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-slate-900">{actionLabel}</p>
                        <p className="text-sm text-slate-500 mt-1">
                          {log.actorName ? `By ${log.actorName}` : "Manual entry"}
                          {log.note ? ` · ${log.note}` : ""}
                        </p>
                      </div>
                      <div className="text-right text-sm text-slate-500">
                        <div>{new Date(log.createdAt).toLocaleString()}</div>
                        <div className="mt-1">{log.before} → {log.after}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Inventory Summary</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between"><span>Current stock</span><span className="font-semibold text-slate-900">{product.stock} {product.unit || "units"}</span></div>
            <div className="flex items-center justify-between"><span>Status</span><span className={`font-semibold ${product.isActive ? "text-emerald-600" : "text-slate-500"}`}>{product.isActive ? "Active" : "Inactive"}</span></div>
            <div className="flex items-center justify-between"><span>Outlet</span><span className="font-semibold text-slate-900">{outletSlug}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
