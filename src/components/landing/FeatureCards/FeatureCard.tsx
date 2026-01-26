"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { fadeInUp } from "../shared/animations";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

// ============================================================================
// FeatureCard Component
// ============================================================================

export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      variants={fadeInUp}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              scale: 1.03,
              y: -4,
              transition: { duration: 0.2, ease: "easeOut" },
            }
      }
      whileTap={
        shouldReduceMotion
          ? undefined
          : { scale: 0.98, transition: { duration: 0.1 } }
      }
      className={cn(
        // Layout
        "flex flex-col items-center text-center",
        "p-6 rounded-xl",
        // Background & border
        "bg-card/50 backdrop-blur-sm",
        "border border-border/50",
        // Base shadow - will enhance on hover
        "shadow-sm",
        // Hover state (CSS fallback for devices without JS)
        "hover:shadow-lg hover:border-landing-primary/30",
        // Transitions for non-animated properties
        "transition-shadow transition-colors duration-300",
        // Keyboard accessibility
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-primary",
        // Make entire card clickable/tappable if needed
        "cursor-pointer"
      )}
      // Keyboard accessibility - treat as interactive element
      tabIndex={0}
      role="article"
      aria-labelledby={`feature-${title.replace(/\s/g, "-")}`}
    >
      {/* Icon container with background */}
      <div
        className={cn(
          "w-16 h-16 mb-4",
          "rounded-xl",
          "bg-landing-primary/10",
          "flex items-center justify-center"
        )}
      >
        <Icon
          className="w-8 h-8 text-landing-primary"
          aria-hidden="true"
          strokeWidth={2}
        />
      </div>

      {/* Title */}
      <h3
        id={`feature-${title.replace(/\s/g, "-")}`}
        className="text-xl font-semibold mb-3 text-landing-text"
      >
        {title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground leading-relaxed text-sm">
        {description}
      </p>
    </motion.article>
  );
}

export default FeatureCard;
