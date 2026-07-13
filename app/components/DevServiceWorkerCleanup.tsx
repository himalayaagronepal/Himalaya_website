"use client";

import { useEffect } from "react";

export default function DevServiceWorkerCleanup() {
  useEffect(() => {
    // Dev-only: don't run in production
    if (process.env.NODE_ENV === "production") return;
    if (typeof window === "undefined") return;

    // Only operate on localhost to avoid affecting real users
    if (!/^(localhost|127\.0\.0\.1)$/.test(window.location.hostname)) return;

    // Unregister any service workers registered for localhost (removes Workbox logs)
    if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
      navigator.serviceWorker
        .getRegistrations()
        .then((regs) => {
          regs.forEach((r) => {
            r.unregister().then((ok) => {
              if (ok) console.debug("[dev] unregistered service worker:", r.scope);
            });
          });
        })
        .catch(() => {});
    }

    // Quiet noisy Workbox / RSC messages in dev console (filter-only => non-destructive)
    try {
      const FILTER_RE = /workbox|_rsc=|workbox-\w+/i;
      (['log', 'info', 'warn', 'error', 'debug'] as const).forEach((method) => {
        const orig = (console as any)[method];
        (console as any)[method] = (...args: any[]) => {
          try {
            if (args.length > 0 && typeof args[0] === 'string' && FILTER_RE.test(args[0])) return;
          } catch (e) {
            /* ignore */
          }
          orig.apply(console, args);
        };
      });
    } catch (e) {
      /* noop */
    }
  }, []);

  return null;
}
