"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { outletSectionsFromPermissions, type OutletEmployeeSection } from "../../../lib/permissions";

type Employee = {
  _id: string;
  name?: string | null;
  email: string;
  role: string;
  photo?: string | null;
  shortDescription?: string | null;
  phoneNumber?: string | null;
  permissions?: string[];
  isActive: boolean;
  createdAt?: string | null;
};

const SECTION_LABELS: Record<OutletEmployeeSection, string> = {
  products: "Manage Products",
  orders: "Manage Orders",
  categories: "Manage Categories",
  "outlet-info": "Outlet Info",
};

export default function OutletEmployeeManageClient({ slug }: { slug: string }) {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function fetchEmployees() {
    setLoading(true);
    try {
      const res = await fetch("/api/outlet-admin/employees", { credentials: "same-origin" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to fetch employees");
      setEmployees(json.employees || []);
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchEmployees();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this employee account? This cannot be undone.")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/outlet-admin/employees/${id}`, { method: "DELETE", credentials: "same-origin" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message || "Failed to delete employee");
      setEmployees((prev) => prev.filter((employee) => employee._id !== id));
      toast.success("Employee deleted");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Outlet Employees</h1>
          <p className="mt-1 text-sm text-slate-500">Create and manage accountant and shopkeeper accounts for this outlet.</p>
        </div>
        <Link
          href={`/admin/outlet/${slug}/employees/create`}
          className="inline-flex items-center justify-center rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 text-sm font-medium transition-colors"
        >
          + Create employee
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">Loading employees…</div>
        ) : employees.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">No employees created yet.</div>
        ) : (
          employees.map((employee) => (
            <div key={employee._id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-cyan-50 overflow-hidden flex items-center justify-center shrink-0">
                    {employee.photo ? <img src={employee.photo} alt={employee.name || employee.email} className="h-full w-full object-cover" /> : <span className="text-cyan-700 font-bold">{(employee.name || employee.email || "E")[0].toUpperCase()}</span>}
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{employee.name || "Unnamed employee"}</h3>
                    <p className="text-sm text-slate-500">{employee.email}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                      {outletSectionsFromPermissions(employee.permissions || []).map((section) => (
                        <span key={section} className="rounded-full bg-cyan-50 text-cyan-700 px-2.5 py-1 font-medium">
                          {SECTION_LABELS[section]}
                        </span>
                      ))}
                      {employee.phoneNumber && <span>{employee.phoneNumber}</span>}
                    </div>
                    {employee.shortDescription && <p className="mt-3 text-sm text-slate-600">{employee.shortDescription}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${employee.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                    {employee.isActive ? "Active" : "Inactive"}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDelete(employee._id)}
                    disabled={busyId === employee._id}
                    className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {busyId === employee._id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
