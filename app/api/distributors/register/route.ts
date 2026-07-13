import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/mongodb";
import User from "../../../../models/User";

function validateEmail(email: string) {
  return typeof email === "string" && /\S+@\S+\.\S+/.test(email);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || "").trim();
  const businessName = String(body.businessName || "").trim();
  const phoneNumber = String(body.phoneNumber || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const password = String(body.password || "");
  const citizenshipFront = String(body.citizenshipFront || "").trim();
  const citizenshipBack = String(body.citizenshipBack || "").trim();
  const panCertificate = String(body.panCertificate || "").trim();

  if (!name) return NextResponse.json({ message: "Full name is required" }, { status: 400 });
  if (!businessName) return NextResponse.json({ message: "Business name is required" }, { status: 400 });
  if (!phoneNumber) return NextResponse.json({ message: "Phone number is required" }, { status: 400 });
  if (!validateEmail(email)) return NextResponse.json({ message: "Valid email is required" }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 });
  if (!citizenshipFront) return NextResponse.json({ message: "Citizenship front document is required" }, { status: 400 });
  if (!citizenshipBack) return NextResponse.json({ message: "Citizenship back document is required" }, { status: 400 });
  if (!panCertificate) return NextResponse.json({ message: "PAN certificate is required" }, { status: 400 });

  if (process.env.ADMIN_EMAIL && email === process.env.ADMIN_EMAIL.toLowerCase()) {
    return NextResponse.json({ message: "Registration using this email is not allowed" }, { status: 403 });
  }

  await connectToDatabase();

  const existing = await User.findOne({ email }).lean();
  if (existing) return NextResponse.json({ message: "Email already in use" }, { status: 409 });

  const user = await User.create({
    name,
    email,
    password,
    role: "distributor",
    distributorStatus: "pending",
    phoneNumber,
    businessName,
    creditLimitNpr: 0,
    creditUsedNpr: 0,
    isActive: true,
    citizenshipFront,
    citizenshipBack,
    panCertificate,
  });

  return NextResponse.json(
    {
      message: "Distributor application submitted successfully",
      distributor: {
        id: String(user._id),
        name: user.name,
        email: user.email,
        businessName: (user as any).businessName,
        distributorStatus: (user as any).distributorStatus,
      },
    },
    { status: 201 }
  );
}
