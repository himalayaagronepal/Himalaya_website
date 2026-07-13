export const EMPLOYEE_ROLE_PERMISSIONS: Record<string, string[]> = {
  accountant: ["orders:read", "orders:write"],
  shopkeeper: ["products:read", "products:write", "categories:read", "categories:write"],
};

const LEGACY_EMPLOYEE_ROLE_PERMISSIONS: Record<string, string[]> = {
  product_manager: ["products:read", "products:write"],
  reporter: ["news:read", "news:write", "news:delete"],
};

export const EMPLOYEE_ROLES = Object.keys(EMPLOYEE_ROLE_PERMISSIONS);

/**
 * New-style outlet employee accounts are granted access by section — chosen
 * freely by the outlet admin at creation time — rather than a fixed
 * accountant/shopkeeper role (mirrors the main admin's AdminEmployee system).
 */
export const OUTLET_EMPLOYEE_SECTIONS = ["products", "orders", "categories", "outlet-info"] as const;
export type OutletEmployeeSection = (typeof OUTLET_EMPLOYEE_SECTIONS)[number];

const OUTLET_SECTION_PERMISSIONS: Record<OutletEmployeeSection, string[]> = {
  products: ["products:read", "products:write"],
  orders: ["orders:read", "orders:write"],
  categories: ["categories:read", "categories:write"],
  "outlet-info": ["outlet:read", "outlet:write"],
};

export function normalizeOutletEmployeeSections(sections: unknown): OutletEmployeeSection[] {
  const list = Array.isArray(sections) ? sections : [];
  const valid = new Set<string>(OUTLET_EMPLOYEE_SECTIONS);
  return Array.from(new Set(list.map((s) => String(s || "").trim()).filter((s) => valid.has(s)))) as OutletEmployeeSection[];
}

export function permissionsForOutletSections(sections: OutletEmployeeSection[]): string[] {
  const perms = new Set<string>();
  for (const section of sections) {
    for (const perm of OUTLET_SECTION_PERMISSIONS[section] || []) perms.add(perm);
  }
  return Array.from(perms);
}

/**
 * Gates access to a shared outlet-console page/route for the outlet's own admin
 * (full access) and section-granted "employee" accounts (granular access) alike.
 * Global admins can browse any outlet's console for support purposes.
 */
export function hasOutletSectionAccess(user: any, slug: string, permission: string): boolean {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (user.role === "outlet-admin") return user.outletSlug === slug;
  if (user.role === "employee" && user.outletSlug === slug) {
    const perms = Array.isArray(user.permissions) ? user.permissions : [];
    return perms.includes(permission);
  }
  return false;
}

/** Reverse of permissionsForOutletSections — used to display granted sections from stored permissions. */
export function outletSectionsFromPermissions(permissions: string[] = []): OutletEmployeeSection[] {
  return OUTLET_EMPLOYEE_SECTIONS.filter((section) =>
    (OUTLET_SECTION_PERMISSIONS[section] || []).some((perm) => permissions.includes(perm))
  );
}

export function normalizePermissions(permissions: string[] = []) {
  const normalized = permissions.map((p) => String(p || "").trim()).filter(Boolean);
  return Array.from(new Set(normalized));
}

export function getDefaultPermissionsForRole(role: string) {
  if (EMPLOYEE_ROLE_PERMISSIONS[role]) return [...EMPLOYEE_ROLE_PERMISSIONS[role]];
  if (LEGACY_EMPLOYEE_ROLE_PERMISSIONS[role]) return [...LEGACY_EMPLOYEE_ROLE_PERMISSIONS[role]];
  return [];
}

export function resolvePermissionsForEmployee(role: string, permissions?: string[]) {
  if (Array.isArray(permissions) && permissions.length > 0) {
    return normalizePermissions(permissions);
  }
  return normalizePermissions(getDefaultPermissionsForRole(role));
}

export function hasPermission(user: any, permission: string) {
  if (!user) return false;
  if (user.role === "admin") return true;
  const perms = Array.isArray(user.permissions) ? user.permissions : [];
  if (perms.includes("*")) return true;
  if (perms.includes(permission)) return true;
  // "admin-employee" accounts grant whole sections (e.g. "products") rather than
  // colon-style read/write/delete permissions — a section grant satisfies any
  // colon-suffixed permission for that same section (e.g. "products:read").
  if (user.role === "admin-employee") {
    const section = permission.split(":")[0];
    if (perms.includes(section)) return true;
  }
  return false;
}

export function permissionForAdminApi(pathname: string, method: string) {
  if (!pathname.startsWith("/api/admin")) return null;

  if (pathname.startsWith("/api/admin/news")) {
    if (method === "GET") return "news:read";
    if (method === "DELETE") return "news:delete";
    return "news:write";
  }

  // Notices live alongside news in the admin "News" section and reuse its permissions.
  if (pathname.startsWith("/api/admin/notices")) {
    if (method === "GET") return "news:read";
    if (method === "DELETE") return "news:delete";
    return "news:write";
  }

  // The dummy-content toggles (news/notices) are managed from the News section.
  if (pathname.startsWith("/api/admin/content-settings")) {
    return method === "GET" ? "news:read" : "news:write";
  }

  if (pathname.startsWith("/api/admin/upload")) {
    return ["products:write", "news:write"];
  }

  if (pathname.startsWith("/api/admin/cloudinary")) {
    return ["products:write", "news:write"];
  }

  if (pathname.startsWith("/api/admin/products")) {
    return method === "GET" ? "products:read" : "products:write";
  }

  if (pathname.startsWith("/api/admin/categories")) {
    return method === "GET" ? "categories:read" : "categories:write";
  }

  if (pathname.startsWith("/api/admin/orders")) {
    return method === "GET" ? "orders:read" : "orders:write";
  }

  return null;
}

const SECTION_LANDING_PATHS: Record<string, string> = {
  // "home" and "about" have no page at their base path — only nested pages
  // (e.g. /admin/home/chairperson) — landing on the bare prefix would fall
  // through to the /admin/[slug] outlet-dashboard route and redirect-loop
  // back here for non-admin/outlet-admin roles.
  home: "/admin/home/chairperson",
  about: "/admin/about/who-we-are",
  products: "/admin/products",
  categories: "/admin/categories",
  orders: "/admin/orders",
  news: "/admin/news",
  gallery: "/admin/gallery",
  contact: "/admin/contact",
  users: "/admin/users",
  outlets: "/admin/outlets",
  employees: "/admin/employees",
};

export function adminLandingForPermissions(permissions: string[] = []) {
  if (permissions.includes("orders:read")) return "/admin/orders";
  if (permissions.includes("products:read")) return "/admin/products";
  if (permissions.includes("news:read")) return "/admin/news";
  if (permissions.includes("categories:read")) return "/admin/categories";
  // "admin-employee" accounts store plain section names (e.g. "products")
  // rather than colon-style permissions — land on their first granted section.
  for (const permission of permissions) {
    if (SECTION_LANDING_PATHS[permission]) return SECTION_LANDING_PATHS[permission];
  }
  return "/admin/dashboard";
}

export function outletEmployeeLandingPath(user: any) {
  const slug = user?.outletSlug;
  const employeeRole = user?.employeeRole;

  if (!slug) return "/employee";
  // Legacy accountant/shopkeeper accounts keep their dedicated dashboards;
  // newer section-based grants land on the shared outlet console (each page
  // there is gated per-section, so the employee only sees what they're granted).
  if (employeeRole === "accountant") return `/admin/outlet-${slug}/accountant`;
  if (employeeRole === "shopkeeper") return `/admin/outlet-${slug}/shopkeeper`;
  return `/admin/outlet/${slug}`;
}

export function outletEmployeeSectionPath(slug: string, employeeRole: string, section: "order" | "product" | "categories") {
  if (!slug || !employeeRole) return "/employee";
  return `/admin/outlet-${slug}/${employeeRole}/${section}`;
}
