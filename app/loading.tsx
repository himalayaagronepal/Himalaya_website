import React from "react";

/**
 * Default full-screen loading page. App Router uses the nearest `loading.tsx`
 * as the Suspense fallback while a route's server component streams in, so this
 * root-level loader covers every page that doesn't define its own (home, farms,
 * about, gallery, contact, …). The persistent navbar/footer stay mounted; only
 * the page content area shows this branded spinner.
 */
export default function Loading() {
  return (
    <div
      className="flex min-h-[calc(100svh-var(--top-bar-height,92px))] flex-col items-center justify-center gap-5 px-6 py-16"
      role="status"
      aria-live="polite"
    >
      <div className="relative h-16 w-16 sm:h-20 sm:w-20">
        {/* track */}
        <span className="absolute inset-0 rounded-full border-4 border-emerald-100" />
        {/* spinning arc */}
        <span className="absolute inset-0 rounded-full border-4 border-emerald-600 border-t-transparent animate-spin" />
        {/* brand mark */}
        <img
          src="/favicon-round.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-[9px] h-[calc(100%-18px)] w-[calc(100%-18px)] rounded-full object-contain"
        />
      </div>
      <p className="text-sm font-medium tracking-wide text-gray-500">Loading…</p>
      <span className="sr-only">Loading, please wait</span>
    </div>
  );
}
