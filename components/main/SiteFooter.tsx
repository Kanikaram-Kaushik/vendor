import Link from "next/link";
import { shoppingUrl } from "@/lib/config";

const footerLinks = [
  { href: "/discover", label: "Discover" },
  { href: "/designs", label: "Designs" },
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "https://designbhk.com/", label: "Shopping Site", external: true },
];

const legalLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-foreground/10 bg-background/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-3">
          <p className="text-xl font-semibold uppercase tracking-[0.25em]">
            DesignBHK
          </p>
          <p className="max-w-sm text-sm text-muted">
            A discovery platform for interior designers, architects, and
            studios shaping elevated living.
          </p>
        </div>
        <div className="flex flex-wrap gap-6 text-sm text-muted">
          {footerLinks.map((link) =>
            link.external ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-foreground"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-foreground"
              >
                {link.label}
              </Link>
            )
          )}
        </div>
      </div>
      <div className="border-t border-foreground/10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 pt-6 pb-28 text-xs text-muted sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-6">
          <p>© 2026 DesignBHK. All rights reserved.</p>
          <div className="flex flex-wrap gap-4">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
