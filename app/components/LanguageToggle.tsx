"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

type Lang = "en" | "ne";

const COOKIE = "googtrans";

function readCookieLang(): Lang {
  if (typeof document === "undefined") return "en";
  const match = document.cookie.match(/googtrans=\/[^/]+\/(\w+)/);
  return match?.[1] === "ne" ? "ne" : "en";
}

/**
 * Returns the cookie `domain` values we should write to so that Google
 * Translate picks up the language preference across host + subdomain.
 *
 * - localhost / raw IP → no domain (host-only cookie)
 * - apex domain (example.com) → also write `.example.com`
 * - subdomain (www.example.com) → write `.example.com`
 */
function getDomains(): string[] {
  const host = window.location.hostname;
  if (!host || host === "localhost" || /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return [""];
  }
  const parts = host.split(".");
  if (parts.length <= 1) return [""];
  const parent = parts.slice(-2).join(".");
  // "" = host-only cookie; ".example.com" = shared across subdomains
  return ["", `.${parent}`];
}

function writeCookieAllDomains(value: string, expire: boolean) {
  const expiry = expire
    ? "expires=Thu, 01 Jan 1970 00:00:00 GMT"
    : "max-age=31536000";
  for (const d of getDomains()) {
    const domainPart = d ? `;domain=${d}` : "";
    document.cookie = `${COOKIE}=${value};path=/;${expiry}${domainPart}`;
  }
}

function setLang(lang: Lang) {
  if (lang === "en") {
    // Clear the cookie everywhere — that's what reliably returns the page to English
    writeCookieAllDomains("", true);
  } else {
    writeCookieAllDomains(`/en/${lang}`, false);
  }
  window.location.reload();
}

/**
 * Small EN ↔ NE switcher.
 *
 * Clicking writes the `googtrans` cookie and reloads — the Google
 * Translate widget reads the cookie on next paint and translates
 * (or restores) the page.
 */
export default function LanguageToggle({ className = "" }: { className?: string }) {
  const [lang, setCurrent] = useState<Lang>("en");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCurrent(readCookieLang());
    setMounted(true);
  }, []);

  const next: Lang = lang === "en" ? "ne" : "en";
  const label = lang === "en" ? "नेपाली" : "English";

  return (
    <button
      onClick={() => setLang(next)}
      aria-label={`Switch language to ${next === "ne" ? "Nepali" : "English"}`}
      // `notranslate` keeps the toggle text from being rewritten by the widget
      className={`notranslate inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-[12px] font-semibold text-gray-700 transition-colors hover:bg-green-50 hover:text-green-700 hover:border-green-200 ${className}`}
      // Hide on first paint until we've read the actual cookie to avoid flashing the wrong label
      style={mounted ? undefined : { visibility: "hidden" }}
      translate="no"
    >
      <Globe size={14} strokeWidth={2} />
      <span>{label}</span>
    </button>
  );
}
