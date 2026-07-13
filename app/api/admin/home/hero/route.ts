import { NextResponse } from "next/server";
import { getSessionUser, requireSection } from "../../../../../lib/server-utils";
import connectToDatabase from "../../../../../lib/mongodb";
import HeroSettings, { HERO_DEFAULTS } from "../../../../../models/HeroSettings";
import { deleteImageByPublicId } from "../../../../../lib/cloudinary";

function serialize(s: any) {
  return {
    headingMain: s?.headingMain ?? HERO_DEFAULTS.headingMain,
    headingAccent: s?.headingAccent ?? HERO_DEFAULTS.headingAccent,
    paragraph: s?.paragraph ?? HERO_DEFAULTS.paragraph,
    primaryButtonLabel: s?.primaryButtonLabel ?? HERO_DEFAULTS.primaryButtonLabel,
    primaryButtonHref: s?.primaryButtonHref ?? HERO_DEFAULTS.primaryButtonHref,
    secondaryButtonLabel: s?.secondaryButtonLabel ?? HERO_DEFAULTS.secondaryButtonLabel,
    secondaryButtonHref: s?.secondaryButtonHref ?? HERO_DEFAULTS.secondaryButtonHref,
    slides: Array.isArray(s?.slides) && s.slides.length > 0 ? s.slides.map((slide: any) => ({
      image: slide?.image || "",
      imagePublicId: slide?.imagePublicId || "",
      mobileImage: slide?.mobileImage || "",
      mobileImagePublicId: slide?.mobileImagePublicId || "",
      alt: slide?.alt || "",
    })) : HERO_DEFAULTS.slides,
    features: Array.isArray(s?.features) && s.features.length > 0 ? s.features.map((feature: any) => ({
      title: feature?.title || "",
      desc: feature?.desc || "",
    })) : HERO_DEFAULTS.features,
  };
}

export async function GET() {
  const user = await getSessionUser();
  const denied = requireSection(user, "home");
  if (denied) return denied;
  await connectToDatabase();
  const doc = await HeroSettings.findOne({ singletonKey: "hero" }).lean();
  return NextResponse.json({ settings: serialize(doc) });
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  const denied = requireSection(user, "home");
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  await connectToDatabase();
  const existing = await HeroSettings.findOne({ singletonKey: "hero" });

  const headingMain = (body.headingMain || "").toString().trim() || HERO_DEFAULTS.headingMain;
  const headingAccent = (body.headingAccent || "").toString().trim() || HERO_DEFAULTS.headingAccent;
  const paragraph = (body.paragraph || "").toString().trim() || HERO_DEFAULTS.paragraph;
  const primaryButtonLabel = (body.primaryButtonLabel || "").toString().trim() || HERO_DEFAULTS.primaryButtonLabel;
  const primaryButtonHref = (body.primaryButtonHref || "").toString().trim() || HERO_DEFAULTS.primaryButtonHref;
  const secondaryButtonLabel = (body.secondaryButtonLabel || "").toString().trim() || HERO_DEFAULTS.secondaryButtonLabel;
  const secondaryButtonHref = (body.secondaryButtonHref || "").toString().trim() || HERO_DEFAULTS.secondaryButtonHref;

  const incomingSlides = Array.isArray(body.slides) ? body.slides : [];
  const slides = incomingSlides
    .map((slide: any) => ({
      image: (slide?.image || "").toString().trim(),
      imagePublicId: (slide?.imagePublicId || "").toString().trim(),
      mobileImage: (slide?.mobileImage || "").toString().trim(),
      mobileImagePublicId: (slide?.mobileImagePublicId || "").toString().trim(),
      alt: (slide?.alt || "").toString().trim(),
    }))
    .filter((slide: any) => slide.image);

  const incomingFeatures = Array.isArray(body.features) ? body.features : [];
  const features = incomingFeatures.map((feature: any) => ({
    title: (feature?.title || "").toString().trim(),
    desc: (feature?.desc || "").toString().trim(),
  }));

  // Clean up Cloudinary assets that were replaced/removed.
  const existingPublicIds = new Set<string>();
  for (const slide of (existing?.slides || []) as any[]) {
    if (slide?.imagePublicId) existingPublicIds.add(slide.imagePublicId);
    if (slide?.mobileImagePublicId) existingPublicIds.add(slide.mobileImagePublicId);
  }
  const nextPublicIds = new Set<string>();
  for (const slide of slides) {
    if (slide.imagePublicId) nextPublicIds.add(slide.imagePublicId);
    if (slide.mobileImagePublicId) nextPublicIds.add(slide.mobileImagePublicId);
  }
  for (const publicId of existingPublicIds) {
    if (!nextPublicIds.has(publicId)) await deleteImageByPublicId(publicId);
  }

  const update = {
    singletonKey: "hero",
    headingMain,
    headingAccent,
    paragraph,
    primaryButtonLabel,
    primaryButtonHref,
    secondaryButtonLabel,
    secondaryButtonHref,
    slides: slides.length > 0 ? slides : HERO_DEFAULTS.slides,
    features,
  };

  const doc = await HeroSettings.findOneAndUpdate(
    { singletonKey: "hero" },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return NextResponse.json({ settings: serialize(doc), message: "Saved" });
}
