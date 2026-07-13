import crypto from "crypto";
import bcrypt from "bcryptjs";
import { Secret, TOTP } from "otpauth";

// Pure crypto / TOTP / backup-code helpers for admin two-factor auth. No DB
// access here — route handlers and the NextAuth `authorize()` import the
// `AdminSecurity` model directly and call into these helpers. These rely on Node
// built-ins (`crypto`) and `otpauth`, so they only run server-side.

// ---------------------------------------------------------------------------
// Secret encryption (AES-256-GCM)
// ---------------------------------------------------------------------------
// The TOTP secret is stored ENCRYPTED at rest. The key is derived from the
// existing NextAuth secret via scrypt with a FIXED salt, so it is deterministic
// across restarts/deploys (no new secret to manage) yet not the raw env value.
// GCM gives us authentication, so any tampering with the stored ciphertext is
// detected on decrypt.
const FIXED_SALT = "himalaya-agro-admin-2fa-v1";

function getEncryptionKey(): Buffer {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("Missing NEXTAUTH_SECRET environment variable (required for 2FA encryption).");
  }
  return crypto.scryptSync(secret, FIXED_SALT, 32);
}

export function encryptSecret(plain: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  // iv:tag:ciphertext, each base64.
  return [iv, tag, ciphertext].map((b) => b.toString("base64")).join(":");
}

export function decryptSecret(payload: string): string {
  const [ivB64, tagB64, ctB64] = String(payload).split(":");
  if (!ivB64 || !tagB64 || !ctB64) {
    throw new Error("Malformed encrypted secret.");
  }
  const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const plaintext = Buffer.concat([decipher.update(Buffer.from(ctB64, "base64")), decipher.final()]);
  return plaintext.toString("utf8");
}

// ---------------------------------------------------------------------------
// TOTP (SHA1, 6 digits, 30s, ±1 step tolerance for clock skew)
// ---------------------------------------------------------------------------
const TOTP_ISSUER = "Himalaya Agro Admin";

function buildTotp(secret: Secret, label: string): TOTP {
  return new TOTP({ issuer: TOTP_ISSUER, label, algorithm: "SHA1", digits: 6, period: 30, secret });
}

/** Fresh secret for enrollment. Returns the base32 secret (to store, encrypted)
 *  and an otpauth:// URI for the QR code. */
export function generateTotpSecret(email: string): { secret: string; uri: string } {
  const secret = new Secret({ size: 20 }); // 160-bit, the SHA1 standard size
  const totp = buildTotp(secret, email);
  return { secret: secret.base32, uri: totp.toString() };
}

export function verifyTotpCode(secretBase32: string, code: string): boolean {
  const clean = String(code ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(clean)) return false;
  const totp = buildTotp(Secret.fromBase32(secretBase32), "admin");
  // validate() returns the time-step delta (a number, possibly 0) or null.
  return totp.validate({ token: clean, window: 1 }) !== null;
}

// ---------------------------------------------------------------------------
// Backup codes (one-time, shown once, stored only as bcrypt hashes)
// ---------------------------------------------------------------------------
// Unambiguous alphabet (no 0/O/1/I) so codes are easy to read and type.
const BACKUP_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

function normalizeBackupCode(code: string): string {
  // Compare on alphanumerics only — ignore the dash, spaces and case.
  return String(code ?? "").replace(/[^a-z0-9]/gi, "").toUpperCase();
}

function randomBackupCode(): string {
  const pick = () => BACKUP_ALPHABET[crypto.randomInt(0, BACKUP_ALPHABET.length)];
  const group = () => Array.from({ length: 4 }, pick).join("");
  return `${group()}-${group()}`; // e.g. "A7K2-9QFM"
}

export async function generateBackupCodes(count = 10): Promise<{ plain: string[]; hashes: string[] }> {
  const plain: string[] = [];
  for (let i = 0; i < count; i++) plain.push(randomBackupCode());
  const hashes = await Promise.all(plain.map((c) => bcrypt.hash(normalizeBackupCode(c), 10)));
  return { plain, hashes };
}

/** Checks a candidate backup code against the stored hashes. On a match returns
 *  the remaining hashes with the matched one removed (single-use). */
export async function consumeBackupCode(
  candidate: string,
  hashes: string[],
): Promise<{ matched: boolean; remainingHashes: string[] }> {
  const normalized = normalizeBackupCode(candidate);
  if (!normalized) return { matched: false, remainingHashes: hashes };

  for (let i = 0; i < hashes.length; i++) {
    // eslint-disable-next-line no-await-in-loop
    if (await bcrypt.compare(normalized, hashes[i])) {
      const remainingHashes = hashes.filter((_, idx) => idx !== i);
      return { matched: true, remainingHashes };
    }
  }
  return { matched: false, remainingHashes: hashes };
}

// ---------------------------------------------------------------------------
// Master reset code (lost device / handover)
// ---------------------------------------------------------------------------
export function isResetCodeConfigured(): boolean {
  return Boolean(process.env.ADMIN_MFA_RESET_CODE);
}

/** Constant-time comparison against ADMIN_MFA_RESET_CODE. Returns false when the
 *  env var is unset so an empty/absent config can never authorize a reset. */
export function isValidResetCode(candidate: string): boolean {
  const expected = process.env.ADMIN_MFA_RESET_CODE;
  if (!expected) return false;
  const a = crypto.createHash("sha256").update(String(candidate ?? ""), "utf8").digest();
  const b = crypto.createHash("sha256").update(String(expected), "utf8").digest();
  return crypto.timingSafeEqual(a, b);
}

// ---------------------------------------------------------------------------
// Principal keys (how an account maps to an AdminSecurity.accountKey)
// ---------------------------------------------------------------------------
export function principalKeyForEnvAdmin(email: string): string {
  return `env:${String(email).toLowerCase().trim()}`;
}

export function principalKeyForUser(userId: string): string {
  return `user:${userId}`;
}

/** Maps a logged-in NextAuth admin session user to its AdminSecurity.accountKey.
 *  Returns null for non-admins (2FA management is admin-only). */
export function adminPrincipalKeyFromSession(
  user: { id?: string; email?: string; role?: string } | null | undefined,
): string | null {
  if (!user || user.role !== "admin") return null;
  if (user.id === "admin") return principalKeyForEnvAdmin(user.email || "");
  if (user.id) return principalKeyForUser(user.id);
  return null;
}
