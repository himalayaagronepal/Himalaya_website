import React from "react";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../lib/auth";
import { hasPermission } from "../../../../lib/permissions";
import AdminWhoWeAreClient from "../../../components/admin/AdminWhoWeAreClient";

export const metadata = { title: "Admin — Who We Are" };

export default async function AdminWhoWeArePage() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "about")) {
    return <div className="p-12">Unauthorized</div>;
  }
  return (
    <main className="pb-16">
      <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <AdminWhoWeAreClient />
      </div>
    </main>
  );
}
