"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-toastify";

type Employee = {
  _id: string;
  fullName: string;
  email: string;
  permissions: string[];
  isActive: boolean;
  createdAt?: string | null;
};

export default function AdminEmployeeManageClient() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/employees", { credentials: "same-origin" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to fetch employees");
      setEmployees(json.employees || []);
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  async function handleDelete(employee: Employee) {
    if (!confirm(`Permanently delete ${employee.fullName || employee.email}? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/admin/employees/${employee._id}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || JSON.stringify(json));
      setEmployees((prev) => prev.filter((e) => e._id !== employee._id));
      toast.success("Employee deleted");
    } catch (err: any) {
      toast.error(err?.message || String(err));
    }
  }

  return (
    <div className="text-slate-900 space-y-5">
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="text-sm text-slate-500">
            Showing <span className="font-semibold text-slate-700">{employees.length}</span> employees
          </div>
          <Link
            href="/admin/employees/create"
            className="rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 text-sm font-medium transition-colors"
          >
            + Create employee
          </Link>
        </div>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-slate-800">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Employee</th>
                <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Permissions</th>
                <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Status</th>
                <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Joined</th>
                <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">Loading…</td></tr>
              )}
              {!loading && employees.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">No employees yet.</td></tr>
              )}
              {!loading && employees.map((emp) => (
                <tr key={emp._id} className="align-top hover:bg-cyan-50/30 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 font-bold text-sm shrink-0">
                        {(emp.fullName || emp.email || "E")[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 truncate text-sm">{emp.fullName || "—"}</div>
                        <div className="text-xs text-slate-400 mt-0.5 truncate">{emp.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {emp.permissions.length === 0 && <span className="text-xs text-slate-400">No sections granted</span>}
                      {emp.permissions.map((p) => (
                        <span key={p} className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-600 capitalize">
                          {p}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${emp.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
                      {emp.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-sm text-slate-500">
                    {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString() : "—"}
                  </td>

                  <td className="px-5 py-3.5">
                    <button
                      className="rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 px-3 py-1 text-xs font-semibold transition-colors"
                      onClick={() => handleDelete(emp)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
