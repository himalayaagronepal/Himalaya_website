import { NextResponse } from "next/server";
import { getSessionUser, requireSection } from "../../../../lib/server-utils";
import connectToDatabase from "../../../../lib/mongodb";
import GalleryImage from "../../../../models/GalleryImage";

function serialize(g: any) {
  return {
    _id: String(g._id),
    url: g.url,
    publicId: g.publicId,
    mediaType: (g.mediaType === "video" ? "video" : "image") as "image" | "video",
    caption: g.caption || "",
    order: typeof g.order === "number" ? g.order : 0,
    createdAt: g.createdAt ? new Date(g.createdAt).toISOString() : null,
  };
}

export async function GET() {
  const user = await getSessionUser();
  const denied = requireSection(user, "gallery");
  if (denied) return denied;

  await connectToDatabase();
  const items = await GalleryImage.find({}).sort({ order: 1, createdAt: 1 }).lean();
  return NextResponse.json({ items: items.map(serialize) });
}

export async function POST(req: Request) {
  const user = await getSessionUser();
  const denied = requireSection(user, "gallery");
  if (denied) return denied;

  const body = await req.json().catch(() => ({}));
  const url = (body.url || "").toString().trim();
  const publicId = (body.publicId || "").toString().trim();
  const caption = (body.caption || "").toString().trim();
  const mediaType = body.mediaType === "video" ? "video" : "image";

  if (!url || !publicId) {
    return NextResponse.json({ message: "url and publicId are required" }, { status: 400 });
  }

  await connectToDatabase();
  // Append to the end of the current order.
  const last = await GalleryImage.findOne({}).sort({ order: -1 }).lean();
  const nextOrder = last && typeof last.order === "number" ? last.order + 1 : 0;

  const doc = await GalleryImage.create({ url, publicId, mediaType, caption: caption || undefined, order: nextOrder });
  return NextResponse.json({ item: serialize(doc.toObject()), message: "Image added" }, { status: 201 });
}
