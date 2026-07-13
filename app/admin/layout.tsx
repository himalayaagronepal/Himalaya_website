import React from "react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AdminShell from "../components/admin/AdminShell";
import { AdminAccessProvider } from "../components/admin/AdminAccessContext";
import { getRawSessionUser, getSessionFromCookies } from "../../lib/adminSession";
import PermissionGate from "../components/admin/PermissionGate";

export const metadata = {
  title: "Admin",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = (await headers()).get("x-pathname") || "";
  const isLoginRoute = pathname.startsWith("/admin/login");

  // The login page is the one unauthenticated route in this tree — render it bare.
  if (isLoginRoute) {
    return <AdminShell>{children}</AdminShell>;
  }

  // /admin also hosts outlet-admin / outlet-staff / distributor portals that
  // authenticate through the same cookie but live outside this permission
  // system — let their own pages/route resolvers gate them as before.
  const rawUser = await getRawSessionUser();
  if (rawUser && rawUser.role !== "admin" && rawUser.role !== "admin-employee") {
    return <AdminShell>{children}</AdminShell>;
  }

  const session = await getSessionFromCookies();
  if (!session) redirect("/admin/login");

  const access = {
    isAdmin: session.role === "admin",
    permissions: session.permissions,
    email: session.email,
    role: session.role,
  };

  return (
    <AdminAccessProvider value={access}>
      <AdminShell>
        <PermissionGate>{children}</PermissionGate>
      </AdminShell>
    </AdminAccessProvider>
  );
}
