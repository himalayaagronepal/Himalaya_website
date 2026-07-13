"use client";

import { motion } from "framer-motion";
import { careerTimeline } from "../../../lib/data/sharma";

type AccentKey = "green" | "amber" | "blue" | "gray";

const accentStyles: Record<AccentKey, { rail: string; badge: string; border: string; glow: string; dot: string }> = {
  green: {
    rail: "from-emerald-500 via-lime-400 to-teal-400",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    border: "border-emerald-100 hover:border-emerald-200",
    glow: "from-emerald-500/10 to-transparent",
    dot: "bg-emerald-500",
  },
  amber: {
    rail: "from-amber-500 via-orange-400 to-rose-400",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    border: "border-amber-100 hover:border-amber-200",
    glow: "from-amber-500/10 to-transparent",
    dot: "bg-amber-500",
  },
  blue: {
    rail: "from-sky-500 via-cyan-400 to-indigo-400",
    badge: "bg-sky-50 text-sky-700 border-sky-200",
    border: "border-sky-100 hover:border-sky-200",
    glow: "from-sky-500/10 to-transparent",
    dot: "bg-sky-500",
  },
  gray: {
    rail: "from-slate-500 via-slate-400 to-slate-300",
    badge: "bg-slate-50 text-slate-700 border-slate-200",
    border: "border-slate-100 hover:border-slate-200",
    glow: "from-slate-500/10 to-transparent",
    dot: "bg-slate-500",
  },
};

export default function CareerTimeline() {
  return (
    <section id="career" className="relative overflow-hidden bg-slate-50 py-16 sm:py-20">
      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-white to-transparent" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full border border-[#1C2B14]/10 bg-white px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.32em] text-[#1C2B14] shadow-sm">
            Career Timeline
          </span>
          <h3 className="mt-4 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
            Leadership journey
          </h3>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            A concise view of the roles, institutions, and milestones that shaped the managing director&apos;s professional path.
          </p>
        </div>

        <div className="mt-10 space-y-5">
          {careerTimeline.map((item, idx) => {
            const accent = accentStyles[(item.accent as AccentKey) || "gray"];
            return (
              <motion.article
                key={`${item.role}-${item.org}-${item.period}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: idx * 0.05 }}
                className="grid gap-4 md:grid-cols-[160px_1fr] md:gap-6"
              >
                <div className="md:pt-5">
                  <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm">
                    <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${accent.rail}`} />
                    <span>{item.period}</span>
                  </div>
                </div>

                <div className={`group relative overflow-hidden rounded-[1.75rem] border bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_60px_rgba(15,23,42,0.12)] ${accent.border}`}>
                  <div className={`absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b ${accent.rail}`} />
                  <div className={`absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${accent.glow} blur-3xl`} />

                  <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-2">
                      <h4 className="text-xl font-bold text-slate-900 transition-colors duration-300 group-hover:text-[#1C2B14] sm:text-2xl">
                        {item.role}
                      </h4>
                      <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-[15px]">
                        {item.org}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 self-start rounded-2xl bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 ring-1 ring-slate-100">
                      <span className={`h-2.5 w-2.5 rounded-full bg-gradient-to-r ${accent.rail}`} />
                      <span>Leadership role</span>
                    </div>
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
