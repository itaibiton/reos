"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { fadeInLeft, fadeInRight } from "../shared/animations";

// ============================================================================
// Types
// ============================================================================

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  /** Image URL for the feature */
  imageSrc?: string;
  imageAlt?: string;
  /** Position: alternating left/right layout */
  position: "left" | "right";
  /** Visual accent color */
  accentColor?: "primary" | "accent";
  className?: string;
}

// ============================================================================
// Reduced Motion Variants
// ============================================================================

const reducedMotionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.01 },
  },
};

// ============================================================================
// FeatureCard Component
// ============================================================================

export function FeatureCard({
  icon: Icon,
  title,
  description,
  imageSrc,
  imageAlt,
  position,
  accentColor = "primary",
  className,
}: FeatureCardProps) {
  const shouldReduceMotion = useReducedMotion();

  const contentVariants = shouldReduceMotion
    ? reducedMotionVariants
    : position === "left"
      ? fadeInLeft
      : fadeInRight;

  const imageVariants = shouldReduceMotion
    ? reducedMotionVariants
    : position === "left"
      ? fadeInRight
      : fadeInLeft;

  const accentColorClasses = {
    primary: {
      iconBg: "bg-landing-primary/10",
      iconText: "text-landing-primary",
      border: "border-landing-primary/20",
      accent: "bg-landing-primary",
    },
    accent: {
      iconBg: "bg-landing-accent/10",
      iconText: "text-landing-accent",
      border: "border-landing-accent/20",
      accent: "bg-landing-accent",
    },
  };

  const colors = accentColorClasses[accentColor];

  return (
    <div
      className={cn(
        "grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center",
        "py-8 lg:py-12",
        className
      )}
    >
      {/* Content */}
      <motion.div
        variants={contentVariants}
        className={cn(
          "flex flex-col",
          position === "right" && "lg:order-last"
        )}
      >
        {/* Icon badge */}
        <div
          className={cn(
            "inline-flex items-center justify-center",
            "w-14 h-14 mb-6",
            "clip-hexagon",
            colors.iconBg
          )}
        >
          <Icon
            className={cn("w-7 h-7", colors.iconText)}
            aria-hidden="true"
          />
        </div>

        {/* Title */}
        <h3
          className={cn(
            "text-2xl sm:text-3xl lg:text-4xl",
            "font-display tracking-wide uppercase",
            "text-landing-text",
            "mb-4"
          )}
        >
          {title}
        </h3>

        {/* Description */}
        <p className="text-base lg:text-lg text-muted-foreground leading-relaxed mb-6">
          {description}
        </p>

        {/* Decorative accent line */}
        <div className="flex items-center gap-3">
          <div className={cn("w-12 h-1", colors.accent, "clip-corner-cut-tr")} />
          <div className={cn("w-6 h-1", colors.accent, "opacity-50")} />
          <div className={cn("w-3 h-1", colors.accent, "opacity-25")} />
        </div>
      </motion.div>

      {/* Image/Visual */}
      <motion.div
        variants={imageVariants}
        className={cn(
          "relative",
          position === "right" && "lg:order-first"
        )}
      >
        <div
          className={cn(
            "relative aspect-[4/3] rounded-lg overflow-hidden",
            "bg-gradient-to-br from-landing-primary/5 to-landing-accent/5",
            "border",
            colors.border
          )}
        >
          {imageSrc ? (
            <img
              src={imageSrc}
              alt={imageAlt || title}
              className="w-full h-full object-cover"
            />
          ) : (
            /* Placeholder with geometric pattern */
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                className="w-full h-full opacity-10"
                viewBox="0 0 400 300"
                preserveAspectRatio="xMidYMid slice"
                aria-hidden="true"
              >
                <defs>
                  <pattern
                    id={`grid-${title.replace(/\s/g, "-")}`}
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
                  </pattern>
                </defs>
                <rect
                  width="400"
                  height="300"
                  fill={`url(#grid-${title.replace(/\s/g, "-")})`}
                />
              </svg>
              <Icon
                className={cn(
                  "absolute w-24 h-24",
                  colors.iconText,
                  "opacity-20"
                )}
                aria-hidden="true"
              />
            </div>
          )}

          {/* Corner accent */}
          <div
            className={cn(
              "absolute top-0 right-0 w-16 h-16",
              colors.accent,
              "opacity-20",
              "clip-diagonal-tl"
            )}
            aria-hidden="true"
          />
        </div>

        {/* Floating geometric decoration */}
        <div
          className={cn(
            "absolute -bottom-4 -left-4 w-24 h-24",
            "border-2",
            colors.border,
            "opacity-40",
            "-z-10"
          )}
          style={{
            clipPath: "polygon(0 0, 100% 0, 100% 70%, 70% 100%, 0 100%)",
          }}
          aria-hidden="true"
        />
      </motion.div>
    </div>
  );
}

export default FeatureCard;
