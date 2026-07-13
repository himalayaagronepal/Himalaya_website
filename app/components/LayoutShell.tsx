"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import LanguageWidget from "./LanguageWidget";
import WhatsAppFloat from "./WhatsAppFloat";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardArea = pathname?.startsWith("/admin");
  const isHomePage = pathname === "/";

  return (
    <>
      {!isDashboardArea && <Navbar />}
      <main>
        {children}
      </main>
      {!isDashboardArea && <Footer />}
      {!isDashboardArea && (
        <>
          <LanguageWidget />
          <WhatsAppFloat />
        </>
      )}
    </>
  );
}
