"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "react-toastify";
import { AlertCircle, CheckCircle2, Loader, Lock, ShoppingCart, Truck } from "lucide-react";

type CheckoutProduct = {
  _id: string;
  name: string;
  price: number;
  images?: string[];
  isActive?: boolean;
  stock?: number;
  outlet?: string;
  brand?: string;
  category?: string;
};

type CheckoutCartItem = {
  product: CheckoutProduct;
  quantity: number;
};

type CheckoutCart = {
  items: CheckoutCartItem[];
  checkoutMode?: 'buyNow' | 'cart';
};

type CheckoutUser = {
  role?: string;
  distributorStatus?: string;
  creditLimitNpr?: number;
  creditUsedNpr?: number;
};

// Only distributors may pay by credit. Everyone else (normal customers) pays via eSewa.

type FormErrors = {
  name?: string;
  line1?: string;
  city?: string;
  phone?: string;
  general?: string;
};

export default function CheckoutClient() {
  const [cart, setCart] = useState<CheckoutCart | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [shipping, setShipping] = useState({ name: "", line1: "", city: "", postalCode: "", phone: "" });
  const [freshUser, setFreshUser] = useState<CheckoutUser | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'credit' | 'esewa'>('credit');
  const { data: session } = useSession();
  const sessionUser = session?.user as CheckoutUser | undefined;
  const currentUser = freshUser ?? sessionUser;
  const isDistributor = currentUser?.role === "distributor";
  const router = useRouter();
  const searchParams = useSearchParams();
  const buyNowProductId = searchParams.get("buyNow");
  const buyNowQtyRaw = Number(searchParams.get("qty") || 1);
  const buyNowQty = Number.isFinite(buyNowQtyRaw) ? Math.max(1, buyNowQtyRaw) : 1;
  const isBuyNow = Boolean(buyNowProductId);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    const load = async () => {
      try {
        if (buyNowProductId) {
          const productRes = await fetch(`/api/products/${encodeURIComponent(buyNowProductId)}`);
          const product = (await productRes.json()) as CheckoutProduct & { message?: string };
          if (!productRes.ok || !product?._id) throw new Error(product?.message || 'Unable to load product');
          if (!product.isActive || (product.stock || 0) < 1) throw new Error('Product is not available');

          const qty = Math.min(buyNowQty, Number(product.stock) || buyNowQty);
          if (!mounted) return;
          setCart({ items: [{ product, quantity: qty }], checkoutMode: 'buyNow' });
          return;
        }

        const res = await fetch('/api/cart');
        const data = (await res.json()) as { cart?: CheckoutCart; message?: string };
        if (!res.ok) throw new Error(data?.message || 'Unable to load cart');
        if (!mounted) return;
        setCart(data.cart || { items: [] });
      } catch (err: unknown) {
        if (mounted) {
          setCart({ items: [] });
          const message = err instanceof Error ? err.message : 'Unable to load buy now item';
          if (buyNowProductId) toast.error(message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();
    return () => { mounted = false; };
  }, [buyNowProductId, buyNowQty]);

  useEffect(() => {
    let mounted = true;
    const loadUser = async () => {
      if (!session) return;
      try {
        const res = await fetch('/api/user', { cache: 'no-store', credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (mounted) setFreshUser(data as CheckoutUser);
      } catch {
        // ignore stale user fetch errors
      }
    };

    loadUser();
    return () => { mounted = false; };
  }, [session]);

  // Normal customers can only pay via eSewa — force it once we know the role.
  useEffect(() => {
    if (currentUser && !isDistributor) setPaymentMethod("esewa");
  }, [currentUser, isDistributor]);

  function updateField<K extends keyof typeof shipping>(k: K, v: string) {
    setShipping((s) => ({ ...s, [k]: v }));
    // Clear error for this field when user starts typing
    if (formErrors[k as keyof FormErrors]) {
      setFormErrors((prev) => ({ ...prev, [k]: undefined }));
    }
  }

  function validateForm(): boolean {
    const errors: FormErrors = {};

    if (!shipping.name?.trim()) {
      errors.name = "Full name is required";
    }

    if (!shipping.line1?.trim()) {
      errors.line1 = "Address is required";
    }

    if (!shipping.phone?.trim()) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{9,15}$/.test(shipping.phone.replace(/[\s\-\+]/g, ''))) {
      errors.phone = "Please enter a valid phone number";
    }

    if (shipping.city && shipping.city.length > 50) {
      errors.city = "City name is too long";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function placeOrder() {
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    if (!cart || !cart.items?.length) {
      toast.error('Cart is empty');
      return;
    }

    if (paymentMethod === 'credit') {
      const creditLimit = Number(currentUser?.creditLimitNpr || 0);
      const creditUsed = Number(currentUser?.creditUsedNpr || 0);
      const available = Math.max(0, creditLimit - creditUsed);
      if (available < subtotal) {
        toast.error(`Insufficient credit. Available: NPR ${available.toFixed(2)}`);
        return;
      }
    }

    const items = cart.items.map((it: CheckoutCartItem) => ({ productId: it.product._id, quantity: it.quantity }));
    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, paymentMethod, shippingAddress: shipping, checkoutMode: cart.checkoutMode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Order failed');
      toast.success('Order placed successfully!');
      if (paymentMethod === 'esewa' && data?._id) {
        router.push(`/esewa/pay?orderId=${encodeURIComponent(data._id)}`);
      } else {
        router.push('/my-orders');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unable to place order';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-10 h-10 text-[#0891b2] mx-auto mb-3 animate-spin" />
          <p className="text-slate-600 font-medium">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!cart) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-2xl">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <p className="text-slate-900 font-semibold">Unable to load cart</p>
      </div>
    );
  }

  const subtotal = cart.items.reduce((s: number, it: CheckoutCartItem) => s + (it.product?.price || 0) * (it.quantity || 0), 0);
  const creditLimit = Number(currentUser?.creditLimitNpr || 0);
  const creditUsed = Number(currentUser?.creditUsedNpr || 0);
  const availableCredit = Math.max(0, creditLimit - creditUsed);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Shipping Details */}
        <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Truck className="w-6 h-6 text-[#0891b2]" />
            <h2 className="text-2xl font-bold text-slate-900">Shipping Details</h2>
          </div>
          <p className="text-slate-600 mb-6">Where should we deliver your order?</p>

          <div className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block">
                <span className="text-sm font-semibold text-slate-900 mb-2 block">Full Name *</span>
                <input
                  type="text"
                  placeholder="Your name"
                  value={shipping.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 ${
                    formErrors.name 
                      ? 'border-red-300 bg-red-50 focus:border-red-500' 
                      : 'border-slate-200 focus:border-[#0891b2]'
                  }`}
                />
              </label>
              {formErrors.name && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {formErrors.name}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block">
                <span className="text-sm font-semibold text-slate-900 mb-2 block">Address *</span>
                <input
                  type="text"
                  placeholder="123 Main Street, Apartment 4B"
                  value={shipping.line1}
                  onChange={(e) => updateField('line1', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 ${
                    formErrors.line1 
                      ? 'border-red-300 bg-red-50 focus:border-red-500' 
                      : 'border-slate-200 focus:border-[#0891b2]'
                  }`}
                />
              </label>
              {formErrors.line1 && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {formErrors.line1}
                </p>
              )}
            </div>

            {/* City and Postal Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-900 mb-2 block">City</span>
                  <input
                    type="text"
                    placeholder="Kathmandu"
                    value={shipping.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 ${
                      formErrors.city 
                        ? 'border-red-300 bg-red-50 focus:border-red-500' 
                        : 'border-slate-200 focus:border-[#0891b2]'
                    }`}
                  />
                </label>
                {formErrors.city && (
                  <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" /> {formErrors.city}
                  </p>
                )}
              </div>

              <div>
                <label className="block">
                  <span className="text-sm font-semibold text-slate-900 mb-2 block">Postal Code</span>
                  <input
                    type="text"
                    placeholder="44600"
                    value={shipping.postalCode}
                    onChange={(e) => updateField('postalCode', e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 focus:border-[#0891b2]"
                  />
                </label>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="block">
                <span className="text-sm font-semibold text-slate-900 mb-2 block">Phone Number *</span>
                <input
                  type="tel"
                  placeholder="+977 1234567890"
                  value={shipping.phone}
                  onChange={(e) => updateField('phone', e.target.value)}
                  className={`w-full px-4 py-3 rounded-lg border transition-colors focus:outline-none focus:ring-2 focus:ring-[#0891b2]/20 ${
                    formErrors.phone 
                      ? 'border-red-300 bg-red-50 focus:border-red-500' 
                      : 'border-slate-200 focus:border-[#0891b2]'
                  }`}
                />
              </label>
              {formErrors.phone && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> {formErrors.phone}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Payment Method */}
        <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-[#0891b2]" />
            <h2 className="text-2xl font-bold text-slate-900">Payment Method</h2>
          </div>
          <p className="text-slate-600 mb-6">How would you like to pay for this order?</p>

          <div className={`grid grid-cols-1 gap-4 mb-6 ${isDistributor ? 'sm:grid-cols-2' : ''}`}>
            {/* Credit Option — distributors only */}
            {isDistributor && (
            <label className={`relative rounded-xl border-2 p-5 cursor-pointer transition-all ${
              paymentMethod === 'credit'
                ? 'border-emerald-500 bg-emerald-50'
                : 'border-slate-200 hover:border-slate-300'
            }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="credit"
                checked={paymentMethod === 'credit'}
                onChange={() => setPaymentMethod('credit')}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === 'credit' ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300'
                }`}>
                  {paymentMethod === 'credit' && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Distributor Credit</p>
                  <p className="text-sm text-slate-600 mt-1">Pay from your approved credit account</p>
                </div>
              </div>
            </label>
            )}

            {/* eSewa Option */}
            <label className={`relative rounded-xl border-2 p-5 cursor-pointer transition-all ${
              paymentMethod === 'esewa'
                ? 'border-[#0891b2] bg-[#0891b2]/5'
                : 'border-slate-200 hover:border-slate-300'
            }`}>
              <input
                type="radio"
                name="paymentMethod"
                value="esewa"
                checked={paymentMethod === 'esewa'}
                onChange={() => setPaymentMethod('esewa')}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center flex-shrink-0 ${
                  paymentMethod === 'esewa' ? 'border-[#0891b2] bg-[#0891b2]' : 'border-slate-300'
                }`}>
                  {paymentMethod === 'esewa' && <CheckCircle2 className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">eSewa Payment</p>
                  <p className="text-sm text-slate-600 mt-1">Pay online via eSewa gateway</p>
                </div>
              </div>
            </label>
          </div>

          {/* Payment Info */}
          {paymentMethod === 'credit' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <p className="text-sm text-emerald-900 font-semibold mb-3">Your Credit Information</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded p-3 text-center">
                  <p className="text-xs text-slate-600 font-medium">Limit</p>
                  <p className="text-lg font-bold text-slate-900">NPR {creditLimit.toFixed(0)}</p>
                </div>
                <div className="bg-white rounded p-3 text-center">
                  <p className="text-xs text-slate-600 font-medium">Used</p>
                  <p className="text-lg font-bold text-slate-900">NPR {creditUsed.toFixed(0)}</p>
                </div>
                <div className="bg-white rounded p-3 text-center">
                  <p className="text-xs text-slate-600 font-medium">Available</p>
                  <p className={`text-lg font-bold ${availableCredit >= subtotal ? 'text-emerald-600' : 'text-red-600'}`}>
                    NPR {availableCredit.toFixed(0)}
                  </p>
                </div>
              </div>
              {availableCredit < subtotal && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>Insufficient credit for this order</span>
                </div>
              )}
            </div>
          )}

          {paymentMethod === 'esewa' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                You will be redirected to eSewa to complete the payment after placing your order.
              </p>
            </div>
          )}
        </section>

        {/* Order Items */}
        <section className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingCart className="w-6 h-6 text-[#0891b2]" />
            <h2 className="text-2xl font-bold text-slate-900">Order Items</h2>
          </div>

          <div className="space-y-4">
            {cart.items.map((it: CheckoutCartItem) => (
              <div key={it.product._id} className="flex gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-white border border-slate-200 flex-shrink-0">
                  <img
                    src={it.product.images?.[0] || '/placeholder.png'}
                    alt={it.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{it.product.name}</p>
                  <p className="text-sm text-slate-600">Qty: {it.quantity}</p>
                  {it.product.brand && <p className="text-xs text-slate-500 mt-1">{it.product.brand}</p>}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-slate-900">NPR {(it.product.price * it.quantity).toFixed(2)}</p>
                  <p className="text-xs text-slate-600">@NPR {it.product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {!isBuyNow && (
            <Link
              href="/cart"
              className="mt-4 inline-flex text-[#0891b2] hover:text-[#0b78be] font-medium text-sm transition-colors"
            >
              ← Edit cart
            </Link>
          )}
        </section>
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:sticky lg:top-4 h-fit">
        <div className="bg-gradient-to-b from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl">
          <h3 className="text-sm font-semibold text-slate-300 mb-6 uppercase tracking-wider">Order Summary</h3>

          <div className="space-y-4 mb-6 pb-6 border-b border-slate-700">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Subtotal ({cart.items.length} items)</span>
              <span className="font-semibold">NPR {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Shipping</span>
              <span className="font-semibold text-emerald-400">Free</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Taxes & Duties</span>
              <span className="font-semibold">Calculated later</span>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-xl">
              <span>Total</span>
              <span className="font-bold">NPR {subtotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={placeOrder}
            disabled={submitting || (paymentMethod === 'credit' && availableCredit < subtotal)}
            className="w-full px-6 py-4 rounded-lg bg-[#0891b2] hover:bg-[#0b78be] disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Placing Order...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Place Order
              </>
            )}
          </button>

          <div className="mt-4 text-xs text-slate-400 text-center">
            ✓ Secure checkout • SSL encrypted • Money-back guarantee
          </div>
        </div>
      </div>
    </div>
  );
}
