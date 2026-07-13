import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import connectToDatabase from "../../../../../lib/mongodb";
import User from "../../../../../models/User";
import AdminSecurity from "../../../../../models/AdminSecurity";
import { principalKeyForEnvAdmin, principalKeyForUser } from "../../../../../lib/admin-2fa";
import { checkRateLimit, recordFailure, clearAttempts } from "../../../../../lib/rate-limit";

// Step one of the admin two-step login. Verifies the email+password and tells the
// client ONLY whether a 6-digit code is still required. It NEVER issues a session
// — the real gate is NextAuth's `authorize()` (lib/auth.ts), which re-verifies the
// password and enforces 2FA. This endpoint is intentionally public (the user has
// no session yet) and is rate-limited to blunt password guessing.
//
// Response is deliberately coarse: `{ mfaRequired: true }` only when the password
// is correct AND the account is an admin with 2FA enabled. Every other case
// (wrong password, non-admin, admin without 2FA) returns `{ mfaRequired: false }`,
// so it can't be used to distinguish "wrong password" from "no 2FA".

// Constant-time compare for the env-admin password (mirrors lib/auth.ts).
function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(String(a), "utf8").digest();
  const hb = crypto.createHash("sha256").update(String(b), "utf8").digest();
  return crypto.timingSafeEqual(ha, hb);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { email?: unknown; password?: unknown } | null;
  const email = typeof body?.email === "string" ? body.email.toLowerCase().trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json({ mfaRequired: false });
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";
  const rateKey = `admin-precheck:${email}:${ip}`;
  const limit = checkRateLimit(rateKey);
  if (!limit.allowed) {
    return NextResponse.json(
      { message: "Too many attempts. Please try again later." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds ?? 900) } },
    );
  }

  // Resolve which admin principal (if any) this password authenticates.
  let accountKey: string | null = null;

  if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    if (email === process.env.ADMIN_EMAIL.toLowerCase() && safeEqual(password, process.env.ADMIN_PASSWORD)) {
      accountKey = principalKeyForEnvAdmin(email);
    }
  }

  if (!accountKey) {
    await connectToDatabase();
    const user = await User.findOne({ email }).exec();
    if (user?.password && user.role === "admin" && user.isActive !== false) {
      const ok = await bcrypt.compare(password, user.password);
      if (ok) accountKey = principalKeyForUser(user._id.toString());
    }
  }

  if (!accountKey) {
    // Not a valid admin login — count it against the limiter and stay quiet.
    recordFailure(rateKey);
    return NextResponse.json({ mfaRequired: false });
  }

  // Password is correct: stop throttling this identity and report 2FA state.
  clearAttempts(rateKey);
  await connectToDatabase();
  const sec = (await AdminSecurity.findOne({ accountKey })
    .select("totpEnabled totpSecret")
    .lean()
    .exec()) as { totpEnabled?: boolean; totpSecret?: string } | null;

  return NextResponse.json({ mfaRequired: Boolean(sec?.totpEnabled && sec.totpSecret) });
}
