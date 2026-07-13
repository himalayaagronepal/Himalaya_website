"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Cat = { _id: string; name: string };

export default function ShopFiltersClient({
  categories = [],
  currentCategory,
  minPrice,
  maxPrice,
  initialQuery,
}: {
  categories?: Cat[];
  currentCategory?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  initialQuery?: string | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [localMin, setLocalMin] = useState<string>(minPrice != null ? String(minPrice) : "");
  const [localMax, setLocalMax] = useState<string>(maxPrice != null ? String(maxPrice) : "");

  useEffect(() => {
    setLocalMin(minPrice != null ? String(minPrice) : "");
    setLocalMax(maxPrice != null ? String(maxPrice) : "");
  }, [minPrice, maxPrice]);

  function pushWith(params: URLSearchParams) {
    const base = `/shop`;
    const qs = params.toString();
    router.push(base + (qs ? `?${qs}` : ""));
  }

  function toggleCategory(cat?: string) {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (!cat) {
      params.delete("category");
    } else if (params.get("category") === cat) {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    params.delete("page");
    pushWith(params);
  }

  function applyPrice(ev?: React.FormEvent) {
    ev?.preventDefault();
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (localMin.trim() === "") params.delete("minPrice");
    else params.set("minPrice", String(Number(localMin) || 0));
    if (localMax.trim() === "") params.delete("maxPrice");
    else params.set("maxPrice", String(Number(localMax) || 0));
    params.delete("page");
    pushWith(params);
  }

  function clearAll() {
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.delete("category");
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("page");
    pushWith(params);
  }

  function applyPreset(min?: number, max?: number) {
    const params = new URLSearchParams(searchParams?.toString() || "");
    if (min == null) params.delete("minPrice"); else params.set("minPrice", String(min));
    if (max == null) params.delete("maxPrice"); else params.set("maxPrice", String(max));
    params.delete("page");
    pushWith(params);
  }

  const hasFilters = currentCategory || minPrice != null || maxPrice != null;

  return (
    <div className="space-y-5 bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 lg:p-6">
      {/* Categories */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-widest">Categories</h4>
          {currentCategory && (
            <button onClick={() => toggleCategory(undefined)} className="text-xs font-medium text-[#059669] hover:underline">
              Show all
            </button>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => toggleCategory(undefined)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
              !currentCategory
                ? 'bg-[#059669] text-white border-[#059669]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#059669] hover:text-[#059669]'
            }`}
          >
            All
          </button>

          {categories.map((c) => {
            const isActive = String(currentCategory || '').toLowerCase() === String(c.name || '').toLowerCase();
            return (
              <button
                key={c._id}
                onClick={() => toggleCategory(c.name)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 ${
                  isActive
                    ? 'bg-[#0891b2] text-white border-[#0891b2]'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-[#0891b2] hover:text-[#0891b2]'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price filter */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-widest">Price Range (Rs.)</h4>
          {(localMin || localMax) && (
            <button onClick={() => { setLocalMin(''); setLocalMax(''); }} className="text-xs font-medium text-[#d97706] hover:underline">
              Reset
            </button>
          )}
        </div>

        <form onSubmit={applyPrice} className="flex flex-wrap items-center gap-2">
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <div className="relative flex-1 min-w-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rs.</span>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Min"
                className="w-full min-w-0 pl-9 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-[#d97706] focus:outline-none transition-colors"
                value={localMin}
                onChange={(e) => setLocalMin(e.target.value)}
              />
            </div>
            <span className="text-gray-300 text-sm">—</span>
            <div className="relative flex-1 min-w-0">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rs.</span>
              <input
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Max"
                className="w-full min-w-0 pl-9 pr-3 py-2 border-2 border-gray-200 rounded-xl text-sm focus:border-[#d97706] focus:outline-none transition-colors"
                value={localMax}
                onChange={(e) => setLocalMax(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="px-5 py-2 bg-[#d97706] text-white rounded-xl text-sm font-semibold hover:bg-[#b45309] transition-colors duration-200">
            Apply
          </button>

          <div className="flex flex-wrap gap-1.5 w-full sm:w-auto sm:ml-1">
            <button type="button" onClick={() => applyPreset(0, 500)} className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:border-[#d97706] hover:text-[#d97706] transition-colors">
              Under Rs.500
            </button>
            <button type="button" onClick={() => applyPreset(500, 2000)} className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:border-[#d97706] hover:text-[#d97706] transition-colors">
              Rs.500–2000
            </button>
            <button type="button" onClick={() => applyPreset(2000, undefined)} className="px-3 py-2 border border-gray-200 rounded-xl text-xs font-medium text-gray-600 hover:border-[#d97706] hover:text-[#d97706] transition-colors">
              Over Rs.2000
            </button>
          </div>
        </form>
      </div>

      {/* Clear all */}
      {hasFilters && (
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <p className="text-xs text-gray-400">Filters applied — results updated.</p>
          <button onClick={clearAll} className="inline-flex items-center gap-1 text-xs font-semibold text-red-400 hover:text-red-500 transition-colors">
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-3.5 h-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
