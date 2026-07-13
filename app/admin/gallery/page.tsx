import React from "react";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../lib/auth";
import { hasPermission } from "../../../lib/permissions";
import AdminGalleryClient from "../../components/admin/AdminGalleryClient";

export default async function AdminGalleryPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "gallery")) {
    return <div className="p-12">Unauthorized</div>;
  }

  return (
    <main className="pb-16">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <AdminGalleryClient />
      </div>
    </main>
  );
}
