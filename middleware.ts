import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { hasPermission, permissionForAdminApi } from "./lib/permissions";

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const outletMatch = pathname.match(/^\/admin\/outlet-([^/]+)(.*)$/);
  if (outletMatch) {
    const [, slug, rest = ""] = outletMatch;
    return NextResponse.rewrite(new URL(`/admin/outlet/${slug}${rest}`, req.url));
  }

  // allow next internals, static files, and auth endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth") ||
    // Admin two-step login pre-check runs BEFORE a session exists, so it must be
    // public. It only reports whether a 2FA code is required and never issues a
    // session (and is itself rate-limited). Keep this scoped to /api/admin/login
    // so the protected /api/admin/2fa/* management routes stay gated below.
    pathname.startsWith("/api/admin/login") ||
    PUBLIC_FILE.test(pathname) ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Protect admin *APIs* at the edge (defense-in-depth on top of per-handler checks).
  // NOTE: this must be tested against `/api/admin` (not `/admin`) — the previous code
  // nested this under `startsWith("/admin")`, which `/api/admin/*` never satisfies, so
  // the entire enforcement was dead and admin APIs (e.g. /api/admin/upload) were exposed.
  if (pathname.startsWith("/api/admin")) {
    if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const required = permissionForAdminApi(pathname, req.method);
    if (required) {
      const requiredList = Array.isArray(required) ? required : [required];
      const allowed = requiredList.some((perm) => hasPermission(token as any, perm));
      if (!allowed) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
      return NextResponse.next();
    }
    // Endpoints without an explicit permission mapping (users/employees/outlets) are
    // admin-area APIs: require an admin, admin-employee, or outlet-staff token here;
    // the handler still performs the precise role/permission check.
    const role = (token as any).role;
    if (role !== "admin" && role !== "admin-employee" && role !== "employee") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next();
  }

  const adminProtected = pathname.startsWith("/admin");
  const employeeProtected = pathname.startsWith("/employee");

  if (adminProtected) {
    // For page routes under /admin, allow the request through — the layout performs a
    // server-side session check and renders a friendly fallback when appropriate.
    // Forward the pathname so the (pathname-less) server layout can tell the
    // login route apart from the rest of the gated admin tree.
    const response = NextResponse.next();
    response.headers.set("x-pathname", pathname);
    return response;
  }

  if (employeeProtected) {
    if (!token) {
      const url = new URL("/login", req.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
    const role = (token as any).role;
    if (role !== "employee" && role !== "admin") return NextResponse.redirect(new URL("/", req.url));
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/employee", "/employee/:path*", "/api/admin/:path*"]
};