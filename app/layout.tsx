import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import "flag-icons/css/flag-icons.min.css";
// import BeautifulNavbar from "./components/BeautifulNavbar";
import SessionProviderClient from "./providers/SessionProviderClient";
import DevServiceWorkerCleanup from "./components/DevServiceWorkerCleanup";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import LayoutShell from "./components/LayoutShell";
import LoadingBarProvider from "./components/LoadingBarProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.himalayaagronepal.com";
const SITE_DESCRIPTION = "Premium Nepalese agricultural products — from farm to your doorstep.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "HNKCL",
    template: "%s-HNKCL",
  },
  description: SITE_DESCRIPTION,
  icons: {
    icon: "/favicon-round.png",
    shortcut: "/favicon-round.png",
    apple: "/logo_original.png",
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Himalaya Agro Nepal",
    title: "HNKCL — Himalaya Agro Nepal",
    description: SITE_DESCRIPTION,
    url: "/",
    images: [{ url: "/logo_original.png", alt: "Himalaya Agro Nepal" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "HNKCL — Himalaya Agro Nepal",
    description: SITE_DESCRIPTION,
    images: ["/logo_original.png"],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover" as const,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/png" href="/favicon-round.png" />
        <link rel="shortcut icon" href="/favicon-round.png" />
        <link rel="apple-touch-icon" href="/logo_original.png" />
        {process.env.NODE_ENV !== 'production' ? (
          // Inline script runs as early as possible to mute noisy Workbox/_rsc logs
          <script
            dangerouslySetInnerHTML={{
              __html: `(() => {
  try {
    const FILTER_RE = /workbox|_rsc=|workbox-\w+/i;
    ['log','info','warn','error','debug'].forEach((m) => {
      const orig = console[m];
      console[m] = function(...args){
        try { if (args.length && typeof args[0] === 'string' && FILTER_RE.test(args[0])) return; } catch(e){}
        return orig.apply(console, args);
      };
    });
  } catch(e){}
})();`,
            }}
          />
        ) : null}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} font-sans antialiased`}
        style={{ fontFamily: 'var(--font-inter), var(--font-geist-sans), system-ui, sans-serif' }}
        suppressHydrationWarning
      >
        <SessionProviderClient>
          {process.env.NODE_ENV !== 'production' && <DevServiceWorkerCleanup />}
          <LoadingBarProvider>
            <LayoutShell>{children}</LayoutShell>
          </LoadingBarProvider>
          <ToastContainer position="top-right" />
        </SessionProviderClient>
      </body>
    </html>
  );
}
