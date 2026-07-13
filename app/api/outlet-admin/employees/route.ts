import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../lib/auth";
import connectToDatabase from "../../../../lib/mongodb";
import Employee from "../../../../models/Employee";
import User from "../../../../models/User";
import OutletAdmin from "../../../../models/OutletAdmin";
import { normalizeOutletEmployeeSections, permissionsForOutletSections } from "../../../../lib/permissions";

async function requireOutletAdmin() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || session.user?.role !== "outlet-admin" || !session.user?.outletId) return null;
  return session;
}

export async function GET() {
  try {
    const session = await requireOutletAdmin();
    if (!session) return NextResponse.json({ message: "Not found" }, { status: 404 });

    await connectToDatabase();
    const employees = await Employee.find({ outlet: session.user.outletId }).sort({ createdAt: -1 }).lean();

    const safeEmployees = (employees || []).map((employee: any) => ({
      _id: String(employee._id),
      name: employee.name || null,
      email: employee.email,
      role: employee.role,
      photo: employee.photo || null,
      shortDescription: employee.shortDescription || null,
      phoneNumber: employee.phoneNumber || null,
      permissions: Array.isArray(employee.permissions) ? employee.permissions : [],
      isActive: !!employee.isActive,
      createdAt: employee.createdAt ? new Date(employee.createdAt).toISOString() : null,
    }));

    return NextResponse.json({ employees: safeEmployees });
  } catch (err: any) {
    console.error("Error in GET /api/outlet-admin/employees:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireOutletAdmin();
    if (!session) return NextResponse.json({ message: "Not found" }, { status: 404 });

    const body = await req.json().catch(() => ({}));
    const name = String(body.name || "").trim();
    const email = String(body.email || "").toLowerCase().trim();
    const password = String(body.password || "");
    const sections = normalizeOutletEmployeeSections(body.sections);

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }
    if (!password || password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
    }
    if (sections.length === 0) {
      return NextResponse.json({ message: "Select at least one section to grant access to" }, { status: 400 });
    }
    if (!name) {
      return NextResponse.json({ message: "Full name is required" }, { status: 400 });
    }

    await connectToDatabase();
    const [existingUser, existingEmployee, existingOutletAdmin] = await Promise.all([
      User.findOne({ email }).lean(),
      Employee.findOne({ email }).lean(),
      OutletAdmin.findOne({ email }).lean(),
    ]);
    if (existingUser || existingEmployee || existingOutletAdmin) {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 });
    }

    const employee = new Employee({
      outlet: session.user.outletId,
      name: name || undefined,
      email,
      password,
      role: "staff",
      photo: typeof body.photo === "string" ? body.photo.trim() : undefined,
      shortDescription: typeof body.shortDescription === "string" ? body.shortDescription.trim() : undefined,
      phoneNumber: typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : undefined,
      permissions: permissionsForOutletSections(sections),
    });

    await employee.save();

    const safe = {
      _id: String(employee._id),
      name: employee.name || null,
      email: employee.email,
      role: employee.role,
      photo: employee.photo || null,
      shortDescription: employee.shortDescription || null,
      phoneNumber: employee.phoneNumber || null,
      permissions: employee.permissions || [],
      isActive: !!employee.isActive,
      createdAt: employee.createdAt ? new Date(employee.createdAt).toISOString() : null,
    };

    return NextResponse.json({ employee: safe, message: "Employee created" }, { status: 201 });
  } catch (err: any) {
    console.error("Error in POST /api/outlet-admin/employees:", err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}