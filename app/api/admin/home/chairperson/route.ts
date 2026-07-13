import { NextResponse } from "next/server";
import { getSessionUser, requireSection } from "../../../../../lib/server-utils";
import connectToDatabase from "../../../../../lib/mongodb";
import ChairpersonSettings, { CHAIRPERSON_DEFAULTS } from "../../../../../models/ChairpersonSettings";
import { deleteImageByPublicId } from "../../../../../lib/cloudinary";

function serialize(s: any) {
  return {
    name: s?.name ?? CHAIRPERSON_DEFAULTS.name,
    role: s?.role ?? CHAIRPERSON_DEFAULTS.role,
    subRole: s?.subRole ?? CHAIRPERSON_DEFAULTS.subRole,
    cardTitle: s?.cardTitle ?? CHAIRPERSON_DEFAULTS.cardTitle,
    image: s?.image ?? CHAIRPERSON_DEFAULTS.image,
    imagePublicId: s?.imagePublicId ?? "",
    contentHtml: s?.contentHtml ?? CHAIRPERSON_DEFAULTS.contentHtml,
  };
}

export async function GET() {
  const user = await getSessionUser();
  const denied = requireSection(user, "home");
  if (denied) return denied;
  await connectToDatabase();
  const doc = await ChairpersonSettings.findOne({ singletonKey: "chairperson" }).lean();
  return NextResponse.json({ settings: serialize(doc) });
}

export async function PUT(req: Request) {
  const user = await getSessionUser();
  const denied = requireSection(user, "home");
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  await connectToDatabase();
  const existing = await ChairpersonSettings.findOne({ singletonKey: "chairperson" });

  const name = (body.name || "").toString().trim() || CHAIRPERSON_DEFAULTS.name;
  const role = (body.role || "").toString().trim() || CHAIRPERSON_DEFAULTS.role;
  const subRole = (body.subRole || "").toString().trim();
  const cardTitle = (body.cardTitle || "").toString().trim() || CHAIRPERSON_DEFAULTS.cardTitle;
  const image = (body.image || "").toString().trim();
  const imagePublicId = (body.imagePublicId || "").toString().trim();
  const contentHtml = (body.contentHtml || "").toString();

  const update: any = { singletonKey: "chairperson", name, role, subRole, cardTitle, contentHtml };

  if (image) {
    const prevPublicId = existing?.imagePublicId;
    if (imagePublicId && prevPublicId && prevPublicId !== imagePublicId) {
      await deleteImageByPublicId(prevPublicId);
    }
    update.image = image;
    update.imagePublicId = imagePublicId;
  }

  const doc = await ChairpersonSettings.findOneAndUpdate(
    { singletonKey: "chairperson" },
    { $set: update },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();

  return NextResponse.json({ settings: serialize(doc), message: "Saved" });
}
