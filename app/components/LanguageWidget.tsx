"use client";

import Script from "next/script";

declare global {
  interface Window {
    googleTranslateElementInit?: () => void;
    google?: {
      translate?: {
        TranslateElement: {
          new (config: Record<string, unknown>, elementId: string): unknown;
          InlineLayout: { SIMPLE: number };
        };
      };
    };
  }
}

/**
 * Loads the Google Website Translator and mounts a (visually hidden but
 * still laid-out) target element. LanguageToggle drives the actual
 * language switch via the `googtrans` cookie.
 *
 * Notes:
 *  - We use `next/script` with `afterInteractive` so the script loads
 *    reliably after hydration without blocking paint.
 *  - The translate element is positioned off-screen instead of `display:none`,
 *    because Google's widget occasionally fails to initialize when its
 *    container has no layout box.
 */
export default function LanguageWidget() {
  return (
    <>
      {/* `inert` keeps the Google-injected <select> out of the tab order / a11y tree
          (it is hidden and driven via the googtrans cookie, never focused directly),
          which resolves the axe "aria-hidden-focus" violation. */}
      <div id="google_translate_element" aria-hidden="true" inert />

      <Script id="gt-init" strategy="afterInteractive">
        {`
          window.googleTranslateElementInit = function () {
            if (!window.google || !window.google.translate) return;
            new window.google.translate.TranslateElement({
              pageLanguage: 'en',
              includedLanguages: 'en,ne',
              autoDisplay: false,
              layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
            }, 'google_translate_element');
          };
        `}
      </Script>

      <Script
        src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
        strategy="afterInteractive"
      />

    </>
  );
}
