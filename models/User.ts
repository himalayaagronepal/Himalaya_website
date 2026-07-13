import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IUser extends Document {
  name?: string;
  email: string;
  password?: string;
  /** @deprecated No longer persisted (plaintext storage removed for security). Always undefined.
   *  Kept on the type only so legacy admin read sites compile; remove with the "view password" UI. */
  rawPassword?: string;
  role: "user" | "admin" | "distributor";
  distributorStatus?: "none" | "pending" | "approved" | "rejected";
  phoneNumber?: string;
  businessName?: string;
  creditLimitNpr?: number;
  creditUsedNpr?: number;
  isActive?: boolean;
  citizenshipFront?: string; // Cloudinary URL
  citizenshipBack?: string; // Cloudinary URL
  panCertificate?: string; // Cloudinary URL
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true, index: true },
    password: { type: String },
    role: { type: String, enum: ["user", "admin", "distributor"], default: "user" },
    distributorStatus: { type: String, enum: ["none", "pending", "approved", "rejected"], default: "none" },
    phoneNumber: { type: String, index: true },
    businessName: { type: String },
    creditLimitNpr: { type: Number, default: 0, min: 0 },
    creditUsedNpr: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
    citizenshipFront: { type: String }, // Cloudinary URL
    citizenshipBack: { type: String }, // Cloudinary URL
    panCertificate: { type: String }, // Cloudinary URL
  },
  { timestamps: true }
);

UserSchema.pre("save", async function () {
  const user = this as IUser;
  // Be defensive: `isModified` is a mongoose instance method; cast to any to
  // keep TypeScript happy in this hook.
  const isModifiedFn = (user as any).isModified;
  if (!isModifiedFn || typeof isModifiedFn !== "function") return;
  if (!isModifiedFn.call(user, "password")) return;
  if (!user.password) return;

  // If a bcrypt hash was already assigned (e.g. from a script), skip hashing to
  // avoid double-hashing. bcrypt hashes start with $2a$ / $2b$ / $2y$, e.g. "$2b$10$...".
  if (/^\$2[aby]\$\d{2}\$/.test(user.password)) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
});

UserSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.password || "");
};

const User: Model<IUser> = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>("User", UserSchema);
export default User;