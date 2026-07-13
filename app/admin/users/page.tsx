import React from "react";
import connectToDatabase from "../../../lib/mongodb";
import User from "../../../models/User";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../lib/auth";
import { hasPermission } from "../../../lib/permissions";
import AdminUsersClient from "../../components/admin/AdminUsersClient";

export default async function AdminUsersPage({ searchParams }: { searchParams?: Promise<{ page?: string }> }) {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "users")) return <div className="p-12">Unauthorized</div>;

  await connectToDatabase();
  const resolvedParams = await (searchParams ?? Promise.resolve({} as { page?: string }));
  const page = Math.max(1, parseInt(resolvedParams?.page || '1', 10));
  const perPage = 20;

  const [total, users] = await Promise.all([
    User.countDocuments({}),
    User.find({}).sort({ createdAt: -1 }).skip((page - 1) * perPage).limit(perPage).select('name email role isActive createdAt distributorStatus businessName phoneNumber creditLimitNpr creditUsedNpr +rawPassword').lean(),
  ]);

  // Convert any non-serializable fields (ObjectId, Date) into plain values
  const safeUsers = (users || []).map((u: any) => ({
    _id: String(u._id),
    name: u.name || null,
    email: u.email || null,
    role: u.role || 'user',
    distributorStatus: u.distributorStatus || 'none',
    businessName: u.businessName || null,
    phoneNumber: u.phoneNumber || null,
    creditLimitNpr: Number(u.creditLimitNpr || 0),
    creditUsedNpr: Number(u.creditUsedNpr || 0),
    isActive: !!u.isActive,
    createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : null,
    rawPassword: u.rawPassword || null,
  }));

  const adminCount = safeUsers.filter((u: any) => u.role === 'admin').length;
  const activeCount = safeUsers.filter((u: any) => u.isActive).length;

  return (
    <main className="pb-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full mb-3">Access</span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">User management</h1>
            <p className="mt-1 text-sm text-slate-500">Manage users, roles and activation status.</p>
          </div>
          <a href="/admin/users" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition-colors shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            Refresh
          </a>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 mb-8">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{total}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Registered accounts</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Admins</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{adminCount}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Admin role users</p>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-600 flex-shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active</p>
                <p className="text-2xl font-bold text-slate-900 mt-0.5">{activeCount}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-3">Currently active</p>
          </div>
        </div>

        {/* Users Table */}
        <AdminUsersClient
          initialUsers={safeUsers}
          initialTotal={Number(total || 0)}
          initialPage={page}
          initialPerPage={perPage}
        />
      </div>
    </main>
  );
}
