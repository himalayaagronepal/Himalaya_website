'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Landmark, Users2, Globe2, Shovel, ShieldCheck } from 'lucide-react';

const Partners = () => {
  const stakeholders = [
    { name: "Government of Nepal", icon: <Landmark className="w-8 h-8" />, color: "#2da8da", label: "Policy & ADS 2035" },
    { name: "Global Shipping", icon: <Globe2 className="w-8 h-8" />, color: "#2da8da", label: "Supply Chain" },
    { name: "Farmer Cooperatives", icon: <Users2 className="w-8 h-8" />, color: "#2da8da", label: "Local Production" },
    { name: "Agri-Tech Hubs", icon: <Shovel className="w-8 h-8" />, color: "#2da8da", label: "Industrialization" },
    { name: "Welfare Fund", icon: <ShieldCheck className="w-8 h-8" />, color: "#2da8da", label: "Risk Management" },
  ];

  return (
    <section className="bg-[#f8fbfc] py-24 px-[5%] relative overflow-hidden">
      {/* Decorative Gradient Blurs - Re-colored to match your Blue theme */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-[#2da8da]/5 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-[#2da8da]/10 blur-[100px] rounded-full" />

      <div className="max-w-[1200px] mx-auto">
        
        {/* --- HEADER --- */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
          <div className="max-w-xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="h-[2px] w-8 bg-[#2da8da]" />
              <span className="text-[#2da8da] font-black tracking-[4px] text-[10px] uppercase">Stakeholder Ecosystem</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#0a0a0a] leading-[0.9]">
              Inclusive <br />
              <span className="text-[#2da8da]">Partnerships</span>
            </h2>
          </div>
          <p className="text-sm text-gray-500 font-medium max-w-[320px] leading-relaxed italic">
            "Leveraging agricultural transformation for economic transformation through collective 80/20 ownership."
          </p>
        </div>

        {/* --- STAKEHOLDER CARDS --- */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {stakeholders.map((item, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="group relative h-48 bg-white rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm border border-gray-100 overflow-hidden text-center"
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500"
                style={{ backgroundColor: item.color }}
              />
              
              <div className="mb-4 text-gray-400 group-hover:text-[#2da8da] transition-colors duration-300">
                {item.icon}
              </div>

              <h4 className="text-[11px] font-black uppercase tracking-tight text-black mb-1">
                {item.name}
              </h4>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                {item.label}
              </span>

              <div 
                className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500"
                style={{ backgroundColor: item.color }}
              />
            </motion.div>
          ))}

          {/* Strategic Ally Card (Based on the Public 20% Share offer) */}
          <motion.div 
            whileHover={{ scale: 0.98 }}
            className="h-48 bg-[#0a0a0a] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer shadow-xl"
          >
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2da8da] mb-2">Investment</span>
            <span className="text-white text-xs font-bold leading-tight uppercase">Public Share <br/>Participation</span>
            <div className="mt-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-lg group">
              →
            </div>
          </motion.div>
        </div>

        {/* --- STATS RIBBON --- */}
        <div className="mt-16 flex flex-wrap justify-center gap-12 border-t border-gray-100 pt-12">
          <div className="text-center">
            <div className="text-2xl font-black text-[#0a0a0a]">753</div>
            <div className="text-[9px] uppercase tracking-widest font-bold text-[#2da8da]">Local Centers</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-[#0a0a0a]">2035</div>
            <div className="text-[9px] uppercase tracking-widest font-bold text-[#2da8da]">ADS Vision Year</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-black text-[#0a0a0a]">80/20</div>
            <div className="text-[9px] uppercase tracking-widest font-bold text-[#2da8da]">Founder-Public Ratio</div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Partners;