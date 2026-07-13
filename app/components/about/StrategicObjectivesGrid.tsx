'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Cog6ToothIcon,
  ArrowTrendingUpIcon,
  Squares2X2Icon,
  BeakerIcon,
  UserGroupIcon,
  TruckIcon,
  GlobeAltIcon,
  LightBulbIcon,
  DevicePhoneMobileIcon,
  SunIcon,
  SparklesIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  StarIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import type { ComponentType, SVGProps } from 'react';

const ICON_MAP: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  'cog': Cog6ToothIcon,
  'trending-up': ArrowTrendingUpIcon,
  'grid': Squares2X2Icon,
  'beaker': BeakerIcon,
  'users': UserGroupIcon,
  'truck': TruckIcon,
  'globe': GlobeAltIcon,
  'bulb': LightBulbIcon,
  'phone': DevicePhoneMobileIcon,
  'sun': SunIcon,
  'leaf': SparklesIcon,
  'chart': ChartBarIcon,
  'shield': ShieldCheckIcon,
  'star': StarIcon,
  'lightning': BoltIcon,
};

type Objective = { name: string; desc: string; icon: string };

type Props = {
  badgeText: string;
  heading: string;
  description: string;
  objectives: Objective[];
};

const gridVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' as const },
  },
};

export default function StrategicObjectivesGrid({ badgeText, heading, description, objectives }: Props) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const colClass =
    objectives.length <= 3
      ? `grid-cols-${objectives.length}`
      : objectives.length === 4
      ? 'grid-cols-2 sm:grid-cols-4'
      : 'grid-cols-2 md:grid-cols-5';

  return (
    <section ref={ref} className="relative overflow-hidden bg-white py-14 sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-emerald-50 opacity-60 blur-[100px]" />
      <div className="pointer-events-none absolute -right-24 bottom-10 h-72 w-72 rounded-full bg-green-50 opacity-60 blur-[100px]" />

      <div className="relative mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-10 xl:px-12">
        {/* Heading */}
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
          {badgeText && (
            <span className="mb-4 inline-block rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[3px] text-emerald-700">
              {badgeText}
            </span>
          )}
          <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            {heading}
          </h2>
          {description && (
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-500 sm:text-base">
              {description}
            </p>
          )}
        </div>

        {/* Grid */}
        <motion.div
          variants={gridVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className={`grid gap-3 sm:gap-4 ${colClass}`}
        >
          {objectives.map((obj, i) => {
            const Icon = ICON_MAP[obj.icon] || Cog6ToothIcon;
            return (
              <motion.div
                key={`${obj.name}-${i}`}
                variants={cardVariants}
                whileHover={{ y: -6 }}
                className="group relative flex flex-col items-center overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 text-center shadow-sm transition-all duration-300 hover:border-emerald-300/60 hover:shadow-lg hover:shadow-emerald-500/5 sm:p-6"
              >
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.15 }}
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 sm:h-14 sm:w-14"
                >
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={1.7} />
                </motion.div>

                <span className="mb-1 block text-xs font-black tabular-nums text-emerald-600">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="text-[13px] font-bold uppercase tracking-tight text-slate-800 sm:text-sm">
                  {obj.name}
                </h3>
                {obj.desc && (
                  <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400 sm:text-xs">{obj.desc}</p>
                )}

                <span className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 bg-gradient-to-r from-emerald-500 to-green-400 transition-transform duration-500 group-hover:scale-x-100" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
