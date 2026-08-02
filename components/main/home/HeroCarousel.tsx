"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import ButtonLink from "@/components/ButtonLink";

export type HeroItem = {
  eyebrow?: string;
  title?: string;
  description?: string;
  primaryCta?: { label?: string; href?: string };
  secondaryCta?: { label?: string; href?: string };
  image?: string;
  accent?: string;
};

const fallbackHeroItems: HeroItem[] = [
  {
    eyebrow: "Discovery Platform",
    title: "Discover studios shaping elevated, livable interiors.",
    description:
      "Explore designers, architects, and inspirations curated for calm, contemporary living. Build your brief, then connect with the teams that fit your vision.",
    primaryCta: { label: "Start Exploring", href: "/discover" },
    secondaryCta: { label: "Browse Inspirations", href: "/designs" },
    image:
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=1600&q=80",
    accent: "Quiet luxury · 2026",
  },
  {
    eyebrow: "Curated Talent",
    title: "Find designers who speak your aesthetic language.",
    description:
      "Filter by style, location, and project type to shortlist studios that match your taste and timeline.",
    primaryCta: { label: "Meet the Studios", href: "/discover" },
    secondaryCta: { label: "View Services", href: "/services" },
    image:
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1600&q=80",
    accent: "Design matchmaking",
  },
  {
    eyebrow: "Inspiration Gallery",
    title: "Build a moodboard across rooms, styles, and moods.",
    description:
      "Save references, explore material palettes, and turn inspiration into an actionable brief.",
    primaryCta: { label: "Explore Inspirations", href: "/designs" },
    secondaryCta: { label: "Read the Journal", href: "/blog" },
    image:
      "https://images.unsplash.com/photo-1501045661006-fcebe0257c3f?auto=format&fit=crop&w=1600&q=80",
    accent: "Material stories",
  },
];

type HeroCarouselProps = {
  items?: HeroItem[];
};

export default function HeroCarousel({ items }: HeroCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const heroItems = items && items.length ? items : fallbackHeroItems;
  const total = heroItems.length;
  const activeItem = useMemo(() => heroItems[index], [index, heroItems]);

  const primaryLabel = activeItem.primaryCta?.label ?? "Start Exploring";
  const primaryHref = activeItem.primaryCta?.href ?? "/discover";
  const secondaryLabel = activeItem.secondaryCta?.label ?? "Browse Inspirations";
  const secondaryHref = activeItem.secondaryCta?.href ?? "/designs";

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, 7000);
    return () => clearInterval(timer);
  }, [total, isPaused]);

  return (
    <section
      className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="space-y-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
          {activeItem.eyebrow ?? "Discovery Platform"}
        </p>
        <div className="space-y-4">
          <h1 className="min-h-[4.8rem] text-4xl font-semibold leading-tight sm:min-h-[6.8rem] sm:text-5xl lg:min-h-[8.6rem] lg:text-6xl">
            {activeItem.title ?? "Discover the studios shaping elevated, livable interiors."}
          </h1>
          <p className="min-h-[5.25rem] max-w-xl text-lg text-muted">
            {activeItem.description ??
              "Explore designers, architects, and inspirations curated for calm, contemporary living."}
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <ButtonLink href={primaryHref} label={primaryLabel} />
          <ButtonLink
            href={secondaryHref}
            label={secondaryLabel}
            variant="secondary"
          />
        </div>
        <div className="flex items-center gap-4">
          {heroItems.map((item, idx) => (
            <button
              key={item.title ?? `hero-${idx}`}
              className={`h-2 w-10 rounded-full transition ${idx === index ? "bg-foreground" : "bg-foreground/20"
                }`}
              onClick={() => setIndex(idx)}
              aria-label={`Show ${item.title ?? "slide"}`}
            />
          ))}
        </div>
      </div>
      <div className="relative">
        <div className="relative overflow-hidden rounded-[32px] border border-foreground/10 bg-card/80 p-6 shadow-[0_40px_80px_rgba(16,10,5,0.18)]">
          <div className="absolute right-6 top-6 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white backdrop-blur">
            {activeItem.accent ?? "Featured"}
          </div>
          <div className="relative h-[360px] w-full overflow-hidden rounded-3xl sm:h-[420px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.image ?? "fallback"}
                className="absolute inset-0"
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              >
                <Image
                  src={activeItem.image ?? fallbackHeroItems[0].image ?? ""}
                  alt={activeItem.title ?? "Hero image"}
                  fill
                  className="object-cover"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
