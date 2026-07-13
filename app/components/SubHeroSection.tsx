'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import BackgroundVideo from './BackgroundVideo';

export type SubHeroSectionProps = {
  title?: string;
  description?: string;
  image?: string;
  /** Optional word(s) inside the title that should be highlighted green */
  accent?: string;
  tag?: string;
  stats?: { value: string; label: string }[];
  btnText?: string;
  btnHref?: string;
  /** Kept for backwards compatibility — visual style is now uniformly dark */
  overlay?: 'light' | 'dark';
  /**
   * Optional looping background video. When both sources are provided the banner
   * plays the video (CDN-first, self-hosted fallback) on larger screens with
   * motion allowed, layered over `image`, which stays as the poster / mobile /
   * reduced-motion fallback.
   */
  videoCloudSrc?: string;
  videoLocalSrc?: string;
  /** CSS min-height for the banner. Defaults to the standard sub-hero size. */
  minHeight?: string;
};

const DEFAULT_MIN_HEIGHT = 'min(46vh, 360px)';

const DEFAULT_IMAGE = '/hero_images/first_image.jpg';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

/**
 * Sub-page hero banner — visually consistent with the home Hero
 * (dark green/black gradient overlay over a farm image, white text with a
 * green-400 accent, green CTA button). Used by news and notices, contact,
 * company, farm sub-pages, etc.
 */
export default function SubHeroSection({
  title = 'Page Title',
  description,
  image = DEFAULT_IMAGE,
  accent,
  btnText,
  btnHref,
  videoCloudSrc,
  videoLocalSrc,
  minHeight = DEFAULT_MIN_HEIGHT,
}: SubHeroSectionProps) {
  const hasVideo = Boolean(videoCloudSrc && videoLocalSrc);
  const pathname = usePathname();

  const segments = (pathname || '')
    .split('/')
    .filter(Boolean)
    .map((seg) => seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' '));

  // Optionally split the title around the accent word(s) for inline highlighting
  let titleNode: React.ReactNode = title;
  if (accent && title.includes(accent)) {
    const [before, after] = title.split(accent);
    titleNode = (
      <>
        {before}
        <span className="text-green-400">{accent}</span>
        {after}
      </>
    );
  }

  return (
    <section
      className="relative z-0 flex w-full flex-col overflow-hidden bg-emerald-950"
      style={{ minHeight }}
    >
      {/* Background image — also the poster / mobile / reduced-motion fallback when a video is set */}
      <motion.div
        initial={{ scale: 1.08 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
        className="absolute inset-0"
      >
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${image}')` }}
        />
      </motion.div>

      {/* Optional looping background video, layered over the image */}
      {hasVideo && (
        <BackgroundVideo
          cloudSources={[{ src: videoCloudSrc!, type: 'video/mp4' }]}
          localSrc={videoLocalSrc!}
          poster={image}
        />
      )}

      {/* Dark gradient overlays — mirror the home Hero so the page-to-page feel is unified */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-emerald-950/70" />
      <div className="absolute inset-y-0 left-0 w-full max-w-[58%] bg-[radial-gradient(circle_at_15%_30%,rgba(0,0,0,0.45),transparent_58%)]" />

      {/* Content */}
      <div className="relative z-10 mx-auto flex w-full max-w-[1650px] flex-1 flex-col justify-center px-4 sm:px-6 lg:px-10 xl:px-12 pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-12 sm:pb-14 lg:pb-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-2xl lg:max-w-[640px]"
        >
          {/* Breadcrumb */}
          <motion.nav
            variants={fadeUpVariants}
            className="mb-3 sm:mb-4"
            aria-label="Breadcrumb"
          >
            <ol className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[2px] text-white/55">
              <li>
                <Link href="/" className="transition-colors hover:text-green-300">
                  Home
                </Link>
              </li>
              {segments.map((seg, i) => (
                <React.Fragment key={i}>
                  <li className="text-white/30">/</li>
                  <li
                    className={
                      i === segments.length - 1 ? 'text-green-300' : 'text-white/55'
                    }
                  >
                    {seg}
                  </li>
                </React.Fragment>
              ))}
            </ol>
          </motion.nav>

          {/* Tag pill */}
          {/* {tag && (
            <motion.div variants={fadeUpVariants}>
              <span className="inline-block px-3.5 py-1 rounded-full text-[10px] sm:text-xs font-semibold tracking-wide mb-3 sm:mb-4 text-green-300 border border-green-300/30 bg-green-400/[0.08] backdrop-blur-sm">
                {tag}
              </span>
            </motion.div>
          )} */}

          {/* Title */}
          <motion.h1
            variants={fadeUpVariants}
            className="text-[26px] xs:text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-black tracking-tight leading-[1.1] text-white drop-shadow-[0_3px_16px_rgba(0,0,0,0.55)] break-words"
          >
            {titleNode}
          </motion.h1>

          {/* Description */}
          {description && (
            <motion.p
              variants={fadeUpVariants}
              className="mt-4 sm:mt-5 max-w-xl text-sm sm:text-[15px] lg:text-base leading-relaxed text-white/85 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]"
            >
              {description}
            </motion.p>
          )}

          {/* CTA button */}
          {btnText && btnHref && (
            <motion.div variants={fadeUpVariants} className="mt-5 sm:mt-6">
              <Link
                href={btnHref}
                className="inline-flex items-center justify-center rounded-[10px] bg-[#11823b] px-6 py-3 text-[13px] font-semibold text-white shadow-[0_10px_18px_rgba(17,130,59,0.32)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0f7434] hover:shadow-[0_14px_24px_rgba(17,130,59,0.4)] sm:px-7 sm:py-3.5 sm:text-[14px]"
              >
                {btnText}
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Subtle bottom fade to the next section's white background */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/15 to-transparent" />
    </section>
  );
}
