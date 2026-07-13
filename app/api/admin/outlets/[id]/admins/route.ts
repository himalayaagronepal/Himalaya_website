import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../../lib/auth";
import connectToDatabase from "../../../../../../lib/mongodb";
import Outlet from "../../../../../../models/Outlet";
import OutletAdmin from "../../../../../../models/OutletAdmin";
import Employee from "../../../../../../models/Employee";
import User from "../../../../../../models/User";
import { hasPermission } from "../../../../../../lib/permissions";

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
    console.error("Error in GET /api/admin/outlets/[id]/admins:", err);
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

    const email = body.email.toLowerCase().trim();
    const username = body.username.toLowerCase().trim();

    const duplicateAccounts = await Promise.all([
      User.findOne({ email }).lean(),
      Employee.findOne({ email }).lean(),
      OutletAdmin.findOne({ email }).lean(),
    ]);
    if (duplicateAccounts.some(Boolean)) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    }

    const existing = await OutletAdmin.findOne({ outlet: id, email });
    if (existing) {
      return NextResponse.json({ message: "Admin with this email already exists for this outlet" }, { status: 400 });
    }

    const admin = await OutletAdmin.create({
      outlet: id,
      username,
      email,
      password: body.password,
      name: body.name || "",
      isActive: body.isActive !== false,
    });

    const { password, ...safeAdmin } = admin.toObject();

    return NextResponse.json(safeAdmin, { status: 201 });
  } catch (err: any) {
    console.error("Error in POST /api/admin/outlets/[id]/admins:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
