"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import React from "react";
import { outletEmployeeSectionPath } from "../../../lib/permissions";
import type { AdminSection } from "../../../lib/adminAccess";

type ShellUser = {
  role?: string;
  permissions?: string[];
  employeeRole?: string;
  outletSlug?: string;
  name?: string;
  email?: string;
};

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
  /** Legacy colon-style permission (e.g. "orders:read") — gates outlet-staff "employee" accounts only. */
  permission?: string;
  /** New section permission (e.g. "orders") — gates "admin-employee" accounts. Omit for admin-only items with no grantable section (e.g. Dashboard). */
  section?: AdminSection;
  adminOnly?: boolean;
};

type NavGroup = {
  label: string;
  icon: React.ReactNode;
  section: AdminSection;
  adminOnly?: boolean;
  basePath: string;
  children: { href: string; label: string }[];
};

const navGroups: NavGroup[] = [
  {
    label: "Home",
    basePath: "/admin/home",
    section: "home",
    adminOnly: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
    children: [
      { href: "/admin/home/hero", label: "Hero Section" },
      { href: "/admin/home/chairperson", label: "Message From Chairperson" },
    ],
  },
  {
    label: "About Us",
    basePath: "/admin/about",
    section: "about",
    adminOnly: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
    children: [
      { href: "/admin/about/who-we-are", label: "Who We Are" },
      { href: "/admin/about/hear-from-md", label: "Hear From MD" },
      { href: "/admin/about/board-of-directors", label: "Board of Directors" },
      { href: "/admin/about/executive-team", label: "Executive Team" },
    ],
  },
];

const navItems: NavItem[] = [
  {
    href: "/admin/dashboard",
    label: "Dashboard",
    adminOnly: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/admin/orders",
    label: "Orders",
    section: "orders",
    permission: "orders:read",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-5-5z" />
        <path d="M15 3v5h5" />
        <line x1="9" y1="13" x2="15" y2="13" />
        <line x1="9" y1="17" x2="13" y2="17" />
      </svg>
    ),
  },
  {
    href: "/admin/products",
    label: "Products",
    section: "products",
    permission: "products:read",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
  {
    href: "/admin/categories",
    label: "Categories",
    section: "categories",
    permission: "categories:read",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "Users",
    section: "users",
    adminOnly: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
  },
  {
    href: "/admin/news",
    label: "News",
    section: "news",
    permission: "news:read",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2" />
        <line x1="10" y1="6" x2="18" y2="6" />
        <line x1="10" y1="10" x2="18" y2="10" />
        <line x1="10" y1="14" x2="14" y2="14" />
      </svg>
    ),
  },
  {
    href: "/admin/employees",
    label: "Employees",
    section: "employees",
    adminOnly: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    href: "/admin/outlets",
    label: "Outlets",
    section: "outlets",
    adminOnly: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3h18v18H3z" />
        <path d="M3 9h18" />
        <path d="M9 3v18" />
        <path d="M15 3v18" />
      </svg>
    ),
  },
  {
    href: "/admin/gallery",
    label: "Gallery",
    section: "gallery",
    adminOnly: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M21 15l-5-5L5 21" />
      </svg>
    ),
  },
  {
    href: "/admin/contact",
    label: "Contact",
    section: "contact",
    adminOnly: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012.18 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.09a16 16 0 006 6l.56-.56a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" />
      </svg>
    ),
  },
  {
    href: "/admin/security",
    label: "Security",
    adminOnly: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M9 12l2 2 4-4" />
      </svg>
    ),
  },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [openGroups, setOpenGroups] = React.useState<Record<string, boolean>>({});
  const { data: session, status } = useSession();

  React.useEffect(() => {
    if (!pathname) return;
    const initial: Record<string, boolean> = {};
    navGroups.forEach((g) => { if (pathname.startsWith(g.basePath)) initial[g.label] = true; });
    setOpenGroups(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => setOpen(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (open && window.innerWidth < 1024) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [open]);
  const isSessionLoading = status === "loading";
  const prefersReducedMotion = useReducedMotion();

  const pageMotion = prefersReducedMotion
    ? {
        initial: false,
        animate: { opacity: 1 },
        exit: { opacity: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 12 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -8 },
        transition: { duration: 0.22, ease: "easeOut" as const },
      };

  const user = session?.user as ShellUser | undefined;
  const role = user?.role;
  const userPermissions = Array.isArray(user?.permissions) ? user.permissions : [];
  const employeeRole = user?.employeeRole;
  const outletSlug = user?.outletSlug;

  function resolveHref(itemHref: string) {
    if (role !== "employee" || !outletSlug || !employeeRole) return itemHref;
    if (itemHref === "/admin/orders") return outletEmployeeSectionPath(outletSlug, employeeRole, "order");
    if (itemHref === "/admin/products") return outletEmployeeSectionPath(outletSlug, employeeRole, "product");
    if (itemHref === "/admin/categories") return outletEmployeeSectionPath(outletSlug, employeeRole, "categories");
    return itemHref;
  }

  // Single shared "what can this user access" check — same definition as
  // PermissionGate and the admin API routes (see lib/adminAccess.ts `can`).
  const isAdmin = role === "admin";
  const canSection = (section?: AdminSection) => isAdmin || (!!section && userPermissions.includes(section));

  const visibleNavItems = navItems.filter((item) => {
    if (isAdmin) return true;
    if (role === "admin-employee") return canSection(item.section);
    if (role !== "employee") return false;
    // Legacy outlet-staff accounts: gated by colon-style permissions, never see admin-only items.
    if (item.adminOnly) return false;
    if (!item.permission) return true;
    return userPermissions.includes("*") || userPermissions.includes(item.permission);
  });

  const visibleNavGroups = navGroups.filter((group) => {
    if (isAdmin) return true;
    if (role === "admin-employee") return canSection(group.section);
    return false;
  });

  const profileName = user?.name || user?.email || (isAdmin ? "Admin" : "Employee");
  const profileRole = isAdmin
    ? "Administrator"
    : role === "admin-employee"
      ? "Employee"
      : user?.employeeRole
        ? String(user.employeeRole)
            .split("_")
            .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
            .join(" ")
        : "Employee";
  const accessBadge = isAdmin ? "Admin / Full Access" : role === "admin-employee" ? "Employee / Limited Access" : null;
  const profileInitial = String(profileName || "U").charAt(0).toUpperCase();

  if (pathname?.startsWith("/admin/login")) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-clip">
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={`fixed left-0 top-0 z-50 h-[100dvh] w-[85%] max-w-[280px] sm:w-[270px] flex flex-col bg-slate-900 transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 px-5 pt-6 pb-5 hover:opacity-90 transition-opacity">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500 text-white text-sm font-bold">
            H
          </div>
          <span className="text-cyan-400 text-[15px] font-semibold tracking-wide">
            Himalaya Agro
          </span>
        </Link>
        {/* Close button (mobile) */}
        <div className="px-5 -mt-2 mb-1 lg:hidden">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-white transition-colors p-1"
            aria-label="Close sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="h-px bg-slate-700/50 mx-4" />

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleNavItems.map((item) => {
            const resolvedHref = resolveHref(item.href);
            const isActive = pathname === resolvedHref || (resolvedHref !== "/admin/dashboard" && pathname?.startsWith(resolvedHref));
            return (
              <Link
                key={resolvedHref}
                href={resolvedHref}
                onClick={() => {
                  if (window.innerWidth < 1024) setOpen(false);
                }}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-cyan-500/15 text-cyan-400"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                <span className={isActive ? "text-cyan-400" : "text-slate-500"}>{item.icon}</span>
                {item.label}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />
                )}
              </Link>
            );
          })}
          {!isSessionLoading && visibleNavItems.length === 0 && (
            <div className="px-3 py-2 text-xs text-slate-500">No admin modules assigned to this account.</div>
          )}

          {/* Collapsible page groups */}
          {visibleNavGroups.map((group) => {
            const isGroupActive = pathname?.startsWith(group.basePath) ?? false;
            const isOpen = openGroups[group.label] ?? false;
            return (
              <div key={group.label}>
                <button
                  type="button"
                  onClick={() => setOpenGroups((prev) => ({ ...prev, [group.label]: !prev[group.label] }))}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                    isGroupActive
                      ? "bg-cyan-500/15 text-cyan-400"
                      : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                  }`}
                >
                  <span className={isGroupActive ? "text-cyan-400" : "text-slate-500"}>{group.icon}</span>
                  <span className="flex-1 text-left">{group.label}</span>
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"
                    className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="ml-9 mt-0.5 space-y-0.5">
                    {group.children.map((child) => {
                      const isActive = pathname === child.href;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => { if (window.innerWidth < 1024) setOpen(false); }}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-medium transition-all duration-200 ${
                            isActive
                              ? "bg-cyan-500/15 text-cyan-400"
                              : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: isActive ? "rgb(34 211 238)" : "rgb(100 116 139)" }} />
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="h-px bg-slate-700/50 mx-4" />

        {/* Home button */}
        <div className="px-3 py-3">
          <Link
            href="/"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition-all duration-200"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Back to Home
          </Link>
        </div>

        <div className="h-px bg-slate-700/50 mx-4" />

        {/* Bottom: Profile & Sign Out */}
        <div className="px-3 py-4 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-700 text-cyan-400 text-sm font-bold flex-shrink-0">
            {profileInitial}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-medium text-slate-200 truncate">{profileName}</div>
            <div className="text-[11px] text-slate-500">{profileRole}</div>
            {accessBadge && (
              <span className={`mt-1 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold ${isAdmin ? "bg-cyan-500/15 text-cyan-400" : "bg-amber-500/15 text-amber-400"}`}>
                {accessBadge}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={async () => {
              try {
                await signOut({ redirect: false });
              } catch (_) {
                // ignore
              }
              // Clear auth cookies
              document.cookie.split(";").forEach((c) => {
                const name = c.split("=")[0].trim();
                document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
              });
              window.location.href = "/login";
            }}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-red-500/15 hover:text-red-400 transition-all duration-200 flex-shrink-0"
            title="Sign out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`min-h-screen transition-all duration-300 ease-in-out ${open ? "lg:ml-[270px]" : "lg:ml-0"}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="flex items-center gap-3 px-4 sm:px-6 h-14">
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              aria-label={open ? "Close navigation" : "Open navigation"}
              aria-expanded={open}
              aria-controls="admin-sidebar"
            >
              {open ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>

            <div className="hidden sm:block text-sm font-medium text-slate-400 capitalize">
              {pathname?.replace("/admin/", "").replace(/\//g, " › ") || "Dashboard"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={pathname || "admin"}
            className="p-3 sm:p-5 lg:p-8 min-w-0"
            {...pageMotion}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
