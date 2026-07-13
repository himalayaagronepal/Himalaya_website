import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IAdminEmployee extends Document {
  fullName: string;
  email: string;
  password: string;
  role: "employee";
  permissions: string[];
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const AdminEmployeeSchema: Schema<IAdminEmployee> = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, default: "employee", enum: ["employee"] },
    permissions: { type: [String], default: [] },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

AdminEmployeeSchema.pre("save", async function () {
  const employee = this as IAdminEmployee;
  if (!employee.isModified("password")) return;
  if (/^\$2[aby]\$\d{2}\$/.test(employee.password)) return;
  employee.password = await bcrypt.hash(employee.password, 10);
});

AdminEmployeeSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password || "");
};

const AdminEmployee: Model<IAdminEmployee> =
  (mongoose.models.AdminEmployee as Model<IAdminEmployee>) ||
  mongoose.model<IAdminEmployee>("AdminEmployee", AdminEmployeeSchema, "adminemployees");

export default AdminEmployee;
