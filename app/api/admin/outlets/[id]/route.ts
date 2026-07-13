import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../lib/auth";
import connectToDatabase from "../../../../../lib/mongodb";
import Outlet from "../../../../../models/Outlet";
import OutletAdmin from "../../../../../models/OutletAdmin";
import Employee from "../../../../../models/Employee";
import Product from "../../../../../models/Product";
import ProductLog from "../../../../../models/ProductLog";
import Order from "../../../../../models/Order";
import Cart from "../../../../../models/Cart";
import { hasPermission } from "../../../../../lib/permissions";

export async function GET(req: Request, context: any) {
  try {
  const params = context.params instanceof Promise ? await context.params : context.params;
  const { id } = params;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "admin")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  await connectToDatabase();
  const outlet = await Outlet.findById(id).lean();
  if (!outlet) return NextResponse.json({ message: "Outlet not found" }, { status: 404 });

  const admins = await OutletAdmin.find({ outlet: id }).select("-password").lean();

  return NextResponse.json({ outlet, admins });
  } catch (err: any) {
    console.error("Error in GET /api/admin/outlets/[id]:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request, context: any) {
  try {
  const params = context.params instanceof Promise ? await context.params : context.params;
  const { id } = params;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "admin")) {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  await connectToDatabase();

  const outlet = await Outlet.findById(id);
  if (!outlet) return NextResponse.json({ message: "Outlet not found" }, { status: 404 });

  if (!body.email || !body.password || !body.username) {
    return NextResponse.json({ message: "Email, username, and password are required" }, { status: 400 });
  }

  const existing = await OutletAdmin.findOne({ outlet: id, email: body.email.toLowerCase() });
  if (existing) {
    return NextResponse.json({ message: "Admin with this email already exists for this outlet" }, { status: 400 });
  }

  const admin = await OutletAdmin.create({
    outlet: id,
    username: body.username.toLowerCase().trim(),
    email: body.email.toLowerCase().trim(),
    password: body.password,
    name: body.name || "",
    isActive: body.isActive !== false,
  });

  const { password, ...safeAdmin } = admin.toObject();

  return NextResponse.json(safeAdmin, { status: 201 });
  } catch (err: any) {
    console.error("Error in POST /api/admin/outlets/[id]:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: any) {
  try {
    const params = context.params instanceof Promise ? await context.params : context.params;
    const { id } = params;

    const session = (await getServerSession(authOptions as any)) as any;
    if (!session || !hasPermission(session.user, "admin")) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    await connectToDatabase();

    const outlet = await Outlet.findById(id);
    if (!outlet) return NextResponse.json({ message: "Outlet not found" }, { status: 404 });

    const nextName = String(body.name || outlet.name || "").trim();
    const nextSlug = String(body.slug || nextName).toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (!nextName || !nextSlug) {
      return NextResponse.json({ message: "Outlet name is required" }, { status: 400 });
    }

    const duplicate = await Outlet.findOne({ _id: { $ne: id }, $or: [{ name: nextName }, { slug: nextSlug }] }).lean();
    if (duplicate) {
      return NextResponse.json({ message: "Another outlet with the same name or slug already exists" }, { status: 409 });
    }

    outlet.name = nextName;
    outlet.slug = nextSlug;
    outlet.description = body.description || "";
    outlet.address = body.address || "";
    outlet.contactPhone = body.contactPhone || "";
    outlet.contactEmail = body.contactEmail || "";

    if (typeof body.profileImage === "string") {
      outlet.profileImage = body.profileImage.trim() || undefined;
    }
    if (Array.isArray(body.galleryImages)) {
      outlet.galleryImages = body.galleryImages.map((image: string) => String(image).trim()).filter(Boolean);
    }

    await outlet.save();

    return NextResponse.json({ outlet: outlet.toObject() });
  } catch (err: any) {
    console.error("Error in PUT /api/admin/outlets/[id]:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const params = context.params instanceof Promise ? await context.params : context.params;
    const { id } = params;

    const session = (await getServerSession(authOptions as any)) as any;
    if (!session || !hasPermission(session.user, "admin")) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    await connectToDatabase();

    const outlet = await Outlet.findById(id).lean();
    if (!outlet) return NextResponse.json({ message: "Outlet not found" }, { status: 404 });

    const productIds = await Product.find({ outlet: id }).distinct("_id");

    await Promise.all([
      ProductLog.deleteMany({ $or: [{ outlet: id }, { product: { $in: productIds } }] }),
      Order.deleteMany({ outlet: id }),
      Product.deleteMany({ outlet: id }),
      Employee.deleteMany({ outlet: id }),
      OutletAdmin.deleteMany({ outlet: id }),
      Cart.updateMany({ "items.product": { $in: productIds } }, { $pull: { items: { product: { $in: productIds } } } }),
    ]);

    await Outlet.deleteOne({ _id: id });

    return NextResponse.json({ message: "Outlet deleted" });
  } catch (err: any) {
    console.error("Error in DELETE /api/admin/outlets/[id]:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
