import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import authOptions from "../../lib/auth";
import { adminLandingForPermissions, outletEmployeeLandingPath } from "../../lib/permissions";

export default async function AdminIndex() {
  const session = (await getServerSession(authOptions as any)) as any;
  // If not signed-in, send to login (middleware also handles protection)
  if (!session) return redirect(`/login?from=/admin/dashboard`);
  // signed-in users — if admin, go to dashboard, otherwise show forbidden page
  if (session.user?.role === "admin") return redirect(`/admin/dashboard`);
  if (session.user?.role === "employee") return redirect(outletEmployeeLandingPath(session.user));
  const permissions = Array.isArray(session.user?.permissions) ? session.user.permissions : [];
  if (permissions.length > 0) return redirect(adminLandingForPermissions(permissions));
  return redirect(`/`);
}
