"use client";

import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
  type SpringOptions,
} from "framer-motion";

type ImageComparisonContextValue = {
  sliderPosition: number;
  setSliderPosition: (position: number) => void;
  motionSliderPosition: MotionValue<number>;
};

const ImageComparisonContext = createContext<ImageComparisonContextValue | undefined>(
  undefined,
);

type ImageComparisonProps = {
  children: ReactNode;
  className?: string;
  enableHover?: boolean;
  springOptions?: SpringOptions;
};

type ImageComparisonLayerProps = {
  className?: string;
  children: ReactNode;
  position: "left" | "right";
};

type ImageComparisonSliderProps = {
  className?: string;
  children?: ReactNode;
};

const DEFAULT_SPRING_OPTIONS: SpringOptions = {
  bounce: 0,
  duration: 0,
};

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function useImageComparisonContext() {
  const context = useContext(ImageComparisonContext);
  if (!context) {
    throw new Error("ImageComparison subcomponents must be used inside ImageComparison");
  }
  return context;
}

export function ImageComparison({
  children,
  className,
  enableHover = false,
  springOptions,
}: ImageComparisonProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const rawSlider = useMotionValue(50);
  const motionSliderPosition = useSpring(
    rawSlider,
    springOptions ?? DEFAULT_SPRING_OPTIONS,
  );

  const updateFromClientX = (clientX: number) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const value = ((clientX - rect.left) / rect.width) * 100;
    const next = Math.max(0, Math.min(100, value));
    rawSlider.set(next);
    setSliderPosition(next);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!enableHover && !isDragging) return;
    updateFromClientX(event.clientX);
  };

  return (
    <ImageComparisonContext.Provider
      value={{ sliderPosition, setSliderPosition, motionSliderPosition }}
    >
      <div
        ref={containerRef}
        className={cx(
          "relative overflow-hidden select-none",
          enableHover && "cursor-ew-resize",
          className,
        )}
        onPointerMove={handlePointerMove}
        onPointerDown={(event) => {
          if (enableHover) return;
          setIsDragging(true);
          updateFromClientX(event.clientX);
        }}
        onPointerUp={() => {
          if (enableHover) return;
          setIsDragging(false);
        }}
        onPointerLeave={() => {
          if (enableHover) return;
          setIsDragging(false);
        }}
      >
        {children}
      </div>
    </ImageComparisonContext.Provider>
  );
}

export function ImageComparisonLayer({
  className,
  children,
  position,
}: ImageComparisonLayerProps) {
  const { motionSliderPosition } = useImageComparisonContext();
  const leftClipPath = useTransform(
    motionSliderPosition,
    (value) => `inset(0 ${100 - value}% 0 0)`,
  );
  const rightClipPath = useTransform(
    motionSliderPosition,
    (value) => `inset(0 0 0 ${value}%)`,
  );

  return (
    <motion.div
      className={cx("absolute inset-0", className)}
      style={{ clipPath: position === "left" ? leftClipPath : rightClipPath }}
    >
      {children}
    </motion.div>
  );
}

export function ImageComparisonSlider({
  className,
  children,
}: ImageComparisonSliderProps) {
  const { motionSliderPosition } = useImageComparisonContext();
  const left = useTransform(motionSliderPosition, (value) => `${value}%`);

  return (
    <motion.div
      className={cx("absolute inset-y-0 w-px -translate-x-1/2", className)}
      style={{ left }}
    >
      {children}
    </motion.div>
  );
}
