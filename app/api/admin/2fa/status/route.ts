import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../lib/auth";
import connectToDatabase from "../../../../../lib/mongodb";
import AdminSecurity from "../../../../../models/AdminSecurity";
import { adminPrincipalKeyFromSession, isResetCodeConfigured } from "../../../../../lib/admin-2fa";

// Tells the Security page whether 2FA is on (and how many backup codes remain),
// and whether a master reset code is configured in the environment.
export async function GET() {
  const session = (await getServerSession(authOptions as any)) as any;
  const user = session?.user;
  if (!user) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  if (user.role !== "admin") return NextResponse.json({ message: "Admin role required." }, { status: 403 });

  const accountKey = adminPrincipalKeyFromSession(user);
  if (!accountKey) return NextResponse.json({ message: "Unauthorized." }, { status: 401 });

  await connectToDatabase();
  const sec = (await AdminSecurity.findOne({ accountKey })
    .select("totpEnabled backupCodes")
    .lean()
    .exec()) as { totpEnabled?: boolean; backupCodes?: string[] } | null;

  return NextResponse.json({
    enabled: Boolean(sec?.totpEnabled),
    backupCodesRemaining: Array.isArray(sec?.backupCodes) ? sec.backupCodes.length : 0,
    resetCodeConfigured: isResetCodeConfigured(),
  });
}
