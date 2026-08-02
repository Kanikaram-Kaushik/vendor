"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import whatsappIcon from "./whatsapp_img/whatsapp.svg";
import Reveal from "../Reveal";
import { ArrowRight, Sparkle } from "lucide-react";
import ButtonLink from "../ButtonLink";
import Link from "next/link";
import AnimatedCounter from "../AnimatedCounter";
import TypewriterWord from "../TypewriterWord";
import { motion, AnimatePresence } from "framer-motion";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=80",
    prefix: "Transform your home into a",
    highlight: "Masterpiece",
  },
  {
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=2000&q=80",
    prefix: "Experience the pinnacle of",
    highlight: "Luxury",
  },
  {
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=2000&q=80",
    prefix: "Design spaces filled with",
    highlight: "Elegance",
  },
  {
    image: "https://images.unsplash.com/photo-1618221118493-9cfa1a1c00da?auto=format&fit=crop&w=2000&q=80",
    prefix: "Redefining comfort through Luxury",
    highlight: "Craftsmanship",
  },
  {
    image: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=2000&q=80",
    prefix: "Craft spaces that define",
    highlight: "Timeless Beauty",
  },
  {
    image: "https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=2000&q=80",
    prefix: "Where innovation meets",
    highlight: "Sophistication",
  },
  {
    image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=2000&q=80",
    prefix: "Elevate everyday living with",
    highlight: "Refined Design",
  },
  {
    image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=2000&q=80",
    prefix: "Inspired interiors built for",
    highlight: "Modern Living",
  },

];

export function HeroFullWidth() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000); // Wait 6 seconds (enough time for word deletion + read time)

    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <div className="w-full">
      <Link
        href="https://wa.me/917032170323"
        target="_blank"
        className="fixed bottom-6 right-4 sm:bottom-10 sm:right-6 z-100 flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 text-white rounded-full transition duration-300 hover:scale-110"
      >
        <Image src={whatsappIcon} alt="WhatsApp" width={44} height={44} className="sm:w-12.5 sm:h-12.5" />
      </Link>
      <section className="relative min-h-[60vh] w-full overflow-hidden">
        {/* Background Image with Gradient Overlay and Crossfade */}
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`bg-${currentSlide}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0 z-0"
          >
            <Image
              src={slide.image}
              alt={`Modern interior design ${currentSlide + 1}`}
              fill
              className="object-cover"
              priority={currentSlide === 0}
            />
            <div className="absolute inset-0 bg-linear-to-r from-background via-background/60 to-background/20" />
            <div className="absolute inset-0 dark:bg-linear-to-r dark:from-background dark:via-background/60 dark:to-background/20" />
          </motion.div>
        </AnimatePresence>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto flex min-h-[60vh] max-w-6xl flex-col justify-center px-4 sm:px-6 lg:px-8 py-12 pb-6">
          <div className="max-w-2xl space-y-6 sm:space-y-8">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-foreground/20 bg-foreground/8 px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-md translate-y-3">
                <Sparkle className="h-3 w-3 sm:h-4 sm:w-4 text-foreground/80 stroke-[2.5]" />
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-foreground">
                  AI-Powered Precision meets Human Artistry
                </span>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <h1 className="text-4xl min-[400px]:text-[2.75rem] font-semibold leading-[1.1] text-foreground sm:text-5xl lg:text-7xl wrap-break-word min-h-[5em] sm:min-h-[3em]">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`text-${currentSlide}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.5 }}
                  >
                    <span>{slide.prefix}</span>
                    <br />
                    <TypewriterWord
                      key={`typewriter-${currentSlide}`}
                      word={slide.highlight}
                      className="inline-block tracking-wide text-[#B89C4A] drop-shadow-[0_1px_1px_rgba(0,0,0,0.18)] wrap-break-word w-full mt-1 sm:mt-0"
                    />
                  </motion.div>
                </AnimatePresence>
              </h1>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="max-w-xl text-base leading-relaxed text-para lg:text-lg">
                DesignBHK combines expert interior designers with <span className="whitespace-nowrap">cutting-edge AI</span> tools to help you discover, plan, and execute your dream home transformation efficiently.
              </p>
            </Reveal>

            <Reveal delay={0.3}>
              <div className="flex flex-wrap items-center gap-4">
                <ButtonLink className="shadow-lg shadow-black/20 w-full sm:w-auto justify-center" href="/discover" label="Create Your Masterpiece" />
              </div>
            </Reveal>

            {/* Stats */}
            <Reveal delay={0.4}>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-6 sm:gap-8 border-t border-foreground/10 pt-6 sm:pt-8 mt-2 pb-0">
                <div className="space-y-1">
                  <p className="text-3xl sm:text-4xl font-medium text-foreground">
                    <AnimatedCounter value={100} suffix="+" />
                  </p>
                  <p className="text-sm sm:text-base text-muted">Verified Studios</p>
                </div>
                <div className="space-y-1">
                  <p className="text-3xl sm:text-4xl font-medium text-foreground">
                    <AnimatedCounter value={500} suffix="+" />
                  </p>
                  <p className="text-sm sm:text-base text-muted">Design Ideas</p>
                </div>
                <div className="space-y-1 col-span-2 sm:col-span-1">
                  <p className="text-3xl sm:text-4xl font-medium text-foreground">
                    <AnimatedCounter value={50} suffix="+" />
                  </p>
                  <p className="text-sm sm:text-base text-muted">Projects Completed</p>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>
    </div>
  );
}
