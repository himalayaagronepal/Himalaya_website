'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { Sprout, Mountain } from 'lucide-react';
import SectionTitle from './SectionTitle';

type IconComponent = React.ComponentType<{ className?: string; strokeWidth?: number }>;

function SolarPanelIcon({ className, strokeWidth = 1.8 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 4h16l2 11H2L4 4Z" />
      <line x1="3" y1="9.5" x2="21" y2="9.5" />
      <line x1="8" y1="4" x2="6.5" y2="15" />
      <line x1="12" y1="4" x2="12" y2="15" />
      <line x1="16" y1="4" x2="17.5" y2="15" />
      <line x1="12" y1="15" x2="12" y2="20" />
      <line x1="8" y1="20" x2="16" y2="20" />
    </svg>
  );
}

function EVChargeIcon({ className, strokeWidth = 1.8 }: { className?: string; strokeWidth?: number }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 16h14a1 1 0 0 0 1-1v-4l-2-4h-7l-2 4H3v5Z" />
      <circle cx="7" cy="16.5" r="1.5" />
      <circle cx="14" cy="16.5" r="1.5" />
      <path d="M19 8.5l2-2v3l2-1.5" />
    </svg>
  );
}

// `href` is optional: only AGRICULTURE points to a real route (/farms). The
// other lines of business don't have pages yet, so they render as
// non-clickable display cards — this also avoids Next.js prefetching dead
// routes (which logged 404s in the console).
const experiences: { title: string; desc: string; href?: string; Icon: IconComponent; img: string }[] = [
  {
    title: 'AGRICULTURE',
    desc: 'Integrated farming — poultry, dairy, fishery & organic crops.',
    href: '/farms',
    Icon: Sprout,
    img: '/hero_images/first_image_two.jpg',
  },
  {
    title: 'RENEWABLE ENERGY',
    desc: 'Clean energy infrastructure for a greener tomorrow.',
    Icon: SolarPanelIcon,
    img: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=1200',
  },
  {
    title: 'EV CHARGING AND MINI MARTS',
    desc: 'Modern highway charging stations and mini marts across Nepal.',
    Icon: EVChargeIcon,
    img: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&q=80&w=1200',
  },
  {
    title: 'AGRO TOURISM',
    desc: 'Family-friendly farm experiences and hospitality.',
    Icon: Mountain,
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=1200',
  },
];

const sectionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: 'easeOut' as const },
  },
};

export default function OurFarmExperiences() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-80px' });

  return (
    <section
      id="integrated-business"
      ref={sectionRef}
      className="relative bg-white py-12 sm:py-16 lg:py-[50px] scroll-mt-20"
    >
      <div className="mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-10 xl:px-12">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <SectionTitle title="Our Integrated Business" />

          {/* Cards */}
          <div className="mt-10 sm:mt-12 lg:mt-14 flex flex-col sm:flex-row sm:flex-wrap lg:flex-nowrap justify-between items-stretch gap-6 lg:gap-7">
            {experiences.map(({ title, desc, Icon, img, href }) => {
              const cardBody = (
                <>
                  <div className="relative">
                    <div className="relative aspect-[4/3] lg:aspect-[3/2] overflow-hidden rounded-t-2xl">
                      <img
                        src={img}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        loading="lazy"
                      />
                      {/* Bottom gradient for icon legibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                    </div>
                    {/* Circular icon — anchored to image bottom, sits OUTSIDE the overflow-hidden so it isn't clipped */}
                    <div className="absolute left-5 bottom-0 z-10 flex h-14 w-14 lg:h-16 lg:w-16 translate-y-1/2 items-center justify-center rounded-full bg-green-700 ring-4 ring-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:bg-green-600">
                      <Icon className="h-6 w-6 lg:h-7 lg:w-7 text-white" strokeWidth={2} />
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-12 lg:pt-14 lg:pb-7">
                    <h3 className="text-[15px] sm:text-base lg:text-[17px] font-bold tracking-[0.1em] text-gray-900">
                      {title}
                    </h3>
                    <p className="mt-2 text-[12.5px] sm:text-[13px] lg:text-sm leading-snug text-gray-500 normal-case">
                      {desc}
                    </p>
                  </div>
                </>
              );

              return (
                <motion.article
                  key={title}
                  variants={cardVariants}
                  whileHover={{ y: -8 }}
                  className="group relative rounded-2xl bg-white shadow-md transition-shadow duration-300 hover:shadow-xl w-full sm:w-[calc(50%-0.75rem)] lg:flex-1 lg:basis-0"
                >
                  {href ? (
                    <Link href={href} className="block">
                      {cardBody}
                    </Link>
                  ) : (
                    // No route for this line of business yet — render a
                    // non-clickable display card (no <Link>, so no dead-route
                    // prefetch and nothing happens on click).
                    <div className="block cursor-default">{cardBody}</div>
                  )}
                </motion.article>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
