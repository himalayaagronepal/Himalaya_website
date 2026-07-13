import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import authOptions from "./auth";
import type { AdminSession } from "./adminAccess";

/**
 * Raw signed-in user from the shared (NextAuth-backed) httpOnly session cookie,
 * regardless of role. /admin also hosts unrelated portals (outlet-admin,
 * outlet-staff, distributor) that authenticate through the same cookie but
 * aren't part of the admins/admin-employees permission system below.
 */
export async function getRawSessionUser(): Promise<any | null> {
  const session = (await getServerSession(authOptions as any)) as any;
  return session?.user ?? null;
}

/**
 * Reads + normalizes the current admin-portal session (admin / admin-employee
 * only) from the shared session cookie. Permissions are normalized to [] for
 * admins. Returns null both when signed out AND when signed in as some other
 * kind of /admin portal user (outlet-admin, outlet-staff, distributor) — those
 * are handled by their own pages/resolvers, not this permission system.
 */
export async function getSessionFromCookies(): Promise<AdminSession | null> {
  const user = await getRawSessionUser();
  if (!user) return null;
  if (user.role !== "admin" && user.role !== "admin-employee") return null;

  return {
    sub: String(user.id || user.sub || ""),
    email: String(user.email || ""),
    role: user.role,
    permissions: user.role === "admin" ? [] : Array.isArray(user.permissions) ? user.permissions : [],
  };
}

/** Redirects to the admin login page when there is no valid admin-portal session. */
export async function requireSession(): Promise<AdminSession> {
  const session = await getSessionFromCookies();
  if (!session) redirect("/admin/login");
  return session;
}
