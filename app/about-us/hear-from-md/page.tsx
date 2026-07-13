import Link from "next/link";
import SubHeroSection from "../../components/SubHeroSection";
import { Section as AnimatedSection } from "../../components/AnimatedClient";
import connectToDatabase from "../../../lib/mongodb";
import HearFromMDSettings, { HEAR_FROM_MD_DEFAULTS } from "../../../models/HearFromMDSettings";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Hear From the MD",
  description:
    "A personal message from the Managing Director of Himalaya Nepal Agriculture Company Limited.",
};

async function getSettings() {
  try {
    await connectToDatabase();
    const doc = await HearFromMDSettings.findOne({ singletonKey: "hear-from-md" }).lean();
    if (doc) return {
      heroTitle: doc.heroTitle || HEAR_FROM_MD_DEFAULTS.heroTitle,
      heroAccent: doc.heroAccent || HEAR_FROM_MD_DEFAULTS.heroAccent,
      heroDescription: doc.heroDescription || HEAR_FROM_MD_DEFAULTS.heroDescription,
      heroImage: doc.heroImage || HEAR_FROM_MD_DEFAULTS.heroImage,
      mdName: doc.mdName || HEAR_FROM_MD_DEFAULTS.mdName,
      mdRole: doc.mdRole || HEAR_FROM_MD_DEFAULTS.mdRole,
      mdImage: doc.mdImage || HEAR_FROM_MD_DEFAULTS.mdImage,
      eyebrow: doc.eyebrow || HEAR_FROM_MD_DEFAULTS.eyebrow,
      heading: doc.heading || HEAR_FROM_MD_DEFAULTS.heading,
      contentHtml: doc.contentHtml || HEAR_FROM_MD_DEFAULTS.contentHtml,
    };
  } catch (_) {}
  return { heroTitle: HEAR_FROM_MD_DEFAULTS.heroTitle, heroAccent: HEAR_FROM_MD_DEFAULTS.heroAccent, heroDescription: HEAR_FROM_MD_DEFAULTS.heroDescription, heroImage: HEAR_FROM_MD_DEFAULTS.heroImage, mdName: HEAR_FROM_MD_DEFAULTS.mdName, mdRole: HEAR_FROM_MD_DEFAULTS.mdRole, mdImage: HEAR_FROM_MD_DEFAULTS.mdImage, eyebrow: HEAR_FROM_MD_DEFAULTS.eyebrow, heading: HEAR_FROM_MD_DEFAULTS.heading, contentHtml: HEAR_FROM_MD_DEFAULTS.contentHtml };
}

export default async function HearFromMDPage() {
  const s = await getSettings();
  const safeContentHtml = s.contentHtml || "";

  return (
    <main className="bg-white text-slate-900">
      <SubHeroSection
        title={s.heroTitle}
        accent={s.heroAccent}
        tag="Leadership"
        description={s.heroDescription}
        image={s.heroImage}
      />

      <section className="py-12 sm:py-16">
        <div className="mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-10 xl:px-12">
          <AnimatedSection
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, margin: "-80px" }}
          >
            <div className="grid lg:grid-cols-[minmax(0,380px)_1fr] gap-8 lg:gap-14 items-start">
              {/* Portrait card */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-sm">
                <div className="relative h-[340px] sm:h-[460px] lg:h-[500px] overflow-hidden">
                  <img
                    src={s.mdImage}
                    alt={s.mdName}
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div className="bg-emerald-700 px-5 py-4 text-center text-white">
                  <h3 className="text-lg font-bold tracking-tight">{s.mdName}</h3>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/85">
                    {s.mdRole}
                  </p>
                </div>
              </div>

              {/* Message */}
              <article className="text-slate-600 leading-relaxed text-[15px] sm:text-base space-y-4">
                <p className="text-emerald-700 text-xs font-bold uppercase tracking-[0.25em]">
                  {s.eyebrow}
                </p>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 mt-2 mb-3">
                  {s.heading}
                </h2>
                <div className="letter-content" dangerouslySetInnerHTML={{ __html: safeContentHtml }} />

                {/* Signature + CTA */}
                <div className="mt-6 pt-5 border-t border-slate-200">
                  <p className="italic text-sm text-slate-500">{s.mdName}, {s.mdRole}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href="/about-us/who-we-are"
                      className="inline-block rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-emerald-800 hover:scale-105"
                    >
                      About Our Company
                    </Link>
                    <Link
                      href="/contact"
                      className="inline-block rounded-xl border border-emerald-700 px-6 py-2.5 text-sm font-semibold text-emerald-700 transition-all duration-300 hover:bg-emerald-50"
                    >
                      Get in Touch
                    </Link>
                  </div>
                </div>
              </article>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </main>
  );
}
