'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { Sprout, Package, Zap, UtensilsCrossed, Leaf, Users, ArrowRight } from 'lucide-react';
import SectionTitle from './SectionTitle';

type FocusStat = { value: string; label: string; icon: React.ReactNode };

type FocusArea = {
  num: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  image: string;
  href: string;
  cta: string;
  featured?: boolean;
  stats?: FocusStat[];
};

const focusAreas: FocusArea[] = [
  {
    num: '01',
    title: 'Integrated Agriculture',
    description:
      'Promoting sustainable farming practices and livestock development for food security and rural prosperity.',
    icon: <Sprout className="h-5 w-5 sm:h-6 sm:w-6" />,
    image:
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&q=80&w=900',
    href: '/farms',
    cta: 'Explore Agriculture',
    featured: true,
    stats: [
      { value: '5,000+', label: 'Farmers Impacted', icon: <Users className="h-4 w-4" /> },
      { value: '10,000+', label: 'Acres Supported', icon: <Sprout className="h-4 w-4" /> },
    ],
  },
  {
    num: '02',
    title: 'Processing & Value Addition',
    description:
      'Transforming raw produce into high-quality products that create more value locally.',
    icon: <Package className="h-5 w-5 sm:h-6 sm:w-6" />,
    image:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    href: '/company/agri-tech',
    cta: 'Explore Processing',
  },
  {
    num: '03',
    title: 'Clean Energy & EV Charging',
    description:
      'Investing in renewable energy and EV infrastructure for a cleaner, greener tomorrow.',
    icon: <Zap className="h-5 w-5 sm:h-6 sm:w-6" />,
    image:
      'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=800',
    href: '/about',
    cta: 'Explore Energy',
  },
  {
    num: '04',
    title: 'Hospitality & Highway Services',
    description:
      'Delivering memorable culinary experiences and reliable services for travelers and communities.',
    icon: <UtensilsCrossed className="h-5 w-5 sm:h-6 sm:w-6" />,
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=800',
    href: '/about',
    cta: 'Explore Hospitality',
  },
  {
    num: '05',
    title: 'Innovation & Sustainability',
    description:
      'Embracing innovation and responsible practices to build a sustainable future for generations.',
    icon: <Leaf className="h-5 w-5 sm:h-6 sm:w-6" />,
    image:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&q=80&w=800',
    href: '/company/organic-farming',
    cta: 'Explore Innovation',
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
  hidden: { opacity: 0, y: 32, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: 'easeOut' as const },
  },
};

function FocusCard({ area }: { area: FocusArea }) {
  return (
    <motion.div
      variants={cardVariants}
      className={`group relative overflow-hidden rounded-2xl sm:rounded-[20px] ${
        area.featured
          ? 'min-h-[420px] sm:col-span-2 sm:min-h-[320px] lg:col-span-1 lg:row-span-2 lg:min-h-0'
          : 'min-h-[210px] sm:min-h-[224px]'
      }`}
    >
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-[800ms] ease-out group-hover:scale-105"
        style={{ backgroundImage: `url(${area.image})` }}
      />
      {/* Dark emerald gradient — darker toward the bottom where the text sits */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/82 to-emerald-900/25" />
      <div className="absolute inset-0 bg-emerald-950/15" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col p-5 sm:p-6 lg:p-7">
        {/* Icon badge */}
        <div className="mb-auto">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#11823b] text-white shadow-[0_8px_18px_rgba(0,0,0,0.35)] transition-transform duration-300 group-hover:scale-110 sm:h-12 sm:w-12">
            {area.icon}
          </div>
        </div>

        {/* Bottom block */}
        <div className="mt-6">
          {/* <span
            className={`block font-black leading-none text-green-400 ${
              area.featured ? 'text-3xl sm:text-4xl lg:text-5xl mb-3' : 'text-2xl sm:text-3xl mb-2'
            }`}
          >
            {area.num}
          </span> */}
          <h3
            className={`font-bold tracking-tight text-white ${
              area.featured ? 'text-2xl sm:text-3xl' : 'text-lg sm:text-xl'
            }`}
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            {area.title}
          </h3>
          <p
            className={`mt-2 leading-relaxed text-white/75 ${
              area.featured ? 'text-sm sm:text-[15px] max-w-md' : 'text-xs sm:text-[13px]'
            }`}
          >
            {area.description}
          </p>

          {/* Stats — featured card only */}
          {area.featured && area.stats && (
            <div className="mt-6 flex items-stretch gap-5 border-t border-white/15 pt-5">
              {area.stats.map((stat, i) => (
                <div key={i} className={i > 0 ? 'border-l border-white/15 pl-5' : ''}>
                  <div className="flex items-center gap-2 text-green-400">
                    {stat.icon}
                    <span className="text-xl font-black text-white sm:text-2xl">{stat.value}</span>
                  </div>
                  <p className="mt-1 text-[11px] font-medium uppercase tracking-wide text-white/60">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <br />
          
          {/* <Link
            href={area.href}
            className="group/cta mt-5 inline-flex items-center gap-2.5 text-[13px] font-semibold text-white sm:text-sm"
          >
            {area.cta}
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#11823b] transition-all duration-300 group-hover/cta:translate-x-0.5 group-hover/cta:bg-[#0f7434]">
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </Link> */}
        </div>
      </div>
    </motion.div>
  );
}

export default function CorePillars() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  return (
    <section ref={sectionRef} className="relative bg-white py-12 sm:py-16 lg:py-[60px] overflow-hidden">
      {/* Subtle decorative blobs */}
      <div className="pointer-events-none absolute top-0 right-0 h-[260px] w-[260px] -translate-y-1/2 translate-x-1/3 rounded-full bg-emerald-50 opacity-40 sm:h-[400px] sm:w-[400px]" />

      <div className="relative mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-10 xl:px-12">
        <motion.div variants={sectionVariants} initial={false} animate={isInView ? 'visible' : 'hidden'}>
          <SectionTitle title="Our Strategic Focus Areas" />

          {/* Subtitle */}
          <motion.p
            variants={headingVariants}
            className="mx-auto mt-4 mb-8 max-w-2xl text-center text-sm leading-relaxed text-gray-500 sm:mb-10 sm:text-base"
          >
            The strategic pillars that drive our mission to transform Nepal&apos;s agricultural landscape.
          </motion.p>

          {/* Bento grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-[1.35fr_1fr_1fr] lg:grid-rows-2">
            {focusAreas.map((area) => (
              <FocusCard key={area.num} area={area} />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
