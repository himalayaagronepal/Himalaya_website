import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../lib/auth";

export async function GET(req: Request) {
  // Dev-only safety
  if (process.env.NODE_ENV === "production") return NextResponse.json({ message: "disabled" }, { status: 404 });

  const headers: any = {};
  for (const [k, v] of Array.from(req.headers.entries())) headers[k] = v;

  const cookieHeader = req.headers.get("cookie") || null;
  // cast to any to satisfy next-auth typings in this dev-only utility
  const token = await getToken({ req: req as any, secret: process.env.NEXTAUTH_SECRET || undefined }).catch(() => null);
  const session = (await getServerSession(authOptions as any).catch(() => null)) as any;

  return NextResponse.json({
    ok: true,
    now: new Date().toISOString(),
    cookieHeader,
    headers,
    token: token ? { id: (token as any).id, role: (token as any).role, exp: (token as any).exp } : null,
    session: session ? { user: session.user ?? null, expires: session.expires ?? null } : null,
  });
}
