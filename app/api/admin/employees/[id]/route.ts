import { NextResponse } from "next/server";
import { getSessionFromCookies } from "../../../../../lib/adminSession";
import { deleteEmployee } from "../../../../../lib/services/adminEmployees";

export async function DELETE(req: Request, context: any) {
  const session = await getSessionFromCookies();
  if (!session) return NextResponse.json({ message: "Authentication required" }, { status: 401 });
  if (session.role !== "admin") return NextResponse.json({ message: "Admin role required" }, { status: 403 });

  const params = (await Promise.resolve(context?.params)) as { id?: string } | undefined;
  const id = params?.id;
  if (!id) return NextResponse.json({ message: "Invalid id" }, { status: 400 });

  const deleted = await deleteEmployee(id);
  if (!deleted) return NextResponse.json({ message: "Employee not found" }, { status: 404 });

  return NextResponse.json({ message: "Deleted" });
}
