"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";


const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: "Invalid email or password.",
  SessionRequired: "Please sign in to continue.",
  OAuthSignin: "Error signing in with provider.",
  OAuthCallback: "Authentication callback error.",
  OAuthCreateAccount: "Error creating account with provider.",
  EmailCreateAccount: "Error creating account with email.",
  Default: "Sign in failed. Please try again.",
};

type Step = "password" | "code";
type CodeMode = "totp" | "backup" | "recovery";

export default function AdminLoginClient({ from = "/admin", serverError }: { from?: string; serverError?: string }) {
  const [step, setStep] = useState<Step>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mode, setMode] = useState<CodeMode>("totp");
  const [codeValue, setCodeValue] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (serverError) {
      const msg = ERROR_MESSAGES[serverError] || serverError || ERROR_MESSAGES.Default;
      setError(msg);
    }
  }, [serverError]);

  // Calls NextAuth with the password plus whichever second factor (if any) the
  // user supplied. NextAuth's authorize() is the real gate. Returns true on
  // success. Leaves `loading` cleared.
  async function attemptSignIn(extra: Record<string, string>): Promise<boolean> {
    const cleanEmail = (email || "").toLowerCase().trim();
    const res = await signIn("credentials", { redirect: false, email: cleanEmail, password, ...extra });
    setLoading(false);
    if (res?.error) {
      if (step === "code") {
        if (extra.backupCode) setError("That backup code didn't match. Try another one.");
        else if (extra.resetCode) setError("That recovery code is not valid.");
        else setError("That code didn't match, or there were too many attempts. Try again.");
      } else {
        setError(ERROR_MESSAGES[res.error] || ERROR_MESSAGES.Default);
      }
      return false;
    }
    return true;
  }

  async function onPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const cleanEmail = (email || "").toLowerCase().trim();
    try {
      // Ask whether this admin needs a second factor before we attempt sign-in.
      const res = await fetch("/api/admin/login/precheck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      if (res.status === 429) {
        setLoading(false);
        setError("Too many attempts. Please wait a few minutes and try again.");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { mfaRequired?: boolean };
      if (data?.mfaRequired) {
        setStep("code");
        setMode("totp");
        setCodeValue("");
        setError(null);
        setLoading(false);
        return;
      }
      // No 2FA on this account (or bad password): let NextAuth decide.
      const ok = await attemptSignIn({});
      if (ok) router.push(from || "/admin");
    } catch {
      setLoading(false);
      setError("Sign in failed. Please try again.");
    }
  }

  async function onCodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const value = (codeValue || "").trim();
    const extra: Record<string, string> =
      mode === "totp" ? { totp: value } : mode === "backup" ? { backupCode: value } : { resetCode: value };
    const ok = await attemptSignIn(extra);
    if (ok) {
      // A recovery code disables 2FA on success — send them to re-enroll.
      if (mode === "recovery") router.push("/admin/security?reset=1");
      else router.push(from || "/admin");
    }
  }

  function switchMode(next: CodeMode) {
    setMode(next);
    setCodeValue("");
    setError(null);
  }

  function backToPassword() {
    setStep("password");
    setCodeValue("");
    setError(null);
    setLoading(false);
  }

  const inputClass =
    "mt-2 block w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 placeholder-slate-400 text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:ring-offset-2 focus:ring-offset-slate-900 transition-shadow";

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 antialiased">
      <div className="max-w-5xl mx-auto py-20 px-6 sm:px-8">
        <div className="relative overflow-hidden rounded-3xl shadow-2xl">
          <div className="absolute inset-0 bg-white" aria-hidden />

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch bg-white border border-gray-100">
            {/* LEFT: brand / context */}
            <aside className="hidden lg:flex flex-col justify-center gap-8 p-12 pl-16 bg-slate-900">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-sky-400 rounded-lg flex items-center justify-center text-slate-900 font-black">H</div>
                <div>
                  <div className="text-sm font-semibold text-slate-100">Himalaya</div>
                  <div className="text-xs text-slate-400">Admin console</div>
                </div>
              </div>

              <div className="max-w-xs">
                <h2 className="text-3xl font-extrabold leading-tight text-slate-100">Welcome back —
                  <span className="block text-base font-medium text-slate-300 mt-2">Manage orders, users and inventory.</span>
                </h2>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-3"><span className="w-2.5 h-2.5 mt-2 bg-emerald-300 rounded-full" />Audit‑ready activity logs</li>
                <li className="flex items-start gap-3"><span className="w-2.5 h-2.5 mt-2 bg-sky-300 rounded-full" />Granular access controls</li>
                <li className="flex items-start gap-3"><span className="w-2.5 h-2.5 mt-2 bg-amber-200 rounded-full" />Two‑factor protected sign‑in</li>
              </ul>

              <div className="mt-6 text-sm text-gray-400">Need help? <a className="text-sky-600 hover:underline" href="/contact">Contact support</a></div>
            </aside>

            {/* RIGHT: form card */}
            <div className="py-10 px-6 sm:px-10 lg:px-14 bg-slate-800">
              <div className="max-w-md mx-auto">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-2xl font-extrabold text-slate-100">
                      {step === "password" ? "Admin sign in" : "Two-step verification"}
                    </h1>
                    <p className="text-sm text-slate-300 mt-1">
                      {step === "password"
                        ? "Sign in with your administrator credentials."
                        : mode === "totp"
                          ? "Enter the 6-digit code from your authenticator app."
                          : mode === "backup"
                            ? "Enter one of your one-time backup codes."
                            : "Enter your recovery code to sign in and reset 2FA."}
                    </p>
                  </div>
                  <div className="text-xs text-slate-400">Secure · Audit‑ready</div>
                </div>

                {step === "password" ? (
                  <form onSubmit={onPasswordSubmit} className="space-y-5" aria-describedby={error ? "auth-error" : undefined}>
                    <div>
                      <label htmlFor="admin-email" className="block text-sm font-medium text-slate-200">Email</label>
                      <input
                        id="admin-email"
                        className={inputClass}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="name@company.com"
                        required
                        autoComplete="username"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <label htmlFor="admin-password" className="block text-sm font-medium">Password</label>
                      </div>

                      <div className="relative mt-2">
                        <input
                          id="admin-password"
                          className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 pr-12 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400/40 focus:ring-offset-2 focus:ring-offset-slate-900 transition-shadow"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          required
                          autoComplete="current-password"
                          aria-describedby={error ? "auth-error" : undefined}
                        />

                        <button
                          type="button"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-300 hover:bg-slate-800/60"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
                            {showPassword ? (
                              <path className="stroke-slate-200" d="M4.03 4.97a9 9 0 0111.94 0l.02.02a9 9 0 010 11.94l-.02.02a9 9 0 01-11.94 0L4 16.97a9 9 0 010-11.94l.03-.06zM10 13a3 3 0 100-6 3 3 0 000 6z" />
                            ) : (
                              <>
                                <path className="stroke-slate-300" d="M3 3l18 18" strokeLinecap="round" strokeLinejoin="round" />
                                <path className="stroke-slate-300" d="M10.58 10.58a3 3 0 104.24 4.24" strokeLinecap="round" strokeLinejoin="round" />
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                    </div>

                    {error ? (
                      <div id="auth-error" className="text-sm text-rose-400" role="alert">{error}</div>
                    ) : null}

                    <div>
                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center gap-3 rounded-lg bg-sky-400 px-4 py-3 text-slate-900 font-semibold shadow-md hover:brightness-110 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400/40 focus:ring-offset-slate-900"
                        disabled={loading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`${loading ? "animate-spin" : ""} h-5 w-5 text-slate-900`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <path d="M12 4v4m0 8v4m8-8h-4M4 12H0" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{loading ? "Signing in…" : "Sign in as admin"}</span>
                      </button>

                      <div className="mt-3 text-center text-sm text-slate-400">By signing in you agree to the operator's terms. Admin access is monitored.</div>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={onCodeSubmit} className="space-y-5" aria-describedby={error ? "auth-error" : undefined}>
                    <div>
                      <label htmlFor="admin-code" className="block text-sm font-medium text-slate-200">
                        {mode === "totp" ? "Authenticator code" : mode === "backup" ? "Backup code" : "Recovery code"}
                      </label>
                      <input
                        id="admin-code"
                        className={`${inputClass} tracking-widest`}
                        value={codeValue}
                        onChange={(e) => setCodeValue(e.target.value)}
                        type="text"
                        inputMode={mode === "totp" ? "numeric" : "text"}
                        autoComplete="one-time-code"
                        placeholder={mode === "totp" ? "123456" : mode === "backup" ? "XXXX-XXXX" : "Recovery code"}
                        required
                        autoFocus
                      />
                    </div>

                    {error ? (
                      <div id="auth-error" className="text-sm text-rose-400" role="alert">{error}</div>
                    ) : null}

                    <div>
                      <button
                        type="submit"
                        className="w-full inline-flex items-center justify-center gap-3 rounded-lg bg-sky-400 px-4 py-3 text-slate-900 font-semibold shadow-md hover:brightness-110 disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-400/40 focus:ring-offset-slate-900"
                        disabled={loading}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`${loading ? "animate-spin" : ""} h-5 w-5 text-slate-900`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                          <path d="M12 4v4m0 8v4m8-8h-4M4 12H0" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span>{loading ? "Verifying…" : "Verify and sign in"}</span>
                      </button>
                    </div>

                    {/* Switch between factor types */}
                    <div className="flex flex-col gap-2 text-sm text-center">
                      {mode !== "totp" && (
                        <button type="button" className="text-sky-300 hover:underline" onClick={() => switchMode("totp")}>
                          Use authenticator code
                        </button>
                      )}
                      {mode !== "backup" && (
                        <button type="button" className="text-sky-300 hover:underline" onClick={() => switchMode("backup")}>
                          Use a backup code
                        </button>
                      )}
                      {mode !== "recovery" && (
                        <button type="button" className="text-slate-400 hover:text-slate-200 hover:underline" onClick={() => switchMode("recovery")}>
                          Lost your device? Use a recovery code
                        </button>
                      )}
                    </div>

                    <div className="text-center">
                      <button type="button" className="text-sm text-slate-400 hover:text-slate-200" onClick={backToPassword}>
                        ← Back
                      </button>
                    </div>
                  </form>
                )}

                <div className="mt-8 text-center text-sm text-slate-400">
                  Not an admin? <a className="text-sky-300 hover:underline" href="/login">Sign in to the storefront</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
