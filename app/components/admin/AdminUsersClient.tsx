"use client";

import React, { useCallback, useEffect, useState } from "react";
import UserActionsClient from "./UserActionsClient";
import { toast } from "react-toastify";

function roleColor(r: string) {
  if (r === "admin") return "bg-amber-50 text-amber-700";
  if (r === "distributor") return "bg-cyan-50 text-cyan-700";
  return "bg-slate-100 text-slate-700";
}

function PasswordCell({ userId, rawPassword }: { userId: string; rawPassword: string | null }) {
  const [visible, setVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [pw, setPw] = useState("");
  const [saving, setSaving] = useState(false);
  const [currentPw, setCurrentPw] = useState(rawPassword);

  async function handleSave() {
    if (!pw || pw.length < 8) return toast.error("Password must be at least 8 characters");
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: pw }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Failed");
      toast.success("Password updated");
      setCurrentPw(pw);
      setPw("");
      setEditing(false);
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setSaving(false);
    }
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1.5">
        <input
          className="w-28 rounded-md border border-slate-200 bg-slate-50/50 px-2 py-1 text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none"
          placeholder="New password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          autoFocus
        />
        <button className="rounded-md bg-cyan-600 text-white px-2 py-1 text-[11px] font-medium hover:bg-cyan-700 disabled:opacity-50" onClick={handleSave} disabled={saving}>
          {saving ? "…" : "Save"}
        </button>
        <button className="rounded-md bg-slate-100 text-slate-600 px-2 py-1 text-[11px] font-medium hover:bg-slate-200" onClick={() => { setEditing(false); setPw(""); }}>
          ✕
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <code className="text-xs bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 text-slate-600 font-mono select-all">
        {currentPw ? (visible ? currentPw : "••••••••") : <span className="text-slate-300 italic">not set</span>}
      </code>
      {currentPw && (
        <button
          className="text-slate-400 hover:text-slate-600 transition-colors"
          onClick={() => setVisible(!visible)}
          title={visible ? "Hide" : "Show"}
        >
          {visible ? (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
          ) : (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          )}
        </button>
      )}
      <button
        className="text-slate-400 hover:text-cyan-600 transition-colors"
        onClick={() => setEditing(true)}
        title="Set password"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
      </button>
    </div>
  );
}

export default function AdminUsersClient({
  initialUsers = [],
  initialTotal = 0,
  initialPage = 1,
  initialPerPage = 20,
}: {
  initialUsers?: any[];
  initialTotal?: number;
  initialPage?: number;
  initialPerPage?: number;
}) {
  const [users, setUsers] = useState(initialUsers || []);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(initialPage || 1);
  const [perPage, setPerPage] = useState(initialPerPage || 20);
  const [total, setTotal] = useState(initialTotal || 0);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<"user" | "admin" | "distributor">("user");
  const [createBusinessName, setCreateBusinessName] = useState("");
  const [createPhoneNumber, setCreatePhoneNumber] = useState("");
  const [createCreditLimitNpr, setCreateCreditLimitNpr] = useState("0");

  const fetchUsers = useCallback(async (opts: { page?: number; q?: string } = {}) => {
    setLoading(true);
    try {
      const url = new URL('/api/admin/users', window.location.origin);
      url.searchParams.set('page', String(opts.page ?? page));
      url.searchParams.set('perPage', String(perPage));
      if (opts.q ?? q) url.searchParams.set('q', (opts.q ?? q) as string);
      const res = await fetch(url.toString(), { credentials: 'same-origin' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || 'Failed to fetch users');
      setUsers(json.users || []);
      setTotal(json.total || 0);
      setPage(json.page || 1);
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, [page, perPage, q]);

  useEffect(() => {
    if (!initialUsers || initialUsers.length === 0) fetchUsers({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    await fetchUsers({ page: 1, q });
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createEmail || !createPassword) return toast.error('Email and password required');
    if (createPassword.length < 8) return toast.error('Password must be at least 8 characters');
    setCreating(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createName || undefined,
          email: createEmail,
          password: createPassword,
          role: createRole,
          businessName: createRole === 'distributor' ? createBusinessName : undefined,
          phoneNumber: createRole === 'distributor' ? createPhoneNumber : undefined,
          creditLimitNpr: createRole === 'distributor' ? Number(createCreditLimitNpr || 0) : undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || JSON.stringify(json));
      toast.success('User created');
      setCreateName('');
      setCreateEmail('');
      setCreatePassword('');
      setCreateRole('user');
      setCreateBusinessName('');
      setCreatePhoneNumber('');
      setCreateCreditLimitNpr('0');
      setShowCreate(false);
      await fetchUsers({ page: 1 });
    } catch (err: any) {
      toast.error(err?.message || String(err));
    } finally {
      setCreating(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil((total || 0) / perPage));

  return (
    <div className="text-slate-900 space-y-5">
      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <form onSubmit={handleSearch} className="flex items-center gap-3 w-full sm:w-auto">
            <label htmlFor="admin-user-search" className="sr-only">Search users</label>
            <div className="relative w-full sm:w-72">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="8" strokeWidth="2"/><path strokeLinecap="round" d="M21 21l-4.35-4.35" strokeWidth="2"/></svg>
              <input
                id="admin-user-search"
                className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-9 pr-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all"
                placeholder="Search by name or email..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <button className="rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 text-sm font-medium transition-colors" type="submit">Search</button>
          </form>

          <div className="flex items-center gap-3">
            <div className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">{users.length}</span> of <span className="font-semibold text-slate-700">{total}</span>
            </div>
            <button
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${showCreate ? 'border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-sm' : 'bg-cyan-600 hover:bg-cyan-700 text-white'}`}
              onClick={() => setShowCreate(!showCreate)}
            >
              {showCreate ? "Cancel" : "+ Create user"}
            </button>
          </div>
        </div>

        {/* Inline Create Form */}
        {showCreate && (
          <form onSubmit={handleCreate} className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-end gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Name</label>
              <input className="w-36 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all" placeholder="optional" value={createName} onChange={(e) => setCreateName(e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Email</label>
              <input className="w-48 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all" placeholder="email" value={createEmail} onChange={(e) => setCreateEmail(e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Password</label>
              <input className="w-36 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all" placeholder="min 8 chars" type="password" value={createPassword} onChange={(e) => setCreatePassword(e.target.value)} />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Role</label>
              <select className="rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all" value={createRole} onChange={(e) => setCreateRole(e.target.value as any)}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="distributor">Distributor</option>
              </select>
            </div>
            {createRole === 'distributor' && (
              <>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Business</label>
                  <input className="w-44 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all" placeholder="business name" value={createBusinessName} onChange={(e) => setCreateBusinessName(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Phone</label>
                  <input className="w-36 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all" placeholder="phone" value={createPhoneNumber} onChange={(e) => setCreatePhoneNumber(e.target.value)} />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-1.5">Credit Limit NPR</label>
                  <input type="number" min={0} className="w-36 rounded-lg border border-slate-200 bg-slate-50/50 px-3.5 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all" placeholder="0" value={createCreditLimitNpr} onChange={(e) => setCreateCreditLimitNpr(e.target.value)} />
                </div>
              </>
            )}
            <button className="rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50" type="submit" disabled={creating}>
              {creating ? 'Creating…' : 'Create'}
            </button>
          </form>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
        <table className="w-full text-sm text-slate-800">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">User</th>
              <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Role</th>
              <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Status</th>
              <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Distributor</th>
              <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Password</th>
              <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Joined</th>
              <th className="px-5 py-3 text-left text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading && (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">Loading…</td></tr>
            )}
            {!loading && users.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-400">No users found.</td></tr>
            )}
            {!loading && users.map((u: any) => (
              <tr key={u._id} className="align-top hover:bg-cyan-50/30 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center text-cyan-600 font-bold text-sm shrink-0">
                      {(u.name || u.email || 'U')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 truncate text-sm">{u.name || '—'}</div>
                      <div className="text-xs text-slate-400 mt-0.5 truncate">{u.email}</div>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${roleColor(u.role)}`}>
                    {u.role}
                  </span>
                </td>

                <td className="px-5 py-3.5">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>

                <td className="px-5 py-3.5">
                  {u.role === 'distributor' ? (
                    <div className="text-xs space-y-1">
                      <div className={`inline-flex items-center px-2 py-0.5 rounded-md font-semibold ${
                        u.distributorStatus === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : u.distributorStatus === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : u.distributorStatus === 'rejected'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.distributorStatus || 'none'}
                      </div>
                      <div className="text-slate-500">Limit: NPR {Number(u.creditLimitNpr || 0).toFixed(0)}</div>
                      <div className="text-slate-500">Used: NPR {Number(u.creditUsedNpr || 0).toFixed(0)}</div>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400">—</span>
                  )}
                </td>

                <td className="px-5 py-3.5">
                  <PasswordCell userId={u._id} rawPassword={u.rawPassword} />
                </td>

                <td className="px-5 py-3.5 text-sm text-slate-500">
                  {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                </td>

                <td className="px-5 py-3.5">
                  <UserActionsClient
                    userId={u._id}
                    initialRole={u.role}
                    initialActive={u.isActive}
                    distributorStatus={u.distributorStatus}
                    creditLimitNpr={Number(u.creditLimitNpr || 0)}
                    creditUsedNpr={Number(u.creditUsedNpr || 0)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-slate-500">Page <span className="font-medium text-slate-700">{page}</span> of <span className="font-medium text-slate-700">{totalPages}</span></div>
        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition-colors shadow-sm disabled:opacity-40" disabled={page <= 1} onClick={() => { setPage((p) => Math.max(1, p-1)); fetchUsers({ page: Math.max(1, page-1) }); }}>Prev</button>
          <button className="rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40" disabled={page >= totalPages} onClick={() => { setPage((p) => p+1); fetchUsers({ page: page+1 }); }}>Next</button>
        </div>
      </div>
    </div>
  );
}
