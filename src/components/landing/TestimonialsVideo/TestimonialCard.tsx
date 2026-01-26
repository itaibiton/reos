"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp } from "../shared/animations";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface TestimonialCardProps {
  testimonial: {
    quote: string;
    author: string;
    role?: string;
    avatar?: string;
  };
}

// ============================================================================
// TestimonialCard Component
// ============================================================================

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      variants={fadeInUp}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              scale: 1.02,
              y: -4,
              transition: { duration: 0.2, ease: "easeOut" },
            }
      }
      className={cn(
        // Layout
        "flex flex-col h-full p-6 rounded-xl",
        // Background & border
        "bg-card/50 backdrop-blur-sm",
        "border border-border/50",
        // Hover state (CSS fallback)
        "hover:shadow-lg hover:border-landing-primary/30",
        // Transitions
        "transition-shadow duration-300"
      )}
    >
      {/* Quote icon */}
      <Quote
        className="w-8 h-8 text-landing-primary/30 mb-4"
        aria-hidden="true"
      />

      {/* Quote text */}
      <blockquote className="text-base leading-relaxed text-landing-text flex-grow mb-6">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Author info */}
      <div className="flex items-center gap-3">
        {testimonial.avatar && (
          <img
            src={testimonial.avatar}
            alt=""
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        <div>
          <p className="font-semibold text-landing-text">{testimonial.author}</p>
          {testimonial.role && (
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
          )}
        </div>
      </div>
    </motion.article>
  );
}

export default TestimonialCard;
