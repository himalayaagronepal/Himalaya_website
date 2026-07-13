"use client";

import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

export default function CartClient() {
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<any>(null);
  const [updating, setUpdating] = useState(false);

  async function fetchCart() {
    setLoading(true);
    const res = await fetch(`/api/cart`);
    const json = await res.json();
    setCart(json.cart || { items: [] });
    setLoading(false);
  }

  useEffect(() => {
    fetchCart();
  }, []);

  async function update(productId: string, quantity: number) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/cart`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, quantity }),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Cart update failed");
      toast.success("Cart updated");
      await fetchCart();
    } catch (err: any) {
      toast.error(err.message || "Unable to update cart");
    } finally {
      setUpdating(false);
    }
  }

  async function remove(productId?: string) {
    setUpdating(true);
    try {
      const res = await fetch(`/api/cart`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(productId ? { productId } : {}),
      });
      if (!res.ok) throw new Error((await res.json()).message || "Remove failed");
      toast.success("Removed");
      await fetchCart();
    } catch (err: any) {
      toast.error(err.message || "Unable to remove item");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) return <div className="py-12">Loading cart…</div>;
  if (!cart || !cart.items.length)
    return (
      <div className="py-14 px-6 text-center bg-[#f8faf9] border border-gray-100 rounded-2xl">
        <h2 className="text-xl font-semibold text-gray-900">Your cart is empty</h2>
        <p className="mt-3 text-gray-600">Browse the <a className="text-[#059669] font-medium hover:underline" href="/shop">shop</a> and add items to your cart.</p>
      </div>
    );

  // defensive total: skip items with missing product or invalid price
  const total = (cart.items || []).reduce((s: number, it: any) => {
    const price = Number(it?.product?.price ?? 0);
    const qty = Number(it?.quantity ?? 0);
    return s + price * qty;
  }, 0);

  const hasMissingProducts = (cart.items || []).some((it: any) => !it?.product);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 text-gray-900">
      <div className="lg:col-span-2 space-y-4 min-w-0">
        {(cart.items || []).map((it: any, idx: number) => {
          const prod = it?.product ?? null;
          const key = it?._id ?? prod?._id ?? `missing-${idx}`;

          if (!prod) {
            return (
              <article key={key} className="group bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden p-3 sm:p-5 flex items-start gap-3 sm:gap-4">
                <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0 flex items-center justify-center text-gray-300">
                  <img src="/placeholder.png" alt="product removed" className="w-full h-full object-cover" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">Product removed</div>
                      <div className="mt-1 text-xs text-gray-500">This product is no longer available</div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-sky-600">—</div>
                      <div className="text-xs text-gray-500 mt-1">—</div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-gray-500">Qty: {it.quantity}</div>
                    </div>

                    <div className="flex items-center gap-4">
                      <button className="text-sm text-gray-700 hover:text-[#059669] hover:underline" onClick={() => remove(it?._id)} disabled={updating}>Remove</button>
                    </div>
                  </div>
                </div>
              </article>
            );
          }

          // product exists — render normally but use safe accessors
          return (
            <article key={key} className="group bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden p-3 sm:p-5 flex items-start gap-3 sm:gap-4">
              <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#f8faf9] flex-shrink-0 border border-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={prod.images?.[0] || '/placeholder.png'} alt={prod.name || 'product'} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{prod.name}</div>
                    <div className="mt-1 text-xs text-gray-500">{prod.brand || ''}{prod.category ? ` • ${prod.category}` : ''}</div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-extrabold text-[#d97706]">₹{(Number(prod.price) || 0).toFixed(2)}</div>
                    <div className="text-xs text-gray-500 mt-1">₹{((Number(prod.price) || 0) * Number(it.quantity || 0)).toFixed(2)}</div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 sm:gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      aria-label={`Decrease quantity for ${prod.name}`}
                      className="w-8 h-8 rounded-lg border border-gray-200 text-gray-700 hover:bg-[#f8faf9] disabled:opacity-50"
                      onClick={() => update(prod._id, Math.max(1, it.quantity - 1))}
                      disabled={updating || it.quantity <= 1}
                    >−</button>
                    <input
                      className="w-20 rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-center"
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e) => update(prod._id, Math.max(1, Number(e.target.value) || 1))}
                    />
                    <button
                      aria-label={`Increase quantity for ${prod.name}`}
                      className="w-8 h-8 rounded-lg border border-gray-200 text-gray-700 hover:bg-[#f8faf9] disabled:opacity-50"
                      onClick={() => update(prod._id, Math.min((prod.stock || 9999), it.quantity + 1))}
                      disabled={updating || it.quantity >= (prod.stock || 9999)}
                    >+</button>
                    <div className="text-xs text-gray-500 ml-3">{prod.stock > 0 ? `${prod.stock} available` : 'Out of stock'}</div>
                  </div>

                  <div className="flex items-center gap-4">
                    <button className="text-sm text-gray-700 hover:text-[#059669] hover:underline" onClick={() => remove(prod._id)} disabled={updating}>Remove</button>
                    <a href={`/product/${prod._id}`} className="text-sm text-gray-700 hover:text-[#059669] hover:underline">View details</a>
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="text-sm text-gray-600">Need to change something? <a className="text-[#059669] font-medium hover:underline" href="/shop">Continue shopping</a></div>
          <div>
            <button className="text-sm text-gray-700 hover:text-[#059669] hover:underline" onClick={() => remove()} disabled={updating}>Clear cart</button>
          </div>
        </div>
      </div>

      <aside className="border border-gray-100 rounded-2xl p-5 sm:p-6 bg-[#f8faf9] shadow-sm lg:sticky lg:top-24 min-w-0">
        <div className="text-sm text-gray-500">Order summary</div>
        <div className="mt-2 flex items-baseline justify-between">
          <div className="text-xs text-gray-500">Items ({cart.items.length})</div>
          <div className="text-2xl font-extrabold text-[#d97706]">₹{total.toFixed(2)}</div>
        </div>

        <div className="mt-6">
          <a href="/checkout" className={`block w-full text-center rounded-xl ${hasMissingProducts ? 'bg-gray-300 text-gray-600 cursor-not-allowed' : 'bg-[#059669] text-white hover:bg-[#047857]'} py-3 text-sm font-semibold transition-colors`} onClick={(e) => hasMissingProducts && e.preventDefault()}>{hasMissingProducts ? 'Remove unavailable items' : 'Proceed to checkout'}</a>
          {hasMissingProducts && <div className="mt-3 text-sm text-amber-600">Some items were removed — please remove unavailable items before checking out.</div>}
        </div>

        <div className="mt-4 text-sm text-gray-500">Shipping & payment on next step. Free returns • Secure payments</div>

        <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-gray-600">
          <div className="px-3 py-2 bg-white border border-gray-100 rounded">Estimated delivery</div>
          <div className="px-3 py-2 bg-white border border-gray-100 rounded text-right">2–5 business days</div>
        </div>
      </aside>
    </div>
  );
}