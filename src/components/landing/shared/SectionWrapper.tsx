"use client";

import { useRef, forwardRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  staggerContainer,
  reducedMotionContainer,
  getMotionSafeContainer,
} from "./animations";

// ============================================================================
// Types
// ============================================================================

type BackgroundVariant =
  | "default"
  | "landing-bg"
  | "muted"
  | "primary-subtle"
  | "accent-subtle"
  | "transparent";

interface SectionWrapperProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  /** Background color variant */
  background?: BackgroundVariant;
  /** Whether to add padding */
  padded?: boolean;
  /** Custom padding class override */
  paddingClassName?: string;
  /** Whether to constrain content to max-width */
  contained?: boolean;
  /** Custom max-width class override */
  containerClassName?: string;
  /** Section heading ID for aria-labelledby */
  ariaLabelledBy?: string;
  /** Direct aria-label for the section */
  ariaLabel?: string;
  /** Whether to animate children with stagger */
  animate?: boolean;
  /** Intersection observer threshold (0-1) */
  inViewThreshold?: number;
  /** Trigger animation only once */
  animateOnce?: boolean;
}

// ============================================================================
// Background variant styles
// ============================================================================

const backgroundStyles: Record<BackgroundVariant, string> = {
  default: "bg-background",
  "landing-bg": "bg-landing-bg",
  muted: "bg-muted/30",
  "primary-subtle": "bg-landing-primary/5",
  "accent-subtle": "bg-landing-accent/5",
  transparent: "bg-transparent",
};

// ============================================================================
// SectionWrapper Component
// ============================================================================

export const SectionWrapper = forwardRef<HTMLElement, SectionWrapperProps>(
  function SectionWrapper(
    {
      children,
      className,
      id,
      background = "default",
      padded = true,
      paddingClassName,
      contained = true,
      containerClassName,
      ariaLabelledBy,
      ariaLabel,
      animate = true,
      inViewThreshold = 0.2,
      animateOnce = true,
    },
    forwardedRef
  ) {
    const internalRef = useRef<HTMLElement>(null);
    const ref = forwardedRef || internalRef;
    const isInView = useInView(ref as React.RefObject<HTMLElement>, {
      once: animateOnce,
      amount: inViewThreshold,
    });
    const shouldReduceMotion = useReducedMotion();

    const containerVariants = getMotionSafeContainer(
      staggerContainer,
      shouldReduceMotion
    );

    const sectionContent = (
      <div className={cn(contained && "mx-auto max-w-7xl", containerClassName)}>
        {animate ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
          >
            {children}
          </motion.div>
        ) : (
          children
        )}
      </div>
    );

    return (
      <section
        ref={ref as React.Ref<HTMLElement>}
        id={id}
        aria-labelledby={ariaLabelledBy}
        aria-label={ariaLabel}
        className={cn(
          "relative overflow-hidden",
          backgroundStyles[background],
          padded &&
            (paddingClassName || "py-16 px-4 sm:px-6 lg:px-8 md:py-20 lg:py-24"),
          className
        )}
      >
        {sectionContent}
      </section>
    );
  }
);

// ============================================================================
// Section Header Component
// ============================================================================

interface SectionHeaderProps {
  title: string;
  titleId?: string;
  subtitle?: string;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
  /** Use display font (Bebas Neue) for title */
  useDisplayFont?: boolean;
  /** Center align text */
  centered?: boolean;
}

export function SectionHeader({
  title,
  titleId,
  subtitle,
  className,
  titleClassName,
  subtitleClassName,
  useDisplayFont = true,
  centered = true,
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "mb-10 lg:mb-14",
        centered && "text-center",
        className
      )}
    >
      <motion.h2
        id={titleId}
        className={cn(
          "text-3xl sm:text-4xl lg:text-5xl font-bold",
          "text-landing-text",
          useDisplayFont && "font-display tracking-wide uppercase",
          "mb-4",
          titleClassName
        )}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: "easeOut" },
          },
        }}
      >
        {title}
      </motion.h2>
      {subtitle && (
        <motion.p
          className={cn(
            "text-base lg:text-lg",
            "text-muted-foreground",
            centered && "mx-auto max-w-3xl",
            subtitleClassName
          )}
          variants={{
            hidden: { opacity: 0, y: 15 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: 0.5, ease: "easeOut", delay: 0.1 },
            },
          }}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}

// ============================================================================
// Section Accent Decoration
// ============================================================================

interface SectionAccentProps {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  className?: string;
}

export function SectionAccent({
  position = "top-left",
  className,
}: SectionAccentProps) {
  const positionClasses: Record<typeof position, string> = {
    "top-left": "top-0 left-0",
    "top-right": "top-0 right-0",
    "bottom-left": "bottom-0 left-0",
    "bottom-right": "bottom-0 right-0",
  };

  return (
    <div
      className={cn(
        "absolute pointer-events-none",
        "w-32 h-32 sm:w-48 sm:h-48 lg:w-64 lg:h-64",
        positionClasses[position],
        className
      )}
      aria-hidden="true"
    >
      {/* Geometric accent shape - diagonal lines */}
      <svg
        className="w-full h-full opacity-10"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <pattern
            id={`diagonalStripes-${position}`}
            patternUnits="userSpaceOnUse"
            width="10"
            height="10"
            patternTransform="rotate(45)"
          >
            <line
              x1="0"
              y1="0"
              x2="0"
              y2="10"
              stroke="currentColor"
              strokeWidth="1"
              className="text-landing-primary"
            />
          </pattern>
        </defs>
        <rect width="100" height="100" fill={`url(#diagonalStripes-${position})`} />
      </svg>
    </div>
  );
}

export default SectionWrapper;
