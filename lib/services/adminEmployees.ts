import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import connectToDatabase from "../mongodb";
import AdminEmployee from "../../models/AdminEmployee";
import User from "../../models/User";
import Employee from "../../models/Employee";
import OutletAdmin from "../../models/OutletAdmin";
import { ADMIN_SECTIONS, type AdminSection } from "../adminAccess";

export type SafeAdminEmployee = {
  _id: string;
  fullName: string;
  email: string;
  role: "employee";
  permissions: string[];
  isActive: boolean;
  createdAt: string | null;
};

function toSafe(doc: any): SafeAdminEmployee {
  return {
    _id: String(doc._id),
    fullName: doc.fullName,
    email: doc.email,
    role: "employee",
    permissions: Array.isArray(doc.permissions) ? doc.permissions : [],
    isActive: !!doc.isActive,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
  };
}

export function normalizeSectionPermissions(permissions: unknown): AdminSection[] {
  const list = Array.isArray(permissions) ? permissions : [];
  // "employees" is excluded — granting it would let an employee manage other
  // employee accounts (and their own permissions), which stays admin-only.
  const valid = new Set<string>((ADMIN_SECTIONS as readonly string[]).filter((s) => s !== "employees"));
  return Array.from(new Set(list.map((p) => String(p || "").trim()).filter((p) => valid.has(p)))) as AdminSection[];
}

export async function listEmployees(): Promise<SafeAdminEmployee[]> {
  await connectToDatabase();
  const employees = await AdminEmployee.find({}).sort({ createdAt: -1 }).lean();
  return employees.map(toSafe);
}

export async function emailInUse(email: string): Promise<boolean> {
  await connectToDatabase();
  const [user, adminEmployee, employee, outletAdmin] = await Promise.all([
    User.findOne({ email }).lean(),
    AdminEmployee.findOne({ email }).lean(),
    Employee.findOne({ email }).lean(),
    OutletAdmin.findOne({ email }).lean(),
  ]);
  return Boolean(user || adminEmployee || employee || outletAdmin);
}

export async function createEmployee(input: {
  fullName: string;
  email: string;
  password: string;
  permissions: unknown;
}): Promise<SafeAdminEmployee> {
  await connectToDatabase();
  const passwordHash = await bcrypt.hash(input.password, 10);
  const employee = new AdminEmployee({
    fullName: input.fullName,
    email: input.email,
    password: passwordHash,
    role: "employee",
    permissions: normalizeSectionPermissions(input.permissions),
  });
  await employee.save();
  return toSafe(employee);
}

export async function deleteEmployee(id: string): Promise<boolean> {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  await connectToDatabase();
  const target = await AdminEmployee.findById(id);
  if (!target) return false;
  await target.deleteOne();
  return true;
}
