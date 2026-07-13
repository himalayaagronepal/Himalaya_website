import type { Metadata } from "next";
import ContactForm from "../components/ContactForm";
import SubHeroSection from "../components/SubHeroSection";
import connectToDatabase from "../../lib/mongodb";
import ContactSettings, { CONTACT_DEFAULTS } from "../../models/ContactSettings";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Contact",
};

export default async function ContactPage() {
  let s = CONTACT_DEFAULTS;

  try {
    await connectToDatabase();
    const doc = await ContactSettings.findOne({ singletonKey: "contact" }).lean() as any;
    if (doc) {
      s = {
        heroTitle: doc.heroTitle || CONTACT_DEFAULTS.heroTitle,
        heroAccent: doc.heroAccent ?? CONTACT_DEFAULTS.heroAccent,
        heroDescription: doc.heroDescription || CONTACT_DEFAULTS.heroDescription,
        heroImage: doc.heroImage || CONTACT_DEFAULTS.heroImage,
        heroImagePublicId: doc.heroImagePublicId || "",
        heroStats: Array.isArray(doc.heroStats) && doc.heroStats.length > 0
          ? doc.heroStats : CONTACT_DEFAULTS.heroStats,
        infoCompanyLabel: doc.infoCompanyLabel || CONTACT_DEFAULTS.infoCompanyLabel,
        infoHeading: doc.infoHeading || CONTACT_DEFAULTS.infoHeading,
        infoSubheading: doc.infoSubheading || CONTACT_DEFAULTS.infoSubheading,
        phones: Array.isArray(doc.phones) && doc.phones.length > 0
          ? doc.phones : CONTACT_DEFAULTS.phones,
        email: doc.email || CONTACT_DEFAULTS.email,
        addressLines: Array.isArray(doc.addressLines) && doc.addressLines.length > 0
          ? doc.addressLines : CONTACT_DEFAULTS.addressLines,
        supportEmail: doc.supportEmail || CONTACT_DEFAULTS.supportEmail,
        openHours: doc.openHours || CONTACT_DEFAULTS.openHours,
        mapEmbedUrl: doc.mapEmbedUrl || CONTACT_DEFAULTS.mapEmbedUrl,
        formHeading: doc.formHeading || CONTACT_DEFAULTS.formHeading,
        formSubheading: doc.formSubheading || CONTACT_DEFAULTS.formSubheading,
      };
    }
  } catch (_) {}

  return (
    <main className="bg-white text-gray-900">
      <SubHeroSection
        title={s.heroTitle}
        accent={s.heroAccent || undefined}
        description={s.heroDescription}
        image={s.heroImage}
      />

      <main className="mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-8 xl:px-10 mt-10 sm:mt-12 lg:mt-20 mb-16 sm:mb-20 lg:mb-24">
        <section className="w-full">
          <ContactForm
            mapEmbedUrl={s.mapEmbedUrl}
            infoCompanyLabel={s.infoCompanyLabel}
            infoHeading={s.infoHeading}
            infoSubheading={s.infoSubheading}
            phones={s.phones}
            contactEmail={s.email}
            addressLines={s.addressLines}
            supportEmail={s.supportEmail}
            openHours={s.openHours}
            formHeading={s.formHeading}
            formSubheading={s.formSubheading}
          />
        </section>
      </main>
    </main>
  );
}
