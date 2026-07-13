"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Product {
  _id: string;
  name: string;
  brand?: string;
  category?: string;
  price: number;
  stock: number;
  images?: string[];
}

interface OrderItem {
  productId: string;
  name: string;
  brand?: string;
  price: number;
  quantity: number;
  image?: string;
}

interface ManualOrderFormClientProps {
  outletSlug: string;
  employeeRole: string;
  backPath: string;
}

export default function ManualOrderFormClient({
  outletSlug,
  employeeRole,
  backPath,
}: ManualOrderFormClientProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Fetch products on search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (productSearch.trim()) {
        setSearchLoading(true);
        try {
          const res = await fetch(
            `/api/outlet/products?search=${encodeURIComponent(productSearch)}&limit=20`
          );
          if (res.ok) {
            const data = await res.json();
            setProducts(data.products || []);
            setShowDropdown(true);
          }
        } catch (err) {
          console.error("Product search error:", err);
        } finally {
          setSearchLoading(false);
        }
      } else {
        setProducts([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [productSearch]);

  const addProductToOrder = (product: Product) => {
    const existingItem = orderItems.find((item) => item.productId === product._id);

    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setOrderItems(
          orderItems.map((item) =>
            item.productId === product._id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        setError(`Insufficient stock for ${product.name}`);
      }
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: product._id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          quantity: 1,
          image: Array.isArray(product.images) ? product.images[0] : undefined,
        },
      ]);
    }

    setProductSearch("");
    setProducts([]);
    setShowDropdown(false);
    setError("");
  };

  const removeItem = (productId: string) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
    } else {
      setOrderItems(
        orderItems.map((item) =>
          item.productId === productId ? { ...item, quantity } : item
        )
      );
    }
  };

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!customerName.trim()) {
        setError("Customer name is required");
        setLoading(false);
        return;
      }

      if (!customerPhone.trim()) {
        setError("Customer phone is required");
        setLoading(false);
        return;
      }

      if (orderItems.length === 0) {
        setError("Please add at least one item");
        setLoading(false);
        return;
      }

      const res = await fetch("/api/outlet/manual-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          paymentMethod,
          items: orderItems,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to create order");
        setLoading(false);
        return;
      }

      setSuccess(
        `Order #${data.order.orderNumber} created successfully for ${customerName}!`
      );
      
      // Reset form
      setCustomerName("");
      setCustomerPhone("");
      setOrderItems([]);
      setPaymentMethod("cod");

      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = backPath;
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-emerald-800 text-sm">
          {success}
        </div>
      )}

      {/* Customer Information */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Customer Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Customer Name *
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Full name"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Customer Phone *
            </label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Phone number"
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
              required
            />
          </div>
        </div>
      </div>

      {/* Product Selection */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Add Products</h2>

        <div className="relative mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Search Products
          </label>
          <div className="relative">
            <input
              type="text"
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              onFocus={() => productSearch && setShowDropdown(true)}
              placeholder="Search by name, brand, or category..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
            />
            {searchLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="animate-spin h-4 w-4 border-2 border-cyan-500 border-t-transparent rounded-full" />
              </div>
            )}
          </div>

          {showDropdown && products.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto">
              {products.map((product) => (
                <button
                  key={product._id}
                  type="button"
                  onClick={() => addProductToOrder(product)}
                  className="w-full text-left px-3 py-2 hover:bg-cyan-50 border-b border-slate-100 last:border-b-0 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-900">{product.name}</p>
                      <p className="text-xs text-slate-500">
                        {product.brand} • {product.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm text-slate-900">
                        Rs {product.price}
                      </p>
                      <p className="text-xs text-slate-500">
                        Stock: {product.stock}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showDropdown && productSearch && products.length === 0 && !searchLoading && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-10 p-3 text-center text-sm text-slate-500">
              No products found
            </div>
          )}
        </div>
      </div>

      {/* Order Items */}
      {orderItems.length > 0 && (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Order Items</h2>
          <div className="space-y-3">
            {orderItems.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm text-slate-900">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.brand}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.productId, Number(e.target.value))
                    }
                    className="w-16 rounded border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 text-center focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                  />
                  <span className="text-sm font-medium text-slate-900 w-20 text-right">
                    Rs {(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    className="ml-2 text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-200">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-slate-900">Total:</span>
              <span className="text-2xl font-bold text-cyan-600">
                Rs {totalAmount.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Payment Method */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Payment Method</h2>
        <div className="space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4 text-cyan-600 border-slate-300 focus:ring-cyan-500"
            />
            <span className="text-sm font-medium text-slate-700">
              Cash on Delivery (COD)
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="paymentMethod"
              value="card"
              checked={paymentMethod === "card"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4 text-cyan-600 border-slate-300 focus:ring-cyan-500"
            />
            <span className="text-sm font-medium text-slate-700">Card Payment</span>
          </label>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Link
          href={backPath}
          className="flex-1 text-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 font-medium text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Cancel
        </Link>
        <button
          type="submit"
          disabled={loading || orderItems.length === 0}
          className="flex-1 rounded-lg bg-cyan-600 px-4 py-2.5 font-medium text-white hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating Order..." : "Create Order"}
        </button>
      </div>
    </form>
  );
}
