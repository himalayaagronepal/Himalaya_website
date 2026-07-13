'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Leaf, Network, ShieldCheck, Users, Route, Target, Trees, Sprout, Building2, Mountain } from 'lucide-react';

type Reason = {
  title: string;
  description: string;
  icon: React.ReactNode;
  art: React.ReactNode;
};

const reasons: Reason[] = [
  {
    title: 'Integrated Ecosystem',
    description: 'A complete value chain from farming to energy, hospitality and beyond.',
    icon: <Network className="h-6 w-6" />,
    art: <Trees className="h-20 w-20" strokeWidth={1.25} />,
  },
  {
    title: 'Quality You Can Trust',
    description: 'GMP & HACCP aligned processes ensuring safety and excellence.',
    icon: <ShieldCheck className="h-6 w-6" />,
    art: <ShieldCheck className="h-20 w-20" strokeWidth={1.25} />,
  },
  {
    title: 'Farmer-Centered Approach',
    description: 'Empowering farmers through training, fair prices and opportunities.',
    icon: <Users className="h-6 w-6" />,
    art: <Sprout className="h-20 w-20" strokeWidth={1.25} />,
  },
  {
    title: 'Infrastructure Excellence',
    description: 'Modern facilities and highway services that connect and empower.',
    icon: <Route className="h-6 w-6" />,
    art: <Building2 className="h-20 w-20" strokeWidth={1.25} />,
  },
  {
    title: 'Long-Term Vision',
    description: 'A transparent and sustainable approach for a self-reliant Nepal.',
    icon: <Target className="h-6 w-6" />,
    art: <Mountain className="h-20 w-20" strokeWidth={1.25} />,
  },
];

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const headingVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 36 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: 'easeOut' as const },
  },
};

export default function WhyChooseUs() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  return (
    <section ref={sectionRef} className="relative overflow-hidden py-16 sm:py-20 lg:py-[88px]">
      {/* Dark emerald base */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950" />
      {/* Faint landscape backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.20]"
        style={{ backgroundImage: "url('/background_for_mission.jpeg')" }}
      />
      {/* Soft glow */}
      <div className="pointer-events-none absolute -right-20 top-0 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[120px]" />

      <div className="relative mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-10 xl:px-12">
        <motion.div variants={sectionVariants} initial={false} animate={isInView ? 'visible' : 'hidden'}>
          {/* Heading (light, on dark) */}
          <motion.div variants={headingVariants} className="text-center">
            <div className="flex justify-center">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-400/15">
                <Leaf className="h-5 w-5 text-green-300" strokeWidth={2} />
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-3 sm:gap-5">
              <span className="h-px w-12 border-t-2 border-dashed border-green-300/30 sm:w-20" />
              <h2 className="text-center text-lg font-bold uppercase tracking-[0.18em] text-white sm:text-xl lg:text-[22px]">
                Why Partner With Us
              </h2>
              <span className="h-px w-12 border-t-2 border-dashed border-green-300/30 sm:w-20" />
            </div>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-emerald-100/70 sm:text-base">
              A unique combination of expertise, infrastructure, and commitment to sustainable
              agriculture that sets us apart.
            </p>
          </motion.div>

          {/* Cards */}
          <div className="mt-10 grid grid-cols-1 gap-5 sm:mt-12 sm:grid-cols-2 sm:gap-6 lg:grid-cols-5">
            {reasons.map((reason, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.3, ease: 'easeOut' as const } }}
                className="group relative flex flex-col items-center overflow-hidden rounded-3xl bg-white px-5 pb-28 pt-11 text-center shadow-[0_20px_45px_rgba(0,0,0,0.22)]"
              >
                {/* Icon */}
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-800 text-white shadow-[0_10px_22px_rgba(6,78,59,0.35)] ring-4 ring-emerald-100 transition-transform duration-300 group-hover:scale-105">
                  {reason.icon}
                </div>

                {/* Title */}
                <h3
                  className="text-lg font-bold leading-snug text-emerald-900"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  {reason.title}
                </h3>

                {/* Description */}
                <p className="mt-3 text-[13px] leading-relaxed text-gray-500">{reason.description}</p>

                {/* Faint decorative watermark */}
                <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-4 text-emerald-800/[0.09]">
                  {reason.art}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
