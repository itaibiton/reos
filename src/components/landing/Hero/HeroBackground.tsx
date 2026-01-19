"use client";

import { useRef } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface FloatingShapeProps {
  className?: string;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
}

interface HeroBackgroundProps {
  className?: string;
}

// ============================================================================
// Animation Variants
// ============================================================================

const floatVariants = {
  initial: { y: 0, rotate: 0 },
  animate: (custom: { duration: number }) => ({
    y: [-10, 10, -10],
    rotate: [0, 5, -5, 0],
    transition: {
      y: {
        duration: custom.duration,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
      rotate: {
        duration: custom.duration * 1.5,
        repeat: Infinity,
        ease: "easeInOut" as const,
      },
    },
  }),
};

const pulseVariants = {
  initial: { scale: 1, opacity: 0.3 },
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.3, 0.5, 0.3],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const,
    },
  },
};

// ============================================================================
// Floating Hexagon Shape
// ============================================================================

function FloatingHexagon({
  className,
  delay = 0,
  duration = 6,
}: FloatingShapeProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      custom={{ duration }}
      variants={shouldReduceMotion ? {} : floatVariants}
      initial="initial"
      animate={shouldReduceMotion ? "initial" : "animate"}
      style={{ animationDelay: `${delay}s` }}
      className={cn("absolute", className)}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        aria-hidden="true"
      >
        <path
          d="M50 5 L90 27.5 L90 72.5 L50 95 L10 72.5 L10 27.5 Z"
          className="fill-landing-primary/10 stroke-landing-primary/20"
          strokeWidth="1"
        />
      </svg>
    </motion.div>
  );
}

// ============================================================================
// Floating Diamond Shape
// ============================================================================

function FloatingDiamond({
  className,
  delay = 0,
  duration = 5,
}: FloatingShapeProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      custom={{ duration }}
      variants={shouldReduceMotion ? {} : floatVariants}
      initial="initial"
      animate={shouldReduceMotion ? "initial" : "animate"}
      style={{ animationDelay: `${delay}s` }}
      className={cn("absolute", className)}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        aria-hidden="true"
      >
        <path
          d="M50 5 L95 50 L50 95 L5 50 Z"
          className="fill-landing-accent/10 stroke-landing-accent/20"
          strokeWidth="1"
        />
      </svg>
    </motion.div>
  );
}

// ============================================================================
// Floating Triangle Shape
// ============================================================================

function FloatingTriangle({
  className,
  delay = 0,
  duration = 7,
}: FloatingShapeProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      custom={{ duration }}
      variants={shouldReduceMotion ? {} : floatVariants}
      initial="initial"
      animate={shouldReduceMotion ? "initial" : "animate"}
      style={{ animationDelay: `${delay}s` }}
      className={cn("absolute", className)}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        aria-hidden="true"
      >
        <path
          d="M50 10 L90 90 L10 90 Z"
          className="fill-landing-primary/5 stroke-landing-primary/15"
          strokeWidth="1"
        />
      </svg>
    </motion.div>
  );
}

// ============================================================================
// Pulsing Circle
// ============================================================================

function PulsingCircle({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={shouldReduceMotion ? {} : pulseVariants}
      initial="initial"
      animate={shouldReduceMotion ? "initial" : "animate"}
      className={cn("absolute rounded-full", className)}
    />
  );
}

// ============================================================================
// Diagonal Grid Pattern
// ============================================================================

function DiagonalGrid({ className }: { className?: string }) {
  return (
    <div className={cn("absolute inset-0 pointer-events-none", className)}>
      <svg
        className="w-full h-full opacity-[0.03]"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="diagonal-grid"
            patternUnits="userSpaceOnUse"
            width="40"
            height="40"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="40"
              className="stroke-landing-primary"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="0"
              x2="40"
              y2="0"
              className="stroke-landing-primary"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#diagonal-grid)" />
      </svg>
    </div>
  );
}

// ============================================================================
// Corner Accent Lines
// ============================================================================

function CornerAccents() {
  return (
    <>
      {/* Top left corner accent */}
      <div className="absolute top-0 left-0 w-32 h-32 md:w-48 md:h-48 overflow-hidden pointer-events-none">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {/* Diagonal lines */}
          <line
            x1="0"
            y1="20"
            x2="20"
            y2="0"
            className="stroke-landing-primary/20"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1="40"
            x2="40"
            y2="0"
            className="stroke-landing-accent/15"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1="60"
            x2="60"
            y2="0"
            className="stroke-landing-primary/10"
            strokeWidth="1"
          />
        </svg>
      </div>

      {/* Bottom right corner accent */}
      <div className="absolute bottom-0 right-0 w-32 h-32 md:w-48 md:h-48 overflow-hidden pointer-events-none">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <line
            x1="100"
            y1="80"
            x2="80"
            y2="100"
            className="stroke-landing-accent/20"
            strokeWidth="1"
          />
          <line
            x1="100"
            y1="60"
            x2="60"
            y2="100"
            className="stroke-landing-primary/15"
            strokeWidth="1"
          />
          <line
            x1="100"
            y1="40"
            x2="40"
            y2="100"
            className="stroke-landing-accent/10"
            strokeWidth="1"
          />
        </svg>
      </div>
    </>
  );
}

// ============================================================================
// HeroBackground Component
// ============================================================================

export function HeroBackground({ className }: HeroBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 overflow-hidden pointer-events-none",
        className
      )}
      aria-hidden="true"
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-landing-bg via-background to-landing-bg/50" />

      {/* Diagonal grid pattern */}
      <DiagonalGrid />

      {/* Corner accent lines */}
      <CornerAccents />

      {/* Floating geometric shapes */}
      <FloatingHexagon
        className="w-20 h-20 md:w-32 md:h-32 top-[15%] left-[10%] opacity-60"
        delay={0}
        duration={8}
      />
      <FloatingHexagon
        className="w-16 h-16 md:w-24 md:h-24 top-[60%] right-[15%] opacity-40"
        delay={2}
        duration={6}
      />
      <FloatingDiamond
        className="w-12 h-12 md:w-20 md:h-20 top-[25%] right-[20%] opacity-50"
        delay={1}
        duration={7}
      />
      <FloatingDiamond
        className="w-14 h-14 md:w-16 md:h-16 bottom-[30%] left-[20%] opacity-30"
        delay={3}
        duration={5}
      />
      <FloatingTriangle
        className="w-16 h-16 md:w-28 md:h-28 bottom-[20%] right-[25%] opacity-40"
        delay={1.5}
        duration={9}
      />
      <FloatingTriangle
        className="w-10 h-10 md:w-16 md:h-16 top-[40%] left-[5%] opacity-25"
        delay={2.5}
        duration={6}
      />

      {/* Pulsing circles */}
      <PulsingCircle className="w-64 h-64 md:w-96 md:h-96 -top-32 -right-32 bg-landing-primary/5" />
      <PulsingCircle className="w-48 h-48 md:w-72 md:h-72 -bottom-24 -left-24 bg-landing-accent/5" />

      {/* Subtle radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_var(--landing-bg)_70%)] opacity-50" />
    </div>
  );
}

export default HeroBackground;
