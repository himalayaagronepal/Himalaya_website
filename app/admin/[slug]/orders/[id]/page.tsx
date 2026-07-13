import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import authOptions from "../../../../../lib/auth";
import connectToDatabase from "../../../../../lib/mongodb";
import Order from "../../../../../models/Order";
import Outlet from "../../../../../models/Outlet";
import AdminOrderActions from "../../../../components/admin/AdminOrderActions";

export default async function AdminOutletOrderDetailPage({ params }: { params: { slug: string; id: string } } | { params: Promise<{ slug: string; id: string }> }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug, id } = resolvedParams;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session) return redirect(`/login?from=/admin/${slug}/orders/${id}`);

  if (session.user?.role !== "admin" && session.user?.role !== "outlet-admin") {
    return redirect("/admin/dashboard");
  }

  if (session.user?.role === "outlet-admin" && session.user?.outletSlug !== slug) {
    return redirect(`/admin/${session.user?.outletSlug || "dashboard"}`);
  }

  await connectToDatabase();

  const outlet = await Outlet.findOne({ slug }).lean();
  if (!outlet) return notFound();

  const order = await Order.findOne({ _id: id }).lean();
  if (!order) return notFound();

  return (
    <main className="pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href={`/admin/${slug}/orders`} className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm text-slate-700">
            ← Back to orders
          </Link>
        </div>
        <AdminOrderActions
          orderId={String((order as any)._id)}
          initialOrderStatus={String((order as any).orderStatus || "pending")}
          initialPaymentStatus={String((order as any).paymentStatus || "pending")}
        />
      </div>
    </main>
  );
}