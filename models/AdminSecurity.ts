import mongoose, { Document, Model, Schema } from "mongoose";

// Per-admin two-factor (TOTP) enrollment, kept in its own collection rather than
// on the User document. Two reasons:
//  1. The primary admin is an ENV account (ADMIN_EMAIL) with no User record, so
//     it has nowhere on a user document to store a secret.
//  2. The User model is read in many storefront/admin paths; keeping 2FA secrets
//     in a separate, narrowly-projected collection avoids accidentally leaking
//     them and keeps the User schema untouched.
//
// `accountKey` is a stable principal identifier, NOT the email, so it survives an
// email change and disambiguates account types:
//   - env admin   -> `env:<lowercased ADMIN_EMAIL>`
//   - DB admin     -> `user:<User _id hex>`
export interface IAdminSecurity extends Document {
  accountKey: string;
  email?: string;
  /** AES-256-GCM encrypted TOTP secret (iv:tag:ciphertext, base64). */
  totpSecret?: string;
  totpEnabled?: boolean;
  /** bcrypt hashes of one-time backup codes; each removed as it is consumed. */
  backupCodes?: string[];
  /** Encrypted secret held only between setup and verify; never used to log in. */
  totpPendingSecret?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AdminSecuritySchema: Schema<IAdminSecurity> = new mongoose.Schema(
  {
    accountKey: { type: String, required: true, unique: true, index: true },
    email: { type: String },
    totpSecret: { type: String },
    totpEnabled: { type: Boolean, default: false },
    backupCodes: { type: [String], default: [] },
    totpPendingSecret: { type: String },
  },
  { timestamps: true }
);

const AdminSecurity: Model<IAdminSecurity> =
  (mongoose.models.AdminSecurity as Model<IAdminSecurity>) ||
  mongoose.model<IAdminSecurity>("AdminSecurity", AdminSecuritySchema);

export default AdminSecurity;
