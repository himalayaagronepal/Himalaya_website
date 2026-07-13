import { NextResponse } from "next/server";
import { getSessionUser, requireSection } from "../../../../../lib/server-utils";
import connectToDatabase from "../../../../../lib/mongodb";
import HearFromMDSettings, { HEAR_FROM_MD_DEFAULTS } from "../../../../../models/HearFromMDSettings";
import { deleteImageByPublicId } from "../../../../../lib/cloudinary";

function serialize(s: any) {
  return {
    heroTitle: s?.heroTitle ?? HEAR_FROM_MD_DEFAULTS.heroTitle,
    heroAccent: s?.heroAccent ?? HEAR_FROM_MD_DEFAULTS.heroAccent,
    heroDescription: s?.heroDescription ?? HEAR_FROM_MD_DEFAULTS.heroDescription,
    heroImage: s?.heroImage ?? HEAR_FROM_MD_DEFAULTS.heroImage,
    heroImagePublicId: s?.heroImagePublicId ?? "",
    mdName: s?.mdName ?? HEAR_FROM_MD_DEFAULTS.mdName,
    mdRole: s?.mdRole ?? HEAR_FROM_MD_DEFAULTS.mdRole,
    mdImage: s?.mdImage ?? HEAR_FROM_MD_DEFAULTS.mdImage,
    mdImagePublicId: s?.mdImagePublicId ?? "",
    eyebrow: s?.eyebrow ?? HEAR_FROM_MD_DEFAULTS.eyebrow,
    heading: s?.heading ?? HEAR_FROM_MD_DEFAULTS.heading,
    contentHtml: s?.contentHtml ?? HEAR_FROM_MD_DEFAULTS.contentHtml,
  };
}

export async function GET() {
  const user = await getSessionUser();
  const denied = requireSection(user, "about");
  if (denied) return denied;
  await connectToDatabase();
  const doc = await HearFromMDSettings.findOne({ singletonKey: "hear-from-md" }).lean();
  return NextResponse.json({ settings: serialize(doc) });
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  const denied = requireSection(user, "about");
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  await connectToDatabase();
  const existing = await HearFromMDSettings.findOne({ singletonKey: "hear-from-md" });

  const heroTitle = (body.heroTitle || "").toString().trim() || HEAR_FROM_MD_DEFAULTS.heroTitle;
  const heroAccent = (body.heroAccent || "").toString().trim();
  const heroDescription = (body.heroDescription || "").toString().trim();
  const heroImage = (body.heroImage || "").toString().trim();
  const heroImagePublicId = (body.heroImagePublicId || "").toString().trim();
  const mdName = (body.mdName || "").toString().trim() || HEAR_FROM_MD_DEFAULTS.mdName;
  const mdRole = (body.mdRole || "").toString().trim() || HEAR_FROM_MD_DEFAULTS.mdRole;
  const mdImage = (body.mdImage || "").toString().trim();
  const mdImagePublicId = (body.mdImagePublicId || "").toString().trim();
  const eyebrow = (body.eyebrow || "").toString().trim() || HEAR_FROM_MD_DEFAULTS.eyebrow;
  const heading = (body.heading || "").toString().trim() || HEAR_FROM_MD_DEFAULTS.heading;
  const contentHtml = (body.contentHtml || "").toString();

  const update: any = { singletonKey: "hear-from-md", heroTitle, heroAccent, heroDescription, mdName, mdRole, eyebrow, heading, contentHtml };

  if (heroImage) {
    const prevPublicId = existing?.heroImagePublicId;
    if (heroImagePublicId && prevPublicId && prevPublicId !== heroImagePublicId) {
      await deleteImageByPublicId(prevPublicId);
    }
    update.heroImage = heroImage;
    update.heroImagePublicId = heroImagePublicId;
  }

  if (mdImage) {
    const prevPublicId = existing?.mdImagePublicId;
    if (mdImagePublicId && prevPublicId && prevPublicId !== mdImagePublicId) {
      await deleteImageByPublicId(prevPublicId);
    }
    update.mdImage = mdImage;
    update.mdImagePublicId = mdImagePublicId;
  }

  const doc = await HearFromMDSettings.findOneAndUpdate(
    { singletonKey: "hear-from-md" },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return NextResponse.json({ settings: serialize(doc), message: "Saved" });
}
