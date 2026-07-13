import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../lib/auth";
import { hasPermission } from "../../../../lib/permissions";
import connectToDatabase from "../../../../lib/mongodb";
import User from "../../../../models/User";
import mongoose from "mongoose";

type AdminSession = {
  user?: {
    role?: string;
  };
};

type AdminUserDetail = {
  _id: mongoose.Types.ObjectId;
  name?: string | null;
  email?: string | null;
  role?: string;
  isActive?: boolean;
  distributorStatus?: string | null;
  businessName?: string | null;
  phoneNumber?: string | null;
  creditLimitNpr?: number;
  creditUsedNpr?: number;
  citizenshipFront?: string | null;
  citizenshipBack?: string | null;
  panCertificate?: string | null;
  rawPassword?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
};

type AdminUserView = {
  _id: string;
  name: string | null;
  email: string | null;
  role: string;
  isActive: boolean;
  distributorStatus: string;
  businessName: string | null;
  phoneNumber: string | null;
  creditLimitNpr: number;
  creditUsedNpr: number;
  citizenshipFront: string | null;
  citizenshipBack: string | null;
  panCertificate: string | null;
  rawPassword: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

function DocumentPreview({ label, url }: { label: string; url?: string | null }) {
  const hasUrl = typeof url === "string" && url.trim().length > 0;
  const isPdf = hasUrl && /\.pdf(\?|#|$)/i.test(url || "");

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-900">{label}</h3>
        {hasUrl ? (
          <a
            href={url || "#"}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-cyan-700 hover:text-cyan-800"
          >
            Open file
          </a>
        ) : (
          <span className="text-xs text-slate-400">Not provided</span>
        )}
      </div>

      {hasUrl ? (
        isPdf ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            PDF document uploaded
          </div>
        ) : (
          <Image
            src={url || ""}
            alt={label}
            width={1200}
            height={800}
            unoptimized
            className="h-56 w-full rounded-xl border border-slate-100 bg-slate-50 object-contain"
          />
        )
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
          No file uploaded
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-1 break-words text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

export default async function AdminUserDetailPage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
  const session = (await getServerSession(authOptions)) as AdminSession | null;
  if (!session || !hasPermission(session.user, "users")) return <div className="p-12">Unauthorized</div>;

  const resolvedParams = await Promise.resolve(params);
  const id = resolvedParams.id;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) notFound();

  await connectToDatabase();
  const user = await User.findById(id)
    .select("name email role isActive createdAt updatedAt distributorStatus businessName phoneNumber creditLimitNpr creditUsedNpr citizenshipFront citizenshipBack panCertificate +rawPassword")
    .lean<AdminUserDetail>();

  if (!user) notFound();

  const safeUser: AdminUserView = {
    _id: String(user._id),
    name: user.name || null,
    email: user.email || null,
    role: user.role || "user",
    isActive: !!user.isActive,
    distributorStatus: user.distributorStatus || "none",
    businessName: user.businessName || null,
    phoneNumber: user.phoneNumber || null,
    creditLimitNpr: Number(user.creditLimitNpr || 0),
    creditUsedNpr: Number(user.creditUsedNpr || 0),
    citizenshipFront: user.citizenshipFront || null,
    citizenshipBack: user.citizenshipBack || null,
    panCertificate: user.panCertificate || null,
    rawPassword: user.rawPassword || null,
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
    updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : null,
  };

  return (
    <main className="pb-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 rounded-[2rem] bg-slate-900 px-6 py-8 text-white shadow-2xl shadow-slate-900/20 sm:px-8">
          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">
            <span>User profile</span>
            <span className="rounded-full bg-white/10 px-3 py-1 tracking-normal text-white/80">{safeUser.role}</span>
            {safeUser.role === "distributor" && (
              <span className="rounded-full bg-cyan-500/20 px-3 py-1 tracking-normal text-cyan-100">{safeUser.distributorStatus}</span>
            )}
          </div>
          <div>
            <h1 className="text-3xl font-black leading-tight sm:text-4xl">{safeUser.name || safeUser.email}</h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-300">
              Complete admin view for the user, including distributor application details and uploaded identity documents.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <InfoRow label="Name" value={safeUser.name || "—"} />
          <InfoRow label="Email" value={safeUser.email || "—"} />
          <InfoRow label="Phone" value={safeUser.phoneNumber || "—"} />
          <InfoRow label="Business" value={safeUser.businessName || "—"} />
          <InfoRow label="Role" value={safeUser.role} />
          <InfoRow label="Status" value={safeUser.isActive ? "Active" : "Inactive"} />
          <InfoRow label="Distributor status" value={safeUser.distributorStatus} />
          <InfoRow label="Password (dev)" value={safeUser.rawPassword || "Not stored"} />
          <InfoRow label="Credit limit" value={`NPR ${safeUser.creditLimitNpr.toFixed(0)}`} />
          <InfoRow label="Credit used" value={`NPR ${safeUser.creditUsedNpr.toFixed(0)}`} />
          <InfoRow label="Created at" value={safeUser.createdAt ? new Date(safeUser.createdAt).toLocaleString() : "—"} />
          <InfoRow label="Updated at" value={safeUser.updatedAt ? new Date(safeUser.updatedAt).toLocaleString() : "—"} />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <DocumentPreview label="Citizenship Front" url={safeUser.citizenshipFront} />
          <DocumentPreview label="Citizenship Back" url={safeUser.citizenshipBack} />
          <DocumentPreview label="PAN Certificate" url={safeUser.panCertificate} />
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/admin/users" className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
            Back to users
          </Link>
          <a href={`/api/admin/users/${safeUser._id}`} className="rounded-full bg-cyan-600 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-700">
            Raw admin API record
          </a>
        </div>
      </div>
    </main>
  );
}
