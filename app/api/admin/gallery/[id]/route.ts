import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { getSessionUser, requireSection } from "../../../../../lib/server-utils";
import connectToDatabase from "../../../../../lib/mongodb";
import GalleryImage from "../../../../../models/GalleryImage";
import { deleteAssetByPublicId } from "../../../../../lib/cloudinary";

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

// PATCH — update caption/order, or replace the image entirely.
// When a new image (url + publicId) is supplied, the previous Cloudinary asset
// is destroyed so we never leave orphaned uploads behind.
export async function PATCH(req: Request, context: any) {
  const user = await getSessionUser();
  const denied = requireSection(user, "gallery");
  if (denied) return denied;

  const params = (await Promise.resolve(context?.params)) as { id?: string } | undefined;
  const id = params?.id;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));

  await connectToDatabase();
  const doc = await GalleryImage.findById(id);
  if (!doc) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const newUrl = (body.url || "").toString().trim();
  const newPublicId = (body.publicId || "").toString().trim();

  // Replacing the asset: drop the old Cloudinary asset, then point at the new one.
  if (newUrl && newPublicId && newPublicId !== doc.publicId) {
    await deleteAssetByPublicId(doc.publicId, doc.mediaType === "video" ? "video" : "image");
    doc.url = newUrl;
    doc.publicId = newPublicId;
    if (typeof body.mediaType === "string") doc.mediaType = body.mediaType === "video" ? "video" : "image";
  }

  if (typeof body.caption === "string") doc.caption = body.caption.trim() || undefined;
  if (typeof body.order === "number") doc.order = body.order;

  await doc.save();
  return NextResponse.json({ item: serialize(doc.toObject()), message: "Image updated" });
}

// DELETE — remove the DB record and the backing Cloudinary asset.
export async function DELETE(req: Request, context: any) {
  const user = await getSessionUser();
  const denied = requireSection(user, "gallery");
  if (denied) return denied;

  const params = (await Promise.resolve(context?.params)) as { id?: string } | undefined;
  const id = params?.id;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  await connectToDatabase();
  const doc = await GalleryImage.findById(id);
  if (!doc) return NextResponse.json({ message: "Not found" }, { status: 404 });

  await deleteAssetByPublicId(doc.publicId, doc.mediaType === "video" ? "video" : "image");
  await doc.deleteOne();

  return NextResponse.json({ message: "Image deleted" });
}
