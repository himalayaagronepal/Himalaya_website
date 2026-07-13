import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../lib/auth";
import connectToDatabase from "../../../../lib/mongodb";
import Notice, { NOTICE_TYPES } from "../../../../models/Notice";
import { hasPermission } from "../../../../lib/permissions";

function serialize(n: any) {
  return {
    _id: String(n._id),
    title: n.title,
    titleNe: n.titleNe || "",
    type: n.type || "Notice",
    status: n.status,
    fileUrl: n.fileUrl || "",
    publishedAt: n.publishedAt ? new Date(n.publishedAt).toISOString() : null,
    createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : null,
    updatedAt: n.updatedAt ? new Date(n.updatedAt).toISOString() : null,
  };
}

function normalizeType(value: unknown): string {
  const t = (value || "").toString().trim();
  return (NOTICE_TYPES as readonly string[]).includes(t) ? t : "Notice";
}

export async function GET() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "news:read")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await connectToDatabase();
  const items = await Notice.find({}).sort({ publishedAt: -1, createdAt: -1 }).lean();
  return NextResponse.json({ items: items.map(serialize) });
}

export async function POST(req: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "news:write")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const title = (body.title || "").toString().trim();
  if (!title) return NextResponse.json({ message: "Title is required" }, { status: 400 });

  const publishedAt = body.publishedAt ? new Date(body.publishedAt) : new Date();
  if (Number.isNaN(publishedAt.getTime())) {
    return NextResponse.json({ message: "Invalid date" }, { status: 400 });
  }

  await connectToDatabase();
  const doc = await Notice.create({
    title,
    titleNe: (body.titleNe || "").toString().trim() || undefined,
    type: normalizeType(body.type),
    status: body.status === "published" ? "published" : "draft",
    fileUrl: (body.fileUrl || "").toString().trim() || undefined,
    publishedAt,
  });

  return NextResponse.json({ item: serialize(doc.toObject()), message: "Notice created" }, { status: 201 });
}
