import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import authOptions from "./auth";
import { hasPermission } from "./permissions";

export async function getSessionUser() {
  const session = (await getServerSession(authOptions as any)) as any;
  return session?.user ?? null;
}

/**
 * Returns a 401 NextResponse when there is no authenticated user, otherwise null.
 * Usage: `const denied = requireUser(user); if (denied) return denied;`
 * (Returns a response instead of throwing so handlers emit a proper 401, not a 500.)
 */
export function requireUser(user: any): NextResponse | null {
  if (!user) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }
  return null;
}

/**
 * Returns a 401/403 NextResponse when the user is missing or not an admin, otherwise null.
 * Usage: `const denied = requireAdmin(user); if (denied) return denied;`
 */
export function requireAdmin(user: any): NextResponse | null {
  if (!user) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ message: "Admin role required" }, { status: 403 });
  }
  return null;
}

/**
 * Returns a 401/403 NextResponse unless the user is an admin or holds the given
 * admin-section permission (e.g. "gallery", "about", "contact", "home") — covers
 * both full admins and admin-employee accounts granted that section.
 * Usage: `const denied = requireSection(user, "gallery"); if (denied) return denied;`
 */
export function requireSection(user: any, section: string): NextResponse | null {
  if (!user) {
    return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  }
  if (!hasPermission(user, section)) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }
  return null;
}