'use client';

import React from 'react';
import { motion } from 'framer-motion';

const EcoBalance = () => {
  const stats = [
    { number: "24.09%", label: "GDP Impact", sub: "Sector Contribution", delay: 0 },
    { number: "2030", label: "Self-Reliance", sub: "National Target", delay: 0.5 },
    { number: "753", label: "Local Centers", sub: "Strategic Network", delay: 1 },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden py-32 px-[5%]">
      
      {/* --- BACKGROUND LAYER --- */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=2000')" }}
      />
      <div className="absolute inset-0 z-10 bg-linear-to-br from-black/95 via-black/80 to-[#0c2d48]/50" />

      {/* --- CONTENT CONTAINER --- */}
      <div className="relative z-20 max-w-350 mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* LEFT SIDE: The Glass Card */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 md:p-16 rounded-sm max-w-175"
        >
          <span className="block font-bold tracking-[3px] text-sm uppercase mb-4 text-[#2da8da]">
            03 — OUR LEGACY
          </span>
          
          <h2 className="text-5xl md:text-7xl font-black uppercase leading-[0.95] mb-8 tracking-tighter text-white">
            Economic <br />
            {/* Adjusted font size here to text-6xl for better fit */}
            <span className="text-4xl md:text-6xl bg-linear-to-r from-[#2da8da] to-[#87ceeb] bg-clip-text text-transparent italic block mt-2">
              Transformation
            </span>
          </h2>

          <p className="text-lg leading-relaxed text-white/80 font-light mb-12 max-w-sm">
            Bridging the 256.98 Arab trade deficit through industrial mechanization and high-value export supply chains.
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col gap-4 group">
                <div className="relative w-16 h-16 rounded-full flex items-center justify-center bg-[#2da8da]/10 border border-[#2da8da]/20">
                  <div className="absolute inset-0 rounded-full border border-[#2da8da] animate-ping opacity-20" style={{ animationDelay: `${stat.delay}s` }} />
                  <span className="text-base font-black text-[#2da8da] group-hover:scale-110 transition-transform">
                    {stat.number}
                  </span>
                </div>
                <div className="text-white">
                  <strong className="block uppercase text-[10px] tracking-widest">{stat.label}</strong>
                  <span className="text-[9px] opacity-50 uppercase">{stat.sub}</span>
                </div>
              </div>
            ))}
          </div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-4 bg-[#2da8da] text-white font-black uppercase text-xs tracking-widest hover:bg-white hover:text-black transition-all"
          >
            Explore Strategy
          </motion.button>
        </motion.div>

        {/* RIGHT SIDE: The Visual Asset */}
        <div className="hidden lg:flex relative justify-center items-center h-full">
          {/* Rotating Data Ring */}
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="absolute w-112.5 h-112.5 border border-dashed border-[#2da8da]/30 rounded-full"
          />
          
          {/* Floating High-Quality Image */}
          <motion.div 
            initial={{ y: 20, opacity: 0, rotate: 0 }}
            whileInView={{ y: 0, opacity: 1, rotate: 3 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="relative z-30 w-72 h-105 rounded-2xl overflow-hidden border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-black"
          >
            <img 
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000" 
              className="object-cover w-full h-full brightness-75 hover:brightness-100 transition-all duration-700"
              alt="Sustainable Highland Agriculture"
            />
            {/* UI Overlay on Photo */}
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 bg-[#2da8da] rounded-full animate-pulse" />
                <span className="text-[10px] font-bold text-white uppercase tracking-tighter">Site: Highland A1</span>
              </div>
              <p className="text-[9px] text-white/60 uppercase tracking-widest font-bold">Smart Irrigation Active</p>
            </div>
          </motion.div>

          {/* Small Floating Data Chip */}
          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 right-10 z-40 bg-black/90 backdrop-blur-md p-4 border-l-4 border-[#2da8da] shadow-2xl"
          >
            <span className="text-[9px] text-[#2da8da] block uppercase font-black tracking-tighter">Export Potential</span>
            <div className="text-xl font-black text-white">USD 2.4B+</div>
            <div className="w-full bg-white/10 h-0.5 mt-2">
                <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: "70%" }}
                    transition={{ duration: 2 }}
                    className="h-full bg-[#2da8da]"
                />
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};

export default EcoBalance;