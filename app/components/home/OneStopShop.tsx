'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Truck, Globe, Droplets, ArrowUpRight } from 'lucide-react';

const OneStopShop = () => {
  const categories = [
    {
      title: "Agri-Tech",
      desc: "Industrial mechanization & smart irrigation systems.",
      icon: <Droplets className="w-5 h-5" />,
      color: "#2da8da",
      tag: "Production"
    },
    {
      title: "Logistics",
      desc: "Cold storage & regional transport network.",
      icon: <Truck className="w-5 h-5" />,
      color: "#2da8da", // Kept theme consistent
      tag: "Supply Chain"
    },
    {
      title: "Export Hub",
      desc: "Global B2B partnerships & branding.",
      icon: <Globe className="w-5 h-5" />,
      color: "#2da8da",
      tag: "Global"
    }
  ];

  return (
    <section className="bg-white py-12 px-[5%]">
      <div className="max-w-300 mx-auto">
        
        {/* --- MINIMAL HEADER --- */}
        <div className="flex items-baseline justify-between mb-8 border-b border-black/5 pb-6">
          <div className="flex items-baseline gap-4">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-black">
              Marketplace
            </h2>
            <span className="text-[10px] font-bold tracking-[2px] text-[#2da8da] uppercase">
              753 Local Sales Centers
            </span>
          </div>
          <button className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-black">
            Strategic Roadmap <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

        {/* --- PURE WHITE TILES --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-black/5">
          {categories.map((cat, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ backgroundColor: "#fafafa" }}
              className="group p-8 border-r border-b border-black/5 transition-colors cursor-pointer"
            >
              <div className="mb-6 flex justify-between items-start">
                <div 
                  className="w-10 h-10 flex items-center justify-center rounded-full border border-black/5 bg-white text-black group-hover:bg-[#2da8da] group-hover:text-white group-hover:border-[#2da8da] transition-all duration-300"
                >
                  {cat.icon}
                </div>
                <span className="text-[9px] font-black uppercase tracking-tighter text-gray-300 group-hover:text-black transition-colors">
                  {cat.tag}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-black uppercase tracking-tighter mb-2 text-black">
                  {cat.title}
                </h3>
                <p className="text-xs text-gray-500 font-medium leading-snug mb-6 max-w-50">
                  {cat.desc}
                </p>
              </div>

              <div 
                className="h-1 w-0 group-hover:w-full transition-all duration-500" 
                style={{ backgroundColor: cat.color }}
              />
            </motion.div>
          ))}
        </div>

        {/* --- SLIM ACTION BAR --- */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <span className="w-1 h-1 bg-[#2da8da] rounded-full animate-pulse" />
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                Digital Logistics System: Active
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                Trade Deficit Impact: -16.4%
              </span>
            </div>
          </div>
          
          <button className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-[#2da8da] transition-all">
            <ShoppingCart className="w-3 h-3" />
            <span>Connect to Network</span>
          </button>
        </div>

      </div>
    </section>
  );
};

export default OneStopShop;