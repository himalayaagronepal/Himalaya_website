import React from "react";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../lib/auth";
import { redirect, notFound } from "next/navigation";
import connectToDatabase from "../../../../../lib/mongodb";
import Outlet from "../../../../../models/Outlet";
import OutletEmployeeManageClient from "../../../../components/admin/OutletEmployeeManageClient";

export default async function OutletEmployeesPage({ params }: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug } = resolvedParams;

  const session = (await getServerSession(authOptions as any)) as any;
  // Outlet employee accounts are managed by that outlet's admin only (a global
  // admin can still view the outlet console, but employee management itself —
  // like the main admin's employee system — is reserved for the outlet admin).
  if (!session || session.user?.role !== "outlet-admin" || session.user?.outletSlug !== slug) {
    return redirect("/login");
  }

  await connectToDatabase();
  const outlet = await Outlet.findOne({ slug }).lean();
  if (!outlet) return notFound();

  return (
    <main className="pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <a href={`/admin/outlet/${slug}`} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium inline-block">
          ← Back to Dashboard
        </a>
        <OutletEmployeeManageClient slug={slug} />
      </div>
    </main>
  );
}
