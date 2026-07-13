import React from "react";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import authOptions from "../../lib/auth";
import { adminLandingForPermissions, outletEmployeeLandingPath } from "../../lib/permissions";

export default async function EmployeeDashboardPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session) return redirect("/login?from=/employee");

  const user = session.user;
  if (user?.role === "admin") return redirect("/admin/dashboard");
  if (user?.role !== "employee") return redirect("/");

  const target = outletEmployeeLandingPath(user);
  if (target !== "/employee") return redirect(target);

  const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const fallback = adminLandingForPermissions(permissions);
  return redirect(fallback === "/admin/dashboard" ? "/" : fallback);
}
