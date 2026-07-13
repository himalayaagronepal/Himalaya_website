import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../lib/auth";
import connectToDatabase from "../../../../../lib/mongodb";
import News from "../../../../../models/News";
import mongoose from "mongoose";
import { hasPermission } from "../../../../../lib/permissions";
import { slugify } from "../../../../../lib/slug";

async function ensureUniqueSlug(baseSlug: string, ignoreId?: string) {
  let slug = baseSlug;
  let counter = 2;
  while (true) {
    const existing = await News.findOne({ slug }).lean();
    if (!existing) return slug;
    if (ignoreId && String(existing._id) === String(ignoreId)) return slug;
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

export async function GET(req: Request, context: any) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "news:read")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const params = await Promise.resolve(context?.params) as { id?: string } | undefined;
  const id = params?.id;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ message: "Invalid id" }, { status: 400 });

  await connectToDatabase();
  const item = await News.findById(id).lean();
  if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });

  return NextResponse.json({
    item: {
      _id: String(item._id),
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || "",
      coverImage: item.coverImage || "",
      category: item.category || "",
      contentHtml: item.contentHtml || "",
      titleNe: item.titleNe || "",
      excerptNe: item.excerptNe || "",
      categoryNe: item.categoryNe || "",
      contentHtmlNe: item.contentHtmlNe || "",
      status: item.status,
      authorName: item.authorName || "",
      authorEmail: item.authorEmail || "",
      publishedAt: item.publishedAt ? new Date(item.publishedAt).toISOString() : null,
      createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
      updatedAt: item.updatedAt ? new Date(item.updatedAt).toISOString() : null,
    },
  });
}

export async function PATCH(req: Request, context: any) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "news:write")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const params = await Promise.resolve(context?.params) as { id?: string } | undefined;
  const id = params?.id;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ message: "Invalid id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));

  await connectToDatabase();
  const item = await News.findById(id);
  if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });

  const nextTitle = typeof body.title === "string" ? body.title.trim() : item.title;
  if (!nextTitle) return NextResponse.json({ message: "Title is required" }, { status: 400 });

  let nextSlug = item.slug;
  if (nextTitle !== item.title) {
    const baseSlug = slugify(nextTitle) || "news";
    nextSlug = await ensureUniqueSlug(baseSlug, id);
  }

  if (typeof body.contentHtml === "string") {
    if (!body.contentHtml.trim()) {
      return NextResponse.json({ message: "Content is required" }, { status: 400 });
    }
    item.contentHtml = body.contentHtml.trim();
  }

  item.title = nextTitle;
  item.slug = nextSlug;
  if (typeof body.excerpt === "string") item.excerpt = body.excerpt.trim();
  if (typeof body.coverImage === "string") item.coverImage = body.coverImage.trim();
  if (typeof body.category === "string") item.category = body.category.trim();

  // Nepali translations (optional — stored empty as undefined).
  if (typeof body.titleNe === "string") item.titleNe = body.titleNe.trim() || undefined;
  if (typeof body.excerptNe === "string") item.excerptNe = body.excerptNe.trim() || undefined;
  if (typeof body.categoryNe === "string") item.categoryNe = body.categoryNe.trim() || undefined;
  if (typeof body.contentHtmlNe === "string") item.contentHtmlNe = body.contentHtmlNe.trim() || undefined;

  if (typeof body.status === "string") {
    const nextStatus = body.status === "published" ? "published" : "draft";
    item.status = nextStatus;
    if (nextStatus === "published" && !item.publishedAt) item.publishedAt = new Date();
    if (nextStatus === "draft") item.publishedAt = undefined;
  }

  await item.save();

  return NextResponse.json({
    item: {
      _id: String(item._id),
      title: item.title,
      slug: item.slug,
      status: item.status,
    },
    message: "News updated",
  });
}

export async function DELETE(req: Request, context: any) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "news:delete")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const params = await Promise.resolve(context?.params) as { id?: string } | undefined;
  const id = params?.id;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ message: "Invalid id" }, { status: 400 });

  await connectToDatabase();
  const item = await News.findById(id);
  if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });
  await item.deleteOne();
  return NextResponse.json({ message: "Deleted" });
}
