"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import ImageUpload from "./ImageUpload";
import { OUTLET_EMPLOYEE_SECTIONS, type OutletEmployeeSection } from "../../../lib/permissions";

const SECTION_LABELS: Record<OutletEmployeeSection, string> = {
  products: "Manage Products",
  orders: "Manage Orders",
  categories: "Manage Categories",
  "outlet-info": "Outlet Info",
};

export default function OutletEmployeeCreateForm({ slug }: { slug: string }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState<string[]>([]);
  const [sections, setSections] = useState<Set<OutletEmployeeSection>>(new Set());
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phoneNumber: "",
    shortDescription: "",
  });

  function toggleSection(section: OutletEmployeeSection) {
    setSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.email || !formData.password) return toast.error("Email and password are required");
    if (formData.password.length < 8) return toast.error("Password must be at least 8 characters");
    if (sections.size === 0) return toast.error("Select at least one section to grant access to");

    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/outlet-admin/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, photo: photo[0] || "", sections: Array.from(sections) }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed to create employee");
      toast.success("Employee created");
      router.push(`/admin/outlet/${slug}/employees`);
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleCreate} className="space-y-6 bg-white border border-slate-200/60 rounded-2xl p-5 sm:p-6 shadow-sm">
      {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Name</label>
          <input
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            placeholder="Jane Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            placeholder="jane@himalaya.com"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Password *</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
          placeholder="Min 8 characters"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Section access *</label>
        <p className="text-xs text-slate-500 mb-3">Choose which parts of the outlet console this employee can manage.</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {OUTLET_EMPLOYEE_SECTIONS.map((section) => {
            const checked = sections.has(section);
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
                <span className="font-medium">{SECTION_LABELS[section]}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
          <input
            value={formData.phoneNumber}
            onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Short Description</label>
          <input
            value={formData.shortDescription}
            onChange={(e) => setFormData((prev) => ({ ...prev, shortDescription: e.target.value }))}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Photo</label>
        <ImageUpload
          images={photo}
          onChange={setPhoto}
          multiple={false}
          uploadEndpoint="/api/outlet-admin/upload"
          label="Upload employee photo"
          helpText="Upload one image for the employee profile."
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? "Creating…" : "Create employee"}
        </button>
        <button
          type="button"
          onClick={() => router.push(`/admin/outlet/${slug}/employees`)}
          className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
