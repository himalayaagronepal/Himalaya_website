import React from "react";
import { redirect } from "next/navigation";
import { requireSession } from "../../../../lib/adminSession";
import AdminEmployeeCreateForm from "../../../components/admin/AdminEmployeeCreateForm";

export const metadata = {
  title: "Create Employee · Admin",
};

export default async function AdminEmployeeCreatePage() {
  const session = await requireSession();
  if (session.role !== "admin") redirect("/admin");

  return (
    <main className="pb-16">
      <div className="max-w-3xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">Access</span>
          <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">Create employee</h1>
          <p className="mt-1 text-sm text-slate-500">Set up an account and choose which admin sections they can access.</p>
        </div>

        <AdminEmployeeCreateForm />
      </div>
    </main>
  );
}
