import type { ReactNode } from "react";
import Link from "next/link";
import SubHeroSection from "./SubHeroSection";
import { Section as AnimatedSection, Div as AnimatedDiv } from "./AnimatedClient";
import FarmIcon from "./FarmIcon";
import FarmTimeline from "./FarmTimeline";
import ProductCard from "./ProductCard";

export type FarmFeature = { title: string; icon: string };
export type FarmActivity = { step: string; title: string; desc: string; icon: string };
export type SustainabilityPrinciple = { title: string; desc: string; icon: string };
export type FarmCategoryName = "Poultry" | "Buffalo" | "Fish" | "Goat";

export type FarmPageData = {
  /** Hero / banner (unchanged across pages) */
  title: string;
  tag?: string;
  heroDescription: string;
  heroImage: string;
  /** Optional looping banner background video (CDN-first + self-hosted fallback).
   *  When set, it plays over `heroImage`, which stays as the poster / fallback. */
  heroVideoCloudSrc?: string;
  heroVideoLocalSrc?: string;
  /** Optional CSS min-height override for the banner (defaults to the standard size). */
  heroMinHeight?: string;
  /** Kept for backward compatibility; the page now uses the shared emerald theme. */
  accent?: string;

  /** 1 — Farm Overview */
  overviewHeading: string;
  overviewText: string;
  overviewText2?: string;
  overviewImage: string;
  features: FarmFeature[];

  /** 2 — Farm Activities */
  activitiesHeading: string;
  activitiesSubheading: string;
  activities: FarmActivity[];

  /** 3 — Sustainability & Responsible Farming */
  sustainabilityHeading: string;
  sustainabilityText: string;
  sustainabilityText2?: string;
  sustainabilityPrinciples: SustainabilityPrinciple[];
  /** Faint backdrop behind the dark emerald sustainability panel. Topic-specific
   *  per farm; falls back to the shared mission texture when omitted. */
  sustainabilityImage?: string;

  /** 4 — Products From This Farm (matched on Product.farmCategory) */
  farmCategory: FarmCategoryName;
};

const REVEAL = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.7, ease: "easeOut" as const },
  viewport: { once: true, margin: "-100px" },
};

const serif = { fontFamily: "Georgia, 'Times New Roman', serif" } as const;

/** Emerald leaf eyebrow — echoes the home-page SectionTitle motif. */
function Eyebrow({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] ${
        dark
          ? "bg-white/10 text-green-200 ring-1 ring-white/15"
          : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
      }`}
    >
      <FarmIcon
        name="leaf"
        strokeWidth={2}
        className={dark ? "h-3.5 w-3.5 text-green-300" : "h-3.5 w-3.5 text-emerald-600"}
      />
      {children}
    </span>
  );
}

export default function FarmPageTemplate({
  data,
  products = [],
}: {
  data: FarmPageData;
  products?: any[];
}) {
  return (
    <main className="bg-white text-gray-900 selection:bg-emerald-100">
      {/* Hero / banner — intentionally unchanged */}
      <SubHeroSection
        title={data.title}
        description={data.heroDescription}
        image={data.heroImage}
        videoCloudSrc={data.heroVideoCloudSrc}
        videoLocalSrc={data.heroVideoLocalSrc}
        minHeight={data.heroMinHeight}
        tag={data.tag}
        btnText="Visit Our Shop"
        btnHref="/shop"
      />

      {/* ───────────────────────── 1 · Farm Overview ───────────────────────── */}
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute -left-28 top-20 h-72 w-72 rounded-full bg-emerald-50 opacity-70" />
        <div className="relative mx-auto w-full max-w-[1650px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-[70px] xl:px-10">
          <AnimatedSection {...REVEAL}>
            <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
              <div>
                <Eyebrow>Farm Overview</Eyebrow>
                <h2
                  className="mt-5 text-[1.7rem] font-bold leading-[1.15] tracking-tight text-emerald-900 sm:text-4xl lg:text-[2.6rem]"
                  style={serif}
                >
                  {data.overviewHeading}
                </h2>
                <p className="mt-5 text-base leading-relaxed text-gray-600 lg:text-lg">{data.overviewText}</p>
                {data.overviewText2 && (
                  <p className="mt-4 text-base leading-relaxed text-gray-600 lg:text-lg">{data.overviewText2}</p>
                )}
              </div>

              <div className="relative">
                <div
                  aria-hidden="true"
                  className="absolute -right-4 -top-4 -z-10 h-28 w-28 rounded-3xl bg-emerald-100/70"
                />
                <div
                  aria-hidden="true"
                  className="absolute -bottom-6 -left-6 -z-10 h-32 w-32 rounded-full bg-emerald-50"
                />
                <div className="overflow-hidden rounded-[2rem] border border-emerald-100 shadow-[0_24px_60px_rgba(6,78,59,0.15)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.overviewImage}
                    alt={data.overviewHeading}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
                  />
                </div>
              </div>
            </div>
          </AnimatedSection>

          {/* Key features */}
          <AnimatedDiv className="mt-12 sm:mt-14" {...REVEAL}>
            <div className="mb-6 sm:mb-8">
              <Eyebrow>Key Features</Eyebrow>
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {data.features.map((feature, i) => (
                <li
                  key={i}
                  className="group flex items-center gap-4 rounded-2xl border border-emerald-100/60 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-[0_18px_36px_rgba(6,78,59,0.12)]"
                >
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 text-white shadow-[0_8px_18px_rgba(6,78,59,0.28)] transition-transform duration-300 group-hover:scale-105">
                    <FarmIcon name={feature.icon} className="h-6 w-6" />
                  </span>
                  <h3 className="text-[15px] font-bold leading-snug text-gray-900 transition-colors duration-300 group-hover:text-emerald-800">
                    {feature.title}
                  </h3>
                </li>
              ))}
            </ul>
          </AnimatedDiv>
        </div>
      </section>

      {/* ─────────────────────── 2 · Farm Activities ─────────────────────── */}
      <section className="relative overflow-hidden bg-[#f8fafb]">
        <div className="pointer-events-none absolute -right-24 top-0 h-80 w-80 -translate-y-1/3 rounded-full bg-emerald-50 opacity-70" />
        <div className="relative mx-auto w-full max-w-[1650px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-[70px]">
          <AnimatedDiv className="mx-auto mb-12 max-w-2xl text-center sm:mb-14 lg:mb-16" {...REVEAL}>
            <Eyebrow>Farm Activities</Eyebrow>
            <h2
              className="mt-5 text-[1.7rem] font-bold tracking-tight text-emerald-900 sm:text-4xl lg:text-[2.6rem]"
              style={serif}
            >
              {data.activitiesHeading}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-500 sm:text-base">
              {data.activitiesSubheading}
            </p>
          </AnimatedDiv>

          <FarmTimeline activities={data.activities} />
        </div>
      </section>

      {/* ───────────── 3 · Sustainability & Responsible Farming ───────────── */}
      <section className="relative overflow-hidden py-14 sm:py-16 lg:py-[70px]">
        {/* Dark emerald base — mirrors the home WhyChooseUs section */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950" />
        <div
          className="absolute inset-0 bg-cover bg-center opacity-[0.20]"
          style={{
            backgroundImage: `url('${data.sustainabilityImage ?? "/background_for_mission.jpeg"}')`,
          }}
        />
        <div className="pointer-events-none absolute -right-20 top-0 h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[120px]" />

        {/* Subtle agricultural illustrations */}
        <FarmIcon
          name="leaf"
          strokeWidth={1}
          className="pointer-events-none absolute right-6 top-8 hidden h-44 w-44 text-white/[0.05] lg:block"
        />
        <FarmIcon
          name="sprout"
          strokeWidth={1}
          className="pointer-events-none absolute -bottom-6 left-8 hidden h-36 w-36 text-white/[0.05] lg:block"
        />

        <div className="relative mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-8">
          <AnimatedDiv className="mx-auto max-w-3xl text-center" {...REVEAL}>
            <Eyebrow dark>Sustainability &amp; Responsible Farming</Eyebrow>
            <h2
              className="mt-5 text-[1.7rem] font-bold leading-[1.15] tracking-tight text-white sm:text-4xl lg:text-[2.5rem]"
              style={serif}
            >
              {data.sustainabilityHeading}
            </h2>
            <p className="mt-5 text-[15px] leading-relaxed text-emerald-100/80 sm:text-base lg:text-[17px]">
              {data.sustainabilityText}
            </p>
            {data.sustainabilityText2 && (
              <p className="mt-4 text-[15px] leading-relaxed text-emerald-100/80 sm:text-base lg:text-[17px]">
                {data.sustainabilityText2}
              </p>
            )}
          </AnimatedDiv>

          <AnimatedDiv
            className="mx-auto mt-10 grid max-w-5xl gap-5 sm:mt-12 sm:grid-cols-3 sm:gap-6"
            {...REVEAL}
          >
            {data.sustainabilityPrinciples.map((principle, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-3xl bg-white p-7 text-center shadow-[0_20px_45px_rgba(0,0,0,0.22)]"
              >
                <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-800 text-white shadow-[0_10px_22px_rgba(6,78,59,0.35)] ring-4 ring-emerald-100 transition-transform duration-300 group-hover:scale-105">
                  <FarmIcon name={principle.icon} className="h-7 w-7" />
                </span>
                <h3 className="text-lg font-bold leading-snug text-emerald-900" style={serif}>
                  {principle.title}
                </h3>
                <p className="mt-3 text-[13px] leading-relaxed text-gray-500">{principle.desc}</p>
              </div>
            ))}
          </AnimatedDiv>
        </div>
      </section>

      {/* ──────────────────── 4 · Products From This Farm ──────────────────── */}
      <section className="relative overflow-hidden bg-white">
        <div className="pointer-events-none absolute -left-24 bottom-0 h-80 w-80 translate-y-1/3 rounded-full bg-emerald-50 opacity-70" />
        <div className="relative mx-auto w-full max-w-[1650px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-[70px]">
          <AnimatedDiv className="mx-auto mb-10 max-w-2xl text-center sm:mb-12" {...REVEAL}>
            <Eyebrow>Products From This Farm</Eyebrow>
            <h2
              className="mt-5 text-[1.7rem] font-bold tracking-tight text-emerald-900 sm:text-4xl lg:text-[2.6rem]"
              style={serif}
            >
              Products From This Farm
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-gray-500 sm:text-base">
              Explore products connected to this farm, drawn directly from our product catalogue.
            </p>
          </AnimatedDiv>

          {products.length > 0 ? (
            <AnimatedDiv {...REVEAL}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} hideQuickView />
                ))}
              </div>
              <div className="mt-10 text-center">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 rounded-full bg-[#11823b] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(17,130,59,0.30)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0f7434]"
                >
                  Browse All Products
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </AnimatedDiv>
          ) : (
            <AnimatedDiv
              className="mx-auto max-w-xl rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/40 px-8 py-16 text-center"
              {...REVEAL}
            >
              <span className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-800 text-white shadow-[0_10px_22px_rgba(6,78,59,0.35)] ring-4 ring-emerald-100">
                <FarmIcon name="package" className="h-7 w-7" />
              </span>
              <p className="text-base font-semibold text-emerald-900">
                Products associated with this farm will appear here.
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-gray-500">
                Products tagged to this farm in the catalogue are listed here automatically.
              </p>
            </AnimatedDiv>
          )}
        </div>
      </section>
    </main>
  );
}
