import { NextResponse } from "next/server";
import { getSessionFromCookies } from "../../../../lib/adminSession";
import { createEmployee, emailInUse, listEmployees } from "../../../../lib/services/adminEmployees";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ message: "Admin role required" }, { status: 403 });

  const employees = await listEmployees();
  return NextResponse.json({ employees });
}

export async function POST(req: Request) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ message: "Admin role required" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const fullName = String(body.fullName || "").trim();
  const email = String(body.email || "").toLowerCase().trim();
  const password = String(body.password || "");

  if (!fullName) return NextResponse.json({ message: "Full name is required" }, { status: 400 });
  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ message: "Invalid email" }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
  }
  if (await emailInUse(email)) {
    return NextResponse.json({ message: "Email already in use" }, { status: 409 });
  }

  const employee = await createEmployee({ fullName, email, password, permissions: body.permissions });
  return NextResponse.json({ employee, message: "Employee created" }, { status: 201 });
}
