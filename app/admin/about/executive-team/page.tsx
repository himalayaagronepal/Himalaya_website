import React from "react";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../lib/auth";
import { hasPermission } from "../../../../lib/permissions";
import AdminExecutiveTeamClient from "../../../components/admin/AdminExecutiveTeamClient";

export const metadata = { title: "Admin — Executive Team" };

export default async function AdminExecutiveTeamPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "about")) {
    return <div className="p-12">Unauthorized</div>;
  }
  return (
    <main className="pb-16">
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <AdminExecutiveTeamClient />
      </div>
    </main>
  );
}
