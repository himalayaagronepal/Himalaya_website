import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../lib/auth";
import connectToDatabase from "../../../../lib/mongodb";
import Outlet from "../../../../models/Outlet";

function hasOutletPermission(user: any, permission: string) {
  if (!user || !user.outletId) return false;
  if (user.role === "outlet-admin") return true;
  if (user.role === "employee") {
    const perms = Array.isArray(user.permissions) ? user.permissions : [];
    return perms.includes(permission);
  }
  return false;
}

async function requireOutletReader() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasOutletPermission(session.user, "outlet:read")) return null;
  return session;
}

async function requireOutletWriter() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasOutletPermission(session.user, "outlet:write")) return null;
  return session;
}

export async function GET() {
  try {
    const session = await requireOutletReader();
    if (!session) return NextResponse.json({ message: "Not found" }, { status: 404 });

    await connectToDatabase();
    const outlet = await Outlet.findById(session.user.outletId).lean();
    if (!outlet) return NextResponse.json({ message: "Outlet not found" }, { status: 404 });

    return NextResponse.json({ outlet });
  } catch (err: any) {
    console.error("Error in GET /api/outlet-admin/outlet:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await requireOutletWriter();
    if (!session) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    await connectToDatabase();

    const outlet = await Outlet.findById(session.user.outletId);
    if (!outlet) return NextResponse.json({ message: "Outlet not found" }, { status: 404 });

    if (typeof body.name === "string") outlet.name = body.name.trim();
    if (typeof body.description === "string") outlet.description = body.description.trim();
    if (typeof body.address === "string") outlet.address = body.address.trim();
    if (typeof body.contactPhone === "string") outlet.contactPhone = body.contactPhone.trim();
    if (typeof body.contactEmail === "string") outlet.contactEmail = body.contactEmail.trim().toLowerCase();
    if (typeof body.profileImage === "string") outlet.profileImage = body.profileImage.trim();
    if (Array.isArray(body.galleryImages)) outlet.galleryImages = body.galleryImages.map((image: string) => String(image).trim()).filter(Boolean);

    await outlet.save();

    return NextResponse.json({ outlet: outlet.toObject(), message: "Outlet updated" });
  } catch (err: any) {
    console.error("Error in PATCH /api/outlet-admin/outlet:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}