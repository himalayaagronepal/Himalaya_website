'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Building2, Cpu, Factory, Store, Globe } from 'lucide-react';

const VerticalRoadmap = () => {
  const phases = [
    {
      year: "Phase 01",
      title: "Foundational Infrastructure",
      desc: "Land consolidation and the establishment of regional cold storage, warehouses, and transport hubs to secure the supply chain.",
      icon: <Building2 className="w-6 h-6" />,
      status: "Preparation"
    },
    {
      year: "Phase 02",
      title: "Smart Mechanization",
      desc: "Integration of ICT-based smart farming and high-precision irrigation to solve labor shortages and boost productivity.",
      icon: <Cpu className="w-6 h-6" />,
      status: "Implementation"
    },
    {
      year: "Phase 03",
      title: "Value Addition & Branding",
      desc: "Establishing primary processing zones and launching the 'Made in Nepal' identity for high-value grains and fruits.",
      icon: <Factory className="w-6 h-6" />,
      status: "Industrialization"
    },
    {
      year: "Phase 04",
      title: "National Market Integration",
      desc: "Expansion of sales centers across all 753 local units to eliminate artificial scarcity and ensure food security.",
      icon: <Store className="w-6 h-6" />,
      status: "Distribution"
    },
    {
      year: "Phase 05",
      title: "Global Export Expansion",
      desc: "Full-scale B2B international partnerships to address the agricultural trade deficit and enter global high-value markets.",
      icon: <Globe className="w-6 h-6" />,
      status: "Global Scaling"
    }
  ];

  return (
    <section className="bg-white py-24 px-[5%]">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="mb-20 text-left border-l-4 border-[#2da8da] pl-6">
          <span className="text-[#2da8da] font-black tracking-widest text-xs uppercase">ADS 2015-2035 Alignment</span>
          <h2 className="text-4xl md:text-6xl font-black uppercase text-black leading-none mt-2">
            Strategic <br /> Roadmap
          </h2>
        </div>

        {/* Vertical Timeline Container */}
        <div className="relative">
          
          {/* Main Vertical Line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-100 -translate-x-1/2" />

          <div className="space-y-12">
            {phases.map((phase, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`relative flex items-center justify-between w-full ${
                  idx % 2 === 0 ? 'md:flex-row-reverse' : 'md:flex-row'
                }`}
              >
                {/* Content Card */}
                <div className="w-full md:w-[45%] ml-12 md:ml-0">
                  <div className="bg-[#f9f9f9] p-8 rounded-2xl border border-transparent hover:border-[#2da8da]/30 hover:bg-white hover:shadow-xl transition-all duration-500 group">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-black bg-[#2da8da] text-white px-2 py-1 rounded">
                        {phase.year}
                      </span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {phase.status}
                      </span>
                    </div>
                    <h3 className="text-xl font-black uppercase text-black mb-3 group-hover:text-[#2da8da] transition-colors">
                      {phase.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed font-medium">
                      {phase.desc}
                    </p>
                  </div>
                </div>

                {/* Center Icon Node */}
                <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-2 border-gray-100 flex items-center justify-center z-10 shadow-sm group-hover:border-[#2da8da] transition-all">
                  <div className="text-[#2da8da]">
                    {phase.icon}
                  </div>
                </div>

                {/* Empty space for the other side on desktop */}
                <div className="hidden md:block w-[45%]" />
              </motion.div>
            ))}
          </div>
        </div>



      </div>
    </section>
  );
};

export default VerticalRoadmap;