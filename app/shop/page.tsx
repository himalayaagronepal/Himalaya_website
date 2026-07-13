import React from "react";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Shop",
};
import connectToDatabase from "../../lib/mongodb";
import Product from "../../models/Product";
import ProductCard from "../components/ProductCard";
import ShopFiltersClient from "./ShopFiltersClient";
import SubHeroSection from "../components/SubHeroSection";

export const revalidate = 30;

type ShopSearchParams = {
  q?: string;
  page?: string;
  limit?: string;
  category?: string;
  minPrice?: string;
  maxPrice?: string;
};

export default async function ShopPage({ searchParams }: { searchParams?: Promise<ShopSearchParams> }) {
  try {
    await connectToDatabase();
    const sp = (await searchParams) || {};
    const page = Math.max(1, Number(sp.page || 1));
    const limit = Math.min(100, Number(sp.limit || 12));
    const filter: any = { isActive: true };
    if (sp.q) filter.$text = { $search: sp.q };
    // category filter (expects category name)
    if (sp.category) filter.category = sp.category;
    // price filters
    const minP = Number(sp.minPrice);
    const maxP = Number(sp.maxPrice);
    if (!Number.isNaN(minP)) filter.price = { ...(filter.price || {}), $gte: minP };
    if (!Number.isNaN(maxP)) filter.price = { ...(filter.price || {}), $lte: maxP };

    const [items, total] = await Promise.all([
      Product.find(filter).skip((page - 1) * limit).limit(limit).lean(),
      Product.countDocuments(filter),
    ]);

    const { serializeMany } = await import('../../lib/serialize');
    const safeItems = serializeMany(items as any[]);

    // fetch categories server-side and render top filters + grid
    const Category = (await import('../../models/Category')).default;
    const cats = await Category.find().sort({ name: 1 }).lean();
    const { serializeMany: serializeCats } = await import('../../lib/serialize');
    const safeCats = serializeCats(cats as any[]);

    const totalPages = Math.ceil(total / limit);

    return (
      <main className="bg-white text-gray-900">
        <SubHeroSection
          title="Our Products"
          description="Premium Nepalese agricultural products — from farm to your doorstep. Discover quality produce sourced directly from our partner farms."
          image="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=2000"
          tag="Browse & Discover"
          stats={[
            { value: `${total}`, label: "Products Available" },
            { value: "340+", label: "Partner Farms" },
          ]}
        />

        <div className="mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {/* Filters */}
          <div className="mb-6 sm:mb-8">
            <ShopFiltersClient
              categories={safeCats}
              currentCategory={sp.category}
              minPrice={(sp.minPrice ? Number(sp.minPrice) : undefined)}
              maxPrice={(sp.maxPrice ? Number(sp.maxPrice) : undefined)}
              initialQuery={sp.q}
            />
          </div>

          {/* Results bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-5 sm:mb-6 pb-4 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-700">
              <span className="text-[#059669] font-bold">{total}</span> product{total === 1 ? '' : 's'} found
            </p>
            <p className="text-xs text-gray-400">
              Page {page} of {totalPages || 1} &middot; {limit} per page
            </p>
          </div>

          {/* Products grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {safeItems.map((p: any) => (
              <ProductCard key={p._id} product={p} hideQuickView />
            ))}
          </div>

          {total === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" className="w-8 h-8 text-gray-400"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
              </div>
              <p className="text-gray-500 font-medium">No products found</p>
              <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search terms.</p>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-8 sm:mt-10">
              {page > 1 && (
                <a href={`/shop?page=${page - 1}${sp.category ? `&category=${sp.category}` : ''}${sp.minPrice ? `&minPrice=${sp.minPrice}` : ''}${sp.maxPrice ? `&maxPrice=${sp.maxPrice}` : ''}`}
                  className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:border-[#059669] hover:text-[#059669] transition-colors"
                >
                  Previous
                </a>
              )}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                const p = i + 1;
                return (
                  <a key={p} href={`/shop?page=${p}${sp.category ? `&category=${sp.category}` : ''}${sp.minPrice ? `&minPrice=${sp.minPrice}` : ''}${sp.maxPrice ? `&maxPrice=${sp.maxPrice}` : ''}`}
                    className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${p === page ? 'bg-[#059669] text-white' : 'border border-gray-200 text-gray-600 hover:border-[#059669] hover:text-[#059669]'}`}
                  >
                    {p}
                  </a>
                );
              })}
              {page < totalPages && (
                <a href={`/shop?page=${page + 1}${sp.category ? `&category=${sp.category}` : ''}${sp.minPrice ? `&minPrice=${sp.minPrice}` : ''}${sp.maxPrice ? `&maxPrice=${sp.maxPrice}` : ''}`}
                  className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg text-gray-600 hover:border-[#059669] hover:text-[#059669] transition-colors"
                >
                  Next
                </a>
              )}
            </div>
          )}
        </div>
      </main>
    );
  } catch (err) {
    console.error('ShopPage — DB error (build/runtime):', err);
    return (
      <div className="bg-white min-h-screen">
        <div className="mx-auto w-full max-w-[1650px] py-12 sm:py-16 px-4 sm:px-6 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-50 flex items-center justify-center">
            <svg fill="none" stroke="#d97706" strokeWidth="1.5" viewBox="0 0 24 24" className="w-8 h-8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Shop Temporarily Unavailable</h1>
          <p className="text-gray-500">Products are temporarily unavailable — please try again later.</p>
        </div>
      </div>
    );
  }
}