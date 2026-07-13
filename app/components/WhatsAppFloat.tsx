"use client";

/**
 * Fixed WhatsApp chat button on the bottom-right of every page.
 *
 * Update the `PHONE` constant below with the actual business number
 * (international format, digits only — no "+", spaces, or dashes).
 * Example for Nepal: "9779800000000" (977 = country code).
 */
const PHONE = "9779800000000";
const PREFILLED_MESSAGE =
  "Hello Himalaya Nepal Agriculture, I'd like to learn more.";

export default function WhatsAppFloat() {
  const href = `https://wa.me/${PHONE}?text=${encodeURIComponent(PREFILLED_MESSAGE)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      // `notranslate` keeps Google Translate from rewriting attributes/text on this element
      className="notranslate group fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_8px_24px_rgba(37,211,102,0.45)] ring-1 ring-white/30 transition-transform duration-200 hover:scale-110 sm:bottom-6 sm:right-6 sm:h-[60px] sm:w-[60px]"
      translate="no"
    >
      <span className="pointer-events-none absolute inset-0 rounded-full bg-[#25D366] opacity-60 animate-ping" />
      <svg
        viewBox="0 0 32 32"
        aria-hidden
        focusable="false"
        className="relative h-7 w-7 sm:h-8 sm:w-8 fill-current"
      >
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 01-.315-.1c-.802-.402-1.504-.817-2.163-1.4-.545-.489-1.143-1.355-1.6-1.98-.355-.491-.105-.751.1-1.027.155-.205.405-.531.605-.781.205-.255.205-.616.1-.866-.105-.25-.787-1.916-1.05-2.62-.205-.51-.405-.51-.555-.51-.155 0-.305-.025-.455-.025a.952.952 0 00-.697.305c-.255.255-.965.91-.965 2.236s.99 2.621 1.13 2.816c.155.205 1.95 3.075 4.787 4.305 2.34 1.01 2.835.811 3.351.811.516 0 1.66-.671 1.892-1.346.231-.671.231-1.247.155-1.347-.07-.105-.265-.205-.55-.345m-5.387 7.422h-.005a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.002-5.45 4.436-9.884 9.888-9.884a9.825 9.825 0 016.988 2.898 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.884 9.884m8.413-18.297A11.815 11.815 0 0014.05 2C7.495 2 2.16 7.335 2.157 13.892c0 2.096.547 4.142 1.588 5.945L2.057 26l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
      </svg>
    </a>
  );
}
