import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSessionUser, requireSection } from "../../../../../lib/server-utils";
import connectToDatabase from "../../../../../lib/mongodb";
import WhoWeAreSettings, { WHO_WE_ARE_DEFAULTS } from "../../../../../models/WhoWeAreSettings";
import { deleteImageByPublicId } from "../../../../../lib/cloudinary";

function serialize(s: any) {
  return {
    heroTitle: s?.heroTitle ?? WHO_WE_ARE_DEFAULTS.heroTitle,
    heroAccent: s?.heroAccent ?? WHO_WE_ARE_DEFAULTS.heroAccent,
    heroDescription: s?.heroDescription ?? WHO_WE_ARE_DEFAULTS.heroDescription,
    heroImage: s?.heroImage ?? WHO_WE_ARE_DEFAULTS.heroImage,
    heroImagePublicId: s?.heroImagePublicId ?? "",
    mainHeading: s?.mainHeading ?? WHO_WE_ARE_DEFAULTS.mainHeading,
    mainAccent: s?.mainAccent ?? WHO_WE_ARE_DEFAULTS.mainAccent,
    paragraph1: s?.paragraph1 ?? WHO_WE_ARE_DEFAULTS.paragraph1,
    paragraph2: s?.paragraph2 ?? WHO_WE_ARE_DEFAULTS.paragraph2,
    contentHtml: s?.contentHtml ?? "",
  };
}

export async function GET() {
  const user = await getSessionUser();
  const denied = requireSection(user, "about");
  if (denied) return denied;
  await connectToDatabase();
  const doc = await WhoWeAreSettings.findOne({ singletonKey: "who-we-are" }).lean();
  return NextResponse.json({ settings: serialize(doc) });
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  const denied = requireSection(user, "about");
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  await connectToDatabase();
  const existing = await WhoWeAreSettings.findOne({ singletonKey: "who-we-are" });

  const heroTitle = (body.heroTitle || "").toString().trim() || WHO_WE_ARE_DEFAULTS.heroTitle;
  const heroAccent = (body.heroAccent || "").toString().trim();
  const heroDescription = (body.heroDescription || "").toString().trim();
  const heroImage = (body.heroImage || "").toString().trim();
  const heroImagePublicId = (body.heroImagePublicId || "").toString().trim();
  const mainHeading = (body.mainHeading || "").toString().trim() || WHO_WE_ARE_DEFAULTS.mainHeading;
  const mainAccent = (body.mainAccent || "").toString().trim();
  const paragraph1 = (body.paragraph1 || "").toString().trim() || WHO_WE_ARE_DEFAULTS.paragraph1;
  const paragraph2 = (body.paragraph2 || "").toString().trim() || WHO_WE_ARE_DEFAULTS.paragraph2;
  const contentHtml = (body.contentHtml || "").toString().trim();

  const update: any = { singletonKey: "who-we-are", heroTitle, heroAccent, heroDescription, mainHeading, mainAccent, paragraph1, paragraph2, contentHtml };

  if (heroImage) {
    const prevPublicId = existing?.heroImagePublicId;
    if (heroImagePublicId && prevPublicId && prevPublicId !== heroImagePublicId) {
      await deleteImageByPublicId(prevPublicId);
    }
    update.heroImage = heroImage;
    update.heroImagePublicId = heroImagePublicId;
  }

  const doc = await WhoWeAreSettings.findOneAndUpdate(
    { singletonKey: "who-we-are" },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  revalidatePath("/about-us/who-we-are");
  revalidatePath("/about");

  return NextResponse.json({ settings: serialize(doc), message: "Saved" });
}
