import React from "react";
import { redirect } from "next/navigation";
import connectToDatabase from "../../../../../../lib/mongodb";
import Order from "../../../../../../models/Order";
import { serializeMany } from "../../../../../../lib/serialize";
import { filterOrdersForOutlet } from "../../../../../../lib/order-access";
import AdminOrdersClient from "../../../../../components/admin/AdminOrdersClient";
import { resolveOutletEmployeeRoute, outletEmployeeBasePath } from "../_utils";

export default async function OutletEmployeeOrdersPage({ params }: { params: { slug: string; role: string } } | { params: Promise<{ slug: string; role: string }> }) {
  const resolved = await resolveOutletEmployeeRoute(params);
  if ("redirectTo" in resolved) return redirect(resolved.redirectTo);

  const { slug, role, outlet } = resolved;

  await connectToDatabase();
  const orders = await Order.find({}).sort({ createdAt: -1 }).limit(300).lean();
  const outletOrders = await filterOrdersForOutlet(serializeMany(orders as any[]), String((outlet as any)._id));

  return (
    <main className="pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <a href={outletEmployeeBasePath(slug, role)} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium mb-4 inline-block">
              ← Back to Workspace
            </a>
            <h1 className="text-3xl font-bold text-slate-900">Orders</h1>
            <p className="mt-2 text-sm text-slate-500">Manage orders for {outlet.name}</p>
          </div>
          <a
            href={`${outletEmployeeBasePath(slug, role)}/order/new`}
            className="px-4 py-2.5 bg-cyan-600 text-white font-medium rounded-lg hover:bg-cyan-700 transition-colors inline-block"
          >
            + Create Manual Order
          </a>
        </div>

        <AdminOrdersClient initialOrders={outletOrders} orderBasePath={`${outletEmployeeBasePath(slug, role)}/order`} />
      </div>
    </main>
  );
}
