import { NextResponse } from "next/server";
import { getSessionUser, requireSection } from "../../../../lib/server-utils";
import connectToDatabase from "../../../../lib/mongodb";
import ContactSettings, { CONTACT_DEFAULTS } from "../../../../models/ContactSettings";
import { deleteImageByPublicId } from "../../../../lib/cloudinary";

function serialize(s: any) {
  return {
    heroTitle: s?.heroTitle ?? CONTACT_DEFAULTS.heroTitle,
    heroAccent: s?.heroAccent ?? CONTACT_DEFAULTS.heroAccent,
    heroDescription: s?.heroDescription ?? CONTACT_DEFAULTS.heroDescription,
    heroImage: s?.heroImage ?? CONTACT_DEFAULTS.heroImage,
    heroImagePublicId: s?.heroImagePublicId ?? "",
    heroStats: Array.isArray(s?.heroStats) && s.heroStats.length > 0
      ? s.heroStats : CONTACT_DEFAULTS.heroStats,
    infoCompanyLabel: s?.infoCompanyLabel ?? CONTACT_DEFAULTS.infoCompanyLabel,
    infoHeading: s?.infoHeading ?? CONTACT_DEFAULTS.infoHeading,
    infoSubheading: s?.infoSubheading ?? CONTACT_DEFAULTS.infoSubheading,
    phones: Array.isArray(s?.phones) && s.phones.length > 0
      ? s.phones : CONTACT_DEFAULTS.phones,
    email: s?.email ?? CONTACT_DEFAULTS.email,
    addressLines: Array.isArray(s?.addressLines) && s.addressLines.length > 0
      ? s.addressLines : CONTACT_DEFAULTS.addressLines,
    supportEmail: s?.supportEmail ?? CONTACT_DEFAULTS.supportEmail,
    openHours: s?.openHours ?? CONTACT_DEFAULTS.openHours,
    mapEmbedUrl: s?.mapEmbedUrl ?? CONTACT_DEFAULTS.mapEmbedUrl,
    formHeading: s?.formHeading ?? CONTACT_DEFAULTS.formHeading,
    formSubheading: s?.formSubheading ?? CONTACT_DEFAULTS.formSubheading,
  };
}

export async function GET() {
  const user = await getSessionUser();
  const denied = requireSection(user, "contact");
  if (denied) return denied;
  await connectToDatabase();
  const doc = await ContactSettings.findOne({ singletonKey: "contact" }).lean();
  return NextResponse.json({ settings: serialize(doc) });
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  const denied = requireSection(user, "contact");
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  await connectToDatabase();
  const existing = await ContactSettings.findOne({ singletonKey: "contact" });

  const heroTitle = (body.heroTitle || "").toString().trim() || CONTACT_DEFAULTS.heroTitle;
  const heroAccent = (body.heroAccent || "").toString().trim();
  const heroDescription = (body.heroDescription || "").toString().trim();
  const heroImage = (body.heroImage || "").toString().trim();
  const heroImagePublicId = (body.heroImagePublicId || "").toString().trim();
  const heroStats = Array.isArray(body.heroStats) ? body.heroStats : CONTACT_DEFAULTS.heroStats;
  const infoCompanyLabel = (body.infoCompanyLabel || "").toString().trim() || CONTACT_DEFAULTS.infoCompanyLabel;
  const infoHeading = (body.infoHeading || "").toString().trim() || CONTACT_DEFAULTS.infoHeading;
  const infoSubheading = (body.infoSubheading || "").toString().trim();
  const phones = Array.isArray(body.phones)
    ? body.phones.map((p: any) => String(p).trim()).filter(Boolean)
    : CONTACT_DEFAULTS.phones;
  const email = (body.email || "").toString().trim() || CONTACT_DEFAULTS.email;
  const addressLines = Array.isArray(body.addressLines)
    ? body.addressLines.map((a: any) => String(a).trim()).filter(Boolean)
    : CONTACT_DEFAULTS.addressLines;
  const supportEmail = (body.supportEmail || "").toString().trim();
  const openHours = (body.openHours || "").toString().trim();
  const mapEmbedUrl = (body.mapEmbedUrl || "").toString().trim() || CONTACT_DEFAULTS.mapEmbedUrl;
  const formHeading = (body.formHeading || "").toString().trim() || CONTACT_DEFAULTS.formHeading;
  const formSubheading = (body.formSubheading || "").toString().trim();

  const update: any = {
    singletonKey: "contact",
    heroTitle, heroAccent, heroDescription, heroStats,
    infoCompanyLabel, infoHeading, infoSubheading,
    phones, email, addressLines, supportEmail, openHours,
    mapEmbedUrl, formHeading, formSubheading,
  };

  if (heroImage) {
    const prevPublicId = existing?.heroImagePublicId;
    if (heroImagePublicId && prevPublicId && prevPublicId !== heroImagePublicId) {
      await deleteImageByPublicId(prevPublicId);
    }
    update.heroImage = heroImage;
    update.heroImagePublicId = heroImagePublicId;
  }

  const doc = await ContactSettings.findOneAndUpdate(
    { singletonKey: "contact" },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return NextResponse.json({ settings: serialize(doc), message: "Saved" });
}
