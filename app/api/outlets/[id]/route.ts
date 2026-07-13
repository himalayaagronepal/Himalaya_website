import { NextResponse } from "next/server";
import connectToDatabase from "../../../../lib/mongodb";
import Outlet from "../../../../models/Outlet";
import Employee from "../../../../models/Employee";
import OutletAdmin from "../../../../models/OutletAdmin";

export async function GET(req: Request, context: any) {
  try {
    const params = context.params instanceof Promise ? await context.params : context.params;
    const { id } = params;
    await connectToDatabase();

    const outlet = await Outlet.findById(id).lean();
    if (!outlet) return NextResponse.json({ message: "Outlet not found" }, { status: 404 });

    const employees = await Employee.find({ outlet: id, isActive: true }).lean();
    const admins = await OutletAdmin.find({ outlet: id, isActive: true }).select("username name").lean();

    const safeEmployees = (employees || []).map((e: any) => ({
      _id: String(e._id),
      name: e.name || null,
      role: e.role,
      photo: e.photo || null,
      shortDescription: e.shortDescription || null,
      phoneNumber: e.phoneNumber || null,
    }));

    const safeAdmins = (admins || []).map((a: any) => ({ _id: String(a._id), username: a.username, name: a.name || null }));

    return NextResponse.json({ outlet, employees: safeEmployees, admins: safeAdmins });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
