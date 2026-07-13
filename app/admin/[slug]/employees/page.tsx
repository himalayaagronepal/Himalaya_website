import React from "react";
import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { redirect, notFound } from "next/navigation";
import authOptions from "../../../../lib/auth";
import connectToDatabase from "../../../../lib/mongodb";
import Outlet from "../../../../models/Outlet";
import Employee from "../../../../models/Employee";
import { serializeMany } from "../../../../lib/serialize";

function roleLabel(role: string) {
  return role.split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export default async function AdminOutletEmployeesPage({ params }: { params: { slug: string } } | { params: Promise<{ slug: string }> }) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug } = resolvedParams;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session) return redirect(`/login?from=/admin/${slug}/employees`);

  if (session.user?.role !== "admin" && session.user?.role !== "outlet-admin") {
    return redirect("/admin/dashboard");
  }

  if (session.user?.role === "outlet-admin" && session.user?.outletSlug !== slug) {
    return redirect(`/admin/${session.user?.outletSlug || "dashboard"}`);
  }

  await connectToDatabase();

  const outlet = await Outlet.findOne({ slug }).lean();
  if (!outlet) return notFound();

  const employees = await Employee.find({ outlet: outlet._id }).sort({ createdAt: -1 }).lean();
  const safeEmployees = serializeMany(employees as any[]);
  const activeCount = safeEmployees.filter((employee: any) => employee.isActive).length;
  const inactiveCount = safeEmployees.length - activeCount;

  return (
    <main className="pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <Link href={`/admin/${slug}`} className="text-cyan-600 hover:text-cyan-700 text-sm font-medium mb-4 inline-block">
              ← Back to Dashboard
            </Link>
            <h1 className="text-3xl font-bold text-slate-900">Employees</h1>
            <p className="mt-2 text-sm text-slate-500">Employee information for {outlet.name}</p>
          </div>
          <Link href="/admin/employees" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition-colors shadow-sm">
            Open Global Employees
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Total Employees</div>
            <div className="mt-2 text-3xl font-bold text-slate-900">{safeEmployees.length}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Active</div>
            <div className="mt-2 text-3xl font-bold text-emerald-600">{activeCount}</div>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Inactive</div>
            <div className="mt-2 text-3xl font-bold text-rose-600">{inactiveCount}</div>
          </div>
        </div>

        <div className="space-y-4">
          {safeEmployees.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">No employees found for this outlet.</div>
          ) : (
            safeEmployees.map((employee: any) => (
              <div key={employee._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-xl bg-cyan-50 overflow-hidden flex items-center justify-center shrink-0">
                      {employee.photo ? (
                        <img src={employee.photo} alt={employee.name || employee.email} className="h-full w-full object-cover" />
                      ) : (
                        <span className="text-cyan-700 font-bold">{(employee.name || employee.email || "E")[0].toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">{employee.name || "Unnamed employee"}</h2>
                      <p className="text-sm text-slate-500">{employee.email}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 font-medium">{roleLabel(employee.role)}</span>
                        {employee.phoneNumber && <span>{employee.phoneNumber}</span>}
                      </div>
                      {employee.shortDescription && <p className="mt-3 text-sm text-slate-600">{employee.shortDescription}</p>}
                    </div>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${employee.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {employee.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}