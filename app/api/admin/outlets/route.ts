import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../lib/auth";
import connectToDatabase from "../../../../lib/mongodb";
import Outlet from "../../../../models/Outlet";
import OutletAdmin from "../../../../models/OutletAdmin";
import Employee from "../../../../models/Employee";
import User from "../../../../models/User";
import { hasPermission } from "../../../../lib/permissions";

export async function GET(req: Request) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session || !hasPermission(session.user, "admin")) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    await connectToDatabase();
    const outlets = await Outlet.find({}).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ outlets });
  } catch (err: any) {
    console.error("Error in GET /api/admin/outlets:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = (await getServerSession(authOptions as any)) as any;
    if (!session || !hasPermission(session.user, "admin")) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    const body = await req.json().catch(() => ({}));
    await connectToDatabase();

    const slug = (body.slug || body.name || "").toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    if (!body.name || !slug) {
      return NextResponse.json({ message: "Outlet name is required" }, { status: 400 });
    }

    const adminName = String(body?.admin?.name || "").trim();
    const adminEmail = String(body?.admin?.email || "").toLowerCase().trim();
    const adminUsername = String(body?.admin?.username || "").toLowerCase().trim();
    const adminPassword = String(body?.admin?.password || "");

    if (!adminEmail || !adminUsername || !adminPassword) {
      return NextResponse.json({ message: "Outlet admin email, username, and password are required" }, { status: 400 });
    }

    const duplicateAccounts = await Promise.all([
      User.findOne({ email: adminEmail }).lean(),
      Employee.findOne({ email: adminEmail }).lean(),
      OutletAdmin.findOne({ email: adminEmail }).lean(),
    ]);
    if (duplicateAccounts.some(Boolean)) {
      return NextResponse.json({ message: "Outlet admin email is already in use" }, { status: 409 });
    }

    const profileImage = typeof body.profileImage === "string" ? body.profileImage.trim() : "";
    const galleryImages = Array.isArray(body.galleryImages)
      ? body.galleryImages.map((image: string) => String(image).trim()).filter(Boolean)
      : [];

    const existing = await Outlet.findOne({ slug });
    if (existing) {
      return NextResponse.json({ message: "Outlet with this name already exists" }, { status: 400 });
    }

    const outlet = await Outlet.create({
      name: body.name,
      slug,
      description: body.description || "",
      address: body.address || "",
      contactPhone: body.contactPhone || "",
      contactEmail: body.contactEmail || "",
      profileImage: profileImage || undefined,
      galleryImages,
      isActive: body.isActive !== false,
    });

    let adminRecord: any = null;
    try {
      adminRecord = await OutletAdmin.create({
        outlet: outlet._id,
        username: adminUsername,
        email: adminEmail,
        password: adminPassword,
        name: adminName || undefined,
        isActive: true,
      });
      outlet.primaryAdmin = adminRecord._id;
      await outlet.save();
    } catch (adminErr) {
      await outlet.deleteOne();
      throw adminErr;
    }

    return NextResponse.json({
      outlet: outlet.toObject(),
      admin: {
        _id: String(adminRecord._id),
        name: adminRecord.name || null,
        email: adminRecord.email,
        username: adminRecord.username,
      },
    }, { status: 201 });
  } catch (err: any) {
    console.error("Error in POST /api/admin/outlets:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
