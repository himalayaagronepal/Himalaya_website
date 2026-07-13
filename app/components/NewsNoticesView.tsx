"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Calendar, ArrowRight, Download, Megaphone, Newspaper } from "lucide-react";
import { Section as AnimatedSection, Div as AnimatedDiv } from "./AnimatedClient";

// ── Shared content shapes (built server-side, one set per language) ──────────
export type FeaturedItem = {
  title: string;
  date: string;
  category: string; // localized display label
  categoryKey: string; // English key used only for the badge colour
  excerpt: string;
  image: string;
  href: string;
};

export type NewsCard = FeaturedItem;

export type NoticeCard = {
  day: string;
  month: string;
  year: string;
  type: string; // English key used only for the badge colour
  typeLabel: string; // localized display label
  title: string;
  href: string;
};

export type LangContent = {
  featured: FeaturedItem | null;
  news: NewsCard[];
  notices: NoticeCard[];
};

export type Lang = "en" | "ne";

const categoryColors: Record<string, string> = {
  Sustainability: "bg-emerald-100 text-emerald-700",
  Infrastructure: "bg-violet-100 text-violet-700",
  Partnership: "bg-sky-100 text-sky-700",
  Community: "bg-rose-100 text-rose-700",
  Awards: "bg-amber-100 text-amber-700",
};

const noticeColors: Record<string, string> = {
  Notice: "bg-emerald-100 text-emerald-700",
  Tender: "bg-amber-100 text-amber-700",
  Vacancy: "bg-sky-100 text-sky-700",
  Circular: "bg-violet-100 text-violet-700",
  Result: "bg-rose-100 text-rose-700",
};

const categoryClass = (key: string) => categoryColors[key] || "bg-emerald-100 text-emerald-700";
const noticeClass = (type: string) => noticeColors[type] || "bg-slate-100 text-slate-700";

// Static UI strings per language.
const STRINGS = {
  en: {
    latestNews: "Latest News",
    notices: "Notices",
    readFullStory: "Read full story",
    viewAllNotices: "View all notices",
    noNews: "No news published yet.",
    noNewsSub: "Published news articles will appear here.",
    noNotices: "No notices published yet.",
    noNoticesSub: "Published notices will appear here.",
    subscribeTitle: "Get notices in your inbox",
    subscribeDesc:
      "Subscribe to receive official announcements, tenders and notices the moment they are published.",
    emailPlaceholder: "Enter your email",
    subscribe: "Subscribe",
  },
  ne: {
    latestNews: "ताजा समाचार",
    notices: "सूचनाहरू",
    readFullStory: "पूरा समाचार पढ्नुहोस्",
    viewAllNotices: "सबै सूचना हेर्नुहोस्",
    noNews: "हालसम्म कुनै समाचार प्रकाशित गरिएको छैन।",
    noNewsSub: "प्रकाशित समाचारहरू यहाँ देखिनेछन्।",
    noNotices: "हालसम्म कुनै सूचना प्रकाशित गरिएको छैन।",
    noNoticesSub: "प्रकाशित सूचनाहरू यहाँ देखिनेछन्।",
    subscribeTitle: "सूचनाहरू आफ्नो इनबक्समा पाउनुहोस्",
    subscribeDesc:
      "आधिकारिक घोषणा, बोलपत्र र सूचनाहरू प्रकाशित हुनासाथ प्राप्त गर्न सदस्यता लिनुहोस्।",
    emailPlaceholder: "आफ्नो इमेल लेख्नुहोस्",
    subscribe: "सदस्यता लिनुहोस्",
  },
} as const;

// Carry the chosen language to the news detail page so it can render Nepali too.
function withLang(href: string, lang: Lang) {
  if (lang === "ne" && href.startsWith("/news/")) {
    return href.includes("?") ? `${href}&lang=ne` : `${href}?lang=ne`;
  }
  return href;
}

export default function NewsNoticesView({ en, ne }: { en: LangContent; ne: LangContent }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = STRINGS[lang];
  const { featured, news, notices } = lang === "ne" ? ne : en;

  const FeaturedWrapper: any = featured && featured.href && featured.href !== "#" ? Link : "article";

  return (
    <div className="mx-auto w-full max-w-[1650px] px-4 sm:px-6 lg:px-8 py-12 sm:py-14 lg:py-16">
      {/* ── Language switch (English / नेपाली) ── */}
      <div className="mb-10 flex justify-center sm:justify-end">
        <div
          role="group"
          aria-label="Select language"
          className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-1 shadow-sm"
        >
          <button
            type="button"
            onClick={() => setLang("en")}
            aria-pressed={lang === "en"}
            className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
              lang === "en" ? "bg-emerald-600 text-white shadow" : "text-slate-600 hover:text-emerald-700"
            }`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLang("ne")}
            aria-pressed={lang === "ne"}
            className={`rounded-full px-5 py-2 text-sm font-bold transition-colors ${
              lang === "ne" ? "bg-emerald-600 text-white shadow" : "text-slate-600 hover:text-emerald-700"
            }`}
          >
            नेपाली
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3 lg:gap-10">
        {/* ── Left: News column ── */}
        <div className="lg:col-span-2">
          <AnimatedSection>
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <Newspaper className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-black tracking-tight sm:text-2xl">{t.latestNews}</h2>
            </div>

            {featured ? (
              <>
                {/* Featured story */}
                <FeaturedWrapper
                  {...(FeaturedWrapper === Link ? { href: withLang(featured.href, lang) } : {})}
                  className="group mb-6 grid overflow-hidden rounded-3xl border border-slate-100 bg-slate-50/50 sm:grid-cols-2"
                >
                  <div className="aspect-video overflow-hidden sm:aspect-auto sm:h-full">
                    <img
                      src={featured.image}
                      alt={featured.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="flex flex-col justify-center p-5 sm:p-7">
                    <div className="mb-3 flex items-center gap-3">
                      {featured.category ? (
                        <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${categoryClass(featured.categoryKey)}`}>
                          {featured.category}
                        </span>
                      ) : null}
                      {featured.date ? (
                        <span className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Calendar className="h-3.5 w-3.5" /> {featured.date}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-lg font-black leading-snug tracking-tight sm:text-xl lg:text-2xl">
                      {featured.title}
                    </h3>
                    {featured.excerpt ? (
                      <p className="mt-3 text-sm leading-relaxed text-slate-500">{featured.excerpt}</p>
                    ) : null}
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 group-hover:gap-2.5 transition-all">
                      {t.readFullStory} <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </FeaturedWrapper>

                {/* News list */}
                <div className="space-y-4">
                  {news.map((item, i) => {
                    const isLink = item.href && item.href !== "#";
                    const Wrapper: any = isLink ? Link : "article";
                    return (
                      <AnimatedDiv key={i}>
                        <Wrapper
                          {...(isLink ? { href: withLang(item.href, lang) } : {})}
                          className="group flex gap-4 rounded-2xl border border-slate-100 p-3 transition-all duration-300 hover:border-emerald-200 hover:shadow-md sm:gap-5 sm:p-4"
                        >
                          <div className="h-24 w-28 flex-shrink-0 overflow-hidden rounded-xl sm:h-28 sm:w-44">
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="mb-1.5 flex flex-wrap items-center gap-2">
                              {item.category ? (
                                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${categoryClass(item.categoryKey)}`}>
                                  {item.category}
                                </span>
                              ) : null}
                              {item.date ? (
                                <span className="flex items-center gap-1 text-[11px] text-slate-400">
                                  <Calendar className="h-3 w-3" /> {item.date}
                                </span>
                              ) : null}
                            </div>
                            <h3 className="text-base font-bold leading-snug tracking-tight transition-colors group-hover:text-emerald-700 sm:text-lg">
                              {item.title}
                            </h3>
                            {item.excerpt ? (
                              <p className="mt-1.5 hidden text-sm leading-relaxed text-slate-500 sm:line-clamp-2">
                                {item.excerpt}
                              </p>
                            ) : null}
                          </div>
                        </Wrapper>
                      </AnimatedDiv>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
                <p className="text-sm font-medium text-slate-500">{t.noNews}</p>
                <p className="mt-1 text-xs text-slate-400">{t.noNewsSub}</p>
              </div>
            )}
          </AnimatedSection>
        </div>

        {/* ── Right: Notices board ── */}
        <aside className="lg:col-span-1">
          <AnimatedSection className="lg:sticky lg:top-[150px]">
            <div className="mb-6 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-white">
                <Megaphone className="h-5 w-5" />
              </span>
              <h2 className="text-xl font-black tracking-tight sm:text-2xl">{t.notices}</h2>
            </div>

            {notices.length > 0 ? (
              <div className="overflow-hidden rounded-3xl border border-slate-100">
                {notices.map((notice, i) => {
                  const isLink = notice.href && notice.href !== "#";
                  return (
                    <a
                      key={i}
                      href={notice.href}
                      {...(isLink ? { target: "_blank", rel: "noreferrer" } : {})}
                      className={`group flex items-start gap-3.5 p-4 transition-colors hover:bg-emerald-50/50 ${
                        i !== notices.length - 1 ? "border-b border-slate-100" : ""
                      }`}
                    >
                      {/* Date block */}
                      <div className="flex h-14 w-14 flex-shrink-0 flex-col items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                        <span className="text-lg font-black leading-none">{notice.day}</span>
                        <span className="text-[10px] font-bold uppercase tracking-wide">{notice.month}</span>
                      </div>
                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${noticeClass(notice.type)}`}>
                            {notice.typeLabel}
                          </span>
                          <span className="text-[11px] text-slate-400">{notice.year}</span>
                        </div>
                        <h4 className="mt-1.5 text-sm font-semibold leading-snug text-slate-800 transition-colors group-hover:text-emerald-700">
                          {notice.title}
                        </h4>
                      </div>
                      <Download className="mt-1 h-4 w-4 flex-shrink-0 text-slate-300 transition-colors group-hover:text-emerald-600" />
                    </a>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/50 p-10 text-center">
                <p className="text-sm font-medium text-slate-500">{t.noNotices}</p>
                <p className="mt-1 text-xs text-slate-400">{t.noNoticesSub}</p>
              </div>
            )}

            <Link
              href="#"
              className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700"
            >
              {t.viewAllNotices} <ArrowRight className="h-4 w-4" />
            </Link>
          </AnimatedSection>
        </aside>
      </div>

      {/* Subscribe strip */}
      <AnimatedSection className="relative mt-14 overflow-hidden rounded-3xl bg-emerald-900 px-6 py-10 sm:mt-16 sm:px-10 sm:py-12">
        <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-emerald-400/15 blur-[90px]" />
        <div className="relative z-10 flex flex-col items-center justify-between gap-6 lg:flex-row lg:gap-10">
          <div className="text-center lg:text-left">
            <h2 className="text-2xl font-black text-white sm:text-3xl">{t.subscribeTitle}</h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-emerald-100/70 sm:text-base">
              {t.subscribeDesc}
            </p>
          </div>
          <div className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder={t.emailPlaceholder}
              className="flex-1 rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm text-white placeholder-emerald-100/50 transition-colors focus:border-emerald-300 focus:outline-none"
            />
            <button className="rounded-full bg-white px-7 py-3 text-sm font-bold text-emerald-900 transition-colors hover:bg-emerald-50">
              {t.subscribe}
            </button>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
}
