"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import UserRow from "./UserRow";

export default function AdminAuthFallbackClient({ from }: { from: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [apiSession, setApiSession] = useState<any>(null);
  const [clientUsers, setClientUsers] = useState<any[] | null>(null);
  const [clientError, setClientError] = useState<string | null>(null);

  const reload = async () => {
    setLoading(true);
    try {
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const fetchApiSession = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/session", { credentials: "include" });
      const json = await res.json();
      setApiSession(json);
    } catch (err) {
      setApiSession({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  // Client-side fallback: attempt a one-time fetch of the protected users API.
  const fetchUsersClient = async (opts: { force?: boolean } = {}) => {
    if (clientUsers && !opts.force) return;
    setLoading(true);
    setClientError(null);
    try {
      const res = await fetch('/api/admin/users?clientFallback=1', { credentials: 'include', cache: 'no-store' });
      if (res.status === 404) {
        // user-management has been disabled (soft-disable)
        setClientError('User management disabled');
        setClientUsers(null);
        return;
      }
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j?.message || `status:${res.status}`);
      }
      const j = await res.json();
      setClientUsers(j.users || []);
    } catch (err: any) {
      setClientError(err?.message || String(err));
      setClientUsers(null);
    } finally {
      setLoading(false);
    }
  };

  // One-time verification: if the client session is admin, verify the server
  // session once and perform a full navigation only when the server agrees.
  // Also attempt a client-side API fetch (one-shot) to recover the admin UI
  // when SSR requests are being handled without cookies (common with SW/RSC).
  useEffect(() => {
    let didCheck = false;
    async function verifyAndMaybeLoad() {
      if (didCheck) return;
      didCheck = true;
      if (!(status === "authenticated" && session?.user?.role === "admin")) return;
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store", credentials: 'include' });
        if (res.ok) {
          const json = await res.json().catch(() => ({}));
              if (json?.user?.role === "admin") {
            // Server already agrees — navigate to admin root (users UI is disabled)
            window.location.href = from || "/admin";
            return;
          }
        }
        // Server didn't confirm — attempt client-side API fetch as a fallback (force)
        await fetchUsersClient({ force: true });
      } catch (e) {
        // ignore; user can trigger actions manually
      }
    }
    const tid = setTimeout(() => void verifyAndMaybeLoad(), 200);
    return () => {
      didCheck = true;
      clearTimeout(tid);
    };
  }, [status, session, from]);

  return (
    <div className="p-12">
      <h2 className="text-lg font-semibold mb-2">Access restricted — admin only</h2>
      <p className="text-sm text-slate-600 mb-4">
        The server did not recognize an active admin session for this request. Below are quick
        diagnostics and actions you can take.
      </p>

      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-3">
          <button className="rounded bg-sky-600 text-white px-3 py-1" onClick={reload} disabled={loading}>
            {loading ? "Refreshing…" : "Reload / revalidate server session"}
          </button>
          <button
            className="rounded bg-slate-100 text-slate-800 px-3 py-1"
            onClick={() => signIn(undefined, { callbackUrl: from })}
          >
            Sign in (admin)
          </button>
          <button className="rounded bg-slate-100 text-slate-800 px-3 py-1" onClick={fetchApiSession}>
            Show /api/auth/session
          </button>

          <button
            className="rounded bg-amber-50 text-amber-700 border border-amber-100 px-3 py-1"
            onClick={() => (window.location.href = from || '/admin')}
            title="Force a full-page navigation so the server receives your auth cookie"
          >
            Open admin (force reload)
          </button>

          <button
            className="rounded bg-red-50 text-red-700 border border-red-100 px-3 py-1"
            onClick={async () => {
              try {
                if (!navigator.serviceWorker || !navigator.serviceWorker.getRegistrations) return alert('No service workers found');
                const regs = await navigator.serviceWorker.getRegistrations();
                await Promise.all(regs.map(r => r.unregister()));
                alert('Unregistered service workers (dev only). Please hard-reload.');
              } catch (err) {
                alert('Failed to unregister service workers: ' + String(err));
              }
            }}
          >
            Unregister service workers
          </button>

          <button
            className="rounded bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1"
            onClick={async () => {
              try {
                const res = await fetch('/api/debug/echo', { credentials: 'include' });
                const json = await res.json();
                setApiSession(json);
              } catch (err) {
                setApiSession({ error: String(err) });
              }
            }}
          >
            Run server echo
          </button>
        </div>

        {session?.user ? (
          <div className="text-sm text-slate-600">
            Signed in as <span className="font-medium">{session.user.email}</span> — role: <span className="font-medium">{session.user.role}</span>
            {session.user.role === "admin" ? (
              <div className="mt-2 text-sm text-amber-600">Server session appears missing — try "Reload" above.</div>
            ) : null}
          </div>
        ) : (
          <div className="text-sm text-slate-600">No client session detected. Please sign in as an admin to continue.</div>
        )}

        {apiSession ? (
          <pre className="mt-3 max-h-56 overflow-auto text-sm bg-slate-50 p-3 border rounded text-slate-700">{JSON.stringify(apiSession, null, 2)}</pre>
        ) : null}

        {/* client-side users fallback (one-shot) */}
        {clientError ? (
          <div className="mt-3 text-sm text-red-600">Client fetch failed: {clientError}</div>
        ) : null}

        {clientUsers ? (
          <div className="mt-4 bg-white border rounded-md shadow-sm">
            <div className="px-6 py-3 border-b font-semibold text-slate-600 flex justify-between">
              <div>Profile</div>
              <div>Role</div>
              <div></div>
            </div>
            <div>
              {clientUsers.map((u: any) => (
                <UserRow key={u._id} user={u} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-3 flex items-center gap-3">
            <button
              className="rounded bg-slate-100 text-slate-800 px-3 py-1"
              onClick={() => fetchUsersClient({ force: true })}
              disabled={loading || clientError === 'User management disabled'}
            >
              {clientError === 'User management disabled' ? 'User management disabled' : (loading ? 'Loading…' : 'Load users (client)')}
            </button>
            <div className="text-sm text-slate-500">If this succeeds the admin UI will be usable immediately.</div>
          </div>
        )}

        <div className="text-sm text-slate-500 mt-2">If reload doesn't fix it, open a private window and sign in (clears stale cookies).</div>
      </div>
    </div>
  );
}

