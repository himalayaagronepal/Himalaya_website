"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { permissionForPath } from "../../../lib/adminAccess";
import { useAdminAccess, useCan } from "./AdminAccessContext";

/**
 * Client-side double-check on top of the server-side layout gate: maps the
 * current admin pathname to a required section permission and blocks render
 * if the signed-in admin-employee lacks it. Admins always pass through.
 */
export default function PermissionGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const { isAdmin } = useAdminAccess();
  const can = useCan();

  if (isAdmin) return <>{children}</>;

  const required = permissionForPath(pathname);
  if (required && !can(required)) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900">Unauthorized</h2>
          <p className="mt-1.5 text-sm text-slate-500">
            You don't have permission to access this section. Contact an administrator if you believe this is a mistake.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
