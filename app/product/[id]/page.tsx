import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import connectToDatabase from "../../../lib/mongodb";
import Product from "../../../models/Product";
import AddToCart from "../../components/AddToCart";
import ProductCard from "../../components/ProductCard";

export const revalidate = 60;

export default async function ProductPage({ params }: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  await connectToDatabase();

  const ps = (params && typeof (params as any)?.then === "function") ? await (params as any) : (params as any);
  const id = ps?.id;
  if (!id || !mongoose.isValidObjectId(id)) return notFound();

  const product = await Product.findById(id).lean();
  if (!product) return notFound();
  const { serialize } = await import("../../../lib/serialize");
  const safeProduct = serialize(product);

  const Category = (await import("../../../models/Category")).default;
  const rawCats = await Category.find().sort({ name: 1 }).lean();
  const safeCats = (rawCats || []).map((c: any) => ({ _id: c._id, name: c.name, count: (c.products || []).length }));

  const related = await Product.find({ category: safeProduct.category, _id: { $ne: safeProduct._id }, isActive: true }).limit(4).lean();
  const { serializeMany } = await import("../../../lib/serialize");
  const relatedSafe = serializeMany(related || []);

  const price = typeof safeProduct.price === 'number' ? `Rs. ${safeProduct.price.toLocaleString('en-NP', { minimumFractionDigits: 2 })}` : safeProduct.price || '—';
  const images = safeProduct.images?.length ? safeProduct.images : ['/placeholder.png'];
  const inStock = safeProduct.stock > 0;

  return (
    <div className="bg-white text-gray-900 min-h-screen pt-20 sm:pt-24">
      {/* Breadcrumb */}
      <div className="bg-[#f8faf9] border-b border-gray-100">
        <div className="mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-8 py-3 overflow-x-auto">
          <nav className="text-sm whitespace-nowrap" aria-label="breadcrumb">
            <ol className="flex items-center gap-1.5 text-gray-500">
              <li><Link href="/" className="hover:text-[#059669] transition-colors">Home</Link></li>
              <li><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></li>
              <li><Link href="/shop" className="hover:text-[#059669] transition-colors">Shop</Link></li>
              {safeProduct.category && (
                <>
                  <li><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></li>
                  <li><Link href={`/shop?category=${encodeURIComponent(safeProduct.category)}`} className="hover:text-[#059669] transition-colors">{safeProduct.category}</Link></li>
                </>
              )}
              <li><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg></li>
              <li className="text-gray-900 font-medium truncate max-w-[180px] sm:max-w-[260px]">{safeProduct.name}</li>
            </ol>
          </nav>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Left: Image Gallery */}
          <div>
            {/* Main image */}
            <div className="relative w-full aspect-square bg-[#f8faf9] rounded-2xl overflow-hidden border border-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[0]}
                alt={safeProduct.name}
                className="w-full h-full object-cover"
              />
              {!inStock && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="bg-white text-red-500 font-bold text-sm px-4 py-2 rounded-full">Out of Stock</span>
                </div>
              )}
              {safeProduct.isNew && (
                <span className="absolute top-4 left-4 bg-[#059669] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider">New Arrival</span>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
                {images.map((img: string, i: number) => (
                  <div key={i} className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 cursor-pointer transition-colors ${i === 0 ? 'border-[#059669]' : 'border-gray-100 hover:border-[#0891b2]'}`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`${safeProduct.name} ${i + 1}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Info */}
          <div className="flex flex-col">
            {/* Category & Brand */}
            <div className="flex items-center gap-3 mb-3">
              {safeProduct.category && (
                <Link href={`/shop?category=${encodeURIComponent(safeProduct.category)}`} className="text-xs font-semibold text-[#0891b2] bg-[#0891b2]/10 px-3 py-1.5 rounded-full hover:bg-[#0891b2]/20 transition-colors">
                  {safeProduct.category}
                </Link>
              )}
              {safeProduct.brand && (
                <span className="text-xs font-semibold text-[#0891b2] bg-[#0891b2]/10 px-3 py-1.5 rounded-full">
                  {safeProduct.brand}
                </span>
              )}
            </div>

            {/* Product Name */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              {safeProduct.name}
            </h1>

            {/* Price */}
            <div className="mt-4 flex flex-wrap items-baseline gap-2 sm:gap-3">
              <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#d97706]">{price}</span>
              {inStock && (
                <span className="text-sm font-medium text-[#059669] bg-[#059669]/10 px-3 py-1 rounded-full">In Stock</span>
              )}
              {!inStock && (
                <span className="text-sm font-medium text-red-500 bg-red-50 px-3 py-1 rounded-full">Out of Stock</span>
              )}
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-100 my-5" />

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-2">Description</h3>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                {safeProduct.shortDescription || safeProduct.description || 'No description available.'}
              </p>
            </div>

            {/* Product Meta */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="bg-[#f8faf9] rounded-xl p-4 border border-gray-50">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Availability</p>
                <p className="text-sm font-bold text-gray-900">
                  {inStock ? `${safeProduct.stock} ${safeProduct.unit || 'unit'} left` : 'Unavailable'}
                </p>
              </div>
              <div className="bg-[#f8faf9] rounded-xl p-4 border border-gray-50">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Shipping</p>
                <p className="text-sm font-bold text-gray-900">2–5 business days</p>
              </div>
              {safeProduct.brand && (
                <div className="bg-[#f8faf9] rounded-xl p-4 border border-gray-50">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Brand</p>
                  <p className="text-sm font-bold text-gray-900">{safeProduct.brand}</p>
                </div>
              )}
              {safeProduct.category && (
                <div className="bg-[#f8faf9] rounded-xl p-4 border border-gray-50">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Category</p>
                  <p className="text-sm font-bold text-gray-900">{safeProduct.category}</p>
                </div>
              )}
            </div>

            {/* Add to Cart */}
            <div className="mt-auto">
              <AddToCart product={safeProduct} />
            </div>

            {/* Trust signals */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-[#0891b2]/5 border border-[#0891b2]/10">
                <svg fill="none" stroke="#0891b2" strokeWidth="1.5" viewBox="0 0 24 24" className="w-5 h-5 mb-1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" /></svg>
                <p className="text-[10px] font-semibold text-[#0891b2]">Fast Shipping</p>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-[#0891b2]/5 border border-[#0891b2]/10">
                <svg fill="none" stroke="#0891b2" strokeWidth="1.5" viewBox="0 0 24 24" className="w-5 h-5 mb-1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
                <p className="text-[10px] font-semibold text-[#0891b2]">Secure Payment</p>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-xl bg-[#0891b2]/5 border border-[#0891b2]/10">
                <svg fill="none" stroke="#0891b2" strokeWidth="1.5" viewBox="0 0 24 24" className="w-5 h-5 mb-1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182M21.015 4.356v4.992" /></svg>
                <p className="text-[10px] font-semibold text-[#0891b2]">Easy Returns</p>
              </div>
            </div>
          </div>
        </div>

        {/* Browse Categories */}
        {safeCats.length > 0 && (
          <section className="mt-14 pt-10 border-t border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>Browse Categories</h3>
              <Link href="/shop" className="text-sm font-medium text-[#059669] hover:underline">View All</Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {safeCats.slice(0, 12).map((c: any) => (
                <Link
                  key={c._id}
                  href={`/shop?category=${encodeURIComponent(c.name)}`}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full border transition-all duration-200 ${
                    String(c.name).toLowerCase() === String(safeProduct.category || '').toLowerCase()
                      ? 'bg-[#059669] text-white border-[#059669]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#059669] hover:text-[#059669]'
                  }`}
                >
                  {c.name}
                  {typeof c.count === 'number' && c.count > 0 && <span className="text-xs opacity-60">({c.count})</span>}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Related Products */}
        {relatedSafe.length > 0 && (
          <section className="mt-14 pt-10 border-t border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs font-semibold text-[#0891b2] uppercase tracking-widest mb-1">You May Also Like</p>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>Related Products</h3>
              </div>
              <Link
                href={`/shop?category=${encodeURIComponent(safeProduct.category || '')}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-[#059669] hover:underline"
              >
                See all
                <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
              {relatedSafe.map((p: any) => <ProductCard key={p._id} product={p} />)}
            </div>
          </section>
        )}

        {/* Need Help */}
        <section className="mt-14 pt-10 border-t border-gray-100">
          <div className="bg-[#f8faf9] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-gray-100">
            <div>
              <h4 className="text-lg font-bold text-gray-900">Need Help With This Product?</h4>
              <p className="text-sm text-gray-500 mt-1">Our team is ready to assist you with any questions.</p>
            </div>
            <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-[#0891b2] text-white text-sm font-semibold rounded-full hover:bg-[#0e7490] transition-colors duration-200">
              <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>
              Contact Us
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
