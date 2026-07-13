"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "../../store/useCart";
import { motion, AnimatePresence } from "framer-motion";
import { adminLandingForPermissions, outletEmployeeLandingPath } from "../../lib/permissions";
import { Search, ShoppingCart, ChevronDown, Menu, X, Store, Send, Leaf, Drumstick, Milk, Fish, Mountain, BookOpen, Info, Users, Briefcase, MessageSquareQuote } from "lucide-react";
import LanguageToggle from "./LanguageToggle";
import { useLoadingBar } from "./LoadingBarProvider";

type SessionUser = {
  role?: string;
  permissions?: string[];
  employeeRole?: string;
  outletSlug?: string;
  distributorStatus?: string;
};

const farmsDropdownItems = [
  { label: "Explore Our Farms", href: "/farms",         description: "Watch our story & all farms", Icon: Leaf },
  { label: "Poultry Sheds",     href: "/farms/poultry", description: "Modern poultry operations",    Icon: Drumstick },
  { label: "Buffalo Farm",      href: "/farms/buffalo", description: "Dairy & buffalo livestock",    Icon: Milk },
  { label: "Fish Ponds",        href: "/farms/fish",    description: "Aquaculture facilities",        Icon: Fish },
  { label: "Goat Grazing",      href: "/farms/goat",    description: "Free-range goat farming",       Icon: Mountain },
];

const aboutDropdownItems = [
  { label: "Who We Are",         href: "/about-us/who-we-are",         description: "Our story & values",          Icon: Info },
  { label: "Hear From the MD",   href: "/about-us/hear-from-md",       description: "Message from our MD",         Icon: MessageSquareQuote },
  { label: "Board of Directors", href: "/about-us/board-of-directors", description: "Chairperson & board members", Icon: Briefcase },
  { label: "Executive Team",     href: "/about-us/executive-team",     description: "The officers who run HNA",    Icon: Users },
];

// Map dropdown label → items so the renderer can switch generically
const dropdownItemsByLabel: Record<string, typeof farmsDropdownItems> = {
  "About Us": aboutDropdownItems as unknown as typeof farmsDropdownItems,
  "Explore Our Farms": farmsDropdownItems,
};

const navLinks: { label: string; href: string; isDropdown?: boolean }[] = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "#", isDropdown: true },
  { label: "Explore Our Farms", href: "#", isDropdown: true },
  { label: "Product", href: "/shop" },
  { label: "Outlet", href: "/outlet" },
  { label: "Gallery", href: "/gallery" },
  { label: "News and Notices", href: "/news-and-notices" },
  { label: "Contact", href: "/contact" },
];

const GREEN = "#15803d";
const GREEN_HOVER = "#16a34a";

const dropdownVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.22, ease: "easeOut" as const },
  },
  exit: {
    opacity: 0, y: 8, scale: 0.97,
    transition: { duration: 0.15, ease: "easeIn" as const },
  },
};

const mobilePanelVariants = {
  hidden: { x: "-100%" },
  visible: { x: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
  exit:    { x: "-100%", transition: { duration: 0.3, ease: "easeIn" as const } },
};

const mobileItemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: (i: number) => ({
    opacity: 1, x: 0,
    transition: { delay: 0.05 * i + 0.12, duration: 0.3, ease: "easeOut" as const },
  }),
};

function NavUnderline() {
  return (
    <motion.span
      layoutId="nav-underline"
      className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full"
      style={{ backgroundColor: GREEN }}
      transition={{ type: "spring", stiffness: 350, damping: 28 }}
    />
  );
}

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (!href || href === "#") return false;
  return pathname.startsWith(href);
}

export default function Navbar() {
  const { data: session } = useSession();
  const sessionUser = session?.user as SessionUser | undefined;
  const role = sessionUser?.role;
  const permissions = sessionUser?.permissions || [];

  // Collapse to mobile if nav overlaps logo or actions
  const COLLAPSE_BREAKPOINT = 1280;
  useEffect(() => {
    const measure = () => {
      if (window.innerWidth >= COLLAPSE_BREAKPOINT) { setForceCollapse(false); return; }
      const logoRect = logoRef.current?.getBoundingClientRect();
      const navRect = navRef.current?.getBoundingClientRect();
      const actionsRect = actionsRef.current?.getBoundingClientRect();
      if (!logoRect || !navRect || !actionsRect) { setForceCollapse(false); return; }
      const pad = 8;
      const overlapLeft = navRect.left < (logoRect.right + pad);
      const overlapRight = navRect.right > (actionsRect.left - pad);
      setForceCollapse(overlapLeft || overlapRight);
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (logoRef.current) ro.observe(logoRef.current);
    if (navRef.current) ro.observe(navRef.current);
    if (actionsRef.current) ro.observe(actionsRef.current);
    window.addEventListener("resize", measure, { passive: true });
    return () => { ro.disconnect(); window.removeEventListener("resize", measure); };
  }, []);
  const canAccessAdmin = role === "admin" || (Array.isArray(permissions) && permissions.length > 0);
  const landingForPermissions = adminLandingForPermissions(permissions);
  const employeeLanding = outletEmployeeLandingPath(sessionUser);
  const adminTarget = role === "admin"
    ? "/admin/dashboard"
    : role === "employee"
      ? employeeLanding
      : landingForPermissions;
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Which desktop dropdown (by label) is currently open; null means none
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  // Which mobile drawer dropdown (by label) is currently expanded
  const [mobileOpenDropdown, setMobileOpenDropdown] = useState<string | null>(null);
  const dropdownContainerRef = useRef<HTMLDivElement | null>(null);
  const cart = useCart((s) => s.items);
  const cartCount = cart.reduce((s, i) => s + (i.quantity || 0), 0);
  const router = useRouter();
  const { start: startLoadingBar } = useLoadingBar();
  // Navigate programmatically while showing the global top progress bar. The
  // bar auto-starts for <Link>/<a> clicks; button-driven router.push() calls
  // need it kicked off manually. complete() fires on the resulting route change.
  const go = (href: string) => { startLoadingBar(); router.push(href); };
  const headerRef = useRef<HTMLElement | null>(null);
  const logoRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const actionsRef = useRef<HTMLDivElement | null>(null);
  const [forceCollapse, setForceCollapse] = useState(false);
  
  const [headerHeight, setHeaderHeight] = useState(0);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  function navigateAndClose(href: string) {
    setMobileOpen(false);
    setMobileOpenDropdown(null);
    go(href);
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // Close any open desktop dropdown when the user clicks outside of all dropdowns
    const onDoc = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (!target.closest('[data-dropdown="true"]')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  

  useEffect(() => {
    if (!mobileOpen) { document.body.style.overflow = ""; return; }
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setMobileOpenDropdown(null);
    setOpenDropdown(null);
  }, [pathname]);

  useEffect(() => {
    const node = headerRef.current;
    if (!node) return;
    const update = () => setHeaderHeight(node.getBoundingClientRect().height);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
      setHeaderHeight(0);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty("--top-bar-height", `${headerHeight}px`);
  }, [headerHeight]);

  return (
    <motion.header
      ref={headerRef}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" as const }}
      className="sticky top-0 left-0 right-0 z-50 w-full"
    >
      <div
        className={`w-full bg-white/95 backdrop-blur-md border-b border-gray-100 transition-all duration-300 ${
          scrolled ? "shadow-md shadow-black/10" : "shadow-sm shadow-black/5"
        }`}
      >
        <div className="max-w-[1650px] mx-auto w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 sm:gap-4 md:gap-8 lg:gap-10 h-[64px] sm:h-[68px] lg:h-[71px] xl:h-[75px] 2xl:h-[77px] pb-[3px]">

            {/* Logo */}
            <Link href="/">
              <div ref={logoRef} className="shrink-0 flex items-center mr-4 sm:mr-6 md:mr-8" aria-label="Home">
              <motion.img
                src="/wide-logo.jpeg"
                alt="Himalaya Nepal Krishi"
                loading="eager"
                className="hidden lg:block h-[52px] xl:h-[56px] 2xl:h-[60px] w-auto max-w-[255px] xl:max-w-[275px] 2xl:max-w-[295px] object-contain pb-[3px]"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.25 }}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/logo_original.png";
                }}
              />
              <motion.img
                src="/logo_mobile_screen.png"
                alt="Himalaya"
                loading="eager"
                className="h-14 sm:h-16 lg:hidden w-auto max-w-[140px] object-contain"
                whileHover={{ scale: 1.04 }}
                transition={{ duration: 0.25 }}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/logo_original.png";
                }}
              />
              </div>
            </Link>

            {/* Desktop nav */}
            <nav
              ref={navRef}
              className={`${forceCollapse ? "hidden" : "hidden xl:flex"} min-w-0 flex-1 items-center justify-center gap-1 sm:gap-2 md:gap-2 xl:gap-4 whitespace-nowrap overflow-visible`}
              onMouseLeave={() => setHoveredLink(null)}
            >
              {(() => {
                const activeLabel = navLinks.find(
                  (l) => !l.isDropdown && isActivePath(pathname, l.href)
                )?.label ?? null;
                const underlineTarget = hoveredLink || activeLabel;

                return (
                  <>
                    {navLinks.map((link) => {
                      if (link.isDropdown) {
                        const items = dropdownItemsByLabel[link.label] ?? [];
                        const isOpen = openDropdown === link.label;
                        return (
                          <div
                            key={link.label}
                            className="relative"
                            data-dropdown="true"
                            onMouseEnter={() => { setOpenDropdown(link.label); setHoveredLink(link.label); }}
                            onMouseLeave={() => { setOpenDropdown((c) => (c === link.label ? null : c)); setHoveredLink(null); }}
                          >
                            <button
                              onClick={() => setOpenDropdown((c) => (c === link.label ? null : link.label))}
                              className={`relative flex items-center gap-1 px-1 sm:px-1.5 py-1 text-[11px] sm:text-[12px] md:text-[12px] lg:text-[13px] 2xl:text-[14px] font-medium transition-colors duration-200 whitespace-nowrap ${
                                underlineTarget === link.label ? "text-green-700" : "text-gray-700 hover:text-green-700"
                              }`}
                            >
                              <span className="relative inline-block">
                                {link.label}
                                {underlineTarget === link.label && <NavUnderline />}
                              </span>
                              <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }} className="inline-flex">
                                <ChevronDown size={14} />
                              </motion.span>
                            </button>
                            <AnimatePresence initial={false} mode="wait">
                                  {isOpen && (
                                    <motion.div
                                      variants={dropdownVariants}
                                      initial="hidden"
                                      animate="visible"
                                      exit="exit"
                                      className="absolute top-full left-0 md:left-1/2 md:-translate-x-1/2 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 overflow-hidden z-50"
                                    >
                                  {items.map((item, idx) => (
                                    <motion.div
                                      key={item.label}
                                      initial={{ opacity: 0, y: 6 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: idx * 0.04, duration: 0.2 }}
                                    >
                                      <Link
                                        href={item.href}
                                        onClick={() => setOpenDropdown(null)}
                                        className="flex items-center gap-3 w-full text-left px-4 py-2.5 hover:bg-green-50 transition-colors duration-200 group"
                                      >
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-700 group-hover:bg-green-200 transition-colors">
                                          <item.Icon size={16} strokeWidth={1.9} />
                                        </span>
                                        <span className="min-w-0 flex-1">
                                          <span className="block text-sm font-semibold text-gray-800 group-hover:text-green-700 transition-colors">{item.label}</span>
                                          <span className="block text-[11px] text-gray-400 mt-0.5 leading-tight">{item.description}</span>
                                        </span>
                                      </Link>
                                    </motion.div>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      }

                      const active = isActivePath(pathname, link.href);
                      return (
                        <Link
                          key={link.label}
                          href={link.href}
                          onMouseEnter={() => setHoveredLink(link.label)}
                          className={`relative px-1 sm:px-1.5 py-1 text-[11px] sm:text-[12px] md:text-[12px] lg:text-[13px] 2xl:text-[14px] font-medium transition-colors duration-200 whitespace-nowrap ${
                            active || hoveredLink === link.label ? "text-green-700" : "text-gray-700 hover:text-green-700"
                          }`}
                        >
                          <span className="relative inline-block">
                            {link.label}
                            {underlineTarget === link.label && <NavUnderline />}
                          </span>
                        </Link>
                      );
                    })}
                  </>
                );
              })()}
            </nav>

            {/* Right actions */}
            <div ref={actionsRef} className="flex items-center gap-0.5 sm:gap-1 md:gap-1 shrink-0">
              <LanguageToggle className="hidden sm:inline-flex" />

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => go("/search")}
                className="p-1.5 rounded-full text-gray-500 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => go("/cart")}
                className="hidden sm:inline-flex relative p-1.5 rounded-full text-gray-500 hover:text-green-700 hover:bg-green-50 transition-all duration-200"
                aria-label="Cart"
              >
                <ShoppingCart size={16} />
                <AnimatePresence>
                  {cartCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                          className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-green-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
                    >
                      {cartCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {session ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setUserMenuOpen((p) => !p)}
                    className="flex items-center p-1.5 rounded-full hover:bg-gray-50 transition-all duration-200"
                    aria-expanded={userMenuOpen}
                  >
                    <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
                      {(session as any).user?.image
                        ? <img src={(session as any).user.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                        : <span>{(session as any).user?.name?.[0]?.toUpperCase() ?? "U"}</span>}
                    </div>
                  </motion.button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <div className="font-semibold text-sm text-gray-900 truncate">{(session as any).user?.name}</div>
                          <div className="text-xs text-gray-400 truncate">{(session as any).user?.email}</div>
                        </div>
                        <button onClick={() => { setUserMenuOpen(false); go("/cart"); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:text-green-700 hover:bg-green-50 transition-colors sm:hidden">Cart</button>
                        <button onClick={() => { setUserMenuOpen(false); go("/my-orders"); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:text-green-700 hover:bg-green-50 transition-colors">My Orders</button>
                        {canAccessAdmin && (
                          <button onClick={() => { setUserMenuOpen(false); go(adminTarget); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:text-green-700 hover:bg-green-50 transition-colors border-t border-gray-100">Admin Panel</button>
                        )}
                        <button onClick={() => signOut()} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors border-t border-gray-100 font-medium">Sign out</button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => go("/login")}
                  className="hidden sm:inline-flex items-center rounded-full border border-green-600 px-3 py-1.5 text-[12px] font-semibold text-green-700 hover:bg-green-50 hover:border-green-700 hover:text-green-800 transition-all duration-200"
                >
                  Login
                </motion.button>
              )}

              {/* Get In Touch CTA: compact visible on small screens, full on large screens */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => go("/contact")}
                aria-label="Get in touch"
                title="Get in touch"
                className={`${forceCollapse ? "inline-flex" : "inline-flex xl:hidden"} items-center justify-center gap-0 px-2 py-2 text-[13px] font-semibold text-white rounded-full bg-green-700 hover:bg-green-600 shadow-sm transition-all duration-200`}
              >
                <Send size={16} strokeWidth={2.2} />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.04, boxShadow: `0 10px 25px -8px ${GREEN_HOVER}66` }}
                whileTap={{ scale: 0.96 }}
                onClick={() => go("/contact")}
                aria-label="Get in touch"
                title="Get in touch"
                className={`${forceCollapse ? "hidden" : "hidden xl:inline-flex"} items-center gap-1.5 px-3 py-1.5 text-[13px] font-semibold text-white rounded-full bg-green-700 hover:bg-green-600 shadow-md shadow-green-900/20 transition-all duration-300 xl:px-5 xl:py-2 xl:text-[13px]`}
              >
                <Send size={14} strokeWidth={2.5} />
                <span className="whitespace-nowrap">Get In Touch</span>
              </motion.button>

              {/* Hamburger */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                className={`${forceCollapse ? "" : "xl:hidden"} p-2.5 rounded-full text-gray-700 hover:bg-green-50 hover:text-green-700 transition-colors duration-200`}
                onClick={() => setMobileOpen((p) => !p)}
                aria-expanded={mobileOpen}
                aria-label="Toggle navigation"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileOpen ? (
                    <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <X className="h-6 w-6" />
                    </motion.span>
                  ) : (
                    <motion.span key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Menu className="h-6 w-6" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile slide panel */}
      <AnimatePresence initial={false} mode="wait">
        {mobileOpen && (
          <>
            <motion.div
              key="mobile-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className={`${forceCollapse ? "" : "xl:hidden"} fixed inset-0 z-40 bg-black/40 backdrop-blur-sm pointer-events-auto`}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              key="mobile-panel"
              variants={mobilePanelVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`${forceCollapse ? "" : "xl:hidden"} fixed top-0 left-0 bottom-0 z-50 w-[280px] sm:w-[310px] shadow-2xl flex flex-col pointer-events-auto bg-white`}
            >
              {/* Logo header */}
              <div className="flex flex-col items-center justify-center px-5 py-6 bg-white shrink-0 relative border-b border-gray-100">
                <motion.button
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setMobileOpen(false)}
                  className="absolute top-3 right-3 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-400"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </motion.button>
                <Link href="/" onClick={() => setMobileOpen(false)} className="flex items-center justify-center">
                  <img
                    src="/logo_mobile_screen.png"
                    alt="Himalaya"
                    className="w-[200px] h-auto object-contain"
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/logo.jpeg";
                    }}
                  />
                </Link>
                <div className="mt-3 h-[2px] w-full bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />
              </div>

              <div className="flex-1 flex flex-col overflow-hidden">
                <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                  {navLinks.map((link, i) => {
                    if (link.isDropdown) {
                      const items = dropdownItemsByLabel[link.label] ?? [];
                      const isOpen = mobileOpenDropdown === link.label;
                      const TriggerIcon = link.label === "About Us" ? Info : Leaf;
                      return (
                        <motion.div key={link.label} custom={i} variants={mobileItemVariants} initial="hidden" animate="visible">
                          <button
                            onClick={() => setMobileOpenDropdown((c) => (c === link.label ? null : link.label))}
                            className={`w-full flex items-center gap-3 justify-between px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                              isOpen ? "bg-green-50 text-green-700" : "text-gray-700 hover:bg-gray-50 hover:text-green-700"
                            }`}
                          >
                            <span className="flex items-center gap-3">
                              <TriggerIcon size={18} className={isOpen ? "text-green-700" : "text-gray-400"} />
                              {link.label}
                            </span>
                            <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                              <ChevronDown size={14} />
                            </motion.span>
                          </button>
                          <AnimatePresence>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeOut" as const }}
                                className="overflow-hidden"
                              >
                                <div className="pl-9 py-1 space-y-0.5">
                                  {items.map((item) => (
                                    <Link
                                      key={item.label}
                                      href={item.href}
                                      onClick={() => { setMobileOpen(false); setMobileOpenDropdown(null); }}
                                      className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-[13px] text-gray-600 hover:text-green-700 hover:bg-green-50 transition-colors duration-200"
                                    >
                                      <item.Icon size={15} strokeWidth={1.9} />
                                      {item.label}
                                    </Link>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    }

                    const active = isActivePath(pathname, link.href);
                    const icons: Record<string, React.ReactNode> = {
                      Home: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>,
                      "About Us": <Info size={18} />,
                      Product: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6h15l-1.5 9h-12L4 2H2" /><circle cx="9" cy="20" r="1" /><circle cx="18" cy="20" r="1" /></svg>,
                      Outlet: <Store size={18} />,
                      Gallery: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></svg>,
                      "News and Notices": <BookOpen size={18} />,
                      Contact: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6A19.79 19.79 0 012.12 4.18 2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" /></svg>,
                    };
                    return (
                      <motion.button
                        key={link.label}
                        custom={i}
                        variants={mobileItemVariants}
                        initial="hidden"
                        animate="visible"
                        onClick={() => navigateAndClose(link.href)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 ${
                          active ? "bg-green-50 text-green-700" : "text-gray-700 hover:bg-gray-50 hover:text-green-700"
                        }`}
                      >
                        <span className={active ? "text-green-700" : "text-gray-400"}>{icons[link.label]}</span>
                        {link.label}
                        {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-600" />}
                      </motion.button>
                    );
                  })}
                </nav>

                <div className="h-0.5 bg-gray-100 mx-4" />

                <div className="shrink-0 px-3 py-3 space-y-1">
                  <div className="flex justify-center pb-1">
                    <LanguageToggle />
                  </div>
                  <button
                    onClick={() => navigateAndClose("/contact")}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-[14px] font-semibold text-white bg-green-700 hover:bg-green-600 transition-all duration-200"
                  >
                    <Send size={15} strokeWidth={2.5} />
                    Get In Touch
                  </button>
                  {!session && (
                    <button
                      onClick={() => navigateAndClose("/login")}
                      className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:text-green-700 transition-all duration-200"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                      </svg>
                      Sign in
                    </button>
                  )}
                  {session && (
                    <>
                      <button onClick={() => navigateAndClose("/cart")} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:text-green-700 transition-all duration-200">
                        <ShoppingCart size={18} className="text-gray-400" />
                        Cart {cartCount > 0 && <span className="ml-1 text-[10px] text-white bg-green-600 rounded-full px-1.5 py-0.5">{cartCount}</span>}
                      </button>
                      <button onClick={() => navigateAndClose("/my-orders")} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:text-green-700 transition-all duration-200">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                          <path d="M16 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V8l-5-5z" />
                          <path d="M15 3v5h5" />
                          <line x1="9" y1="13" x2="15" y2="13" />
                          <line x1="9" y1="17" x2="13" y2="17" />
                        </svg>
                        My Orders
                      </button>
                      {canAccessAdmin && (
                        <button onClick={() => navigateAndClose(adminTarget)} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-[13px] font-medium text-gray-700 hover:bg-gray-50 hover:text-green-700 transition-all duration-200">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                            <rect x="3" y="3" width="7" height="7" rx="1" />
                            <rect x="14" y="3" width="7" height="7" rx="1" />
                            <rect x="3" y="14" width="7" height="7" rx="1" />
                            <rect x="14" y="14" width="7" height="7" rx="1" />
                          </svg>
                          Admin Panel
                        </button>
                      )}
                    </>
                  )}
                </div>

                {session && (
                  <>
                    <div className="h-px bg-gray-100 mx-4" />
                    <div className="shrink-0 px-3 py-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-700 text-white text-sm font-bold shrink-0">
                        {(session as any).user?.image
                          ? <img src={(session as any).user.image} alt="" className="w-9 h-9 rounded-full object-cover" />
                          : <span>{(session as any).user?.name?.[0]?.toUpperCase() ?? "U"}</span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-gray-900 truncate">{(session as any).user?.name}</div>
                        <div className="text-[11px] text-gray-400 truncate">{(session as any).user?.email}</div>
                      </div>
                      <button
                        onClick={() => { setMobileOpen(false); signOut(); }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all duration-200 shrink-0"
                        title="Sign out"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
