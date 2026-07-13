import mongoose, { Document, Model, Schema } from "mongoose";
import bcrypt from "bcryptjs";

export interface IOutletAdmin extends Document {
  outlet: mongoose.Types.ObjectId;
  username: string;
  email: string;
  password: string;
  name?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OutletAdminSchema: Schema<IOutletAdmin> = new mongoose.Schema(
  {
    outlet: { type: mongoose.Schema.Types.ObjectId, ref: "Outlet", required: true, index: true },
    username: { type: String, required: true, lowercase: true },
    email: { type: String, required: true, lowercase: true, unique: true, index: true },
    password: { type: String, required: true },
    name: { type: String },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Hash password before saving if it's been modified and not already hashed
OutletAdminSchema.pre<IOutletAdmin>("save", async function () {
  if (!this.isModified("password")) return;

  // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
  if (this.password.startsWith("$2a$") || this.password.startsWith("$2b$") || this.password.startsWith("$2y$")) {
    return;
  }

  const hashedPassword = await bcrypt.hash(this.password, 10);
  this.password = hashedPassword;
});

OutletAdminSchema.index({ outlet: 1, username: 1 }, { unique: true });

const OutletAdmin: Model<IOutletAdmin> = (mongoose.models.OutletAdmin as Model<IOutletAdmin>) || mongoose.model<IOutletAdmin>("OutletAdmin", OutletAdminSchema);
export default OutletAdmin;
