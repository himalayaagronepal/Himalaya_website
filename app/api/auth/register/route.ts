import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/mongodb";
import User from "../../../../models/User";

// Self-service customer registration. Anyone can open a normal "user" account with
// name + email + phone + password — no admin approval. These accounts buy online and
// pay via eSewa only. (Distributor sign-up still lives at /register/distributor.)
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
  const phoneRaw = typeof body.phone === "string" ? body.phone.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!name) {
    return NextResponse.json({ message: "Please enter your full name." }, { status: 400 });
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ message: "Please enter a valid email address." }, { status: 400 });
  }
  if (!phoneRaw || !/^\d{7,15}$/.test(phoneRaw.replace(/[\s\-+]/g, ""))) {
    return NextResponse.json({ message: "Please enter a valid phone number." }, { status: 400 });
  }
  if (!password || password.length < 8) {
    return NextResponse.json({ message: "Password must be at least 8 characters." }, { status: 400 });
  }

  await connectToDatabase();

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
  }

  // Password is hashed by the User model's pre-save hook.
  await User.create({
    name,
    email,
    phoneNumber: phoneRaw,
    password,
    role: "user",
    isActive: true,
  });

  return NextResponse.json({ message: "Account created successfully." }, { status: 201 });
}
