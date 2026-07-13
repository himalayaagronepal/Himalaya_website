"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ADMIN_SECTIONS, type AdminSection } from "../../../lib/adminAccess";

function sectionLabel(section: string) {
  return section.split("-").map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

// Granting "employees" access would let an employee manage other employee
// accounts (and their own permissions) — that stays admin-only.
const GRANTABLE_SECTIONS = ADMIN_SECTIONS.filter((section) => section !== "employees");

export default function AdminEmployeeCreateForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [permissions, setPermissions] = useState<Set<AdminSection>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  const allSelected = permissions.size === GRANTABLE_SECTIONS.length;

  function toggleSection(section: AdminSection) {
    setPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }

  function toggleSelectAll() {
    setPermissions(allSelected ? new Set() : new Set(GRANTABLE_SECTIONS));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName.trim()) return toast.error("Full name is required");
    if (!email.trim()) return toast.error("Email is required");
    if (password.length < 8) return toast.error("Password must be at least 8 characters");

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: email.toLowerCase().trim(),
          password,
          permissions: Array.from(permissions),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || JSON.stringify(json));
      toast.success("Employee created");
      router.push("/admin/employees");
      router.refresh();
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6 bg-white border border-slate-200/60 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Full name</label>
          <input
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Jane Doe"
            required
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Email</label>
          <input
            type="email"
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jane@himalaya.com"
            required
          />
        </div>
        <div>
          <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Password</label>
          <input
            type="password"
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 characters"
            required
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Section access</label>
          <button
            type="button"
            onClick={toggleSelectAll}
            className="text-xs font-medium text-cyan-600 hover:text-cyan-700"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
          {GRANTABLE_SECTIONS.map((section) => {
            const checked = permissions.has(section);
            return (
              <label
                key={section}
                className={`flex items-center gap-2.5 rounded-lg border px-3.5 py-2.5 text-sm cursor-pointer transition-colors ${
                  checked ? "border-cyan-500 bg-cyan-50/60 text-cyan-700" : "border-slate-200 bg-slate-50/50 text-slate-600 hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500/30"
                  checked={checked}
                  onChange={() => toggleSection(section)}
                />
                <span className="font-medium">{sectionLabel(section)}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {submitting ? "Creating…" : "Create employee"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/employees")}
          className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
