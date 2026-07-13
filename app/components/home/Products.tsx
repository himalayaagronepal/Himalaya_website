'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import SectionTitle from './SectionTitle';

type ProductCard = {
  _id: string;
  name: string;
  shortDescription?: string;
  images?: string[];
  price?: number;
  unit?: string;
  brand?: string | null;
  category?: string | null;
};

const demoList: ProductCard[] = [
  { _id: 'demo-1', name: 'Aero-Scan AI', shortDescription: 'Advanced drone imaging for precision nitrogen mapping across large scale industrial farms.', images: ['https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&q=80&w=800'] },
  { _id: 'demo-2', name: 'Terra-Compute', shortDescription: 'Predictive analytics dashboard for seasonal yields and soil health monitoring through cloud-based AI.', images: ['https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&q=80&w=800'] },
  { _id: 'demo-3', name: 'Hydra-Node', shortDescription: 'Satellite-linked sensors for underground moisture levels and real-time irrigation automation.', images: ['https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&q=80&w=800'] },
];

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: 'easeOut' as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

export default function Products({ products }: { products?: ProductCard[] }) {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });
  const list = (products && products.length) ? products : demoList;

  const scroll = (direction: number) => {
    const el = carouselRef.current;
    if (!el) return;

    const card = el.querySelector('.product-card') as HTMLElement | null;
    const cardBase = card?.offsetWidth ?? Math.round(el.clientWidth * 0.9);
    const scrollAmount = Math.round((cardBase + 24) * 2);

    el.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section ref={sectionRef} className="relative bg-[#f8fafb] py-12 sm:py-16 lg:py-[50px] overflow-hidden">
      {/* Subtle decorative background elements — consistent with WhatWeDo */}
      <div className="absolute top-0 left-0 w-[260px] h-[260px] sm:w-[400px] sm:h-[400px] rounded-full bg-emerald-50 opacity-40 -translate-y-1/2 -translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[220px] h-[220px] sm:w-[350px] sm:h-[350px] rounded-full bg-blue-50 opacity-40 translate-y-1/2 translate-x-1/3 pointer-events-none" />

      <div className="relative mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-10 xl:px-12">
        <motion.div
          variants={sectionVariants}
          initial={false}
          animate={isInView ? 'visible' : 'hidden'}
        >
          <SectionTitle title="Featured Products" />

          {/* Subtitle */}
          <motion.p
            variants={headingVariants}
            className="mt-4 text-center text-base sm:text-lg text-gray-500 leading-relaxed max-w-xl mx-auto mb-8 sm:mb-10"
          >
            Handpicked from our catalog — updated in real time.
          </motion.p>

          {/* Carousel Navigation */}
          <motion.div variants={headingVariants} className="flex justify-end gap-2.5 mb-6">
            <button
              onClick={() => scroll(-1)}
              aria-label="Scroll left"
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 bg-white hover:bg-[#059669] hover:text-white hover:border-[#059669] transition-all duration-300 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="m12 19-7-7 7-7"/></svg>
            </button>
            <button
              onClick={() => scroll(1)}
              aria-label="Scroll right"
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 bg-white hover:bg-[#059669] hover:text-white hover:border-[#059669] transition-all duration-300 shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </motion.div>

          {/* Product Carousel */}
          <div
            ref={carouselRef}
            className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {list.map((product) => (
              <motion.div
                key={product._id}
                variants={cardVariants}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.3, ease: 'easeOut' as const },
                }}
                className="product-card flex-none w-[82%] sm:w-[60%] md:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] xl:w-[calc(25%-15px)] snap-start group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
              >
                {/* Top accent bar — appears on hover like WhatWeDo cards */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-[#059669] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left z-10" />

                {/* Image */}
                <div className="relative h-[210px] overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 ease-out group-hover:scale-105"
                    style={{ backgroundImage: `url(${(product.images && product.images[0]) || '/placeholder.png'})` }}
                  />
                  <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors duration-300" />
                </div>

                {/* Content */}
                <div className="p-5 sm:p-6 flex flex-col justify-between h-[190px]">
                  <div>
                    <h3
                      className="text-base font-bold text-gray-900 mb-2 truncate tracking-tight group-hover:text-[#059669] transition-colors duration-300"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                      {product.name}
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">
                      {product.shortDescription}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 mt-auto pt-4 border-t border-gray-100">
                    <div className="text-[15px] font-bold text-gray-800">
                      {typeof product.price === 'number' ? `₹${product.price.toFixed(2)}` : ''}
                    </div>
                    {product.unit && (
                      <div className="text-[11px] text-gray-500 font-medium">
                        / {product.unit}
                      </div>
                    )}
                    <motion.a
                      href={`/product/${product._id}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#059669] text-white text-[11px] font-semibold tracking-wider uppercase transition-colors duration-300 hover:bg-[#047857] shadow-sm hover:shadow-md"
                    >
                      View
                      <svg className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round"><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                    </motion.a>
                  </div>
                </div>

                {/* Bottom accent line — matching WhatWeDo cards */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#059669] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}