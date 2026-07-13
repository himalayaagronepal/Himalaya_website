"use client";

import React, { useRef, useState } from "react";
import { toast } from "react-toastify";

const FARM_OPTIONS = [
  { value: "", label: "— None —" },
  { value: "Poultry", label: "Poultry Sheds" },
  { value: "Buffalo", label: "Buffalo Farm" },
  { value: "Fish", label: "Fish Ponds" },
  { value: "Goat", label: "Goat Grazing" },
] as const;

export default function ProductRow({ product }: { product: any }) {
  const [busy, setBusy] = useState(false);
  const [farmDropOpen, setFarmDropOpen] = useState(false);
  const [currentFarm, setCurrentFarm] = useState<string>(product.farmCategory ?? "");
  const dropRef = useRef<HTMLDivElement>(null);

  // Keep local state in sync when the parent re-fetches and passes a fresh product prop
  React.useEffect(() => {
    setCurrentFarm(product.farmCategory ?? "");
  }, [product.farmCategory]);

  // Close the farm dropdown on outside click
  React.useEffect(() => {
    if (!farmDropOpen) return;
    function onDoc(e: MouseEvent) {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setFarmDropOpen(false);
      }
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [farmDropOpen]);

  async function remove() {
    if (!confirm("Delete product? This action cannot be undone.")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/products/${product._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error((await res.json()).message || "delete failed");
      toast.success("Deleted");
      location.reload();
    } catch (err: any) {
      toast.error(err.message || "Unable to delete");
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive() {
    setBusy(true);
    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !product.isActive }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "update failed");
      toast.success("Updated");
      location.reload();
    } catch (err: any) {
      toast.error(err.message || "Unable to update");
    } finally {
      setBusy(false);
    }
  }

  async function assignFarm(value: string) {
    setFarmDropOpen(false);
    if (value === currentFarm) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/products/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ farmCategory: value }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "update failed");
      setCurrentFarm(value);
      const label = FARM_OPTIONS.find((o) => o.value === value)?.label ?? "None";
      toast.success(value ? `Assigned to ${label}` : "Farm assignment removed");
    } catch (err: any) {
      toast.error(err.message || "Unable to update farm");
    } finally {
      setBusy(false);
    }
  }

  const farmLabel = FARM_OPTIONS.find((o) => o.value === currentFarm)?.label ?? "Farm";

  return (
    <tr className="align-top hover:bg-slate-50/60 transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.images?.[0] || "/placeholder.png"}
            className="w-10 h-10 object-cover rounded-2xl flex-shrink-0"
            alt={product.name}
          />
          <div className="min-w-0">
            <div className="font-semibold text-slate-900 truncate">{product.name}</div>
            <div className="text-xs text-slate-400 mt-0.5 truncate">{product.brand || "—"}</div>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 text-slate-600">{product.category || "—"}</td>
      <td className="px-5 py-4 font-extrabold text-slate-900">₹{product.price.toFixed(2)}</td>
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            product.stock > 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
          }`}
        >
          {product.stock}
          {product.unit ? ` ${product.unit}` : " units"}
        </span>
      </td>
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
            product.isActive ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-700"
          }`}
        >
          {product.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center gap-2 flex-wrap">
          <a
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-sky-600 hover:bg-sky-50 whitespace-nowrap"
            href={`/admin/products/edit/${product._id}`}
          >
            Edit
          </a>
          <button
            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 whitespace-nowrap"
            onClick={toggleActive}
            disabled={busy}
          >
            {product.isActive ? "Disable" : "Enable"}
          </button>

          {/* Farm assignment dropdown */}
          <div ref={dropRef} className="relative">
            <button
              onClick={() => setFarmDropOpen((o) => !o)}
              disabled={busy}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                currentFarm
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
              }`}
              title="Assign to farm page"
            >
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              {currentFarm ? farmLabel : "Farm"}
              <svg
                width="9"
                height="9"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`transition-transform ${farmDropOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {farmDropOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-44 rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Assign to farm
                </p>
                {FARM_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => assignFarm(opt.value)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-slate-50 ${
                      opt.value === currentFarm
                        ? "font-semibold text-emerald-700"
                        : "text-slate-700"
                    }`}
                  >
                    {opt.value === currentFarm && (
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="flex-shrink-0 text-emerald-600"
                      >
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {opt.value !== currentFarm && <span className="w-[10px] flex-shrink-0" />}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            className="rounded-full border border-rose-200 bg-white px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 whitespace-nowrap"
            onClick={remove}
            disabled={busy}
          >
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
}
