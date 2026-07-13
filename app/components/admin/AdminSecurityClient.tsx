"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

type Status = {
  enabled: boolean;
  backupCodesRemaining: number;
  resetCodeConfigured: boolean;
};

type Enrollment = { qr: string; manualKey: string };

async function postJson(url: string, body?: unknown) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data } as { ok: boolean; status: number; data: any };
}

export default function AdminSecurityClient({ email }: { email: string }) {
  const searchParams = useSearchParams();
  const wasReset = searchParams?.get("reset") === "1";

  const [status, setStatus] = useState<Status | null>(null);
  const [view, setView] = useState<"idle" | "enrolling" | "showCodes" | "disable">("idle");
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [code, setCode] = useState("");
  const [disableCode, setDisableCode] = useState("");
  const [useRecovery, setUseRecovery] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/2fa/status", { cache: "no-store" });
      if (res.ok) setStatus((await res.json()) as Status);
    } catch {
      /* keep last known status */
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  async function startEnroll() {
    setError(null);
    setNotice(null);
    setBusy(true);
    const { ok, data } = await postJson("/api/admin/2fa/setup");
    setBusy(false);
    if (!ok) {
      setError(data?.message || "Could not start setup. Try again.");
      return;
    }
    setEnrollment({ qr: data.qr, manualKey: data.manualKey });
    setCode("");
    setView("enrolling");
  }

  async function submitEnroll(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const { ok, data } = await postJson("/api/admin/2fa/verify", { code: code.trim() });
    setBusy(false);
    if (!ok) {
      setError(data?.message || "That code didn't match. Try again.");
      return;
    }
    setBackupCodes(Array.isArray(data.backupCodes) ? data.backupCodes : []);
    setEnrollment(null);
    setView("showCodes");
    await loadStatus();
  }

  async function submitDisable(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const payload = useRecovery ? { resetCode: disableCode.trim() } : { code: disableCode.trim() };
    const { ok, data } = await postJson("/api/admin/2fa/reset", payload);
    setBusy(false);
    if (!ok) {
      setError(data?.message || "Could not disable two-factor authentication.");
      return;
    }
    setDisableCode("");
    setUseRecovery(false);
    setView("idle");
    setNotice("Two-factor authentication has been turned off.");
    await loadStatus();
  }

  function downloadBackupCodes() {
    if (!backupCodes) return;
    const body = [
      "Himalaya Agro — admin backup codes",
      email ? `Account: ${email}` : "",
      `Generated: ${new Date().toISOString()}`,
      "",
      "Each code works once. Keep them somewhere safe.",
      "",
      ...backupCodes,
      "",
    ]
      .filter(Boolean)
      .join("\n");
    const blob = new Blob([body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "himalaya-admin-backup-codes.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  const cardClass = "rounded-2xl border border-slate-200 bg-white p-6 shadow-sm";

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Security</h1>
        <p className="mt-1 text-sm text-slate-500">
          Protect your admin account with two-factor authentication (2FA).
        </p>
      </div>

      {wasReset && status && !status.enabled && view === "idle" ? (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Your 2FA was reset with a recovery code. Set up a new authenticator below to protect your account again.
        </div>
      ) : null}

      {notice ? (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      ) : null}

      {status === null ? (
        <div className={cardClass}>
          <div className="animate-pulse text-sm text-slate-400">Loading…</div>
        </div>
      ) : view === "showCodes" && backupCodes ? (
        <div className={cardClass}>
          <h2 className="text-lg font-semibold text-slate-900">Save your backup codes</h2>
          <p className="mt-1 text-sm text-slate-500">
            These are shown <span className="font-semibold">once</span>. Each code works a single time if you lose your
            authenticator. Store them somewhere safe.
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-4 font-mono text-sm text-slate-800">
            {backupCodes.map((c) => (
              <div key={c} className="tracking-wider">{c}</div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={downloadBackupCodes}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Download codes
            </button>
            <button
              type="button"
              onClick={() => { setBackupCodes(null); setView("idle"); }}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              I've saved them
            </button>
          </div>
        </div>
      ) : view === "enrolling" && enrollment ? (
        <div className={cardClass}>
          <h2 className="text-lg font-semibold text-slate-900">Set up your authenticator</h2>
          <p className="mt-1 text-sm text-slate-500">
            Scan this QR code with Google Authenticator, Authy, 1Password or any TOTP app, then enter the 6-digit code it
            shows.
          </p>

          <div className="mt-4 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={enrollment.qr} alt="2FA QR code" className="h-44 w-44 rounded-lg border border-slate-200" />
            <div className="text-sm">
              <div className="text-slate-500">Can't scan? Enter this key manually:</div>
              <code className="mt-1 inline-block break-all rounded bg-slate-100 px-2 py-1 font-mono text-slate-800">
                {enrollment.manualKey}
              </code>
            </div>
          </div>

          <form onSubmit={submitEnroll} className="mt-5 space-y-3">
            <label htmlFor="enroll-code" className="block text-sm font-medium text-slate-700">
              Verification code
            </label>
            <input
              id="enroll-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              className="w-40 rounded-lg border border-slate-300 px-3 py-2 tracking-widest focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              required
            />
            {error ? <div className="text-sm text-rose-600">{error}</div> : null}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {busy ? "Verifying…" : "Verify and enable"}
              </button>
              <button
                type="button"
                onClick={() => { setView("idle"); setEnrollment(null); setError(null); }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : view === "disable" ? (
        <div className={cardClass}>
          <h2 className="text-lg font-semibold text-slate-900">Turn off two-factor authentication</h2>
          <p className="mt-1 text-sm text-slate-500">
            Confirm with a current authenticator code{status.resetCodeConfigured ? " or your recovery code" : ""} to
            disable 2FA.
          </p>
          <form onSubmit={submitDisable} className="mt-4 space-y-3">
            <input
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value)}
              inputMode={useRecovery ? "text" : "numeric"}
              autoComplete="one-time-code"
              placeholder={useRecovery ? "Recovery code" : "123456"}
              className="w-56 rounded-lg border border-slate-300 px-3 py-2 tracking-widest focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              required
            />
            {error ? <div className="text-sm text-rose-600">{error}</div> : null}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
              >
                {busy ? "Disabling…" : "Disable 2FA"}
              </button>
              <button
                type="button"
                onClick={() => { setView("idle"); setDisableCode(""); setUseRecovery(false); setError(null); }}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              {status.resetCodeConfigured ? (
                <button
                  type="button"
                  onClick={() => { setUseRecovery((v) => !v); setDisableCode(""); setError(null); }}
                  className="text-sm text-slate-500 hover:text-slate-700 hover:underline"
                >
                  {useRecovery ? "Use authenticator code instead" : "Use recovery code instead"}
                </button>
              ) : null}
            </div>
          </form>
        </div>
      ) : (
        // idle
        <div className={cardClass}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Two-factor authentication</h2>
              <p className="mt-1 text-sm text-slate-500">
                {status.enabled
                  ? "2FA is on. You'll be asked for a code from your authenticator app each time you sign in."
                  : "Add a second step to your sign-in using an authenticator app."}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                status.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
              }`}
            >
              {status.enabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          {status.enabled ? (
            <>
              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                Backup codes remaining: <span className="font-semibold text-slate-900">{status.backupCodesRemaining}</span>
                {status.backupCodesRemaining <= 2 ? (
                  <span className="ml-2 text-amber-600">Running low — change your authenticator to get a fresh set.</span>
                ) : null}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={startEnroll}
                  disabled={busy}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                >
                  {busy ? "Please wait…" : "Change authenticator app"}
                </button>
                <button
                  type="button"
                  onClick={() => { setView("disable"); setError(null); setNotice(null); }}
                  className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50"
                >
                  Disable 2FA
                </button>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Changing your authenticator also issues a new set of backup codes (the old ones stop working).
              </p>
            </>
          ) : (
            <div className="mt-4">
              {error ? <div className="mb-3 text-sm text-rose-600">{error}</div> : null}
              <button
                type="button"
                onClick={startEnroll}
                disabled={busy}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {busy ? "Please wait…" : "Enable two-factor authentication"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
