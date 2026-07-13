import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import authOptions from "../../../../lib/auth";
import connectToDatabase from "../../../../lib/mongodb";
import Outlet from "../../../../models/Outlet";
import { serialize } from "../../../../lib/serialize";
import OutletSettingsClient from "../../../components/admin/OutletSettingsClient";

export default async function AdminOutletInfoPage({ params }: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug } = resolvedParams;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session) return redirect(`/login?from=/admin/${slug}/outlet-info`);

  if (session.user?.role !== "admin" && session.user?.role !== "outlet-admin") {
    return redirect("/admin/dashboard");
  }

  if (session.user?.role === "outlet-admin" && session.user?.outletSlug !== slug) {
    return redirect(`/admin/${session.user?.outletSlug || "dashboard"}`);
  }

  await connectToDatabase();

  const outlet = await Outlet.findOne({ slug }).lean();
  if (!outlet) return notFound();

  const safeOutlet = serialize(outlet);

  return (
    <main className="pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <Link href={`/admin/${slug}`} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Outlet Info</h1>
          <p className="mt-2 text-sm text-slate-500">Edit outlet details, profile images, and contact information.</p>
        </div>

        <section id="outlet-info">
          <OutletSettingsClient
            initialOutlet={safeOutlet as any}
            updateEndpoint={`/api/admin/outlets/${safeOutlet._id}`}
            uploadEndpoint="/api/admin/upload"
          />
        </section>
      </div>
    </main>
  );
}