import React from "react";
import { redirect } from "next/navigation";
import { requireSession } from "../../../lib/adminSession";
import AdminEmployeeManageClient from "../../components/admin/AdminEmployeeManageClient";

export const metadata = {
  title: "Employees · Admin",
};

export default async function AdminEmployeesPage() {
  const session = await requireSession();
  if (session.role !== "admin") redirect("/admin");

  return (
    <main className="pb-16">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">Access</span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">Employees</h1>
            <p className="mt-1 text-sm text-slate-500">Create employee accounts and grant per-section admin access.</p>
          </div>
        </div>

        <AdminEmployeeManageClient />
      </div>
    </main>
  );
}
