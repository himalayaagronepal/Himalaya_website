import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../lib/auth";
import connectToDatabase from "../../../../../lib/mongodb";
import Notice, { NOTICE_TYPES } from "../../../../../models/Notice";
import mongoose from "mongoose";
import { hasPermission } from "../../../../../lib/permissions";

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

export async function PATCH(req: Request, context: any) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "news:write")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const params = (await Promise.resolve(context?.params)) as { id?: string } | undefined;
  const id = params?.id;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  const body = await req.json().catch(() => ({}));

  await connectToDatabase();
  const item = await Notice.findById(id);
  if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });

  if (typeof body.title === "string") {
    const nextTitle = body.title.trim();
    if (!nextTitle) return NextResponse.json({ message: "Title is required" }, { status: 400 });
    item.title = nextTitle;
  }

  if (typeof body.titleNe === "string") {
    item.titleNe = body.titleNe.trim() || undefined;
  }

  if (typeof body.type === "string") {
    const t = body.type.trim();
    if ((NOTICE_TYPES as readonly string[]).includes(t)) item.type = t as any;
  }

  if (typeof body.status === "string") {
    item.status = body.status === "published" ? "published" : "draft";
  }

  if (typeof body.fileUrl === "string") {
    item.fileUrl = body.fileUrl.trim() || undefined;
  }

  if (body.publishedAt !== undefined) {
    const d = new Date(body.publishedAt);
    if (Number.isNaN(d.getTime())) return NextResponse.json({ message: "Invalid date" }, { status: 400 });
    item.publishedAt = d;
  }

  await item.save();
  return NextResponse.json({ item: serialize(item.toObject()), message: "Notice updated" });
}

export async function DELETE(req: Request, context: any) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "news:delete")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const params = (await Promise.resolve(context?.params)) as { id?: string } | undefined;
  const id = params?.id;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: "Invalid id" }, { status: 400 });
  }

  await connectToDatabase();
  const item = await Notice.findById(id);
  if (!item) return NextResponse.json({ message: "Not found" }, { status: 404 });
  await item.deleteOne();
  return NextResponse.json({ message: "Deleted" });
}
