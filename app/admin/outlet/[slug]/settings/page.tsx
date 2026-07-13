import React from "react";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../lib/auth";
import { redirect, notFound } from "next/navigation";
import connectToDatabase from "../../../../../lib/mongodb";
import Outlet from "../../../../../models/Outlet";
import { serialize } from "../../../../../lib/serialize";
import OutletSettingsClient from "../../../../components/admin/OutletSettingsClient";
import { hasOutletSectionAccess } from "../../../../../lib/permissions";

export default async function OutletSettingsPage({ params }: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug } = resolvedParams;

  const session = (await getServerSession(authOptions as any)) as any;
  // A global admin may view any outlet's console; an outlet-admin (or a
  // section-granted outlet employee) may manage info for their own outlet.
  if (!session || !hasOutletSectionAccess(session.user, slug, "outlet:read")) {
    return redirect("/login");
  }

  await connectToDatabase();

  const outlet = await Outlet.findOne({ slug }).lean();
  if (!outlet) return notFound();

  const safeOutlet = serialize(outlet);

  return (
    <main className="pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <a href={`/admin/outlet/${slug}`} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium mb-4 inline-block">
            ← Back to Dashboard
          </a>
          <h1 className="text-3xl font-bold text-slate-900">Outlet Management</h1>
          <p className="mt-2 text-sm text-slate-500">Edit outlet details, profile images, and outlet staff.</p>
        </div>

        <section id="outlet-info">
          <OutletSettingsClient initialOutlet={safeOutlet as any} />
        </section>
        {session.user?.role === "outlet-admin" && (
          <section id="employees">
            <a
              href={`/admin/outlet/${slug}/employees`}
              className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-cyan-300 transition-colors"
            >
              <h2 className="text-lg font-semibold text-slate-900">Outlet Employees</h2>
              <p className="mt-1 text-sm text-slate-500">Create and manage staff accounts for this outlet →</p>
            </a>
          </section>
        )}
      </div>
    </main>
  );
}