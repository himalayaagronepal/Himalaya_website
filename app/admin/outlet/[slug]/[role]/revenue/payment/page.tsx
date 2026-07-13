import React from "react";
import { redirect } from "next/navigation";
import connectToDatabase from "../../../../../../../lib/mongodb";
import User from "../../../../../../../models/User";
import { resolveOutletEmployeeRoute, outletEmployeeBasePath } from "../../_utils";
import DistributorPaymentClient from "../../../../../../components/admin/DistributorPaymentClient";

export default async function OutletRevenuePaymentPage({ params }: { params: { slug: string; role: string } } | { params: Promise<{ slug: string; role: string }> }) {
  const resolved = await resolveOutletEmployeeRoute(params);
  if ("redirectTo" in resolved) return redirect(resolved.redirectTo);

  const { slug, role } = resolved;
  if (role !== "accountant") return redirect(outletEmployeeBasePath(slug, "accountant"));

  await connectToDatabase();
  const distributors = await User.find({ role: "distributor" }).sort({ updatedAt: -1 }).limit(200).lean();
  const list = (distributors || []).map((u: any) => ({
    id: String(u._id),
    name: u.name || u.email,
    email: u.email,
    businessName: u.businessName || null,
    creditLimitNpr: Number(u.creditLimitNpr || 0),
    creditUsedNpr: Number(u.creditUsedNpr || 0),
    distributorStatus: u.distributorStatus || "none",
  }));

  const approved = list.filter((u) => u.distributorStatus === "approved");

  return (
    <main className="pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <a href={outletEmployeeBasePath(slug, role)} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium mb-4 inline-block">← Back to Workspace</a>
          <h1 className="text-3xl font-bold text-slate-900">Distributor payments</h1>
          <p className="mt-2 text-sm text-slate-500">Receive payment and reduce the used credit score for approved distributors.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6">
          <DistributorPaymentClient distributorId={approved[0]?.id || ""} initialLimit={approved[0]?.creditLimitNpr || 0} initialUsed={approved[0]?.creditUsedNpr || 0} />

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900">Approved distributors</h2>
            <p className="mt-1 text-sm text-slate-500">Select a distributor ID from the list and submit payment from the form on the left.</p>

            <div className="mt-5 space-y-3 max-h-[540px] overflow-auto pr-1">
              {approved.length === 0 && <div className="rounded-2xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">No approved distributors found.</div>}
              {approved.map((u) => (
                <div key={u.id} className="rounded-2xl border border-slate-200 p-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="font-semibold text-slate-900">{u.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{u.businessName || "No business name"}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{u.email}</div>
                    <div className="text-xs text-slate-500 mt-2">Limit: NPR {u.creditLimitNpr.toFixed(0)} · Used: NPR {u.creditUsedNpr.toFixed(0)} · Available: NPR {Math.max(0, u.creditLimitNpr - u.creditUsedNpr).toFixed(0)}</div>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">ID: {u.id}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
