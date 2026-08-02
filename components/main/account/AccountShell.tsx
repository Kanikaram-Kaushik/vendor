"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

const navItems = [
  { href: "/account", label: "Overview" },
  { href: "/account/saved", label: "Saved" },
  { href: "/account/comments", label: "Comments" },
  { href: "/account/likes", label: "Likes" },
  { href: "/account/following", label: "Following" },
];

export default function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, isReady, openModal } = useAuth();

  useEffect(() => {
    if (isReady && !isLoggedIn) {
      openModal();
      router.replace("/");
    }
  }, [isReady, isLoggedIn, openModal, router]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 pb-24 pt-12 sm:px-6 lg:flex-row">
      <aside className="w-full rounded-[28px] border border-foreground/10 bg-card/80 p-6 lg:sticky lg:top-24 lg:w-64 lg:self-start">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">Account</p>
        <nav className="mt-6 flex flex-col gap-2 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-2xl px-4 py-2 transition ${
                pathname === item.href
                  ? "bg-foreground text-[var(--card)] font-semibold shadow-sm"
                  : "text-foreground/70 hover:bg-foreground/8 hover:text-foreground"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <motion.section
        key={pathname}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex-1"
      >
        {children}
      </motion.section>
    </div>
  );
}
