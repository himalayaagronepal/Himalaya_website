import { getServerSession } from "next-auth/next";
import authOptions from "../../../../../lib/auth";
import connectToDatabase from "../../../../../lib/mongodb";
import Outlet from "../../../../../models/Outlet";
import { outletEmployeeLandingPath } from "../../../../../lib/permissions";

export const OUTLET_EMPLOYEE_ROLES = ["accountant", "shopkeeper"] as const;

export type OutletEmployeeRole = (typeof OUTLET_EMPLOYEE_ROLES)[number];

export type OutletEmployeeRouteParams = {
  slug: string;
  role: string;
};

export type OutletEmployeeRouteRedirect = {
  redirectTo: string;
};

export type OutletEmployeeRouteResolved = {
  session: any;
  slug: string;
  role: OutletEmployeeRole;
  outlet: any;
};

export type OutletEmployeeRouteResult = OutletEmployeeRouteRedirect | OutletEmployeeRouteResolved;

export async function resolveOutletEmployeeRoute(params: OutletEmployeeRouteParams | Promise<OutletEmployeeRouteParams>): Promise<OutletEmployeeRouteResult> {
  const resolvedParams = params instanceof Promise ? await params : params;
  const { slug, role } = resolvedParams;

  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || session.user?.role !== "employee") {
    return { redirectTo: "/login" as const };
  }

  if (session.user?.outletSlug !== slug) {
    return { redirectTo: outletEmployeeLandingPath(session.user) };
  }

  if (!OUTLET_EMPLOYEE_ROLES.includes(role as OutletEmployeeRole)) {
    return { redirectTo: outletEmployeeLandingPath(session.user) };
  }

  if (session.user?.employeeRole !== role) {
    return { redirectTo: outletEmployeeLandingPath(session.user) };
  }

  await connectToDatabase();
  const outlet = await Outlet.findOne({ slug }).lean();
  if (!outlet) {
    return { redirectTo: "/login" as const };
  }

  return { session, slug, role: role as OutletEmployeeRole, outlet };
}

export function outletEmployeeBasePath(slug: string, role: string) {
  return `/admin/outlet/${slug}/${role}`;
}
