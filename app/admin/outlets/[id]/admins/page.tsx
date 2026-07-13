import React from "react";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../lib/auth";
import { redirect } from "next/navigation";
import connectToDatabase from "../../../../../lib/mongodb";
import Outlet from "../../../../../models/Outlet";
import OutletAdmin from "../../../../../models/OutletAdmin";
import { serialize, serializeMany } from "../../../../../lib/serialize";
import { hasPermission } from "../../../../../lib/permissions";
import OutletAdminManagementClient from "../../../../components/admin/OutletAdminManagementClient";

export default async function OutletAdminsPage({ params }: { params: { id: string } } | { params: Promise<{ id: string }> }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { id } = resolvedParams;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "outlets")) {
    return redirect("/login");
  }

  await connectToDatabase();

  const outlet = await Outlet.findById(id).lean();
  if (!outlet) {
    return redirect("/admin/outlets");
  }

  const admins = await OutletAdmin.find({ outlet: id }).select("-password").lean();
  const safeOutlet = serialize(outlet);
  const safeAdmins = serializeMany(admins as any[]);

  return (
    <main className="pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <a href="/admin/outlets" className="text-cyan-600 hover:text-cyan-700 text-sm font-medium mb-4 inline-block">
            ← Back to Outlets
          </a>
          <h1 className="text-3xl font-bold text-slate-900">{outlet.name}</h1>
          <p className="mt-2 text-sm text-slate-500">Manage outlet administrators</p>
        </div>

        {/* Admins List */}
        <OutletAdminManagementClient outletId={id} initialAdmins={safeAdmins} outletName={outlet.name} />
      </div>
    </main>
  );
}
