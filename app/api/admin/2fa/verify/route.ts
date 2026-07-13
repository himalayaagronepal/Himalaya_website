import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../lib/auth";
import connectToDatabase from "../../../../../lib/mongodb";
import AdminSecurity from "../../../../../models/AdminSecurity";
import {
  verifyTotpCode,
  decryptSecret,
  generateBackupCodes,
  adminPrincipalKeyFromSession,
} from "../../../../../lib/admin-2fa";

// Finalizes enrollment: the admin enters the first 6-digit code from their
// authenticator. If it matches the PENDING secret, 2FA is switched on and we
// return ~10 one-time backup codes (shown once, stored only as hashes).
export async function POST(request: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  const user = session?.user;
  if (!user) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ message: "Admin role required." }, { status: 403 });

  const accountKey = adminPrincipalKeyFromSession(user);
  if (!accountKey) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { code?: unknown } | null;
  const code = typeof body?.code === "string" ? body.code : undefined;
  if (!code) return NextResponse.json({ message: "Enter the 6-digit code." }, { status: 400 });

  await connectToDatabase();
  const sec = (await AdminSecurity.findOne({ accountKey }).exec()) as
    | { totpPendingSecret?: string }
    | null;

  if (!sec?.totpPendingSecret) {
    return NextResponse.json({ message: "No pending setup. Start enrollment again." }, { status: 400 });
  }

  let secret: string;
  try {
    secret = decryptSecret(sec.totpPendingSecret);
  } catch {
    return NextResponse.json({ message: "Setup is corrupted. Start again." }, { status: 400 });
  }

  if (!verifyTotpCode(secret, code)) {
    return NextResponse.json(
      { message: "That code didn't match. Check your authenticator and try again." },
      { status: 400 },
    );
  }

  const { plain, hashes } = await generateBackupCodes(10);

  await AdminSecurity.updateOne(
    { accountKey },
    {
      // Promote pending -> active (stays encrypted); enable; store hashed codes.
      $set: { totpSecret: sec.totpPendingSecret, totpEnabled: true, backupCodes: hashes },
      $unset: { totpPendingSecret: "" },
    },
  ).exec();

  return NextResponse.json({ ok: true, backupCodes: plain });
}
