"use client";

import { motion } from "framer-motion";
import { travels } from "../../../lib/data/sharma";

const flagCodes: Record<string, string> = {
  India: "in",
  "UAE (Dubai)": "ae",
  "South Korea": "kr",
  Japan: "jp",
  Russia: "ru",
  Pakistan: "pk",
  Malaysia: "my",
  "United Kingdom": "gb",
  Australia: "au",
  Bangladesh: "bd",
  Singapore: "sg",
  China: "cn",
};

export default function TravelSection() {
  return (
    <section id="travels" className="relative overflow-hidden bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-[#1C2B14]/10 bg-[#1C2B14]/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.32em] text-[#1C2B14]">
            International Exposure
          </span>
          <h3 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Countries visited and global exposure
          </h3>
        </div>

        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="mt-8 flex flex-wrap gap-3">
          {travels.map((country, i) => (
            <motion.div
              key={country}
              whileInView={{ y: 0, opacity: 1 }}
              initial={{ y: 8, opacity: 0 }}
              transition={{ delay: i * 0.03, duration: 0.35, ease: "easeOut" }}
              className="group inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#1C2B14]/15 hover:bg-white hover:text-[#1C2B14] hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white ring-1 ring-slate-200 transition-transform duration-300 group-hover:scale-105">
                <span
                  className={`fi fi-${flagCodes[country] || "un"}`}
                  aria-hidden="true"
                  style={{ fontSize: "1.2rem", lineHeight: 1 }}
                />
              </span>
              <span>{country}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
