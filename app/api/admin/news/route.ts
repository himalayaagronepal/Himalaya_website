import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../lib/auth";
import connectToDatabase from "../../../../lib/mongodb";
import News from "../../../../models/News";
import { hasPermission } from "../../../../lib/permissions";
import { slugify } from "../../../../lib/slug";

async function ensureUniqueSlug(baseSlug: string) {
  let slug = baseSlug;
  let counter = 2;
  while (await News.findOne({ slug }).lean()) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
  return slug;
}

export async function GET(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "news:read")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const status = url.searchParams.get("status") || "";
  const q = url.searchParams.get("q") || "";

  await connectToDatabase();
  const filter: any = {};
  if (status) filter.status = status;
  if (q) {
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    filter.$or = [{ title: rx }, { excerpt: rx }, { category: rx }];
  }

  const items = await News.find(filter).sort({ createdAt: -1 }).lean();
  const safe = items.map((n: any) => ({
    _id: String(n._id),
    title: n.title,
    slug: n.slug,
    excerpt: n.excerpt || "",
    coverImage: n.coverImage || "",
    category: n.category || "",
    titleNe: n.titleNe || "",
    excerptNe: n.excerptNe || "",
    categoryNe: n.categoryNe || "",
    status: n.status,
    authorName: n.authorName || "",
    authorEmail: n.authorEmail || "",
    publishedAt: n.publishedAt ? new Date(n.publishedAt).toISOString() : null,
    createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : null,
    updatedAt: n.updatedAt ? new Date(n.updatedAt).toISOString() : null,
  }));

  return NextResponse.json({ items: safe });
}

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "news:write")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const title = (body.title || "").toString().trim();
  const contentHtml = (body.contentHtml || "").toString().trim();

  if (!title) return NextResponse.json({ message: "Title is required" }, { status: 400 });
  if (!contentHtml) return NextResponse.json({ message: "Content is required" }, { status: 400 });

  await connectToDatabase();
  const baseSlug = slugify(title);
  const slug = await ensureUniqueSlug(baseSlug || "news");

  const status = body.status === "published" ? "published" : "draft";
  const now = new Date();

  const doc = await News.create({
    title,
    slug,
    excerpt: (body.excerpt || "").toString().trim() || undefined,
    coverImage: (body.coverImage || "").toString().trim() || undefined,
    category: (body.category || "").toString().trim() || undefined,
    contentHtml,
    titleNe: (body.titleNe || "").toString().trim() || undefined,
    excerptNe: (body.excerptNe || "").toString().trim() || undefined,
    categoryNe: (body.categoryNe || "").toString().trim() || undefined,
    contentHtmlNe: (body.contentHtmlNe || "").toString().trim() || undefined,
    status,
    authorName: session.user?.name || "",
    authorEmail: session.user?.email || "",
    publishedAt: status === "published" ? now : undefined,
  });

  return NextResponse.json({
    item: {
      _id: String(doc._id),
      title: doc.title,
      slug: doc.slug,
      status: doc.status,
      createdAt: doc.createdAt,
    },
    message: "News created",
  }, { status: 201 });
}
