import { NextResponse } from "next/server";
import { getSessionUser, requireSection } from "../../../../../lib/server-utils";
import connectToDatabase from "../../../../../lib/mongodb";
import ExecutiveSettings, { EXECUTIVE_DEFAULTS } from "../../../../../models/ExecutiveSettings";
import { deleteImageByPublicId } from "../../../../../lib/cloudinary";

function serialize(s: any) {
  return {
    heroTitle: s?.heroTitle ?? EXECUTIVE_DEFAULTS.heroTitle,
    heroAccent: s?.heroAccent ?? EXECUTIVE_DEFAULTS.heroAccent,
    heroTag: s?.heroTag ?? EXECUTIVE_DEFAULTS.heroTag,
    heroDescription: s?.heroDescription ?? EXECUTIVE_DEFAULTS.heroDescription,
    heroImage: s?.heroImage ?? EXECUTIVE_DEFAULTS.heroImage,
    heroImagePublicId: s?.heroImagePublicId ?? "",
    eyebrow: s?.eyebrow ?? EXECUTIVE_DEFAULTS.eyebrow,
    sectionTitle: s?.sectionTitle ?? EXECUTIVE_DEFAULTS.sectionTitle,
    sectionDescription: s?.sectionDescription ?? EXECUTIVE_DEFAULTS.sectionDescription,
    members: Array.isArray(s?.members) && s.members.length > 0
      ? s.members.map((m: any) => ({
          _id: m._id ? String(m._id) : undefined,
          name: m.name || "",
          role: m.role || "",
          image: m.image || "",
          imagePublicId: m.imagePublicId || "",
          phone: m.phone || "",
          email: m.email || "",
          address: m.address || "",
        }))
      : EXECUTIVE_DEFAULTS.members,
  };
}

export async function GET() {
  const user = await getSessionUser();
  const denied = requireSection(user, "about");
  if (denied) return denied;
  await connectToDatabase();
  const doc = await ExecutiveSettings.findOne({ singletonKey: "executive" }).lean();
  return NextResponse.json({ settings: serialize(doc) });
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  const denied = requireSection(user, "about");
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  await connectToDatabase();
  const existing = await ExecutiveSettings.findOne({ singletonKey: "executive" });

  const heroTitle = (body.heroTitle || "").toString().trim() || EXECUTIVE_DEFAULTS.heroTitle;
  const heroAccent = (body.heroAccent || "").toString().trim();
  const heroTag = (body.heroTag || "").toString().trim();
  const heroDescription = (body.heroDescription || "").toString().trim();
  const heroImage = (body.heroImage || "").toString().trim();
  const heroImagePublicId = (body.heroImagePublicId || "").toString().trim();
  const eyebrow = (body.eyebrow || "").toString().trim() || EXECUTIVE_DEFAULTS.eyebrow;
  const sectionTitle = (body.sectionTitle || "").toString().trim() || EXECUTIVE_DEFAULTS.sectionTitle;
  const sectionDescription = (body.sectionDescription || "").toString().trim();
  const members = Array.isArray(body.members) ? body.members : EXECUTIVE_DEFAULTS.members;

  const update: any = { singletonKey: "executive", heroTitle, heroAccent, heroTag, heroDescription, eyebrow, sectionTitle, sectionDescription, members };

  if (heroImage) {
    const prevPublicId = existing?.heroImagePublicId;
    if (heroImagePublicId && prevPublicId && prevPublicId !== heroImagePublicId) {
      await deleteImageByPublicId(prevPublicId);
    }
    update.heroImage = heroImage;
    update.heroImagePublicId = heroImagePublicId;
  }

  const doc = await ExecutiveSettings.findOneAndUpdate(
    { singletonKey: "executive" },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return NextResponse.json({ settings: serialize(doc), message: "Saved" });
}
