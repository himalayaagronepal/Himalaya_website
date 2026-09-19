'use client';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import SectionTitle from './SectionTitle';
import currentNotices from '../../../lib/current-notices.json';

const ALL_HREF = '/news-and-notices';
const latestNotice = currentNotices.notices[0];

type Item = {
  kind: 'News' | 'Notice';
  date: string;
  title: string;
  excerpt: string;
  image: string;
};

const items: Item[] = [
  {
    kind: 'News',
    date: 'May 18, 2026',
    title: 'Integrated Farming Model Lifts Smallholder Incomes Across 12 Districts',
    excerpt:
      'Combining poultry, livestock, fishery and organic crops on a single landholding raised average partner-household earnings by 38% in the first year.',
    image:
      'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=800&q=80',
  },
  {
    kind: 'News',
    date: 'May 5, 2026',
    title: 'New Cold-Chain Hub Commissioned in Biratnagar to Cut Post-Harvest Losses',
    excerpt:
      'The state-of-the-art facility reduces post-harvest losses by up to 40% and supports year-round export operations across the eastern corridor.',
    image:
      'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80',
  },
  {
    kind: 'Notice',
    date: new Date(latestNotice.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }),
    title: latestNotice.title,
    excerpt: latestNotice.excerpt,
    image: latestNotice.previewImages[0],
  },
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

const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.6, ease: 'easeOut' as const },
  },
};

export default function NewsMedia() {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-60px' });

  return (
    <section
      ref={sectionRef}
      className="relative bg-white py-12 sm:py-16 lg:py-[50px] overflow-hidden"
    >
      {/* Decorative blobs — emerald, matching the site theme */}
      <div className="pointer-events-none absolute top-0 right-0 h-[260px] w-[260px] -translate-y-1/2 translate-x-1/3 rounded-full bg-emerald-50 opacity-40 sm:h-[400px] sm:w-[400px]" />
      <div className="pointer-events-none absolute bottom-0 left-0 h-[220px] w-[220px] translate-y-1/2 -translate-x-1/3 rounded-full bg-emerald-50 opacity-30 sm:h-[350px] sm:w-[350px]" />

      <div className="relative mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-10 xl:px-12">
        <motion.div
          variants={sectionVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
        >
          <SectionTitle title="News & Notices" />

          <motion.p
            variants={headingVariants}
            className="mx-auto mt-4 mb-8 max-w-2xl text-center text-base leading-relaxed text-gray-500 sm:mb-10 sm:text-lg"
          >
            Stay up to date with our latest milestones, official announcements and notices.
          </motion.p>

          {/* Cards grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
            {items.map((item, index) => (
              <motion.article
                key={index}
                variants={cardVariants}
                whileHover={{ y: -8, transition: { duration: 0.3, ease: 'easeOut' as const } }}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-emerald-100/60 bg-white shadow-sm transition-all duration-500 hover:border-emerald-200 hover:shadow-[0_18px_40px_rgba(6,78,59,0.14)]"
              >
                <Link href={ALL_HREF} className="flex flex-1 flex-col">
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden sm:h-52">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/45 to-transparent" />

                    {/* Kind badge */}
                    <span className="absolute left-4 top-4 rounded-full bg-[#11823b] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white shadow-sm">
                      {item.kind}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex flex-1 flex-col p-6">
                    <span className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-gray-400">
                      <Calendar className="h-3.5 w-3.5" />
                      {item.date}
                    </span>

                    <h3
                      className="mb-3 text-lg font-bold leading-snug text-emerald-900 transition-colors duration-300 group-hover:text-[#11823b]"
                      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                    >
                      {item.title}
                    </h3>

                    <p className="flex-1 text-sm leading-relaxed text-gray-500 line-clamp-3">
                      {item.excerpt}
                    </p>

                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#11823b]">
                      <span className="transition-all duration-300 group-hover:tracking-wide">
                        Read more
                      </span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>

                {/* Bottom accent bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[3px] origin-left scale-x-0 bg-[#11823b] transition-transform duration-500 group-hover:scale-x-100" />
              </motion.article>
            ))}
          </div>

          {/* View all CTA — matches the farm pages' primary button */}
          <motion.div variants={headingVariants} className="mt-10 text-center sm:mt-12">
            <Link
              href={ALL_HREF}
              className="inline-flex items-center gap-2 rounded-full bg-[#11823b] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(17,130,59,0.30)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0f7434]"
            >
              View All News &amp; Notices
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
