import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../lib/auth";
import connectToDatabase from "../../../../../lib/mongodb";
import AdminSecurity from "../../../../../models/AdminSecurity";
import {
  generateTotpSecret,
  encryptSecret,
  adminPrincipalKeyFromSession,
} from "../../../../../lib/admin-2fa";

// Begins 2FA enrollment for the logged-in admin. Generates a fresh secret, stores
// it as PENDING (not yet active), and returns a QR code + manual key for the
// authenticator app. Enrollment is only finalized by /api/admin/2fa/verify once
// the admin proves they scanned it with a valid code.
export async function POST() {
  const session = (await getServerSession(authOptions as any)) as any;
  const user = session?.user;
  if (!user) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ message: "Admin role required." }, { status: 403 });

  const accountKey = adminPrincipalKeyFromSession(user);
  if (!accountKey) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const { secret, uri } = generateTotpSecret(user.email || "admin");
  const qr = await QRCode.toDataURL(uri);

  await connectToDatabase();
  await AdminSecurity.updateOne(
    { accountKey },
    { $set: { totpPendingSecret: encryptSecret(secret), email: user.email } },
    { upsert: true },
  ).exec();

  // `manualKey` lets the admin type the secret if their camera can't scan.
  return NextResponse.json({ qr, manualKey: secret });
}
