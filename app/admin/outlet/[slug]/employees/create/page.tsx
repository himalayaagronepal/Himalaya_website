import React from "react";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../../lib/auth";
import { redirect, notFound } from "next/navigation";
import connectToDatabase from "../../../../../../lib/mongodb";
import Outlet from "../../../../../../models/Outlet";
import OutletEmployeeCreateForm from "../../../../../components/admin/OutletEmployeeCreateForm";

export default async function OutletEmployeeCreatePage({ params }: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug } = resolvedParams;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || session.user?.role !== "outlet-admin" || session.user?.outletSlug !== slug) {
    return redirect("/login");
  }

  await connectToDatabase();
  const outlet = await Outlet.findOne({ slug }).lean();
  if (!outlet) return notFound();

  return (
    <main className="pb-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <a href={`/admin/outlet/${slug}/employees`} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium inline-block">
          ← Back to Employees
        </a>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create Outlet Employee</h1>
          <p className="mt-1 text-sm text-slate-500">Add an accountant or shopkeeper account for this outlet.</p>
        </div>
        <OutletEmployeeCreateForm slug={slug} />
      </div>
    </main>
  );
}
