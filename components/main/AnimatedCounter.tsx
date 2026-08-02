"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, animate } from "framer-motion";

type AnimatedCounterProps = {
  value: number;
  suffix?: string;
};

export default function AnimatedCounter({
  value,
  suffix = "",
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  // Update displayed value when motionValue changes
  useEffect(() => {
    const unsubscribe = motionValue.on("change", (latest) => {
      const rounded = Math.min(value, Math.round(latest));
      setDisplay(rounded.toLocaleString("en-US"));
    });

    return unsubscribe;
  }, [motionValue, value]);

  // Trigger animation when in view
  useEffect(() => {
    if (!isInView) return;

    const controls = animate(motionValue, value, {
      duration: 0.75,
      ease: "easeIn",
    });

    return () => controls.stop();
  }, [isInView, motionValue, value]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}