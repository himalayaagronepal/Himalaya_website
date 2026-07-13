"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { stats } from "../../../lib/data/sharma";

function useCount(target: number) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let raf: number;
    let start: number | null = null;
    const duration = 2200;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return value;
}

export default function StatsBar() {
  return (
    <div id="experience" className="bg-white border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {stats.map((s) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="group rounded-3xl border border-slate-100 bg-gradient-to-br from-white via-white to-slate-50/70 px-5 py-6 text-center shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#1C2B14]/15 hover:shadow-[0_20px_50px_rgba(15,23,42,0.12)]"
            >
              <CountItem label={s.label} value={s.value} suffix={s.suffix} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CountItem({ label, value, suffix }: { label: string; value: number; suffix?: string }) {
  const count = useCount(value);
  return (
    <div>
      <div className="text-3xl sm:text-4xl font-bold text-gray-900 transition-colors duration-300 group-hover:text-[#1C2B14]">
        {count}{suffix || ""}
      </div>
      <div className="mt-2 text-xs sm:text-sm font-semibold uppercase tracking-[0.18em] text-gray-500 transition-colors duration-300 group-hover:text-gray-700">
        {label}
      </div>
    </div>
  );
}
