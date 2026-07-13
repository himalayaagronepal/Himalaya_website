import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../lib/auth";
import connectToDatabase from "../../../../../lib/mongodb";
import AdminSecurity from "../../../../../models/AdminSecurity";
import {
  verifyTotpCode,
  decryptSecret,
  isValidResetCode,
  adminPrincipalKeyFromSession,
} from "../../../../../lib/admin-2fa";

// Turns 2FA OFF for the logged-in admin — used both to "Disable 2FA" and as the
// first half of "Change authenticator app" (after which the client re-runs
// /api/admin/2fa/setup to enroll a new device). To stop a hijacked session from
// silently removing 2FA, the caller must prove ONE of:
//   - code:      a current valid authenticator code (they still have the device)
//   - resetCode: the ADMIN_MFA_RESET_CODE from the environment (lost device)
export async function POST(request: Request) {
  const session = (await getServerSession(authOptions as any)) as any;
  const user = session?.user;
  if (!user) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ message: "Admin role required." }, { status: 403 });

  const accountKey = adminPrincipalKeyFromSession(user);
  if (!accountKey) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as { code?: unknown; resetCode?: unknown } | null;
  const code = typeof body?.code === "string" ? body.code : undefined;
  const resetCode = typeof body?.resetCode === "string" ? body.resetCode : undefined;

  await connectToDatabase();
  const sec = (await AdminSecurity.findOne({ accountKey }).exec()) as
    | { totpEnabled?: boolean; totpSecret?: string }
    | null;

  if (!sec?.totpEnabled || !sec.totpSecret) {
    return NextResponse.json({ message: "Two-factor authentication is not enabled." }, { status: 400 });
  }

  let authorized = false;
  if (resetCode && isValidResetCode(resetCode)) {
    authorized = true;
  } else if (code) {
    try {
      authorized = verifyTotpCode(decryptSecret(sec.totpSecret), code);
    } catch {
      authorized = false;
    }
  }

  if (!authorized) {
    return NextResponse.json(
      { message: "Enter a valid authenticator code or the recovery code to continue." },
      { status: 401 },
    );
  }

  await AdminSecurity.updateOne(
    { accountKey },
    { $set: { totpEnabled: false }, $unset: { totpSecret: "", backupCodes: "", totpPendingSecret: "" } },
  ).exec();

  return NextResponse.json({ ok: true });
}
