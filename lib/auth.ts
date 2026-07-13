import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions } from "next-auth";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import connectToDatabase from "./mongodb";
import User from "../models/User";
import Employee from "../models/Employee";
import AdminEmployee from "../models/AdminEmployee";
import OutletAdmin from "../models/OutletAdmin";
import Outlet from "../models/Outlet";
import AdminSecurity from "../models/AdminSecurity";
import { resolvePermissionsForEmployee } from "./permissions";
import {
  verifyTotpCode,
  decryptSecret,
  consumeBackupCode,
  isValidResetCode,
  principalKeyForEnvAdmin,
  principalKeyForUser,
} from "./admin-2fa";
import { checkRateLimit, recordFailure, clearAttempts } from "./rate-limit";

// Constant-time string comparison (hash-then-compare so timing is independent of
// length and content). Used for the env-admin password so login timing can't be
// used to recover it character-by-character.
function safeEqual(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(String(a), "utf8").digest();
  const hb = crypto.createHash("sha256").update(String(b), "utf8").digest();
  return crypto.timingSafeEqual(ha, hb);
}

// Best-effort client IP for rate-limiting the 2FA code step. NextAuth hands the
// underlying request (headers/body) as the second argument to `authorize`.
function getRequestIp(req: any): string {
  const xff = req?.headers?.["x-forwarded-for"];
  const first = Array.isArray(xff) ? xff[0] : typeof xff === "string" ? xff.split(",")[0] : "";
  return (first || req?.headers?.["x-real-ip"] || "unknown").toString().trim() || "unknown";
}

// Second-factor gate for an admin principal. Returns true when the caller may
// proceed: either 2FA isn't enabled for this account, or a valid authenticator
// code / one-time backup code / master reset code was supplied. A reset code
// also WIPES the enrollment (lost device / handover) so a new authenticator can
// be set up after signing in. The 6-digit space is brute-forceable, so attempts
// are rate-limited per (account, IP). Assumes the DB connection is already open.
async function passesAdmin2fa(
  accountKey: string,
  creds: { totp?: string; backupCode?: string; resetCode?: string },
  ip: string,
): Promise<boolean> {
  const sec = (await AdminSecurity.findOne({ accountKey }).lean().exec()) as
    | { totpEnabled?: boolean; totpSecret?: string; backupCodes?: string[] }
    | null;
  if (!sec?.totpEnabled || !sec.totpSecret) return true; // 2FA not enabled

  const rateKey = `admin-mfa:${accountKey}:${ip}`;
  if (!checkRateLimit(rateKey).allowed) return false;

  const { totp, backupCode, resetCode } = creds;

  if (resetCode) {
    if (!isValidResetCode(resetCode)) {
      recordFailure(rateKey);
      return false;
    }
    await AdminSecurity.updateOne(
      { accountKey },
      { $set: { totpEnabled: false }, $unset: { totpSecret: "", backupCodes: "", totpPendingSecret: "" } },
    ).exec();
    clearAttempts(rateKey);
    return true;
  }

  if (totp) {
    let ok = false;
    try {
      ok = verifyTotpCode(decryptSecret(sec.totpSecret), totp);
    } catch {
      ok = false;
    }
    if (!ok) {
      recordFailure(rateKey);
      return false;
    }
    clearAttempts(rateKey);
    return true;
  }

  if (backupCode) {
    const { matched, remainingHashes } = await consumeBackupCode(
      backupCode,
      Array.isArray(sec.backupCodes) ? sec.backupCodes : [],
    );
    if (!matched) {
      recordFailure(rateKey);
      return false;
    }
    await AdminSecurity.updateOne({ accountKey }, { $set: { backupCodes: remainingHashes } }).exec();
    clearAttempts(rateKey);
    return true;
  }

  // 2FA is enabled but the request carried no second factor.
  recordFailure(rateKey);
  return false;
}

export const authOptions: NextAuthOptions = {
  // 7-day sessions (was the 30-day NextAuth default). Because role/permissions/isActive
  // are baked into the JWT at login, a shorter lifetime bounds how long a deactivated
  // account or revoked permission can linger. Sensitive flows re-validate server-side.
  session: { strategy: "jwt", maxAge: 7 * 24 * 60 * 60 },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "you@domain.com" },
        password: { label: "Password", type: "password" },
        // Admin second-factor fields (optional; only used by the /admin/login flow).
        totp: { label: "Authenticator code", type: "text" },
        backupCode: { label: "Backup code", type: "text" },
        resetCode: { label: "Recovery code", type: "text" },
      },
      async authorize(credentials, req) {
        if (!credentials) return null;
        const { password } = credentials;
        const email = (credentials.email || "").toLowerCase().trim();
        const ip = getRequestIp(req);
        const mfaCreds = {
          totp: typeof credentials.totp === "string" ? credentials.totp : undefined,
          backupCode: typeof credentials.backupCode === "string" ? credentials.backupCode : undefined,
          resetCode: typeof credentials.resetCode === "string" ? credentials.resetCode : undefined,
        };

        // Admin via env (no DB record required)
        if (process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
          if (email === (process.env.ADMIN_EMAIL || "").toLowerCase() && safeEqual(password, process.env.ADMIN_PASSWORD)) {
            // Enforce 2FA (if enrolled) BEFORE issuing the session.
            await connectToDatabase();
            const ok = await passesAdmin2fa(principalKeyForEnvAdmin(email), mfaCreds, ip);
            if (!ok) return null;
            return { id: "admin", name: "Administrator", email, role: "admin", permissions: ["*"] } as any;
          }
        }

        await connectToDatabase();
        const user = await User.findOne({ email }).exec();
        if (user && user.password) {
          if (user.isActive === false) return null;
          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            if (process.env.NODE_ENV !== "production") console.debug("Credentials: password mismatch for", email);
            return null;
          }
          // DB admins must clear 2FA too (when enrolled). Non-admin users are
          // unaffected — they never have an AdminSecurity record.
          if (user.role === "admin") {
            const ok = await passesAdmin2fa(principalKeyForUser(user._id.toString()), mfaCreds, ip);
            if (!ok) return null;
          }
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            distributorStatus: user.distributorStatus || "none",
            creditLimitNpr: Number(user.creditLimitNpr || 0),
            creditUsedNpr: Number(user.creditUsedNpr || 0),
            permissions: user.role === "admin" ? ["*"] : [],
          } as any;
        }

        const adminEmployee = await AdminEmployee.findOne({ email }).exec();
        if (adminEmployee && adminEmployee.password) {
          if (adminEmployee.isActive === false) return null;
          const isValid = await bcrypt.compare(password, adminEmployee.password);
          if (!isValid) {
            if (process.env.NODE_ENV !== "production") console.debug("Credentials: password mismatch for", email);
            return null;
          }
          return {
            id: adminEmployee._id.toString(),
            name: adminEmployee.fullName,
            email: adminEmployee.email,
            role: "admin-employee",
            permissions: Array.isArray(adminEmployee.permissions) ? adminEmployee.permissions : [],
          } as any;
        }

        const employee = await Employee.findOne({ email }).exec();
        if (employee && employee.password) {
          if (employee.isActive === false) return null;
          const isValid = await bcrypt.compare(password, employee.password);
          if (!isValid) {
            if (process.env.NODE_ENV !== "production") console.debug("Credentials: password mismatch for", email);
            return null;
          }
          const outlet = employee.outlet ? await Outlet.findById(employee.outlet).exec() : null;
          return {
            id: employee._id.toString(),
            name: employee.name,
            email: employee.email,
            role: "employee",
            employeeRole: employee.role,
            outletId: outlet ? outlet._id.toString() : undefined,
            outletName: outlet?.name,
            outletSlug: outlet?.slug,
            permissions: resolvePermissionsForEmployee(employee.role, employee.permissions),
          } as any;
        }

        // Outlet Admin
        const outletAdmin = await OutletAdmin.findOne({ email }).exec();
        if (outletAdmin?.password) {
          if (outletAdmin.isActive === false) return null;
          const isValid = await bcrypt.compare(password, outletAdmin.password);
          if (!isValid) {
            if (process.env.NODE_ENV !== "production") console.debug("Credentials: password mismatch for outlet admin", email);
            return null;
          }
          const outlet = await Outlet.findById(outletAdmin.outlet).exec();
          if (!outlet || !outlet.isActive) return null;
          return {
            id: outletAdmin._id.toString(),
            name: outletAdmin.name || outletAdmin.username,
            email: outletAdmin.email,
            role: "outlet-admin",
            outletId: outlet._id.toString(),
            outletName: outlet.name,
            outletSlug: outlet.slug,
            permissions: ["outlet:*"],
          } as any;
        }

        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // first time jwt callback is run, user object is available
      if (user) {
        token.role = (user as any).role || "user";
        token.id = (user as any).id || (user as any)._id;
        token.permissions = (user as any).permissions || [];
        token.employeeRole = (user as any).employeeRole || undefined;
        token.outletId = (user as any).outletId || undefined;
        token.outletName = (user as any).outletName || undefined;
        token.outletSlug = (user as any).outletSlug || undefined;
        token.distributorStatus = (user as any).distributorStatus || "none";
        token.creditLimitNpr = Number((user as any).creditLimitNpr || 0);
        token.creditUsedNpr = Number((user as any).creditUsedNpr || 0);
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
        (session.user as any).permissions = token.permissions || [];
        (session.user as any).employeeRole = token.employeeRole || undefined;
        (session.user as any).outletId = token.outletId || undefined;
        (session.user as any).outletName = token.outletName || undefined;
        (session.user as any).outletSlug = token.outletSlug || undefined;
        (session.user as any).distributorStatus = token.distributorStatus || "none";
        (session.user as any).creditLimitNpr = Number(token.creditLimitNpr || 0);
        (session.user as any).creditUsedNpr = Number(token.creditUsedNpr || 0);
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/login",
  },
};

export default authOptions;