"use client";

import React from "react";
import { can, type AdminSection } from "../../../lib/adminAccess";

export type AdminAccessValue = {
  isAdmin: boolean;
  permissions: string[];
  email: string;
  role: "admin" | "admin-employee";
};

const AdminAccessContext = React.createContext<AdminAccessValue | null>(null);

export function AdminAccessProvider({
  value,
  children,
}: {
  value: AdminAccessValue;
  children: React.ReactNode;
}) {
  return <AdminAccessContext.Provider value={value}>{children}</AdminAccessContext.Provider>;
}

export function useAdminAccess(): AdminAccessValue {
  const ctx = React.useContext(AdminAccessContext);
  if (!ctx) throw new Error("useAdminAccess must be used within an AdminAccessProvider");
  return ctx;
}

/** Shared "what can this user access" check — same definition used by sidebar, route gate, and APIs. */
export function useCan() {
  const access = useAdminAccess();
  return (section: AdminSection | string) => can(access, section);
}
