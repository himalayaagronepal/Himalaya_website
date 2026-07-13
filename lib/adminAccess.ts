/**
 * Client-safe admin-portal access primitives: section vocabulary, the shared
 * `can()` check, and route→permission mapping. No server-only imports here —
 * this module is consumed directly by client components (sidebar, gate, forms).
 * Server-side session reading lives in ./adminSession.
 */

/**
 * Admin portal sections. These double as the permission-grant vocabulary for
 * AdminEmployee accounts (an employee granted "products" can see/use the
 * Products section, etc).
 */
export const ADMIN_SECTIONS = [
  "home",
  "about",
  "products",
  "categories",
  "orders",
  "news",
  "gallery",
  "contact",
  "users",
  "outlets",
  "employees",
] as const;

export type AdminSection = (typeof ADMIN_SECTIONS)[number];

/**
 * "admin-employee" identifies accounts from the new AdminEmployee collection.
 * It's distinct from the legacy outlet-scoped "employee" role (accountant/
 * shopkeeper, colon-style permissions like "orders:read") so the two systems
 * don't get conflated in the shared session shape.
 */
export type AdminSession = {
  sub: string;
  email: string;
  role: "admin" | "admin-employee";
  permissions: string[];
};

/**
 * Single source of truth for "what can this user access" — used by the
 * sidebar, PermissionGate, and admin API routes alike so the rules can't drift.
 */
export function can(session: Pick<AdminSession, "role" | "permissions">, section: string): boolean {
  return session.role === "admin" || session.permissions.includes(section);
}

/** Maps admin URL path prefixes to the permission required to access them. */
export const ROUTE_PERMISSIONS: { permission: AdminSection; prefixes: string[] }[] = [
  { permission: "home", prefixes: ["/admin/home"] },
  { permission: "about", prefixes: ["/admin/about"] },
  { permission: "products", prefixes: ["/admin/products"] },
  { permission: "categories", prefixes: ["/admin/categories"] },
  { permission: "orders", prefixes: ["/admin/orders"] },
  { permission: "news", prefixes: ["/admin/news"] },
  { permission: "gallery", prefixes: ["/admin/gallery"] },
  { permission: "contact", prefixes: ["/admin/contact"] },
  { permission: "users", prefixes: ["/admin/users"] },
  { permission: "outlets", prefixes: ["/admin/outlets"] },
  { permission: "employees", prefixes: ["/admin/employees"] },
];

/** Returns the permission required for a given admin pathname, or null if none apply. */
export function permissionForPath(pathname: string): AdminSection | null {
  for (const entry of ROUTE_PERMISSIONS) {
    if (entry.prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
      return entry.permission;
    }
  }
  return null;
}
