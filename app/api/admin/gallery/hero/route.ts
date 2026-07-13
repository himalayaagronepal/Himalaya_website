import { NextResponse } from "next/server";
import { getSessionUser, requireSection } from "../../../../../lib/server-utils";
import connectToDatabase from "../../../../../lib/mongodb";
import GallerySettings, { GALLERY_HERO_DEFAULTS } from "../../../../../models/GallerySettings";
import { deleteImageByPublicId } from "../../../../../lib/cloudinary";

function serialize(s: any) {
  return {
    heroTitle: s?.heroTitle ?? GALLERY_HERO_DEFAULTS.heroTitle,
    heroAccent: s?.heroAccent ?? GALLERY_HERO_DEFAULTS.heroAccent,
    heroDescription: s?.heroDescription ?? GALLERY_HERO_DEFAULTS.heroDescription,
    heroImage: s?.heroImage ?? GALLERY_HERO_DEFAULTS.heroImage,
    heroImagePublicId: s?.heroImagePublicId ?? "",
    carouselLabel: s?.carouselLabel ?? GALLERY_HERO_DEFAULTS.carouselLabel,
    carouselTitle: s?.carouselTitle ?? GALLERY_HERO_DEFAULTS.carouselTitle,
    carouselDescription: s?.carouselDescription ?? GALLERY_HERO_DEFAULTS.carouselDescription,
  };
}

export async function GET() {
  const user = await getSessionUser();
  const denied = requireSection(user, "gallery");
  if (denied) return denied;

  await connectToDatabase();
  const doc = await GallerySettings.findOne({ singletonKey: "gallery" }).lean();
  return NextResponse.json({ settings: serialize(doc) });
}

// PUT — upsert the gallery hero (title / accent / description / image).
// When a new uploaded image replaces a previous Cloudinary asset, the old one
// is destroyed so we don't leave orphaned uploads behind.
export async function PUT(req: Request) {
  const user = await getSessionUser();
  const denied = requireSection(user, "gallery");
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));

  await connectToDatabase();
  const existing = await GallerySettings.findOne({ singletonKey: "gallery" });

  const heroTitle = (body.heroTitle || "").toString().trim() || GALLERY_HERO_DEFAULTS.heroTitle;
  const heroAccent = (body.heroAccent || "").toString().trim();
  const heroDescription = (body.heroDescription || "").toString().trim();
  const heroImage = (body.heroImage || "").toString().trim();
  const heroImagePublicId = (body.heroImagePublicId || "").toString().trim();
  const carouselLabel = (body.carouselLabel || "").toString().trim();
  const carouselTitle = (body.carouselTitle || "").toString().trim();
  const carouselDescription = (body.carouselDescription || "").toString().trim();

  const update: any = { singletonKey: "gallery", heroTitle, heroAccent, heroDescription, carouselLabel, carouselTitle, carouselDescription };

  if (heroImage) {
    // Image changed to a new Cloudinary asset → reclaim the previous one.
    const prevPublicId = existing?.heroImagePublicId;
    if (heroImagePublicId && prevPublicId && prevPublicId !== heroImagePublicId) {
      await deleteImageByPublicId(prevPublicId);
    }
    update.heroImage = heroImage;
    update.heroImagePublicId = heroImagePublicId;
  }

  const doc = await GallerySettings.findOneAndUpdate(
    { singletonKey: "gallery" },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return NextResponse.json({ settings: serialize(doc), message: "Hero saved" });
}
