"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Inspiration } from "@/data/types";
import { useEngagements } from "@/hooks/useEngagements";

type InspirationMasonryProps = {
  inspirations: Inspiration[];
};

const filterButton =
  "rounded-full border border-foreground/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted transition hover:border-foreground/40 hover:text-foreground";

export default function InspirationMasonry({
  inspirations,
}: InspirationMasonryProps) {
  const [room, setRoom] = useState("All");
  const [style, setStyle] = useState("All");
  const [selectedInspiration, setSelectedInspiration] = useState<Inspiration | null>(null);
  const { likes, toggleLike } = useEngagements();

  const rooms = useMemo(() => {
    const all = new Set<string>();
    inspirations.forEach((item) =>
      (item.roomTypes || []).forEach((roomItem) => {
        // Convert slug to title case for display
        const title = roomItem
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        all.add(title);
      })
    );
    return ["All", ...Array.from(all)];
  }, [inspirations]);

  const styles = useMemo(() => {
    const all = new Set<string>();
    inspirations.forEach((item) =>
      (item.styles || []).forEach((styleItem) => {
        // Convert slug to title case for display
        const title = styleItem
          .split("-")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        all.add(title);
      })
    );
    return ["All", ...Array.from(all)];
  }, [inspirations]);

  const filtered = inspirations.filter((item) => {
    const matchesRoom =
      room === "All" ||
      (item.roomTypes || []).some(
        (r) =>
          r === room.toLowerCase().replace(/\s+/g, "-") ||
          r === room.toLowerCase()
      );
    const matchesStyle =
      style === "All" ||
      (item.styles || []).some(
        (s) =>
          s === style.toLowerCase().replace(/\s+/g, "-") ||
          s === style.toLowerCase()
      );
    return matchesRoom && matchesStyle;
  });

  return (
    <div className="grid gap-10 lg:grid-cols-[280px_1fr]">
      <aside className="space-y-8 rounded-3xl border border-foreground/10 bg-card/70 p-6 lg:sticky lg:top-28 lg:self-start">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted">
            Room
          </p>
          <div className="flex flex-wrap gap-3">
            {rooms.map((item) => (
              <button
                key={item}
                className={`${filterButton} ${room === item
                  ? "border-foreground/60 text-foreground"
                  : ""
                  }`}
                onClick={() => setRoom(item)}
              >
                {item}
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
        <button
          className="text-xs font-semibold uppercase tracking-[0.3em] text-foreground"
          onClick={() => {
            setRoom("All");
            setStyle("All");
          }}
        >
          Reset filters
        </button>
      </aside>
      <div className="space-y-6">
        <div className="flex items-center justify-between text-sm text-muted">
          <p>{filtered.length} inspirations</p>
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
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedInspiration(item)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedInspiration(item);
                  }
                }}
                className="group w-full cursor-pointer text-left flex h-full flex-col overflow-hidden rounded-3xl border border-foreground/10 bg-card/80 transition hover:-translate-y-1 hover:border-foreground/30 hover:shadow-[0_20px_45px_rgba(15,10,5,0.12)]"
              >
                <div className="relative h-64 w-full overflow-hidden">
                  {item.images?.[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : null}
                  <button
                    aria-label="Like inspiration"
                    className={`absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/30 bg-black/55 text-white shadow-[0_12px_30px_rgba(15,10,5,0.35)] backdrop-blur transition ${likes.some(
                      (liked) =>
                        liked.itemType === "inspiration" &&
                        liked.itemId === item.slug
                    )
                      ? "bg-accent text-white border-transparent"
                      : "hover:bg-black/70"
                      }`}
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      toggleLike("inspiration", item.slug);
                    }}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill={
                        likes.some(
                          (liked) =>
                            liked.itemType === "inspiration" &&
                            liked.itemId === item.slug
                        )
                          ? "currentColor"
                          : "none"
                      }
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3 p-6 min-h-[160px]">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
                    {(item.roomTypes || [])
                      .slice(0, 2)
                      .map(
                        (r) =>
                          r
                            .split("-")
                            .map(
                              (w) => w.charAt(0).toUpperCase() + w.slice(1)
                            )
                            .join(" ") // Convert slug to title
                      )
                      .join(" · ")}
                  </p>
                  <h3
                    className="text-2xl font-semibold"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted">
                    {(item.styles || [])
                      .slice(0, 2)
                      .map(
                        (s) =>
                          s
                            .split("-")
                            .map(
                              (w) => w.charAt(0).toUpperCase() + w.slice(1)
                            )
                            .join(" ") // Convert slug to title
                      )
                      .join(" · ")}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedInspiration && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInspiration(null)}
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
                onClick={() => setSelectedInspiration(null)}
                className="absolute right-4 top-4 z-20 rounded-full bg-background/50 p-2 text-foreground/70 backdrop-blur-md transition hover:bg-background hover:text-foreground"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
              </button>

              {selectedInspiration.images?.[0] && (
                <div className="relative -mx-6 -mt-6 mb-6 h-56 overflow-hidden bg-muted">
                  <Image
                    src={selectedInspiration.images[0]}
                    alt={selectedInspiration.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-muted">
                {(selectedInspiration.roomTypes || [])
                  .slice(0, 2)
                  .map(
                    (r) =>
                      r
                        .split("-")
                        .map(
                          (w) => w.charAt(0).toUpperCase() + w.slice(1)
                        )
                        .join(" ")
                  )
                  .join(" · ")}
              </p>
              <h3 className="mt-2 text-2xl font-bold">{selectedInspiration.title}</h3>

              {selectedInspiration.description ? (
                <p className="mt-4 text-sm text-muted line-clamp-4">
                  {selectedInspiration.description}
                </p>
              ) : (
                <p className="mt-4 text-sm text-muted">
                  Discover more details, material palettes, and inspirations related to this look.
                </p>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedInspiration(null)}
                  className="rounded-full border border-foreground/15 px-6 py-2.5 text-sm font-semibold transition hover:bg-muted/5"
                >
                  Close
                </button>
                <Link
                  href={`/designs/${selectedInspiration.slug}`}
                  className="flex items-center justify-center rounded-full bg-foreground px-8 py-2.5 text-sm font-semibold text-background transition hover:bg-foreground/90 hover:scale-105 active:scale-95"
                >
                  View Full Details
                </Link>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
