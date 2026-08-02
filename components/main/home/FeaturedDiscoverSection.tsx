"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Building2, ImageIcon } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  getFeaturedEntities,
  getFeaturedInspirations,
  getHomePageData,
} from "@/data";
import ButtonLink from "@/components/ButtonLink";
import SectionHeader from "@/components/SectionHeader";

type DiscoveryKind = "all" | "studio" | "inspiration";

type DiscoveryItem = {
  id: string;
  kind: Exclude<DiscoveryKind, "all">;
  title: string;
  subtitle: string;
  meta: string;
  href: string;
  image?: string;
};

const FILTERS: Array<{ value: DiscoveryKind; label: string }> = [
  { value: "all", label: "All" },
  { value: "studio", label: "Studios" },
  { value: "inspiration", label: "Inspirations" },
];

const formatType = (value?: string) =>
  value ? value.charAt(0).toUpperCase() + value.slice(1) : "";

export function FeaturedDiscoverySection() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase() || "";

  const homePage = getHomePageData();
  const [filter, setFilter] = useState<DiscoveryKind>("all");
  const [activeId, setActiveId] = useState<string | null>(null);

  const featuredStudios = useMemo(() => {
    const studios = homePage.featuredEntities.length
      ? homePage.featuredEntities
        .map((slug) => getFeaturedEntities().find((entity) => entity.slug === slug))
        .filter((entity): entity is NonNullable<typeof entity> => entity !== undefined)
      : getFeaturedEntities();

    return studios.slice(0, 4).map<DiscoveryItem>((studio) => ({
      id: `studio-${studio.slug}`,
      kind: "studio",
      title: studio.name,
      subtitle: `${formatType(studio.type)}${studio.location ? ` · ${studio.location}` : ""}`,
      meta: studio.styles.slice(0, 3).join(" · "),
      href: `/discover/${studio.slug}`,
      image: studio.featuredImage,
    }));
  }, [homePage.featuredEntities]);

  const featuredInspirations = useMemo(() => {
    const inspirations = homePage.featuredInspirations.length
      ? homePage.featuredInspirations
        .map((slug) =>
          getFeaturedInspirations().find((inspiration) => inspiration.slug === slug),
        )
        .filter(
          (inspiration): inspiration is NonNullable<typeof inspiration> =>
            inspiration !== undefined,
        )
      : getFeaturedInspirations();

    return inspirations.slice(0, 4).map<DiscoveryItem>((inspiration) => ({
      id: `inspiration-${inspiration.slug}`,
      kind: "inspiration",
      title: inspiration.title,
      subtitle: inspiration.roomTypes.slice(0, 1).join(""),
      meta: inspiration.styles.slice(0, 2).join(" · "),
      href: `/designs/${inspiration.slug}`,
      image: inspiration.images[0],
    }));
  }, [homePage.featuredInspirations]);

  const items = useMemo(
    () => [...featuredStudios, ...featuredInspirations],
    [featuredInspirations, featuredStudios],
  );

  const filteredItems = useMemo(() => {
    let result = items;
    if (filter !== "all") {
      result = result.filter((item) => item.kind === filter);
    }
    if (query) {
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(query) ||
          item.subtitle.toLowerCase().includes(query) ||
          item.meta.toLowerCase().includes(query) ||
          (item.kind === "studio" && query.includes("studio")) ||
          (item.kind === "inspiration" && query.includes("inspiration"))
      );
    }
    return result.length > 0 ? result : items; // Fallback to all items if no match
  }, [filter, items, query]);

  const activeItem = useMemo(() => {
    return filteredItems.find((item) => item.id === activeId) ?? filteredItems[0];
  }, [activeId, filteredItems]);

  const miniItems = useMemo(() => {
    if (!activeItem) return [];
    return filteredItems.filter((item) => item.id !== activeItem.id).slice(0, 4);
  }, [activeItem, filteredItems]);

  useEffect(() => {
    // Reset active item when filter or query changes so we don't show an invalid active item
    if (activeId && !filteredItems.find((item) => item.id === activeId)) {
      setActiveId(null);
    }
  }, [filteredItems, activeId]);

  if (!activeItem) return null;

  return (
    <section id="discovery" className="w-full bg-card/40 px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-12">
        <SectionHeader
          eyebrow="Featured Discoveries"
          title="Studios and spaces, curated together"
          description="Explore professionals and inspirational spaces in one interactive canvas to shortlist faster."
        />

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setFilter(item.value)}
              className={`relative rounded-full px-5 py-2.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium transition ${filter === item.value
                ? "text-foreground"
                : "text-muted hover:text-foreground"
                }`}
            >
              {filter === item.value ? (
                <motion.span
                  layoutId="featured-discovery-filter-pill"
                  className="absolute inset-0 rounded-full bg-card shadow-sm ring-1 ring-foreground/10"
                />
              ) : null}
              <span className="relative">{item.label}</span>
            </button>
          ))}
        </div>

        {query && (
          <div className="text-sm font-medium text-muted">
            Showing results based on your requirement: <span className="text-foreground">"{query}"</span>
          </div>
        )}

        <div className="relative grid auto-rows-[180px] gap-5 md:grid-cols-6">
          <div
            className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem]"
            style={{
              background:
                "radial-gradient(circle at 22% 20%, rgba(var(--accent-shadow), 0.18), transparent 40%), radial-gradient(circle at 84% 82%, rgba(var(--accent-shadow), 0.14), transparent 45%)",
            }}
          />

          <motion.article
            className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-card/70 md:col-span-4 md:row-span-2"
            layout
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeItem.id}
                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
                className="relative h-full"
              >
                {activeItem.image ? (
                  <Image
                    src={activeItem.image}
                    alt={activeItem.title}
                    fill
                    className="object-cover"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="relative flex h-full flex-col justify-end gap-4 p-6 sm:p-8">
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                    {activeItem.kind === "studio" ? (
                      <Building2 className="h-3.5 w-3.5" />
                    ) : (
                      <ImageIcon className="h-3.5 w-3.5" />
                    )}
                    {activeItem.kind}
                  </span>
                  <div>
                    <h3 className="text-2xl font-semibold text-white sm:text-3xl">
                      {activeItem.title}
                    </h3>
                    <p className="mt-1 text-sm text-white/80">{activeItem.subtitle}</p>
                    <p className="mt-2 text-sm text-white/70">{activeItem.meta}</p>
                  </div>
                  <Link
                    href={activeItem.href}
                    className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-accent hover:text-white"
                  >
                    View Details
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.article>

          <div className="rounded-2xl border border-foreground/10 bg-card/70 p-5 backdrop-blur-sm md:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Curated Balance
            </p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Featured Studios</span>
                <span className="font-semibold text-foreground">
                  {featuredStudios.length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Inspiration Picks</span>
                <span className="font-semibold text-foreground">
                  {featuredInspirations.length}
                </span>
              </div>
            </div>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              Toggle filters or select any card to instantly switch the spotlight.
            </p>
          </div>

          {miniItems.map((item, index) => (
            <motion.button
              key={item.id}
              type="button"
              onClick={() => setActiveId(item.id)}
              className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-card/70 text-left backdrop-blur-sm transition hover:-translate-y-1 hover:border-accent/35 md:col-span-2"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.35, ease: "easeOut", delay: 0.06 * index }}
            >
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
              <div className="relative flex h-full flex-col justify-end gap-1 p-4">
                <span className="text-[11px] uppercase tracking-[0.18em] text-white/70">
                  {item.kind}
                </span>
                <p className="text-base font-semibold text-white">{item.title}</p>
                <p className="text-xs text-white/80">{item.subtitle}</p>
              </div>
            </motion.button>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <ButtonLink href="/discover" label="View All Studios" variant="secondary" />
          <ButtonLink
            href="/designs"
            label="Explore Gallery"
            variant="secondary"
          />
        </div>
      </div>
    </section>
  );
}

