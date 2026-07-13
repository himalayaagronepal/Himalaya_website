import React from "react";
import { getServerSession } from "next-auth/next";
import authOptions from "../../../lib/auth";
import connectToDatabase from "../../../lib/mongodb";
import News from "../../../models/News";
import Notice from "../../../models/Notice";
import ContentSettings, { CONTENT_SETTINGS_DEFAULTS } from "../../../models/ContentSettings";
import AdminNewsClient from "../../components/admin/AdminNewsClient";
import AdminNoticesClient from "../../components/admin/AdminNoticesClient";
import ContentToggleClient from "../../components/admin/ContentToggleClient";
import { hasPermission } from "../../../lib/permissions";

// Toggles and notices are managed here, so always render the freshest data.
export const dynamic = "force-dynamic";

export default async function AdminNewsPage() {
  const session = (await getServerSession(authOptions as any)) as any;
  if (!session || !hasPermission(session.user, "news:read")) return <div className="p-12">Unauthorized</div>;

  await connectToDatabase();
  const [items, noticeDocs, settingsDoc] = await Promise.all([
    News.find({}).sort({ createdAt: -1 }).lean(),
    Notice.find({}).sort({ publishedAt: -1, createdAt: -1 }).lean(),
    ContentSettings.findOne({ singletonKey: "content" }).lean(),
  ]);

  const safe = items.map((n: any) => ({
    _id: String(n._id),
    title: n.title,
    slug: n.slug,
    status: n.status,
    category: n.category || "",
    coverImage: n.coverImage || "",
    updatedAt: n.updatedAt ? new Date(n.updatedAt).toISOString() : null,
    publishedAt: n.publishedAt ? new Date(n.publishedAt).toISOString() : null,
  }));

  const safeNotices = noticeDocs.map((n: any) => ({
    _id: String(n._id),
    title: n.title,
    titleNe: n.titleNe || "",
    type: n.type || "Notice",
    status: n.status,
    fileUrl: n.fileUrl || "",
    publishedAt: n.publishedAt ? new Date(n.publishedAt).toISOString() : null,
    createdAt: n.createdAt ? new Date(n.createdAt).toISOString() : null,
    updatedAt: n.updatedAt ? new Date(n.updatedAt).toISOString() : null,
  }));

  const contentSettings = {
    newsDummyEnabled:
      typeof settingsDoc?.newsDummyEnabled === "boolean"
        ? settingsDoc.newsDummyEnabled
        : CONTENT_SETTINGS_DEFAULTS.newsDummyEnabled,
    noticesDummyEnabled:
      typeof settingsDoc?.noticesDummyEnabled === "boolean"
        ? settingsDoc.noticesDummyEnabled
        : CONTENT_SETTINGS_DEFAULTS.noticesDummyEnabled,
  };

  const publishedCount = safe.filter((n: any) => n.status === "published").length;
  const draftCount = safe.filter((n: any) => n.status === "draft").length;
  const categories = [...new Set(safe.map((n: any) => n.category).filter(Boolean))];

  return (
    <main className="pb-16">
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full">Content</span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-bold text-slate-900">News</h1>
            <p className="mt-1 text-sm text-slate-500">Manage your news posts and announcements.</p>
          </div>
          <div className="flex items-center gap-2 self-start">
            <a href="/admin/news/add" className="rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 text-sm font-medium transition-colors inline-flex items-center gap-1.5">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
              Add news
            </a>
            <a href="/admin/news" className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition-colors shadow-sm">
              Refresh
            </a>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Total Posts</div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{safe.length}</div>
                <div className="mt-1 text-xs text-slate-400">All news articles</div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-cyan-50 flex items-center justify-center"><svg className="h-5 w-5 text-cyan-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/></svg></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Published</div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{publishedCount}</div>
                <div className="mt-1 text-xs text-slate-400">Live &amp; visible</div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-emerald-50 flex items-center justify-center"><svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Drafts</div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{draftCount}</div>
                <div className="mt-1 text-xs text-slate-400">Awaiting publish</div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center"><svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg></div>
            </div>
          </div>

          <div className="bg-white border border-slate-200/60 rounded-2xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">Categories</div>
                <div className="mt-2 text-2xl font-bold text-slate-900">{categories.length}</div>
                <div className="mt-1 text-xs text-slate-400">Unique topics</div>
              </div>
              <div className="h-10 w-10 rounded-xl bg-violet-50 flex items-center justify-center"><svg className="h-5 w-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg></div>
            </div>
          </div>
        </div>

        {/* Dummy-data toggles for the public News & Notices page */}
        <div className="mb-6">
          <ContentToggleClient initialSettings={contentSettings} />
        </div>

        {/* News Table */}
        <AdminNewsClient initialItems={safe} />

        {/* Notices manager (publishes the public Notices board) */}
        <div className="mt-10 pt-8 border-t border-slate-200">
          <AdminNoticesClient initialItems={safeNotices} />
        </div>
      </div>
    </main>
  );
}
