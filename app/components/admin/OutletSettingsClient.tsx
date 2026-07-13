"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import ImageUpload from "./ImageUpload";

type Outlet = {
  _id: string;
  name: string;
  description?: string;
  address?: string;
  contactPhone?: string;
  contactEmail?: string;
  profileImage?: string;
  galleryImages?: string[];
};

export default function OutletSettingsClient({
  initialOutlet,
  updateEndpoint = "/api/outlet-admin/outlet",
  uploadEndpoint = "/api/outlet-admin/upload",
}: {
  initialOutlet: Outlet;
  updateEndpoint?: string;
  uploadEndpoint?: string;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: initialOutlet.name || "",
    description: initialOutlet.description || "",
    address: initialOutlet.address || "",
    contactPhone: initialOutlet.contactPhone || "",
    contactEmail: initialOutlet.contactEmail || "",
    profileImage: initialOutlet.profileImage ? [initialOutlet.profileImage] : [],
    galleryImages: initialOutlet.galleryImages || [],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch(updateEndpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          profileImage: formData.profileImage[0] || "",
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Failed to update outlet");
      toast.success("Outlet updated");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-slate-900">Outlet Information</h2>
          <p className="mt-1 text-sm text-slate-500">Update the public-facing outlet profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Outlet Name *</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number</label>
              <input
                value={formData.contactPhone}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Contact Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
              <input
                value={formData.address}
                onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Short Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Profile Picture</label>
              <ImageUpload
                images={formData.profileImage}
                onChange={(next) => setFormData((prev) => ({ ...prev, profileImage: next.slice(0, 1) }))}
                multiple={false}
                uploadEndpoint={uploadEndpoint}
                label="Upload profile picture"
                helpText="Upload one image for the outlet profile."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Gallery</label>
              <ImageUpload
                images={formData.galleryImages}
                onChange={(next) => setFormData((prev) => ({ ...prev, galleryImages: next }))}
                uploadEndpoint={uploadEndpoint}
                label="Upload gallery images"
                helpText="Upload multiple images for the outlet gallery."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}