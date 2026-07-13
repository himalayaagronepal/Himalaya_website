"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import ImageUpload from "./ImageUpload";

interface Outlet {
  _id: string;
  name: string;
  slug: string;
  description: string;
  address: string;
  contactPhone: string;
  contactEmail: string;
  profileImage?: string;
  galleryImages?: string[];
  primaryAdmin?: string;
  isActive: boolean;
  createdAt: string;
}

interface OutletManagementClientProps {
  initialOutlets: Outlet[];
}

export default function OutletManagementClient({ initialOutlets }: OutletManagementClientProps) {
  const router = useRouter();
  const [outlets, setOutlets] = useState<Outlet[]>(initialOutlets);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingOutletId, setEditingOutletId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [profileImage, setProfileImage] = useState<string[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    address: "",
    contactPhone: "",
    contactEmail: "",
    adminName: "",
    adminEmail: "",
    adminUsername: "",
    adminPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/outlets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          profileImage: profileImage[0] || "",
          galleryImages,
          admin: {
            name: formData.adminName,
            email: formData.adminEmail,
            username: formData.adminUsername,
            password: formData.adminPassword,
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create outlet");
      }

      const json = await res.json();
      const newOutlet = json.outlet || json;
      setOutlets((prev) => [newOutlet, ...prev]);
      resetForm();
      setIsCreateModalOpen(false);
      toast.success("Outlet created successfully");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
      toast.error(err.message || "Failed to create outlet");
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const openEditModal = (outlet: Outlet) => {
    setFormData({
      name: outlet.name,
      slug: outlet.slug,
      description: outlet.description,
      address: outlet.address,
      contactPhone: outlet.contactPhone,
      contactEmail: outlet.contactEmail,
      adminName: "",
      adminEmail: "",
      adminUsername: "",
      adminPassword: "",
    });
    setProfileImage(outlet.profileImage ? [outlet.profileImage] : []);
    setGalleryImages(outlet.galleryImages || []);
    setEditingOutletId(outlet._id);
    setIsEditModalOpen(true);
    setError("");
  };

  const handleUpdateOutlet = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/admin/outlets/${editingOutletId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          address: formData.address,
          contactPhone: formData.contactPhone,
          contactEmail: formData.contactEmail,
          profileImage: profileImage[0] || "",
          galleryImages,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update outlet");
      }

      const updatedOutlet = await res.json();
      setOutlets((prev) =>
        prev.map((outlet) => (outlet._id === editingOutletId ? updatedOutlet : outlet))
      );
      setIsEditModalOpen(false);
      setEditingOutletId(null);
      resetForm();
      toast.success("Outlet updated successfully");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An error occurred");
      toast.error(err.message || "Failed to update outlet");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteOutlet = async (outletId: string, outletName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${outletName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/outlets/${outletId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete outlet");
      }

      setOutlets((prev) => prev.filter((outlet) => outlet._id !== outletId));
      toast.success("Outlet deleted successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete outlet");
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      address: "",
      contactPhone: "",
      contactEmail: "",
      adminName: "",
      adminEmail: "",
      adminUsername: "",
      adminPassword: "",
    });
    setProfileImage([]);
    setGalleryImages([]);
  };

  const closeModals = () => {
    if (!isLoading) {
      setIsCreateModalOpen(false);
      setIsEditModalOpen(false);
      resetForm();
    }
  };

  return (
    <>
      {/* Create/Edit Modal */}
      <AnimatePresence mode="wait">
        {(isCreateModalOpen || isEditModalOpen) && (
          <motion.div
            key="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-slate-900 bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={closeModals}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-slate-200 p-6 sticky top-0 bg-white z-10">
                <h2 className="text-xl font-bold text-slate-900">
                  {isEditModalOpen ? "Edit Outlet" : "Create New Outlet"}
                </h2>
              </div>

              <form
                onSubmit={isEditModalOpen ? handleUpdateOutlet : handleSubmit}
                className="p-6 space-y-4"
              >
                {error && (
                  <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Outlet Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleNameChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                    placeholder="e.g., Downtown Branch"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Slug (Auto-generated)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    readOnly
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none resize-none"
                    placeholder="Brief description of the outlet"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, address: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                    placeholder="Physical address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                    placeholder="+1-800-123-4567"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                    placeholder="contact@outlet.com"
                  />
                </div>

                {!isEditModalOpen && (
                  <div className="pt-2 border-t border-slate-200">
                    <h3 className="text-sm font-semibold text-slate-900 mb-3">
                      Outlet Admin
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={formData.adminName}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, adminName: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                          placeholder="Outlet admin name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          value={formData.adminEmail}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, adminEmail: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                          placeholder="admin@outlet.com"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Username *
                        </label>
                        <input
                          type="text"
                          value={formData.adminUsername}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              adminUsername: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                          placeholder="outlet-admin"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Password *
                        </label>
                        <input
                          type="password"
                          value={formData.adminPassword}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              adminPassword: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                          placeholder="Minimum 8 characters"
                          required
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Profile Picture
                    </label>
                    <ImageUpload
                      images={profileImage}
                      onChange={(next) => setProfileImage(next.slice(0, 1))}
                      multiple={false}
                      uploadEndpoint="/api/admin/upload"
                      label="Upload profile image"
                      helpText="Upload one image for the outlet profile picture."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Gallery
                    </label>
                    <ImageUpload
                      images={galleryImages}
                      onChange={setGalleryImages}
                      uploadEndpoint="/api/admin/upload"
                      label="Upload gallery images"
                      helpText="Upload multiple images for the outlet gallery."
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={closeModals}
                    className="flex-1 px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-medium transition-colors disabled:opacity-50"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? isEditModalOpen
                        ? "Updating..."
                        : "Creating..."
                      : isEditModalOpen
                        ? "Update Outlet"
                        : "Create Outlet"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Outlets List */}
      <div className="space-y-4">
        {outlets.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl border border-slate-200">
            <p className="text-slate-500">No outlets found. Create one to get started.</p>
          </div>
        ) : (
          outlets.map((outlet) => (
            <motion.div
              key={outlet._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-slate-900">{outlet.name}</h3>
                    {outlet.isActive ? (
                      <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full">
                        Inactive
                      </span>
                    )}
                  </div>
                  {outlet.description && (
                    <p className="text-sm text-slate-600 mt-1">{outlet.description}</p>
                  )}
                  {outlet.address && (
                    <p className="text-xs text-slate-500 mt-2">{outlet.address}</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 flex-wrap sm:flex-nowrap">
                  <a
                    href={`/admin/outlets/${outlet._id}/admins`}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Manage Admins
                  </a>
                  <button
                    onClick={() => openEditModal(outlet)}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Edit
                  </button>
                  <a
                    href={`/admin/outlet/${outlet.slug}`}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    View Dashboard
                  </a>
                  <button
                    onClick={() => handleDeleteOutlet(outlet._id, outlet.name)}
                    disabled={isDeleting}
                    className="inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-sm font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* New Outlet Button (floating) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCreateModalOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg flex items-center justify-center transition-colors"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </motion.button>
    </>
  );
}
