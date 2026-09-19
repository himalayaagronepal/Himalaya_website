"use client";

import { useState, useSyncExternalStore } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { ArrowRight, CalendarDays, ExternalLink, FileText, Megaphone, X } from "lucide-react";
import Link from "next/link";
import type { HomeAnnouncement } from "../../../lib/home-announcement";

const subscribe = () => () => {};
const clientSnapshot = () => true;
const serverSnapshot = () => false;

function NoticePreviewImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
      {failed ? (
        <p className="p-4 text-sm text-slate-600">This page preview is unavailable. Open the attachment below to read it.</p>
      ) : (
        // Preserve the original document's text and full page proportions.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} onError={() => setFailed(true)} className="block h-auto w-full object-contain" />
      )}
    </div>
  );
}

export default function LatestAnnouncementPopup({ announcement }: { announcement: HomeAnnouncement }) {
  // Mount the portal after hydration so its server and first client output match.
  const hydrated = useSyncExternalStore(subscribe, clientSnapshot, serverSnapshot);
  // Show on each homepage visit; closing an older notice must not hide a new one.
  const [open, setOpen] = useState(true);
  const [imageFailed, setImageFailed] = useState(false);
  const isNotice = announcement.kind === "notice";
  const date = new Date(announcement.publishedAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kathmandu",
  });

  if (!hydrated) return null;

  return (
    <Dialog open={open} onClose={setOpen} className="relative z-[100]">
      <DialogBackdrop className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm" />
      <div
        className="fixed inset-0 flex items-center justify-center p-3 sm:p-6"
        style={{
          paddingTop: "max(0.75rem, env(safe-area-inset-top))",
          paddingRight: "max(0.75rem, env(safe-area-inset-right))",
          paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
          paddingLeft: "max(0.75rem, env(safe-area-inset-left))",
        }}
      >
        <DialogPanel className="flex max-h-full w-full min-w-0 max-w-2xl flex-col overflow-hidden rounded-2xl bg-white text-slate-900 shadow-2xl sm:rounded-3xl">
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-emerald-100 bg-emerald-50 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <Megaphone aria-hidden="true" className="h-5 w-5 shrink-0 text-emerald-700" />
              <DialogTitle className="text-base font-bold text-emerald-950 sm:text-lg">
                {isNotice ? "Latest notice" : "Latest news"}
              </DialogTitle>
            </div>
            <button
              type="button"
              data-autofocus
              onClick={() => setOpen(false)}
              aria-label="Close popup"
              className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-600 transition-colors hover:bg-emerald-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              <X aria-hidden="true" className="h-5 w-5" />
            </button>
          </div>

          <div
            role="region"
            aria-label="Announcement content"
            tabIndex={0}
            className="min-h-0 overflow-y-auto overscroll-contain px-4 py-5 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-emerald-700 sm:px-6 sm:py-6"
          >
            <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
              <span className="max-w-full rounded-full bg-emerald-100 px-3 py-1 font-semibold wrap-anywhere text-emerald-800">
                {announcement.category}
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-500">
                <CalendarDays aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                <time dateTime={announcement.publishedAt}>{date}</time>
              </span>
            </div>
            <h3 className="text-xl leading-snug font-bold wrap-anywhere sm:text-2xl">
              {announcement.title}
            </h3>
            {announcement.titleNe && announcement.titleNe !== announcement.title && (
              <p lang="ne" className="mt-2 text-base leading-relaxed wrap-anywhere text-slate-600">
                {announcement.titleNe}
              </p>
            )}
            {announcement.excerpt && (
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-line wrap-anywhere text-slate-600 sm:text-base">
                {announcement.excerpt}
              </p>
            )}

            {announcement.previewImages?.length ? (
              <div className="mt-5 space-y-4">
                {announcement.previewImages.map((src, index) => (
                  <figure key={src}>
                    <NoticePreviewImage src={src} alt={`${announcement.title} — page ${index + 1}`} />
                    {announcement.previewImages!.length > 1 && (
                      <figcaption className="mt-2 text-center text-xs text-slate-500">
                        Page {index + 1} of {announcement.previewImages!.length}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            ) : announcement.imageUrl && !imageFailed ? (
              <div className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {/* Preserve the full uploaded poster, including extensionless raw uploads. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={announcement.imageUrl}
                  alt={announcement.title}
                  onError={() => setImageFailed(true)}
                  className="block h-auto w-full object-contain"
                />
              </div>
            ) : isNotice && announcement.href ? (
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <FileText aria-hidden="true" className="h-8 w-8 shrink-0 text-emerald-700" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">Official notice attachment</p>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    Open the attachment to read the full announcement.
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
            {announcement.href && (
              isNotice ? (
                <a
                  href={announcement.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                >
                  Open attachment
                  <ExternalLink aria-hidden="true" className="h-4 w-4 shrink-0" />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              ) : (
                <Link
                  href={announcement.href}
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
                >
                  Read full story <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" />
                </Link>
              )
            )}
            <Link
              href="/news-and-notices"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 items-center justify-center rounded-xl px-3 py-2 text-center text-sm font-semibold text-emerald-800 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
            >
              View all news &amp; notices
            </Link>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  );
}
