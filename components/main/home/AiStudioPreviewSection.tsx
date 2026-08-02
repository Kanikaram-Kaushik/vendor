"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ImagePlus, WandSparkles } from "lucide-react";
import { useState } from "react";
import ButtonLink from "@/components/ButtonLink";
import { ImageComparison, ImageComparisonLayer, ImageComparisonSlider } from "@/components/ImageComparison";
import SectionHeader from "@/components/SectionHeader";

const PREVIEW_OUTPUTS = [
  {
    id: "quiet-luxe",
    title: "Quiet Luxe Refresh",
    style: "Warm Minimal",
    time: "Preview render · 4s",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "coastal-serene",
    title: "Coastal Serenity",
    style: "Coastal Contemporary",
    time: "Preview render · 5s",
    image: "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1600&q=80",
  },
  {
    id: "earthy-japandi",
    title: "Earthy Japandi Studio",
    style: "Japandi",
    time: "Preview render · 4s",
    image: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1600&q=80",
  },
];

const SOURCE_IMAGE = "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80";
const JOURNEY_STEPS = [
  {
    title: "Upload Your Space",
    description: "Drop your current room photo and choose the zone to redesign.",
  },
  {
    title: "Prompt Your Vision",
    description: "Describe style, mood, materials, and lighting with natural language.",
  },
  {
    title: "Generate Variations",
    description: "Get multiple design directions with before/after comparisons instantly.",
  },
];

export function AiStudioPreviewSection() {
  const [outputIndex, setOutputIndex] = useState(0);
  const output = PREVIEW_OUTPUTS[outputIndex];

  return (
    <section className="w-full px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-14">
        <SectionHeader
          eyebrow="AI Studio · Preview"
          title="Your Personal AI Design Studio"
          description="This is a visual concept preview. You can explore the reveal interaction, while full prompt and upload capabilities are coming soon."
        />

        <div className="relative grid gap-6 lg:grid-cols-[1.05fr_1.25fr]">
          <div
            className="pointer-events-none absolute inset-0 -z-10 rounded-[2rem]"
            style={{
              background:
                "radial-gradient(circle at 10% 10%, rgba(var(--accent-shadow), 0.2), transparent 42%), radial-gradient(circle at 88% 90%, rgba(var(--accent-shadow), 0.14), transparent 40%)",
            }}
          />

          <motion.div
            className="space-y-5 rounded-3xl border border-foreground/10 bg-card/70 p-6 backdrop-blur-sm sm:p-7"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between gap-4">
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <WandSparkles className="h-4 w-4 text-accent" />
                AI Studio Flow
              </p>
              <span className="rounded-full border border-accent/30 bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
                Coming Soon
              </span>
            </div>

            <div className="space-y-3">
              {JOURNEY_STEPS.map((step, index) => (
                <motion.div
                  key={step.title}
                  className="rounded-2xl border border-foreground/10 bg-background/55 p-4"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.4, ease: "easeOut", delay: 0.08 * index }}
                >
                  <div className="mb-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">
                    {index + 1}
                  </div>
                  <p className="text-sm font-semibold text-foreground">{step.title}</p>
                  <p className="mt-1 text-sm text-muted">{step.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="rounded-2xl border border-foreground/10 bg-card/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted">What You Will Get</p>
              <div className="mt-3 grid gap-2 text-sm text-foreground sm:grid-cols-2">
                <div className="rounded-xl bg-background/70 px-3 py-2">Multi-style variations</div>
                <div className="rounded-xl bg-background/70 px-3 py-2">Before/after comparisons</div>
                <div className="rounded-xl bg-background/70 px-3 py-2">Material + mood guidance</div>
                <div className="rounded-xl bg-background/70 px-3 py-2">Export-ready concepts</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="relative overflow-hidden rounded-3xl border border-foreground/10 bg-card/70 p-4 backdrop-blur-sm sm:p-5"
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.08 }}
          >
            <div className="mb-4 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-foreground">Preview Canvas</p>
              <span className="text-xs text-muted">{output.time}</span>
            </div>

            <ImageComparison
              className="aspect-[16/10] rounded-2xl border border-foreground/10"
              springOptions={{ bounce: 0, duration: 0.15 }}
            >
              <ImageComparisonLayer position="left">
                <Image
                  src={SOURCE_IMAGE}
                  alt="Room reference image"
                  fill
                  sizes="(max-width: 1024px) 100vw, 70vw"
                  className="object-cover"
                />
              </ImageComparisonLayer>

              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={output.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0.72 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                >
                  <ImageComparisonLayer position="right">
                    <Image
                      src={output.image}
                      alt={output.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 70vw"
                      className="object-cover"
                    />
                  </ImageComparisonLayer>
                </motion.div>
              </AnimatePresence>

              <motion.div
                className="pointer-events-none absolute inset-0"
                initial={{ opacity: 0.35 }}
                animate={{ opacity: [0.25, 0.45, 0.25] }}
                transition={{ duration: 2.2, repeat: Number.POSITIVE_INFINITY }}
                style={{
                  background: "linear-gradient(115deg, transparent 10%, rgba(255,255,255,0.24) 45%, transparent 75%)",
                }}
              />

              <div className="absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-white">
                Before
              </div>
              <div className="absolute right-3 top-3 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                AI Output
              </div>

              <ImageComparisonSlider className="bg-white/80">
                <div className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/75 bg-black/45 text-white backdrop-blur-sm">
                  <span className="mx-auto mt-3 block h-4 w-4 rounded-full border border-white/70" />
                </div>
              </ImageComparisonSlider>

              <motion.div
                className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/45 px-3 py-1 text-[11px] font-medium text-white"
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                Drag to compare
              </motion.div>
            </ImageComparison>

            <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <div>
                <p className="text-base font-semibold text-foreground">{output.title}</p>
                <p className="mt-1 text-sm text-muted">{output.style}</p>
              </div>
              <ButtonLink href="/contact" label="Join Waitlist" size="sm" variant="secondary" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {PREVIEW_OUTPUTS.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setOutputIndex(index)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${outputIndex === index
                    ? "bg-foreground text-background"
                    : "border border-foreground/15 bg-card text-muted hover:text-foreground"
                    }`}
                >
                  {item.style}
                </button>
              ))}
            </div>

            <motion.div
              className="absolute -bottom-6 -right-6 hidden h-28 w-28 items-center justify-center rounded-full bg-accent/15 lg:flex"
              animate={{ scale: [1, 1.08, 1], rotate: [0, 8, 0] }}
              transition={{ duration: 4.5, repeat: Number.POSITIVE_INFINITY }}
            >
              <ImagePlus className="h-8 w-8 text-accent" />
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
