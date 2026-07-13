import React from "react";
import Link from "next/link";
import { Sprout, Factory, Zap, UtensilsCrossed, Leaf, ArrowRight } from "lucide-react";
import SubHeroSection from "../components/SubHeroSection";
import { Section as AnimatedSection } from "../components/AnimatedClient";
import StrategicObjectives from "../components/about/StrategicObjectives";
import connectToDatabase from "../../lib/mongodb";
import WhoWeAreSettings, { WHO_WE_ARE_DEFAULTS } from "../../models/WhoWeAreSettings";

export const metadata = {
  title: "Who We Are",
  description:
    "Himalaya Nepal Krishi Company Limited — an integrated agricultural enterprise spanning farming, processing, clean energy, hospitality and innovation for a self-reliant Nepal.",
};

export const dynamic = "force-dynamic";

const verticals = [
  { label: "Integrated Agriculture", Icon: Sprout },
  { label: "Processing & Value Addition", Icon: Factory },
  { label: "Clean Energy & EV", Icon: Zap },
  { label: "Hospitality & Highway Services", Icon: UtensilsCrossed },
  { label: "Innovation & Sustainability", Icon: Leaf },
];

async function getSettings() {
  try {
    await connectToDatabase();
    const doc = await WhoWeAreSettings.findOne({ singletonKey: "who-we-are" }).lean();
    if (doc) return {
      heroTitle: doc.heroTitle || WHO_WE_ARE_DEFAULTS.heroTitle,
      heroAccent: doc.heroAccent || undefined,
      heroDescription: doc.heroDescription || WHO_WE_ARE_DEFAULTS.heroDescription,
      heroImage: doc.heroImage || WHO_WE_ARE_DEFAULTS.heroImage,
      mainHeading: doc.mainHeading || WHO_WE_ARE_DEFAULTS.mainHeading,
      mainAccent: doc.mainAccent || WHO_WE_ARE_DEFAULTS.mainAccent,
      paragraph1: doc.paragraph1 || WHO_WE_ARE_DEFAULTS.paragraph1,
      paragraph2: doc.paragraph2 || WHO_WE_ARE_DEFAULTS.paragraph2,
      contentHtml: (doc as any).contentHtml || "",
    };
  } catch (_) {}
  return {
    heroTitle: WHO_WE_ARE_DEFAULTS.heroTitle,
    heroAccent: WHO_WE_ARE_DEFAULTS.heroAccent || undefined,
    heroDescription: WHO_WE_ARE_DEFAULTS.heroDescription,
    heroImage: WHO_WE_ARE_DEFAULTS.heroImage,
    mainHeading: WHO_WE_ARE_DEFAULTS.mainHeading,
    mainAccent: WHO_WE_ARE_DEFAULTS.mainAccent,
    paragraph1: WHO_WE_ARE_DEFAULTS.paragraph1,
    paragraph2: WHO_WE_ARE_DEFAULTS.paragraph2,
    contentHtml: "",
  };
}

export default async function WhoWeArePage() {
  const s = await getSettings();

  // Split mainHeading around mainAccent for green highlight
  let headingNode: React.ReactNode = s.mainHeading;
  if (s.mainAccent && s.mainHeading.includes(s.mainAccent)) {
    const [before, after] = s.mainHeading.split(s.mainAccent);
    headingNode = <>{before}<span className="text-emerald-600">{s.mainAccent}</span>{after}</>;
  }

  return (
    <main className="bg-white text-slate-900 selection:bg-emerald-100">
      <SubHeroSection
        title={s.heroTitle}
        accent={s.heroAccent}
        description={s.heroDescription}
        image={s.heroImage}
      />

      {/* Intro — brand + aligned story */}
      <AnimatedSection
        className="mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-10 xl:px-12 py-14 sm:py-16 lg:py-20"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true, margin: "-80px" }}
      >
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {/* Story */}
          <div>
            <h2 className="text-2xl font-black leading-[1.12] tracking-tight sm:text-3xl lg:text-4xl">
              {headingNode}
            </h2>
            {s.contentHtml ? (
              <div
                className="who-we-are-content mt-5 max-w-xl text-[15px] leading-relaxed text-slate-500 sm:text-base"
                dangerouslySetInnerHTML={{ __html: s.contentHtml }}
              />
            ) : (
              <>
                <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate-500 sm:text-base">
                  {s.paragraph1}
                </p>
                <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-slate-500 sm:text-base">
                  {s.paragraph2}
                </p>
              </>
            )}

            {/* Vertical chips */}
            <div className="mt-7 flex flex-wrap gap-2.5">
              {verticals.map(({ label, Icon }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700"
                >
                  <Icon className="h-3.5 w-3.5 text-emerald-600" />
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-7 py-3 text-sm font-bold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                Partner With Us <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-7 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-emerald-300 hover:text-emerald-700"
              >
                Browse Products
              </Link>
            </div>
          </div>

          {/* Brand card */}
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-950 p-8 shadow-xl sm:p-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/20 blur-[90px]" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-green-400/10 blur-[90px]" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="rounded-3xl bg-white p-5 shadow-lg sm:p-6">
                <img
                  src="/logo_mobile_screen.png"
                  alt="Himalaya Nepal Krishi Company Limited"
                  className="h-24 w-auto sm:h-28"
                />
              </div>
              <h3 className="mt-6 text-lg font-black text-white sm:text-xl">
                Himalaya Nepal Krishi Company Limited
              </h3>
              <p className="mt-2 text-sm text-emerald-100/80">
                Farming · Processing · Energy · Hospitality · Innovation
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {["GMP Aligned", "HACCP", "Made in Nepal"].map((b) => (
                  <span
                    key={b}
                    className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-50"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      {/* Ten Strategic Objectives */}
      <StrategicObjectives />

      {/* CTA */}
      <div className="mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-10 xl:px-12 pb-16 sm:pb-20">
        <AnimatedSection
          className="relative overflow-hidden rounded-[2rem] bg-emerald-950 px-6 py-12 text-center sm:px-10 sm:py-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-emerald-500/15 blur-[110px]" />
          <div className="relative z-10 mx-auto max-w-2xl">
            <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl">
              Building Nepal&apos;s agriculture, together
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-emerald-100/70 sm:text-base">
              Join our mission to modernize, commercialize and industrialize Nepal&apos;s agriculture
              for a sustainable, self-reliant future.
            </p>
            <Link
              href="/contact"
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-emerald-900 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-50"
            >
              Get in Touch <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </AnimatedSection>
      </div>
    </main>
  );
}
