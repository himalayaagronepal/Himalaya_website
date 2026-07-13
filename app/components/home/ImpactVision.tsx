'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

const stats = [
  { value: '10,000+', label: 'Farmers to be Empowered', color: '#059669' },
  { value: '5,000+', label: 'Hectares Commercial Cultivation', color: '#0891b2' },
  { value: 'Multiple', label: 'International Export Markets', color: '#d97706' },
  { value: 'Nationwide', label: 'Modern Processing Units', color: '#0891b2' },
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

const statVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

export default function ImpactVision() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  return (
    <section ref={sectionRef} className="relative bg-gray-900 py-20 sm:py-28 lg:py-32 overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(8,145,178,0.08),transparent_60%)] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          {/* Section Label */}
          <motion.div variants={headingVariants} className="text-center mb-5">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-[#0891b2]/10 text-[#0891b2] text-xs sm:text-sm font-semibold tracking-widest uppercase border border-[#0891b2]/20">
              <span className="w-2 h-2 rounded-full bg-[#0891b2] animate-pulse" />
              Our Impact
            </span>
          </motion.div>

          <motion.h2
            variants={headingVariants}
            className="text-center text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-4"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            Our Impact{' '}
            <span className="text-[#0891b2]">Vision</span>
          </motion.h2>

          {/* Decorative divider */}
          <motion.div
            variants={headingVariants}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="h-px w-12 bg-[#0891b2]/40" />
            <div className="w-2 h-2 rounded-full bg-[#0891b2]" />
            <div className="h-px w-12 bg-[#0891b2]/40" />
          </motion.div>

          <motion.p
            variants={headingVariants}
            className="text-center text-base sm:text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto mb-16"
          >
            Building the future of Nepalese agriculture — one milestone at a time.
          </motion.p>

          {/* Stats Row — horizontal with vertical dividers */}
          <div className="flex flex-col sm:flex-row items-center justify-center">
            {stats.map((stat, index) => (
              <div key={index} className="flex items-center">
                <motion.div
                  variants={statVariants}
                  className="text-center px-6 sm:px-8 lg:px-12 py-6 sm:py-0"
                >
                  <motion.h3
                    className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-2"
                    style={{
                      fontFamily: "Georgia, 'Times New Roman', serif",
                      color: stat.color,
                    }}
                    whileHover={{ scale: 1.08 }}
                    transition={{ duration: 0.25 }}
                  >
                    {stat.value}
                  </motion.h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-snug max-w-[160px] mx-auto">
                    {stat.label}
                  </p>
                </motion.div>

                {/* Vertical divider (not after last item) */}
                {index < stats.length - 1 && (
                  <div className="hidden sm:block w-px h-20 bg-gray-700/60 flex-shrink-0" />
                )}
                {/* Horizontal divider for mobile */}
                {index < stats.length - 1 && (
                  <div className="block sm:hidden w-24 h-px bg-gray-700/60 mx-auto" />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
