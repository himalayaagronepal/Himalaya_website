import React from "react";
import { redirect } from "next/navigation";
import connectToDatabase from "../../../../../../../lib/mongodb";
import ManualOrderFormClient from "../../../../../../components/outlet/ManualOrderFormClient";
import { resolveOutletEmployeeRoute, outletEmployeeBasePath } from "../../_utils";

export default async function CreateManualOrderPage({
  params,
}: {
  params: { slug: string; role: string } | Promise<{ slug: string; role: string }>;
}) {
  const resolved = await resolveOutletEmployeeRoute(params);
  if ("redirectTo" in resolved) return redirect(resolved.redirectTo);

  const { slug, role, outlet } = resolved;

  // Both accountants and shopkeepers can create manual orders
  if (role !== "accountant" && role !== "shopkeeper") {
    return redirect(outletEmployeeBasePath(slug, role));
  }

  await connectToDatabase();

  const backPath = `${outletEmployeeBasePath(slug, role)}/order`;

  return (
    <main className="pb-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <a
            href={backPath}
            className="text-cyan-600 hover:text-cyan-700 text-sm font-medium mb-4 inline-block"
          >
            ← Back to Orders
          </a>
          <h1 className="text-3xl font-bold text-slate-900">Create Manual Order</h1>
          <p className="mt-2 text-sm text-slate-500">
            Create an order for customer visiting {outlet.name} offline
          </p>
        </div>

        <ManualOrderFormClient
          outletSlug={slug}
          employeeRole={role}
          backPath={backPath}
        />
      </div>
    </main>
  );
}
