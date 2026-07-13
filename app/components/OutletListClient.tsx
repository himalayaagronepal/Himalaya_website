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
  photo?: string;
  image?: string;
  imageUrl?: string;
  coverImage?: string;
  galleryImages?: string[];
};

const DISTRICTS = [
  "Bhojpur",
  "Dhankuta",
  "Ilam",
  "Jhapa",
  "Khotang",
  "Morang",
  "Okhaldhunga",
  "Panchthar",
  "Sankhuwasabha",
  "Solukhumbu",
  "Sunsari",
  "Taplejung",
  "Terhathum",
  "Udayapur",
  "Bara",
  "Dhanusha",
  "Mahottari",
  "Parsa",
  "Rautahat",
  "Saptari",
  "Sarlahi",
  "Siraha",
  "Bhaktapur",
  "Chitwan",
  "Dhading",
  "Dolakha",
  "Kathmandu",
  "Kavrepalanchok",
  "Lalitpur",
  "Makwanpur",
  "Nuwakot",
  "Ramechhap",
  "Rasuwa",
  "Sindhuli",
  "Sindhupalchok",
  "Baglung",
  "Gorkha",
  "Kaski",
  "Lamjung",
  "Manang",
  "Mustang",
  "Myagdi",
  "Nawalpur (East Nawalparasi)",
  "Parbat",
  "Syangja",
  "Tanahun",
  "Arghakhanchi",
  "Banke",
  "Bardiya",
  "Dang",
  "Gulmi",
  "Kapilvastu",
  "Palpa",
  "Parasi (West Nawalparasi)",
  "Pyuthan",
  "Rolpa",
  "Rukum East",
  "Rukum West",
  "Rupandehi",
  "Dailekh",
  "Dolpa",
  "Humla",
  "Jajarkot",
  "Jumla",
  "Kalikot",
  "Mugu",
  "Salyan",
  "Surkhet",
  "Achham",
  "Baitadi",
  "Bajhang",
  "Bajura",
  "Dadeldhura",
  "Darchula",
  "Kailali",
  "Kanchanpur",
];

function getOutletImage(outlet: Outlet): string | null {
  const directImage = outlet.photo || outlet.image || outlet.imageUrl || outlet.coverImage;
  if (directImage) return directImage;
  if (Array.isArray(outlet.galleryImages) && outlet.galleryImages.length > 0) {
    return outlet.galleryImages[0];
  }
  return null;
}

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
        {filtered.map((o) => {
          const bgImage = getOutletImage(o);

          return (
            <article
              key={o._id}
              className="relative min-h-[260px] rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-shadow"
            >
              {bgImage ? (
                <div
                  className="absolute inset-0 bg-center bg-cover"
                  style={{ backgroundImage: `url(${bgImage})` }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-cyan-100 to-emerald-100" />
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/10" />

              <div className="relative z-10 h-full p-5 flex flex-col justify-end text-white">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold leading-snug">{o.name}</h3>
                    {o.address && <div className="text-sm text-white/85 mt-1">{o.address}</div>}
                    {o.district && <div className="text-sm text-white/90 mt-1">{o.district}</div>}
                    {o.products && o.products.length > 0 && (
                      <div className="mt-2 text-sm text-white/85">
                        Products: {o.products.slice(0, 3).join(", ")}
                        {o.products.length > 3 ? "..." : ""}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-right">
                    <Link
                      href={`/outlet/${o._id}`}
                      className="inline-block mt-1 text-sm font-semibold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg backdrop-blur-sm transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>

                <div className="mt-3 text-xs text-white/80">
                  {o.contactPhone && <div>Phone: {o.contactPhone}</div>}
                  {o.contactEmail && <div>Email: {o.contactEmail}</div>}
                </div>
              </div>
            </article>
          );
        })}

        {filtered.length === 0 && (
          <div className="col-span-full text-gray-500">No outlets match the filters.</div>
        )}
      </div>
    </div>
  );
}
