"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function UserActionsClient({ userId, initialRole, initialActive, distributorStatus = 'none', creditLimitNpr = 0, creditUsedNpr = 0 }: { userId: string; initialRole: string; initialActive: boolean; distributorStatus?: string; creditLimitNpr?: number; creditUsedNpr?: number }) {
  const router = useRouter();
  const [role, setRole] = useState(initialRole);
  const [isActive, setIsActive] = useState(!!initialActive);
  const [limit, setLimit] = useState(Number(creditLimitNpr || 0));
  const [used, setUsed] = useState(Number(creditUsedNpr || 0));
  const [loading, setLoading] = useState(false);

  async function patch(payload: Record<string, unknown>) {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || JSON.stringify(json));
      toast.success(json?.message || "Updated");
      return json.user;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  async function handlePromote() {
    if (!confirm("Promote this user to admin?")) return;
    const u = await patch({ role: "admin" });
    setRole(u.role);
    router.refresh();
  }

  async function handleDemote() {
    if (!confirm("Demote this admin to user?")) return;
    const u = await patch({ role: "user" });
    setRole(u.role);
    router.refresh();
  }

  async function handleToggleActive() {
    const next = !isActive;
    if (!confirm(`${next ? 'Activate' : 'Deactivate'} this user?`)) return;
    const u = await patch({ isActive: next });
    setIsActive(u.isActive);
    router.refresh();
  }

  async function handleSetDistributorStatus(nextStatus: string) {
    const u = await patch({ role: 'distributor', distributorStatus: nextStatus });
    setRole(u.role);
    router.refresh();
  }

  async function handleSetCredit() {
    const nextLimit = prompt('Enter new credit limit in NPR:', String(limit));
    if (nextLimit === null) return;
    const parsedLimit = Number(nextLimit);
    if (!Number.isFinite(parsedLimit) || parsedLimit < 0) return alert('Credit limit must be a non-negative number');

    const nextUsed = prompt('Enter current used credit in NPR:', String(used));
    if (nextUsed === null) return;
    const parsedUsed = Number(nextUsed);
    if (!Number.isFinite(parsedUsed) || parsedUsed < 0) return alert('Used credit must be a non-negative number');

    const u = await patch({ role: 'distributor', creditLimitNpr: parsedLimit, creditUsedNpr: parsedUsed });
    setRole(u.role);
    setLimit(Number(u.creditLimitNpr || parsedLimit));
    setUsed(Number(u.creditUsedNpr || parsedUsed));
    router.refresh();
  }

  async function handleSetPassword() {
    const pw = prompt("Enter new password for the user (min 8 chars):");
    if (!pw) return;
    if (pw.length < 8) return alert("Password must be at least 8 characters");
    await patch({ password: pw });
    toast.success("Password updated (dev) — user can sign in with the new password");
  }

  async function handleDelete() {
    if (!confirm("Permanently delete this user? This cannot be undone.")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || JSON.stringify(json));
      toast.success("User deleted");
      router.push('/admin');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Link
        href={`/admin/users/${userId}`}
        title={`Distributor status: ${distributorStatus}`}
        className="rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-medium hover:bg-slate-800 transition-colors"
      >
        View profile
      </Link>

      {role === "admin" ? (
        <button className="rounded-full bg-amber-50 text-amber-800 px-3 py-1 text-xs font-medium" onClick={handleDemote} disabled={loading}>Demote</button>
      ) : (
        <button className="rounded-full bg-sky-600 text-white px-3 py-1 text-xs font-medium" onClick={handlePromote} disabled={loading}>Promote</button>
      )}

      {role === 'distributor' && (
        <>
          <button className="rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-medium" onClick={() => handleSetDistributorStatus('approved')} disabled={loading}>Approve</button>
          <button className="rounded-full bg-amber-50 text-amber-700 px-3 py-1 text-xs font-medium" onClick={() => handleSetDistributorStatus('pending')} disabled={loading}>Pend</button>
          <button className="rounded-full bg-rose-50 text-rose-700 px-3 py-1 text-xs font-medium" onClick={() => handleSetDistributorStatus('rejected')} disabled={loading}>Reject</button>
          <button className="rounded-full bg-cyan-50 text-cyan-700 px-3 py-1 text-xs font-medium" onClick={handleSetCredit} disabled={loading}>Credit</button>
        </>
      )}

      <button className={`rounded-full ${isActive ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'} px-3 py-1 text-xs font-medium`} onClick={handleToggleActive} disabled={loading}>
        {isActive ? 'Deactivate' : 'Activate'}
      </button>

      <button className="rounded-full bg-slate-100 text-slate-800 px-3 py-1 text-xs font-medium" onClick={handleSetPassword} disabled={loading}>Set password</button>

      <button className="rounded-full bg-red-600 text-white px-3 py-1 text-xs font-medium" onClick={handleDelete} disabled={loading}>Delete</button>
    </div>
  );
}
