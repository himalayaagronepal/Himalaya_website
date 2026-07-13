import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../lib/auth";
import connectToDatabase from "../../../../../lib/mongodb";
import Employee from "../../../../../models/Employee";
import User from "../../../../../models/User";
import OutletAdmin from "../../../../../models/OutletAdmin";
import mongoose from "mongoose";
import { EMPLOYEE_ROLES } from "../../../../../lib/permissions";

async function requireOutletAdmin() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || session.user?.role !== "outlet-admin" || !session.user?.outletId) return null;
  return session;
}

export async function PATCH(req: Request, context: any) {
  try {
    const session = await requireOutletAdmin();
    if (!session) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const params = context.params instanceof Promise ? await context.params : context.params;
    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ message: "Invalid id" }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    await connectToDatabase();

    const target = await Employee.findById(id);
    if (!target) return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    if (!target.outlet || String(target.outlet) !== String(session.user.outletId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const updates: any = {};
    if (typeof body.name === "string") updates.name = body.name.trim();
    if (typeof body.photo === "string") updates.photo = body.photo.trim();
    if (typeof body.shortDescription === "string") updates.shortDescription = body.shortDescription.trim();
    if (typeof body.phoneNumber === "string") updates.phoneNumber = body.phoneNumber.trim();
    if (typeof body.role === "string") {
      const nextRole = body.role.trim();
      if (!EMPLOYEE_ROLES.includes(nextRole)) {
        return NextResponse.json({ message: "Invalid role" }, { status: 400 });
      }
      updates.role = nextRole;
    }
    if (typeof body.isActive === "boolean") updates.isActive = body.isActive;
    if (typeof body.password === "string" && body.password.length >= 8) updates.password = body.password;

    if (typeof body.email === "string" && body.email.trim()) {
      const nextEmail = body.email.toLowerCase().trim();
      const duplicateAccounts = await Promise.all([
        User.findOne({ email: nextEmail, _id: { $ne: target._id } }).lean(),
        Employee.findOne({ email: nextEmail, _id: { $ne: target._id } }).lean(),
        OutletAdmin.findOne({ email: nextEmail }).lean(),
      ]);
      if (duplicateAccounts.some(Boolean)) {
        return NextResponse.json({ message: "Email already in use" }, { status: 409 });
      }
      updates.email = nextEmail;
    }

    Object.assign(target, updates);
    await target.save();

    const safe = {
      _id: String(target._id),
      name: target.name || null,
      email: target.email,
      role: target.role,
      photo: target.photo || null,
      shortDescription: target.shortDescription || null,
      phoneNumber: target.phoneNumber || null,
      isActive: !!target.isActive,
    };

    return NextResponse.json({ employee: safe, message: "Updated" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const session = await requireOutletAdmin();
    if (!session) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const params = context.params instanceof Promise ? await context.params : context.params;
    const { id } = params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) return NextResponse.json({ message: "Invalid id" }, { status: 400 });

    await connectToDatabase();
    const target = await Employee.findById(id);
    if (!target) return NextResponse.json({ message: "Employee not found" }, { status: 404 });
    if (!target.outlet || String(target.outlet) !== String(session.user.outletId)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await target.deleteOne();
    return NextResponse.json({ message: "Deleted" });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
