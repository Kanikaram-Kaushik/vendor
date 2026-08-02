"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Entity } from "@/data/types";

type DiscoveryGridProps = {
  professionals: Entity[];
};

const filterButton =
  "rounded-full border border-foreground/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted transition hover:border-foreground/40 hover:text-foreground";

export default function DiscoveryGrid({ professionals }: DiscoveryGridProps) {
  const [profession, setProfession] = useState<string>("All");
  const [style, setStyle] = useState<string>("All");
  const [location, setLocation] = useState<string>("All");
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null);

  const styles = useMemo(() => {
    const all = new Set<string>();
    professionals.forEach((item) =>
      item.styles?.forEach((s) => {
        // Convert slug to title case for display
        const title = s
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        all.add(title);
      })
    );
    return ["All", ...Array.from(all)];
  }, [professionals]);

  const locations = useMemo(() => {
    const all = new Set<string>();
    professionals.forEach((item) => {
      if (item.location) all.add(item.location);
    });
    return ["All", ...Array.from(all)];
  }, [professionals]);

  const professions = [
    { value: "All", label: "All" },
    { value: "designer", label: "Designer" },
    { value: "architect", label: "Architect" },
    { value: "company", label: "Company" },
  ];

  const filtered = professionals.filter((item) => {
    const matchesProfession =
      profession === "All" || item.type === profession;
    const matchesStyle =
      style === "All" ||
      item.styles?.some(
        (s) =>
          s === style.toLowerCase().replace(/\s+/g, "-") ||
          s === style.toLowerCase()
      );
    const matchesLocation =
      location === "All" || item.location === location;
    return matchesProfession && matchesStyle && matchesLocation;
  });

  const formatType = (value: string) =>
    value ? value.charAt(0).toUpperCase() + value.slice(1) : value;

  return (
    <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-8 rounded-3xl border border-foreground/10 bg-card/70 p-6 lg:sticky lg:top-28 lg:self-start">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Profession
          </p>
          <div className="flex flex-wrap gap-3">
            {professions.map((item) => (
              <button
                key={item.value}
                className={`${filterButton} ${profession === item.value
                  ? "border-foreground/60 text-foreground"
                  : ""
                  }`}
                onClick={() => setProfession(item.value)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Style
          </p>
          <div className="flex flex-wrap gap-3">
            {styles.map((item) => (
              <button
                key={item}
                className={`${filterButton} ${style === item
                  ? "border-foreground/60 text-foreground"
                  : ""
                  }`}
                onClick={() => setStyle(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Location
          </p>
          <div className="flex flex-wrap gap-3">
            {locations.map((item) => (
              <button
                key={item}
                className={`${filterButton} ${location === item
                  ? "border-foreground/60 text-foreground"
                  : ""
                  }`}
                onClick={() => setLocation(item)}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
        <button
          className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground"
          onClick={() => {
            setProfession("All");
            setStyle("All");
            setLocation("All");
          }}
        >
          Reset filters
        </button>
      </aside>
      <div className="space-y-6">
        <div className="flex items-center justify-between text-sm text-muted">
          <p>{filtered.length} profiles</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <button
                type="button"
                onClick={() => setSelectedEntity(item)}
                className="group block w-full text-left overflow-hidden rounded-3xl border border-foreground/10 bg-card/80 transition hover:-translate-y-1 hover:border-foreground/30 hover:shadow-[0_20px_45px_rgba(15,10,5,0.12)]"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  {item.featuredImage ? (
                    <Image
                      src={item.featuredImage}
                      alt={item.name}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : null}
                </div>
                <div className="space-y-4 p-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
                      {formatType(item.type)} · {item.location}
                    </p>
                    <h3 className="text-2xl font-semibold">{item.name}</h3>
                    <p className="text-sm text-muted">
                      {(item.styles || [])
                        .slice(0, 2)
                        .map(
                          (s) =>
                            s
                              .split("-")
                              .map(
                                (w) =>
                                  w.charAt(0).toUpperCase() + w.slice(1)
                              )
                              .join(" ") // Convert slug to title
                        )
                        .join(" · ")}
                    </p>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedEntity && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEntity(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-foreground/10 bg-card p-6 shadow-2xl"
            >
              <button
                type="button"
                onClick={() => setSelectedEntity(null)}
                className="absolute right-4 top-4 z-20 rounded-full bg-background/50 p-2 text-foreground/70 backdrop-blur-md transition hover:bg-background hover:text-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>

              {selectedEntity.featuredImage && (
                <div className="relative -mx-6 -mt-6 mb-6 h-56 overflow-hidden bg-muted">
                  <Image
                    src={selectedEntity.featuredImage}
                    alt={selectedEntity.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
                {formatType(selectedEntity.type)} · {selectedEntity.location}
              </p>
              <h3 className="mt-2 text-2xl font-bold">{selectedEntity.name}</h3>

              {selectedEntity.bio ? (
                <p className="mt-4 text-sm text-muted line-clamp-4">
                  {selectedEntity.bio}
                </p>
              ) : (
                <p className="mt-4 text-sm text-muted">
                  Discover more about {selectedEntity.name} and view their portfolio of exceptional designs.
                </p>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedEntity(null)}
                  className="rounded-full border border-foreground/15 px-6 py-2.5 text-sm font-semibold transition hover:bg-muted/5"
                >
                  Close
                </button>
                <Link
                  href={`/discover/${selectedEntity.slug}`}
                  className="flex items-center justify-center rounded-full bg-foreground px-8 py-2.5 text-sm font-semibold text-background transition hover:bg-foreground/90 hover:scale-105 active:scale-95"
                >
                  Know More
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
