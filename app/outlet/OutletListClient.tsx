"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";

type Outlet = {
  _id: string;
  name: string;
  slug: string;
  address?: string;
  district?: string;
  products?: string[];
  contactPhone?: string;
  contactEmail?: string;
};

const DISTRICTS = [
  "Kathmandu",
  "Lalitpur",
  "Bhaktapur",
  "Pokhara",
  "Chitwan",
  "Banke",
  "Bardiya",
  "Kaski",
  "Ilam",
  "Jumla",
  // ... add remaining districts or keep this list editable via CMS later
];

export default function OutletListClient({ initialOutlets }: { initialOutlets: Outlet[] }) {
  const [query, setQuery] = useState("");
  const [district, setDistrict] = useState("");
  const [product, setProduct] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const p = product.trim().toLowerCase();
    return initialOutlets.filter((o) => {
      if (district && o.district !== district) return false;
      if (q) {
        const hay = `${o.name} ${o.address || ""} ${o.slug}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (p) {
        const prods = (o.products || []).map((s) => s.toLowerCase());
        if (!prods.some((s) => s.includes(p))) return false;
      }
      return true;
    });
  }, [initialOutlets, query, district, product]);

  return (
    <div>
      <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Search outlets</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="Search by outlet name or address"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">District</label>
            <select
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              <option value="">All districts</option>
              {DISTRICTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Product</label>
            <input
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
              placeholder="e.g. cardamom, fish"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-3 text-sm text-gray-500">Showing {filtered.length} of {initialOutlets.length} outlets</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((o) => (
          <article key={o._id} className="bg-white rounded-lg border border-gray-100 p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">{o.name}</h3>
                {o.address && <div className="text-sm text-gray-500 mt-1">{o.address}</div>}
                {o.district && <div className="text-sm text-gray-500 mt-1">{o.district}</div>}
                {o.products && o.products.length > 0 && (
                  <div className="mt-3 text-sm text-gray-600">Products: {o.products.slice(0,3).join(', ')}{o.products.length>3? '...' : ''}</div>
                )}
              </div>

              <div className="shrink-0 text-right">
                <Link href={`/outlet/${o.slug}`} className="inline-block mt-1 text-sm font-semibold text-[#2da8da]">View</Link>
              </div>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              {o.contactPhone && <div>Phone: {o.contactPhone}</div>}
              {o.contactEmail && <div>Email: {o.contactEmail}</div>}
            </div>
          </article>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-gray-500">No outlets match the filters.</div>
        )}
      </div>
    </div>
  );
}
