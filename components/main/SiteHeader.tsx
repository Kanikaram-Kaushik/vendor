"use client";

import Image from "next/image";
import Link from "next/link";
import ButtonLink from "./ButtonLink";
import ThemeToggle from "./ThemeToggle";
import { brandDashboardUrl, shoppingUrl } from "@/lib/config";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/components/auth/AuthProvider";
import { ChevronDown } from "lucide-react";

const MenuIcon = ({
  path,
  className = "h-4 w-4",
}: {
  path: string;
  className?: string;
}) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8">
    <path d={path} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const links = [
  { href: "/discover", label: "Discover" },
  { href: "/designs", label: "Designs" },
  { href: "https://designbhk.com/", label: "Shop", external: true },
  { href: "/ai-studio", label: "AI Studio" },
  {
    href: "/stories",
    label: "Stories",
    dropdown: [
      { href: "/blog", label: "Blog" },
      { href: "/forum", label: "Forum" },
    ],
  },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const { user, isLoggedIn, openModal, logout } = useAuth();
  const initials =
    typeof (user as { firstName?: string })?.firstName === "string" &&
      typeof (user as { lastName?: string })?.lastName === "string"
      ? `${(user as { firstName?: string }).firstName?.charAt(0) ?? ""}${(user as { lastName?: string }).lastName?.charAt(0) ?? ""
      }`
      : "ME";
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storiesOpen, setStoriesOpen] = useState(false);
  const [mobileStoriesOpen, setMobileStoriesOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const mobileButtonRef = useRef<HTMLButtonElement | null>(null);
  const storiesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!accountMenuOpen && !mobileMenuOpen) return;
    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (accountMenuRef.current?.contains(target)) return;
      if (mobileMenuRef.current?.contains(target)) return;
      if (mobileButtonRef.current?.contains(target)) return;
      setAccountMenuOpen(false);
      setMobileMenuOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, [accountMenuOpen, mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl" >
      <div className="relative border-b border-foreground/10 bg-background/70">
        <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-3 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/logo_dark.png"
                alt="DesignBHK"
                width={180}
                height={48}
                className="h-9 w-auto sm:h-10"
                style={{ filter: "var(--header-logo-filter)" }}
                priority
              />
              <span className="text-lg font-semibold uppercase tracking-[0.18em] sm:text-xl">DesignBHK</span>
            </Link>
            <nav className="hidden items-center justify-center gap-6 text-sm font-medium text-muted lg:flex">
              {links.map((link) => {
                if (link.dropdown) {
                  const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`) ||
                    link.dropdown.some(d => pathname === d.href || pathname.startsWith(`${d.href}/`));
                  return (
                    <div
                      key={link.href}
                      ref={storiesRef}
                      className="relative"
                      onMouseEnter={() => setStoriesOpen(true)}
                      onMouseLeave={() => setStoriesOpen(false)}
                    >
                      <button
                        className={`inline-flex items-center gap-1 relative transition hover:text-foreground ${isActive ? "text-foreground" : ""
                          }`}
                        onClick={() => setStoriesOpen(o => !o)}
                      >
                        {link.label}
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${storiesOpen ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {storiesOpen && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 6 }}
                            transition={{ duration: 0.18, ease: "easeOut" }}
                            className="absolute left-0 top-full mt-2 w-36 rounded-2xl border border-foreground/10 bg-card/95 p-2 text-sm shadow-[0_16px_40px_rgba(0,0,0,0.15)] backdrop-blur-xl"
                          >
                            {link.dropdown.map(item => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="block rounded-xl px-4 py-2.5 text-muted transition hover:bg-foreground/5 hover:text-foreground"
                                onClick={() => setStoriesOpen(false)}
                              >
                                {item.label}
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                const isActive = !link.external && (pathname === link.href || pathname.startsWith(`${link.href}/`));
                const cls = `relative transition hover:text-foreground ${isActive
                  ? "text-foreground after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-foreground after:transition-transform after:duration-300 after:ease-out after:scale-x-100"
                  : "after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-full after:rounded-full after:bg-foreground after:transition-transform after:duration-300 after:ease-out after:scale-x-0"
                  }`;
                return link.external ? (
                  <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className={cls}>
                    {link.label}
                  </a>
                ) : (
                  <Link key={link.href} href={link.href} className={cls}>
                    {link.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-2 sm:gap-3 lg:justify-self-end">
              <div className="hidden items-center gap-3 lg:flex">
                {/* <ButtonLink href={shoppingUrl} label="Shop" variant="secondary" external size="sm" /> */}
                <ButtonLink href="/contact" label="Contact Us" size="sm" />
              </div>
              <ThemeToggle />
              <div className="relative" ref={accountMenuRef}>
                <button
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 bg-card/85 text-foreground transition hover:bg-card/95 hover:shadow-[0_8px_20px_rgba(15,10,5,0.18)]"
                  onClick={() => {
                    if (!isLoggedIn) {
                      openModal();
                      return;
                    }
                    setMobileMenuOpen(false);
                    setAccountMenuOpen((prev) => !prev);
                  }}
                  aria-label={isLoggedIn ? "Open account menu" : "Sign in"}
                >
                  {isLoggedIn ? (
                    <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-foreground">
                      {initials}
                    </span>
                  ) : (
                    <MenuIcon path="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z" />
                  )}
                </button>
                {isLoggedIn && accountMenuOpen ? (
                  <div className="absolute right-0 mt-3 w-56 rounded-2xl border border-foreground/10 bg-card/95 p-2 text-sm shadow-[0_20px_45px_rgba(15,10,5,0.2)]">
                    <Link
                      href="/account"
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-muted hover:bg-foreground/5 hover:text-foreground"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <MenuIcon path="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm7-3a7 7 0 0 0-.1-1l2.1-1.6-2-3.4-2.5 1a7 7 0 0 0-1.7-1l-.4-2.7h-4l-.4 2.7a7 7 0 0 0-1.7 1l-2.5-1-2 3.4 2.1 1.6a7 7 0 0 0 0 2L2.6 14.6l2 3.4 2.5-1a7 7 0 0 0 1.7 1l.4 2.7h4l.4-2.7a7 7 0 0 0 1.7-1l2.5 1 2-3.4-2.1-1.6c.07-.33.1-.66.1-1z" />
                      Manage account
                    </Link>
                    <Link
                      href="/account"
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-muted hover:bg-foreground/5 hover:text-foreground"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <MenuIcon path="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4.4 0-8 2.2-8 5v1h16v-1c0-2.8-3.6-5-8-5z" />
                      Profile
                    </Link>
                    <button
                      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-muted hover:bg-foreground/5 hover:text-foreground"
                      onClick={() => {
                        logout();
                        setAccountMenuOpen(false);
                      }}
                    >
                      <MenuIcon path="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" />
                      Logout
                    </button>
                    <div className="my-2 border-t border-foreground/10" />
                    <a
                      href={brandDashboardUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#d6a06c] hover:bg-[#d6a06c]/10"
                      onClick={() => setAccountMenuOpen(false)}
                    >
                      <MenuIcon path="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
                      Register a brand?
                    </a>
                  </div>
                ) : null}
              </div>
              <button
                ref={mobileButtonRef}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-foreground/15 bg-card/85 text-foreground transition hover:bg-card/95 hover:shadow-[0_8px_20px_rgba(15,10,5,0.18)] lg:hidden"
                onClick={() => {
                  setAccountMenuOpen(false);
                  setMobileMenuOpen((prev) => !prev);
                }}
                aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-nav"
              >
                <span className="relative h-5 w-5">
                  <AnimatePresence mode="wait" initial={false}>
                    {mobileMenuOpen ? (
                      <motion.span
                        key="icon-close"
                        className="absolute inset-0"
                        initial={{ opacity: 0, rotate: 90, scale: 0.9 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: -90, scale: 0.9 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <MenuIcon className="h-5 w-5" path="M6 6l12 12M18 6l-12 12" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="icon-open"
                        className="absolute inset-0"
                        initial={{ opacity: 0, rotate: -90, scale: 0.9 }}
                        animate={{ opacity: 1, rotate: 0, scale: 1 }}
                        exit={{ opacity: 0, rotate: 90, scale: 0.9 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <MenuIcon className="h-5 w-5" path="M4 6h16M4 12h16M4 18h16" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </span>
              </button>
            </div>
          </div>
          <AnimatePresence>
            {mobileMenuOpen ? (
              <motion.div
                className="absolute left-0 right-0 top-full z-50 pb-6 pt-2 lg:hidden"
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                  <div
                    id="mobile-nav"
                    ref={mobileMenuRef}
                    className="rounded-[28px] border border-foreground/10 bg-card/95 p-6 text-sm shadow-[0_18px_40px_rgba(15,10,5,0.18)]"
                    role="navigation"
                    aria-label="Mobile navigation"
                  >
                    <div className="space-y-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted">Explore</p>
                      <div className="grid gap-2">
                        {links.map((link) => {
                          if (link.dropdown) {
                            return (
                              <div key={link.href}>
                                <button
                                  className="relative flex w-full items-center justify-between rounded-2xl border border-transparent px-5 py-3.5 text-sm font-medium text-muted transition hover:bg-foreground/5 hover:text-foreground"
                                  onClick={() => setMobileStoriesOpen(o => !o)}
                                >
                                  {link.label}
                                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${mobileStoriesOpen ? "rotate-180" : ""}`} />
                                </button>
                                <AnimatePresence>
                                  {mobileStoriesOpen && (
                                    <motion.div
                                      initial={{ opacity: 0, height: 0 }}
                                      animate={{ opacity: 1, height: "auto" }}
                                      exit={{ opacity: 0, height: 0 }}
                                      transition={{ duration: 0.2, ease: "easeOut" }}
                                      className="overflow-hidden pl-4"
                                    >
                                      {link.dropdown.map(item => (
                                        <Link
                                          key={item.href}
                                          href={item.href}
                                          className="flex items-center rounded-2xl border border-transparent px-5 py-3 text-sm font-medium text-muted transition hover:bg-foreground/5 hover:text-foreground"
                                          onClick={() => setMobileMenuOpen(false)}
                                        >
                                          {item.label}
                                        </Link>
                                      ))}
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          }
                          const isActive = !link.external && (pathname === link.href || pathname.startsWith(`${link.href}/`));
                          const cls = `relative flex items-center justify-between rounded-2xl border border-transparent px-5 py-3.5 text-sm font-medium transition ${isActive
                            ? "bg-foreground/5 text-foreground after:absolute after:bottom-1.5 after:left-5 after:right-5 after:h-[2px] after:rounded-full after:bg-foreground"
                            : "text-muted hover:bg-foreground/5 hover:text-foreground"
                            }`;
                          return link.external ? (
                            <a key={link.href} href={link.href} target="_blank" rel="noreferrer" className={cls} onClick={() => setMobileMenuOpen(false)}>
                              {link.label}
                            </a>
                          ) : (
                            <Link key={link.href} href={link.href} className={cls} onClick={() => setMobileMenuOpen(false)}>
                              {link.label}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                    <div className="mt-6 h-px w-full bg-foreground/10" />
                    <div className="mt-5 space-y-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted">Actions</p>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <ButtonLink
                          href={shoppingUrl}
                          label="Shop"
                          variant="secondary"
                          external
                          size="sm"
                          className="w-full sm:w-auto"
                        />
                        <ButtonLink href="/contact" label="Know More About Us" size="sm" className="w-full sm:w-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
