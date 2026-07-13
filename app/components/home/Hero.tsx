'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination } from 'swiper/modules';
import { Sprout, Mountain } from 'lucide-react';

import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';

export type HeroSlide = {
  image: string;
  mobileImage?: string;
  alt?: string;
};

export type HeroFeature = {
  title: string;
  desc: string;
};

export type HeroProps = {
  headingMain?: string;
  headingAccent?: string;
  paragraph?: string;
  primaryButtonLabel?: string;
  primaryButtonHref?: string;
  secondaryButtonLabel?: string;
  secondaryButtonHref?: string;
  slides?: HeroSlide[];
  features?: HeroFeature[];
};

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    image: '/hero_images/first_image.jpg',
    mobileImage: '/hero_images/first_image_two.jpg',
    alt: 'Himalaya Agro farm landscape',
  },
  {
    image: '/hero_images/second_image.jpeg',
    alt: 'Himalaya Agro farm operations',
  },
  {
    image: '/hero_images/third_image.jpeg',
    alt: 'Himalaya Agro sustainable farming',
  },
];

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

type FeatureIconComponent = React.ComponentType<{ className?: string; strokeWidth?: number }>;

// Feature icons stay fixed (tied to display order) — only title/description are admin-editable.
const FEATURE_ICONS: FeatureIconComponent[] = [Sprout, SolarPanelIcon, EVChargeIcon, Mountain];

const DEFAULT_FEATURES: HeroFeature[] = [
  { title: 'Sustainable Agriculture', desc: 'High quality production for food security' },
  { title: 'Renewable Energy', desc: 'Clean energy for a greener tomorrow' },
  { title: 'EV Charging Network', desc: "Powering Nepal's future with clean mobility" },
  { title: 'Agro Tourism', desc: 'Experience nature, culture and rural life' },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.7 + i * 0.1, duration: 0.55, ease: 'easeOut' as const },
  }),
};

export default function Hero({
  headingMain = 'From our farms to world market for a',
  headingAccent = 'Sustainable Development',
  paragraph = 'We are a modern integrated agro-company specializing in poultry, buffalo farming,goat farming , fishery,and organic farming.',
  primaryButtonLabel = 'Our Projects',
  primaryButtonHref = '#integrated-business',
  secondaryButtonLabel = 'Explore Opportunities',
  secondaryButtonHref = '/contact',
  slides = DEFAULT_SLIDES,
  features = DEFAULT_FEATURES,
}: HeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const heroSlides = slides.length > 0 ? slides : DEFAULT_SLIDES;
  const heroFeatures = features.length > 0 ? features : DEFAULT_FEATURES;

  return (
    <section className="relative w-full overflow-hidden h-[640px] sm:h-[700px] lg:h-[calc(85dvh-var(--top-bar-height,80px))] lg:min-h-[540px] lg:max-h-[680px]">
      {/* Background slideshow */}
      <Swiper
        modules={[Autoplay, EffectFade, Pagination]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        loop
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        speed={1200}
        pagination={{ clickable: true, el: '.hero-pagination' }}
        onSlideChange={(s) => setActiveSlide(s.realIndex)}
        className="absolute inset-0 h-full w-full"
      >
        {heroSlides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className="relative h-full w-full">
              <img
                src={slide.image}
                alt={slide.alt || ''}
                className="absolute inset-0 h-full w-full object-cover"
                loading={i === 0 ? 'eager' : 'lazy'}
              />
              {/* Ken-Burns subtle zoom on the active slide */}
              <motion.div
                key={`zoom-mobile-${activeSlide}-${i}`}
                initial={{ scale: 1 }}
                animate={{ scale: activeSlide === i ? 1.08 : 1 }}
                transition={{ duration: 7, ease: 'easeOut' }}
                className={`absolute inset-0 bg-cover bg-center ${slide.mobileImage ? 'lg:hidden' : ''}`}
                style={{ backgroundImage: `url(${slide.mobileImage || slide.image})` }}
              />
              {slide.mobileImage && (
                <motion.div
                  key={`zoom-desktop-${activeSlide}-${i}`}
                  initial={{ scale: 1 }}
                  animate={{ scale: activeSlide === i ? 1.08 : 1 }}
                  transition={{ duration: 7, ease: 'easeOut' }}
                  className="absolute inset-0 bg-cover bg-center hidden lg:block"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Dark gradient overlays for text contrast */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/10 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/60 z-[1]" />
      <div className="absolute inset-0 lg:inset-y-0 lg:left-0 lg:w-full lg:max-w-[58%] bg-[radial-gradient(circle_at_50%_30%,rgba(0,0,0,0.5),transparent_58%)] lg:bg-[radial-gradient(circle_at_15%_22%,rgba(0,0,0,0.5),transparent_58%)] z-[1]" />

      {/* Foreground content */}
      <div className="absolute inset-x-0 top-0 z-10 mx-auto flex h-full w-full max-w-[1650px] flex-col justify-start pt-24 sm:pt-28 lg:justify-center lg:pt-0 px-4 sm:px-6 lg:px-12 pb-[210px] sm:pb-[230px] lg:pb-40">
        <div className="w-full max-w-2xl lg:max-w-[700px]">
          <motion.h1
            initial={{ opacity: 1, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
            className="text-2xl sm:text-4xl md:text-[2.75rem] lg:text-[3.4rem] xl:text-[3.75rem] leading-[1.15] sm:leading-[1.12] font-black tracking-tight text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.58)]"
          >
            {headingMain}{' '}
            <span className="block lg:inline">
              for a <span className="text-green-400">{headingAccent}</span>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 1, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
            className="mt-3 max-w-full sm:max-w-[34rem] text-[13px] leading-relaxed text-white/90 sm:mt-5 sm:text-sm lg:mt-6 lg:text-base lg:leading-[1.7] drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]"
          >
            {paragraph}
          </motion.p>

          <motion.div
            initial={{ opacity: 1, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.45 }}
            className="mt-5 flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:mt-7 sm:gap-4 lg:mt-9"
          >
            <Link
              href={primaryButtonHref}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-[10px] bg-[#11823b] px-5 py-3 text-sm font-semibold text-white shadow-[0_10px_18px_rgba(17,130,59,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0f7434] hover:shadow-[0_14px_24px_rgba(17,130,59,0.34)] sm:min-w-[124px] sm:px-6 sm:py-3 sm:text-[13px] lg:px-7 lg:py-3.5 lg:text-[14px]"
            >
              {primaryButtonLabel}
            </Link>

            <Link
              href={secondaryButtonHref}
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-[10px] bg-[#f7f3ea] px-5 py-3 text-sm font-semibold text-slate-900 shadow-[0_10px_18px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-white hover:shadow-[0_14px_24px_rgba(0,0,0,0.2)] sm:min-w-[156px] sm:px-6 sm:py-3 sm:text-[13px] lg:px-7 lg:py-3.5 lg:text-[14px]"
            >
              {secondaryButtonLabel}
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Pagination dots (hidden to match design) */}
      <div className="hero-pagination hidden" />

      {/* Bottom feature panel — anchored to bottom on every breakpoint */}
      <div className="absolute inset-x-0 bottom-5 sm:bottom-7 lg:bottom-8 z-10 px-4 sm:px-6 lg:px-12">
        <div className="mx-auto w-full max-w-[1650px]">
          <div className="rounded-2xl border border-white/15 bg-[#0a3d1f]/75 px-5 py-5 sm:px-6 sm:py-5 lg:px-10 lg:py-8 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-5 sm:gap-x-5 lg:gap-x-10">
              {heroFeatures.map(({ title, desc }, i) => {
                const Icon = FEATURE_ICONS[i % FEATURE_ICONS.length];
                return (
                  <motion.div
                    key={`${title}-${i}`}
                    custom={i}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    className="group flex items-center gap-3 lg:gap-5 min-w-0"
                  >
                    <div className="flex h-12 w-12 lg:h-[68px] lg:w-[68px] shrink-0 items-center justify-center rounded-full border-[1.5px] border-green-300/70 bg-green-400/[0.06] transition-transform duration-300 group-hover:scale-105">
                      <Icon className="h-5 w-5 lg:h-8 lg:w-8 text-green-300" strokeWidth={1.6} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[13px] lg:text-[17px] font-semibold leading-tight text-white">
                        {title}
                      </h3>
                      <p className="mt-1 text-[11.5px] lg:text-[13.5px] leading-snug text-white/80 line-clamp-2 lg:line-clamp-none">
                        {desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
