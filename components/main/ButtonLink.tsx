import Link from "next/link";

type ButtonLinkProps = {
  href: string;
  label: string;
  variant?: "primary" | "secondary" | "ghost";
  external?: boolean;
  size?: "sm" | "md";
  className?: string;
};

const variants = {
  primary: "bg-accent-strong text-white hover:bg-accent dark:hover:text-black " + "shadow-[0_15px_35px_rgb(var(--accent-shadow)/0.25)]",

  secondary:
    "border border-foreground/20 bg-card text-text-strong " +
    "hover:border-accent/40 hover:bg-accent/5 hover:text-foreground",

  ghost:
    "border border-foreground/20 bg-transparent text-foreground " +
    "hover:border-accent/40 hover:bg-accent/5 hover:text-accent-strong",
};

export default function ButtonLink({
  href,
  label,
  variant = "primary",
  external,
  size = "md",
  className = "",
}: ButtonLinkProps) {
  const sizes = {
    sm: "px-4 py-2 text-[11px]",
    md: "px-6 py-3 text-sm",
  };

  const baseClassName = `inline-flex items-center justify-center rounded-full font-semibold uppercase tracking-[0.2em] transition ${sizes[size]} ${variants[variant]} ${className}`;

  if (external) {
    return (
      <a className={baseClassName} href={href} target="_blank" rel="noreferrer">
        {label}
      </a>
    );
  }

  if (href === "#") {
    return (
      <span className={baseClassName} aria-hidden="true">
        {label}
      </span>
    );
  }

  return (
    <Link className={baseClassName} href={href}>
      {label}
    </Link>
  );
}
