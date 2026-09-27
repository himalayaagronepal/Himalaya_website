import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import connectToDatabase from "../../../lib/mongodb";
import News from "../../../models/News";
import { agmNews } from "../../../lib/agm-notice";

function formatDate(dateValue?: Date | string | null) {
  if (!dateValue) return "";
  return new Date(dateValue).toLocaleDateString();
}

type ParamsLike = { slug: string } | Promise<{ slug: string }>;
type SearchLike = { lang?: string } | Promise<{ lang?: string }> | undefined;

export default async function NewsDetailPage({
  params,
  searchParams,
}: {
  params: ParamsLike;
  searchParams?: SearchLike;
}) {
  const resolvedParams = params instanceof Promise ? await params : params;
  const slug = resolvedParams.slug;
  const resolvedSearch = searchParams instanceof Promise ? await searchParams : searchParams;
  const lang = resolvedSearch?.lang === "ne" ? "ne" : "en";

  const item = slug === agmNews.slug
    ? agmNews
    : await (async () => {
        await connectToDatabase();
        return News.findOne({ slug, status: "published" }).lean();
      })();
  if (!item) return notFound();

  const hasNepali = Boolean((item.titleNe || "").trim() || (item.contentHtmlNe || "").trim());

  // Pick the requested language, falling back to English when a field is empty.
  const title = (lang === "ne" ? item.titleNe : "") || item.title;
  const category =
    (lang === "ne" ? item.categoryNe : "") || item.category || (lang === "ne" ? "समाचार" : "News");
  const rawContent = (lang === "ne" ? item.contentHtmlNe : "") || item.contentHtml || "";

  // Sanitize stored HTML server-side before injecting it (prevents stored XSS).
  const safeContentHtml = DOMPurify.sanitize(rawContent);

  return (
    <main className="bg-white text-slate-900">
      <div className="mx-auto w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        {/* Language switch — only shown when a Nepali translation exists */}
        {hasNepali ? (
          <div className="mb-6 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1">
            <Link
              href={`/news/${slug}`}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                lang === "en" ? "bg-emerald-600 text-white" : "text-slate-600 hover:text-emerald-700"
              }`}
            >
              English
            </Link>
            <Link
              href={`/news/${slug}?lang=ne`}
              className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                lang === "ne" ? "bg-emerald-600 text-white" : "text-slate-600 hover:text-emerald-700"
              }`}
            >
              नेपाली
            </Link>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500 mb-4">
          <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide">{category}</span>
          <span>{formatDate(item.publishedAt || item.createdAt)}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black leading-tight mb-5 sm:mb-6 break-words">{title}</h1>

        {item.coverImage ? (
          <div className="rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100 mb-6 sm:mb-8">
            <a href={item.coverImage} target="_blank" rel="noopener noreferrer" aria-label={`${title} — open full-resolution image`}>
              <img src={item.coverImage} alt={title} className="w-full h-auto object-contain" />
            </a>
          </div>
        ) : null}

        <div className="news-content" dangerouslySetInnerHTML={{ __html: safeContentHtml }} />
      </div>
    </main>
  );
}
