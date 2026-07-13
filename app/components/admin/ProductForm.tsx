"use client";

import React, { useState } from "react";
import ImageUpload from "./ImageUpload";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function ProductForm({ initial = null, redirectTo = "/admin/products" }: { initial?: any; redirectTo?: string }) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [brand, setBrand] = useState(initial?.brand || "");
  const [price, setPrice] = useState(initial?.price || 0);
  const [unit, setUnit] = useState(initial?.unit || "");
  const [farmCategory, setFarmCategory] = useState<string>(initial?.farmCategory || "");
  const [categories, setCategories] = useState<Array<any>>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [images, setImages] = useState<string[]>(initial?.images || []);
  const [stock, setStock] = useState(initial?.stock || 0);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"form" | "preview">("form");
  const router = useRouter();

  React.useEffect(() => {
    let mounted = true;
    fetch('/api/categories')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setCategories(data.categories || []);
        if (initial?.category) {
          const match = (data.categories || []).find((c: any) => c._id === initial.category || c.name === initial.category);
          if (match) setSelectedCategoryId(match._id);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [initial]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: any = { name, description, brand, price, unit, images, stock, farmCategory };
      if (selectedCategoryId) payload.category = selectedCategoryId;
      else if (initial?.category) payload.category = initial.category;

      const method = initial ? "PATCH" : "POST";
      const url = initial ? `/api/products/${initial._id}` : `/api/products`;
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error((await res.json()).message || "Save failed");
      toast.success("Product saved");
      router.push(redirectTo);
    } catch (err: any) {
      toast.error(err.message || "Unable to save product");
    } finally {
      setLoading(false);
    }
  }

  // Checklist items
  const checks = [
    { label: "At least one image uploaded", ok: images.length > 0 },
    { label: "Product name (3–60 chars)", ok: name.length >= 3 && name.length <= 60 },
    { label: "Price is set", ok: typeof price === "number" && price > 0 },
    { label: "Stock value set", ok: typeof stock === "number" && stock > 0 },
    { label: "Category assigned", ok: !!selectedCategoryId },
  ];

  return (
    <form onSubmit={submit} className="space-y-6">
      {/* Mobile tabs: Form / Preview */}
      <div className="flex lg:hidden bg-slate-100 rounded-xl p-1 gap-1">
        <button
          type="button"
          onClick={() => setActiveTab("form")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "form"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500"
          }`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("preview")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === "preview"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500"
          }`}
        >
          Preview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form section */}
        <div className={`lg:col-span-3 space-y-6 ${activeTab !== "form" ? "hidden lg:block" : ""}`}>
          {/* Product Details Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">Product Details</h2>
                <p className="text-xs text-slate-400 mt-0.5">Fields marked * are required</p>
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50 px-2.5 py-1 rounded-full">
                {initial ? "Editing" : "Draft"}
              </span>
            </div>

            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Product Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 focus:bg-white transition-all"
                  placeholder="e.g. Organic Turmeric Powder"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <div className="mt-1 text-xs text-slate-400">{name.length}/60 characters</div>
              </div>

              {/* Brand + Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Brand</label>
                  <input
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 focus:bg-white transition-all"
                    placeholder="Brand name"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Category</label>
                  <select
                    value={selectedCategoryId}
                    onChange={(e) => setSelectedCategoryId(e.target.value)}
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 focus:bg-white transition-all"
                  >
                    <option value="">— Select category —</option>
                    {categories.map((c: any) => (
                      <option key={c._id} value={c._id}>{c.name} ({c.productsCount ?? 0})</option>
                    ))}
                  </select>
                  {initial?.category && !selectedCategoryId && (
                    <div className="mt-1.5 text-xs text-slate-500">
                      Current: <span className="font-medium text-slate-700">{initial.category}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Farm Category — links the product to a farm detail page */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Farm Category</label>
                <select
                  value={farmCategory}
                  onChange={(e) => setFarmCategory(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 focus:bg-white transition-all"
                >
                  <option value="">— None (not farm-specific) —</option>
                  <option value="Poultry">Poultry</option>
                  <option value="Buffalo">Buffalo</option>
                  <option value="Fish">Fish</option>
                  <option value="Goat">Goat</option>
                </select>
                <div className="mt-1 text-xs text-slate-400">
                  Shows this product under “Products From This Farm” on the matching Explore Our Farms page.
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Short Description</label>
                <textarea
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 focus:bg-white transition-all resize-none"
                  placeholder="Brief, benefit-focused description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
                <div className="mt-1 text-xs text-slate-400">Shown on category cards and listings.</div>
              </div>

              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Price (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-medium">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      className="pl-8 pr-4 w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 focus:bg-white transition-all"
                      placeholder="0.00"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Stock <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 focus:bg-white transition-all"
                    placeholder="0"
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Unit / measurement</label>
                <input
                  className="block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-200 focus:border-cyan-400 focus:bg-white transition-all"
                  placeholder="kg, m, liter, piece, box, etc. Leave blank for none"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                />
                <div className="mt-1 text-xs text-slate-400">Used on product pages and cart summaries.</div>
              </div>
            </div>
          </div>

          {/* Images Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-base font-semibold text-slate-900">Product Images</h2>
              <p className="text-xs text-slate-400 mt-0.5">First image is used as the primary thumbnail</p>
            </div>
            <div className="p-6">
              <ImageUpload images={images} onChange={setImages} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm shadow-cyan-200/50 transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                  Saving…
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                  Save Product
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Live Preview section */}
        <div className={`lg:col-span-2 space-y-5 ${activeTab !== "preview" ? "hidden lg:block" : ""}`}>
          {/* Live Preview Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden sticky top-20">
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-sm font-semibold text-slate-900">Live Preview</h4>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>

            {/* Product card preview */}
            <div className="p-5">
              <div className="border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                <div className="w-full aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                  {images[0] ? (
                    <img src={images[0]} alt={name || 'preview'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center text-slate-400">
                      <svg className="mx-auto mb-2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                      <div className="text-xs">No image yet</div>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  {brand && (
                    <div className="text-[10px] font-semibold text-cyan-600 uppercase tracking-wider mb-1">{brand}</div>
                  )}
                  <div className="text-sm font-semibold text-slate-900 truncate">{name || 'Product title'}</div>
                  <div className="mt-1 text-xs text-slate-500 line-clamp-2">{description || 'Short description will appear here.'}</div>
                  <div className="mt-3 flex items-center justify-between pt-3 border-t border-slate-100">
                    <div className="text-lg font-bold text-slate-900">
                      {typeof price === 'number' && price > 0 ? `₹${Number(price).toFixed(2)}` : '—'}
                    </div>
                    <div className="text-xs text-slate-500 bg-slate-50 px-2 py-1 rounded-md">
                      Stock: <span className="font-semibold text-slate-700">{stock}{unit ? ` ${unit}` : ' units'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist */}
            <div className="px-5 pb-5">
              <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Readiness Checklist</h5>
              <div className="space-y-2">
                {checks.map((c, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                      c.ok ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-300"
                    }`}>
                      {c.ok ? (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5"/></svg>
                      ) : (
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/></svg>
                      )}
                    </div>
                    <span className={`text-xs ${c.ok ? "text-slate-600" : "text-slate-400"}`}>{c.label}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-xs text-slate-400">
                {checks.filter(c => c.ok).length}/{checks.length} complete
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}