"use client";

import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin, Quote, Star } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getTestimonials } from "@/data";
import SectionHeader from "@/components/SectionHeader";

const AUTOPLAY_MS = 5500;
const SWIPE_THRESHOLD = 80;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function clampIndex(index: number, length: number) {
  if (length === 0) return 0;
  return ((index % length) + length) % length;
}

export function TestimonialsBentoSection() {
  const testimonials = getTestimonials();
  const shouldReduceMotion = useReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [cycleProgress, setCycleProgress] = useState(0);
  const remainingMsRef = useRef(AUTOPLAY_MS);
  const skipRemainingCaptureRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const count = testimonials.length;

  useEffect(() => {
    const onVisibilityChange = () => {
      setIsVisible(document.visibilityState === "visible");
    };

    onVisibilityChange();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const canCycle = count > 1;
  const autoplayEnabled =
    canCycle && !shouldReduceMotion && !isPaused && isVisible;

  const resetCycle = useCallback((markSkip: boolean) => {
    skipRemainingCaptureRef.current = markSkip;
    remainingMsRef.current = AUTOPLAY_MS;
    setCycleProgress(0);
  }, []);

  const clearScheduled = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (rafRef.current !== null) {
      window.cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const goTo = useCallback(
    (index: number) => {
      resetCycle(autoplayEnabled);
      setActiveIndex(clampIndex(index, count));
    },
    [autoplayEnabled, count, resetCycle],
  );

  const handleNext = useCallback(() => {
    resetCycle(autoplayEnabled);
    setActiveIndex((prev) => clampIndex(prev + 1, count));
  }, [autoplayEnabled, count, resetCycle]);

  const handlePrev = useCallback(() => {
    resetCycle(autoplayEnabled);
    setActiveIndex((prev) => clampIndex(prev - 1, count));
  }, [autoplayEnabled, count, resetCycle]);

  useEffect(() => {
    if (!autoplayEnabled) return undefined;

    const startRemaining = Math.max(remainingMsRef.current, 1);
    const startedAt = performance.now();

    const updateProgress = () => {
      const elapsed = performance.now() - startedAt;
      const remaining = Math.max(startRemaining - elapsed, 0);
      setCycleProgress((AUTOPLAY_MS - remaining) / AUTOPLAY_MS);

      if (remaining > 0) {
        rafRef.current = window.requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
    timeoutRef.current = window.setTimeout(() => {
      handleNext();
    }, startRemaining);

    return () => {
      clearScheduled();
      if (skipRemainingCaptureRef.current) {
        skipRemainingCaptureRef.current = false;
        return;
      }

      const elapsed = performance.now() - startedAt;
      remainingMsRef.current = Math.max(startRemaining - elapsed, 0);
    };
  }, [autoplayEnabled, clearScheduled, handleNext]);

  const averageRating = useMemo(() => {
    if (!count) return "0.0";
    const total = testimonials.reduce((sum, item) => sum + item.rating, 0);
    return (total / count).toFixed(1);
  }, [count, testimonials]);

  if (count === 0) return null;

  const active = testimonials[activeIndex];
  const supportingIndexes = testimonials
    .map((_, index) => index)
    .filter((index) => index !== activeIndex)
    .slice(0, 3);
  const displayedProgress = shouldReduceMotion || !canCycle ? 0 : cycleProgress;

  return (
    <section className="w-full px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-16">
        <SectionHeader
          eyebrow="Testimonials"
          title="Trusted by clients with ambitious spaces"
          description="Real project outcomes from homeowners and teams who transformed ideas into livable interiors."
        />

        <div
          className="relative grid auto-rows-[180px] gap-5 md:grid-cols-6"
          tabIndex={0}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={(event) => {
            const nextTarget = event.relatedTarget as Node | null;
            if (!event.currentTarget.contains(nextTarget)) {
              setIsPaused(false);
            }
          }}
          onKeyDown={(event) => {
            if (!canCycle) return;
            if (event.key === "ArrowRight") {
              event.preventDefault();
              handleNext();
            }
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              handlePrev();
            }
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem] opacity-70"
            style={{
              background:
                "radial-gradient(circle at 20% 15%, rgba(var(--accent-shadow), 0.22), transparent 38%), radial-gradient(circle at 82% 78%, rgba(var(--accent-shadow), 0.14), transparent 42%)",
            }}
          />

          <motion.article
            className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-card/70 p-6 backdrop-blur-sm md:col-span-4 md:row-span-2 md:p-8"
            drag={canCycle && !shouldReduceMotion ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onDragEnd={(_, info) => {
              if (info.offset.x > SWIPE_THRESHOLD) {
                handlePrev();
              } else if (info.offset.x < -SWIPE_THRESHOLD) {
                handleNext();
              }
            }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                className="flex h-full flex-col justify-between gap-8"
                initial={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 0, y: 16, scale: 0.98 }
                }
                animate={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 1, y: 0, scale: 1 }
                }
                exit={
                  shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }
                }
                transition={{ duration: 0.45, ease: "easeOut" }}
              >
                <div className="space-y-5">
                  <Quote className="h-8 w-8 text-accent/80" />
                  <p className="text-lg leading-relaxed text-foreground sm:text-xl">
                    “{active.quote}”
                  </p>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <Star
                        key={`${active.id}-star-${index}`}
                        className={`h-4 w-4 ${index < active.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-foreground/20"
                          }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {active.avatar ? (
                    <div className="relative h-14 w-14 overflow-hidden rounded-full border border-foreground/10">
                      <Image
                        src={active.avatar}
                        alt={active.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-foreground/10 bg-accent/10 text-sm font-semibold text-accent">
                      {getInitials(active.name)}
                    </div>
                  )}
                  <div className="space-y-1">
                    <p className="text-base font-semibold text-foreground">
                      {active.name}
                    </p>
                    <p className="text-sm text-muted">
                      {active.role}
                      {active.company ? ` · ${active.company}` : ""}
                    </p>
                    <p className="text-xs text-muted">
                      {active.location ? (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {active.location}
                        </span>
                      ) : null}
                      {active.projectType ? (
                        <span>{active.location ? " · " : ""}{active.projectType}</span>
                      ) : null}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.article>

          <motion.aside
            className="relative overflow-hidden rounded-2xl border border-foreground/10 bg-card/70 p-5 backdrop-blur-sm md:col-span-2"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">
              Client Trust
            </p>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-semibold text-foreground">
                {averageRating}
              </span>
              <span className="pb-1 text-sm text-muted">/ 5.0 avg rating</span>
            </div>
            <p className="mt-4 text-sm text-muted">
              Based on {count} recent design collaborations across residential and
              hospitality projects.
            </p>
          </motion.aside>

          <motion.div
            className="rounded-2xl border border-foreground/10 bg-card/70 p-5 backdrop-blur-sm md:col-span-2"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-foreground">Browse stories</p>
              {canCycle ? (
                <span className="text-xs text-muted">
                  {activeIndex + 1} / {count}
                </span>
              ) : null}
            </div>

            {canCycle ? (
              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous testimonial"
                  onClick={handlePrev}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/15 text-foreground transition hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next testimonial"
                  onClick={handleNext}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-foreground/15 text-foreground transition hover:border-accent/40 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            ) : null}

            {canCycle ? (
              <div className="mt-5 space-y-4">
                <div className="h-1.5 overflow-hidden rounded-full bg-foreground/10">
                  <motion.div
                    className="h-full origin-left rounded-full bg-accent"
                    animate={{ scaleX: displayedProgress }}
                    transition={{ duration: 0.08, ease: "linear" }}
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {testimonials.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => goTo(index)}
                      aria-label={`Show testimonial ${index + 1}`}
                      aria-current={index === activeIndex ? "true" : "false"}
                      className={`h-2.5 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${index === activeIndex
                        ? "w-8 bg-accent"
                        : "w-2.5 bg-foreground/20 hover:bg-foreground/40"
                        }`}
                    />
                  ))}
                </div>
              </div>
            ) : null}
          </motion.div>

          {supportingIndexes.map((index, cardIndex) => {
            const item = testimonials[index];

            return (
              <motion.button
                key={item.id}
                type="button"
                className="group relative overflow-hidden rounded-2xl border border-foreground/10 bg-card/70 p-4 text-left backdrop-blur-sm transition hover:border-accent/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:col-span-2"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
                whileHover={shouldReduceMotion ? {} : { y: -4 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{
                  duration: 0.4,
                  ease: "easeOut",
                  delay: 0.08 * (cardIndex + 1),
                }}
                onClick={() => goTo(index)}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100"
                  style={{
                    background:
                      "radial-gradient(circle at top right, rgba(var(--accent-shadow), 0.16), transparent 45%)",
                  }}
                />
                <div className="relative space-y-3">
                  <p className="text-sm font-semibold text-foreground">{item.name}</p>
                  <p
                    className="text-sm leading-relaxed text-muted"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    “{item.quote}”
                  </p>
                  <p className="text-xs text-muted">{item.projectType ?? item.role}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
