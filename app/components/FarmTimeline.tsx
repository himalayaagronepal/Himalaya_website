"use client";

import { motion, useReducedMotion } from "framer-motion";
import FarmIcon from "./FarmIcon";

export type TimelineActivity = {
  step: string;
  title: string;
  desc: string;
  icon: string;
};

const serif = { fontFamily: "Georgia, 'Times New Roman', serif" } as const;

/**
 * Farm Activities — a modern vertical process timeline.
 * Desktop: alternating cards either side of a centered emerald rail.
 * Mobile: a single left-anchored rail with stacked cards.
 * Each step reveals on scroll (respecting prefers-reduced-motion).
 */
export default function FarmTimeline({ activities }: { activities: TimelineActivity[] }) {
  const reduce = useReducedMotion();

  return (
    <ol className="relative mx-auto max-w-4xl">
      {/* Connector rail */}
      <span
        aria-hidden="true"
        className="absolute left-[27px] top-3 bottom-3 w-[2px] bg-gradient-to-b from-emerald-300 via-emerald-200 to-emerald-100/50 md:left-1/2 md:-translate-x-1/2"
      />

      {activities.map((activity, i) => {
        const onLeft = i % 2 === 0;
        return (
          <motion.li
            key={activity.step}
            initial={reduce ? false : { opacity: 0, y: 28 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: "easeOut", delay: i * 0.05 }}
            className="relative pb-8 pl-[76px] last:pb-0 md:grid md:grid-cols-2 md:pb-12 md:pl-0"
          >
            {/* Step node sitting on the rail */}
            <span
              className="absolute left-0 top-0 z-10 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-800 text-sm font-black text-white shadow-[0_12px_24px_rgba(6,78,59,0.30)] ring-4 ring-emerald-100 md:left-1/2 md:-translate-x-1/2"
            >
              {activity.step}
            </span>

            {/* Activity card */}
            <div className={onLeft ? "md:col-start-1 md:pr-16 md:text-right" : "md:col-start-2 md:pl-16"}>
              <div className="group rounded-2xl border border-emerald-100/70 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_36px_rgba(6,78,59,0.12)] sm:p-6">
                <div className={`mb-3 flex items-center gap-3 ${onLeft ? "md:flex-row-reverse" : ""}`}>
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 text-white shadow-[0_8px_16px_rgba(6,78,59,0.25)]">
                    <FarmIcon name={activity.icon} className="h-5 w-5" />
                  </span>
                  <h3 className="text-lg font-bold tracking-tight text-emerald-900" style={serif}>
                    {activity.title}
                  </h3>
                </div>
                <p className="text-sm leading-relaxed text-gray-600">{activity.desc}</p>
              </div>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
