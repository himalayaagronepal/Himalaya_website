import React from "react";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../lib/auth";
import AdminSecurityClient from "../../components/admin/AdminSecurityClient";

export const metadata = {
  title: "Security",
};

// 2FA management is admin-only. Employees/outlet-admins never reach this page.
export default async function AdminSecurityPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session) return <div className="p-12">Unauthorized</div>;
  if (session.user?.role !== "admin") return <div className="p-12">Unauthorized</div>;

  return <AdminSecurityClient email={session.user?.email || ""} />;
}
