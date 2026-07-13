import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import authOptions from "../../../../lib/auth";
import connectToDatabase from "../../../../lib/mongodb";
import Order from "../../../../models/Order";
import Outlet from "../../../../models/Outlet";
import { serializeMany } from "../../../../lib/serialize";
import { filterOrdersForOutlet } from "../../../../lib/order-access";
import AdminOrdersClient from "../../../components/admin/AdminOrdersClient";

export default async function AdminOutletOrdersPage({ params }: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug } = resolvedParams;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session) return redirect(`/login?from=/admin/${slug}/orders`);

  if (session.user?.role !== "admin" && session.user?.role !== "outlet-admin") {
    return redirect("/admin/dashboard");
  }

  if (session.user?.role === "outlet-admin" && session.user?.outletSlug !== slug) {
    return redirect(`/admin/${session.user?.outletSlug || "dashboard"}`);
  }

  await connectToDatabase();

  const outlet = await Outlet.findOne({ slug }).lean();
  if (!outlet) return notFound();

  const orders = await Order.find({}).sort({ createdAt: -1 }).limit(300).lean();
  const outletOrders = await filterOrdersForOutlet(serializeMany(orders as any[]), String(outlet._id));

  return (
    <main className="pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <Link href={`/admin/${slug}`} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
            <p className="mt-2 text-sm text-slate-500">Orders containing products from {outlet.name}</p>
          </div>
        </div>

        <AdminOrdersClient initialOrders={outletOrders} orderBasePath={`/admin/${slug}/orders`} />
      </div>
    </main>
  );
}