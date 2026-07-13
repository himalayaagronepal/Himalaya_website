"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function AddToCart({ product }: { product: any }) {
  const [qty, setQty] = useState(1);
  const { data: session } = useSession();
  const role = (session as any)?.user?.role;
  const distributorStatus = (session as any)?.user?.distributorStatus;
  const router = useRouter();
  const disabled = product.stock < 1;

  function enforcePurchaseAccess() {
    if (!session) {
      toast.info("Please sign in or create an account to continue.");
      const from = typeof window !== "undefined" ? window.location.pathname : "/";
      router.push(`/login?from=${encodeURIComponent(from)}`);
      return false;
    }
    // Normal customers can buy directly; approved distributors keep their existing access.
    if (role === "user") return true;
    if (role === "distributor" && distributorStatus === "approved") return true;
    toast.error("This account type can't buy online.");
    return false;
  }

  function buyNow() {
    if (!enforcePurchaseAccess()) return;
    const safeQty = Math.max(1, Math.min(Number(product.stock) || 1, Number(qty) || 1));
    const checkoutUrl = `/checkout?buyNow=${encodeURIComponent(product._id)}&qty=${safeQty}`;
    router.push(checkoutUrl);
  }

  async function add() {
    if (!enforcePurchaseAccess()) return;
    try {
      const res = await fetch(`/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id, quantity: qty }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Failed to add");
      toast.success("Added to cart");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Unable to add to cart");
    }
  }

  return (
    <div className="space-y-4">
      {/* Quantity selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-semibold text-gray-700">Quantity</label>
        <div className="flex items-center border-2 border-gray-200 rounded-xl overflow-hidden">
          <button
            type="button"
            onClick={() => setQty(Math.max(1, qty - 1))}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#059669] transition-colors"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" /></svg>
          </button>
          <input
            type="number"
            min={1}
            max={product.stock}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            className="w-14 h-10 text-center text-sm font-bold border-x-2 border-gray-200 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setQty(Math.min(product.stock || 99, qty + 1))}
            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-[#059669] transition-colors"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#059669] text-white text-sm font-bold rounded-xl hover:bg-[#047857] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          onClick={add}
          disabled={disabled}
        >
          <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" /></svg>
          Add to Cart
        </button>
        <button
          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 border-2 border-[#d97706] text-[#d97706] text-sm font-bold rounded-xl hover:bg-[#d97706] hover:text-white transition-colors duration-200"
          onClick={buyNow}
          disabled={disabled}
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}