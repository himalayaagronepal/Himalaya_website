"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ProductCard({ product, hideQuickView }: { product: any; hideQuickView?: boolean }) {
  const price = typeof product.price === 'number' ? `Rs. ${product.price.toLocaleString('en-NP', { minimumFractionDigits: 2 })}` : product.price || '—';
  const stockLabel = product.unit ? `${product.stock} ${product.unit}` : `${product.stock} units`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' as const }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#059669]/20 hover:shadow-xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative w-full aspect-4/3 bg-[#f8faf9] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.images?.[0] || "/placeholder.png"}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isNew && (
            <span className="bg-[#059669] text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              New
            </span>
          )}
          {product.stock < 1 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
              Sold Out
            </span>
          )}
        </div>

        {/* Category badge top-right */}
        {product.category && (
          <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-[#0891b2] px-2.5 py-1 rounded-full border border-[#0891b2]/10">
            {product.category}
          </span>
        )}

        {/* Quick view button */}
        {!hideQuickView && (
        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <Link
            href={`/product/${product._id}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/95 backdrop-blur-sm text-[#059669] text-sm font-semibold rounded-xl hover:bg-[#059669] hover:text-white transition-colors duration-200"
          >
            <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Quick View
          </Link>
        </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5">
        {/* Brand */}
        {product.brand && (
          <p className="text-[10px] font-semibold text-[#0891b2] uppercase tracking-wider mb-1">
            {product.brand}
          </p>
        )}

        {/* Title */}
        <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-snug line-clamp-2 mb-2 group-hover:text-[#059669] transition-colors duration-200">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-400 leading-relaxed line-clamp-2 mb-3">
          {product.shortDescription || product.description || 'Premium quality agricultural product from Nepal.'}
        </p>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div>
            <p className="text-lg font-bold text-[#d97706]">{price}</p>
            {product.stock > 0 && product.stock <= 5 && (
              <p className="text-[10px] text-red-400 font-medium mt-0.5">Only {stockLabel} left</p>
            )}
          </div>
          <Link
            href={`/product/${product._id}`}
            className="inline-flex items-center gap-1 px-4 py-2 bg-[#059669] text-white text-xs font-semibold rounded-full hover:bg-[#047857] transition-colors duration-200"
            aria-label={`View details for ${product.name}`}
          >
            Details
            <svg fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
