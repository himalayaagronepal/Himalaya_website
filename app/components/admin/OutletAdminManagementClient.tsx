"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { CalendarDays, Eye, EyeOff, Mail, Plus, ShieldCheck, Users, X } from "lucide-react";
import { Div as AnimatedDiv, Section as AnimatedSection } from "../AnimatedClient";

interface OutletAdmin {
  _id: string;
  username: string;
  email: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

interface OutletAdminManagementClientProps {
  outletId: string;
  initialAdmins: OutletAdmin[];
  outletName: string;
}

type AdminFormData = {
  name: string;
  email: string;
  username: string;
  password: string;
};

function createEmptyForm(): AdminFormData {
  return {
    name: "",
    email: "",
    username: "",
    password: "",
  };
}

function formatJoinedDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function getAdminInitials(admin: OutletAdmin) {
  const source = (admin.name || admin.username || admin.email || "A").trim();
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all duration-200 focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10";

export default function OutletAdminManagementClient({ outletId, initialAdmins, outletName }: OutletAdminManagementClientProps) {
  const router = useRouter();
  const [admins, setAdmins] = useState<OutletAdmin[]>(initialAdmins);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<AdminFormData>(createEmptyForm);

  const outletLabel = outletName?.trim() || "this outlet";
  const totalAdmins = admins.length;
  const activeAdmins = admins.filter((admin) => admin.isActive).length;
  const inactiveAdmins = totalAdmins - activeAdmins;

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoading) {
        setIsModalOpen(false);
        setError("");
        setShowPassword(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, isLoading]);

  const openModal = () => {
    setError("");
    setShowPassword(false);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isLoading) {
      return;
    }

    setIsModalOpen(false);
    setError("");
    setShowPassword(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/outlets/${outletId}/admins`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { message?: string };
        throw new Error(data.message || "Failed to create admin");
      }

      const newAdmin = (await response.json()) as OutletAdmin;
      setAdmins((prev) => [newAdmin, ...prev]);
      setFormData(createEmptyForm());
      setShowPassword(false);
      setIsModalOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            key="outlet-admin-modal"
            className="fixed inset-0 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <motion.button
              type="button"
              aria-label="Close create admin dialog"
              onClick={closeModal}
              disabled={isLoading}
              className="absolute inset-0 h-full w-full cursor-default bg-slate-950/60 backdrop-blur-sm disabled:cursor-not-allowed"
            />

            <div className="relative flex h-full items-end justify-center p-3 sm:items-center sm:p-4">
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="outlet-admin-modal-title"
                aria-describedby="outlet-admin-modal-description"
                initial={{ opacity: 0, y: 28, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 28, scale: 0.98 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl"
              >
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                      <ShieldCheck size={14} />
                      Secure access
                    </span>
                    <h2 id="outlet-admin-modal-title" className="text-xl font-bold text-slate-900 sm:text-2xl">
                      Create outlet admin
                    </h2>
                    <p id="outlet-admin-modal-description" className="text-sm text-slate-500">
                      Add a new administrator for {outletLabel}.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isLoading}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-6">
                  {error ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">
                      {error}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Full name</span>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))}
                        className={inputClassName}
                        placeholder="e.g. Your name"
                        autoComplete="name"
                      />
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Email *</span>
                      <div className="relative">
                        <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                          className={`${inputClassName} pl-10`}
                          placeholder="admin@outlet.com"
                          required
                          autoComplete="email"
                        />
                      </div>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Username *</span>
                      <input
                        type="text"
                        value={formData.username}
                        onChange={(event) => setFormData((prev) => ({ ...prev, username: event.target.value }))}
                        className={inputClassName}
                        placeholder="outlet-admin"
                        required
                        autoComplete="username"
                        spellCheck={false}
                      />
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Password *</span>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={formData.password}
                          onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                          className={`${inputClassName} pr-12`}
                          placeholder="Minimum 8 characters"
                          required
                          minLength={8}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-3 inline-flex items-center justify-center text-slate-400 transition-colors hover:text-slate-700"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </label>
                  </div>

                  <p className="text-xs leading-5 text-slate-400">
                    The password is stored securely and the account becomes available immediately after creation.
                  </p>

                  <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(45,168,218,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-[0_16px_32px_rgba(45,168,218,0.3)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.22" />
                            <path d="M22 12a10 10 0 0 1-10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                          </svg>
                          Creating...
                        </>
                      ) : (
                        <>
                          <Plus size={18} />
                          Create admin
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatedSection
        className="space-y-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <AnimatedDiv
          className="overflow-hidden rounded-[28px] border border-slate-200/70 bg-gradient-to-br from-white via-white to-cyan-50/40 shadow-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="p-5 sm:p-6 lg:p-7">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-2xl space-y-4">
                <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-700">
                  <Users size={14} />
                  Outlet admin roster
                </span>

                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{outletLabel}</h2>
                  <p className="max-w-2xl text-sm leading-6 text-slate-500">
                    Manage outlet administrators with a clean, mobile-first flow that keeps access states and contact details easy to scan.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    onClick={openModal}
                    className="hidden items-center justify-center gap-2 rounded-full bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(45,168,218,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-[0_16px_32px_rgba(45,168,218,0.3)] active:translate-y-0 sm:inline-flex"
                  >
                    <Plus size={18} />
                    Create admin
                  </button>
                  <p className="text-sm text-slate-500">Mobile users can use the floating action button for quick creation.</p>
                </div>
              </div>

              <div className="grid w-full gap-3 sm:grid-cols-3 xl:w-[39rem]">
                <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-700">
                      <Users size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total</p>
                      <p className="mt-0.5 text-2xl font-bold text-slate-900">{totalAdmins}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-400">Admins registered for this outlet</p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                      <ShieldCheck size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Active</p>
                      <p className="mt-0.5 text-2xl font-bold text-slate-900">{activeAdmins}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-400">Accounts currently enabled</p>
                </div>

                <div className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                      <EyeOff size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Inactive</p>
                      <p className="mt-0.5 text-2xl font-bold text-slate-900">{inactiveAdmins}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-400">Accounts waiting to be re-enabled</p>
                </div>
              </div>
            </div>
          </div>
        </AnimatedDiv>

        <AnimatedDiv
          className="space-y-4"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: "easeOut", delay: 0.05 }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Admin roster</h3>
              <p className="text-sm text-slate-500">Changes appear immediately after creation.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{totalAdmins} total</span>
          </div>

          {admins.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-10 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700">
                <Users size={26} />
              </div>
              <h4 className="mt-4 text-lg font-semibold text-slate-900">No admins yet</h4>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Add the first administrator for {outletLabel}. The flow is optimized for both mobile and desktop screens.
              </p>
              <button
                type="button"
                onClick={openModal}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(45,168,218,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-[0_16px_32px_rgba(45,168,218,0.3)]"
              >
                <Plus size={18} />
                Create admin
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {admins.map((admin, index) => (
                <AnimatedDiv
                  key={admin._id}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-200 hover:shadow-lg hover:shadow-cyan-500/5"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, ease: "easeOut", delay: 0.04 * index }}
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 via-emerald-400 to-amber-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${admin.isActive ? "bg-cyan-50 text-cyan-700" : "bg-slate-100 text-slate-500"}`}>
                        {getAdminInitials(admin)}
                      </div>
                      <div className="min-w-0">
                        <h4 className="truncate text-lg font-semibold text-slate-900">{admin.name || admin.username}</h4>
                        <p className="truncate text-sm text-slate-500">@{admin.username}</p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${admin.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}
                    >
                      <ShieldCheck size={12} />
                      {admin.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <dl className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50/90 p-3">
                      <dt className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        <Mail size={12} />
                        Email
                      </dt>
                      <dd className="mt-1 truncate text-sm font-medium text-slate-700">{admin.email}</dd>
                    </div>

                    <div className="rounded-2xl bg-slate-50/90 p-3">
                      <dt className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                        <CalendarDays size={12} />
                        Joined
                      </dt>
                      <dd className="mt-1 text-sm font-medium text-slate-700">{formatJoinedDate(admin.createdAt)}</dd>
                    </div>

                    <div className="rounded-2xl bg-slate-50/90 p-3 sm:col-span-2">
                      <dt className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Username</dt>
                      <dd className="mt-1 truncate text-sm font-medium text-slate-700">{admin.username}</dd>
                    </div>
                  </dl>
                </AnimatedDiv>
              ))}
            </div>
          )}
        </AnimatedDiv>
      </AnimatedSection>

      <motion.button
        type="button"
        onClick={openModal}
        aria-label="Create outlet admin"
        className="fixed bottom-4 right-4 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-cyan-600 text-white shadow-[0_16px_35px_rgba(45,168,218,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-cyan-700 hover:shadow-[0_20px_40px_rgba(45,168,218,0.32)] active:translate-y-0 sm:hidden"
        whileHover={{ y: -2, scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
      >
        <Plus size={24} />
      </motion.button>
    </>
  );
}
