import React from "react";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../../lib/auth";
import { hasPermission } from "../../../../lib/permissions";
import NewsEditorClient from "../../../components/admin/NewsEditorClient";

export default async function AdminNewsAddPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "news:write")) return <div className="p-12">Unauthorized</div>;

  return (
    <main className="pb-16">
      <div className="max-w-7xl mx-auto py-16 px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.3em] text-sky-600">Content</span>
            <h1 className="mt-3 text-4xl font-black text-slate-900">Add news</h1>
            <p className="mt-3 text-sm text-slate-500">Create a new announcement with a WordPress-like editor.</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/admin/news"
              className="rounded-full border border-slate-200 bg-white px-5 py-2.5 text-sm text-slate-700"
            >
              ← Back to news
            </a>
          </div>
        </div>

        <div className="mt-10">
          <NewsEditorClient mode="create" />
        </div>
      </div>
    </main>
  );
}
