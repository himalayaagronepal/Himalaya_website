import React from "react";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../lib/auth";
import { redirect } from "next/navigation";
import connectToDatabase from "../../../lib/mongodb";
import Outlet from "../../../models/Outlet";
import { serialize, serializeMany } from "../../../lib/serialize";
import { hasPermission } from "../../../lib/permissions";
import OutletManagementClient from "../../components/admin/OutletManagementClient";

export default async function OutletsPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "outlets")) {
    return redirect("/login");
  }

  await connectToDatabase();
  const outlets = await Outlet.find({}).sort({ createdAt: -1 }).lean();
  const safeOutlets = serializeMany(outlets as any[]);

  return (
    <main className="pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Outlets</h1>
            <p className="mt-2 text-sm text-slate-500">Create outlets, assign their outlet admin, and manage outlet details from one place.</p>
          </div>
        </div>

        {/* Outlets List */}
        <OutletManagementClient initialOutlets={safeOutlets} />
      </div>
    </main>
  );
}
