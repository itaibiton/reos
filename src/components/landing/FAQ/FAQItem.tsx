"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface FAQItemProps {
  value: string;
  question: string;
  answer: string;
  className?: string;
}

// ============================================================================
// FAQItem Component
// ============================================================================

export function FAQItem({
  value,
  question,
  answer,
  className,
}: FAQItemProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <AccordionPrimitive.Item
      value={value}
      className={cn(
        "group relative",
        "border-b border-landing-primary/10",
        "last:border-b-0",
        className
      )}
    >
      {/* Diagonal accent line - visible on hover */}
      <div
        className={cn(
          "absolute start-0 top-0 w-1 h-full",
          "bg-gradient-to-b from-landing-primary via-landing-accent to-landing-primary",
          "opacity-0 transition-opacity duration-300",
          "group-hover:opacity-100 group-data-[state=open]:opacity-100"
        )}
        aria-hidden="true"
      />

      <AccordionPrimitive.Header className="flex">
        <AccordionPrimitive.Trigger
          className={cn(
            "flex flex-1 items-center justify-between gap-4",
            "py-5 px-4 sm:py-6 sm:px-6",
            "text-left transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-primary focus-visible:ring-offset-2",
            "group-hover:bg-landing-primary/5"
          )}
        >
          {/* Question text */}
          <span
            className={cn(
              "text-base sm:text-lg font-medium",
              "text-landing-text",
              "transition-colors duration-200",
              "group-hover:text-landing-primary",
              "group-data-[state=open]:text-landing-primary"
            )}
          >
            {question}
          </span>

          {/* Chevron icon with rotation */}
          <motion.div
            animate={shouldReduceMotion ? {} : undefined}
            className={cn(
              "flex-shrink-0",
              "w-8 h-8 sm:w-10 sm:h-10",
              "flex items-center justify-center",
              "bg-landing-primary/10 rounded-full",
              "transition-all duration-300",
              "group-hover:bg-landing-primary/20",
              "group-data-[state=open]:bg-landing-primary group-data-[state=open]:text-white"
            )}
          >
            <ChevronDown
              className={cn(
                "w-4 h-4 sm:w-5 sm:h-5",
                "text-landing-primary",
                "transition-transform duration-300",
                "group-data-[state=open]:rotate-180 group-data-[state=open]:text-white"
              )}
              aria-hidden="true"
            />
          </motion.div>
        </AccordionPrimitive.Trigger>
      </AccordionPrimitive.Header>

      <AccordionPrimitive.Content
        className={cn(
          "overflow-hidden",
          "data-[state=closed]:animate-accordion-up",
          "data-[state=open]:animate-accordion-down"
        )}
      >
        <div className="px-4 sm:px-6 pb-5 sm:pb-6">
          {/* Decorative corner accent */}
          <div className="relative">
            <div
              className={cn(
                "absolute -start-2 top-0 w-6 h-6",
                "border-s-2 border-t-2 border-landing-accent/30"
              )}
              aria-hidden="true"
            />
            <p
              className={cn(
                "text-sm sm:text-base",
                "text-muted-foreground",
                "leading-relaxed",
                "ps-4"
              )}
            >
              {answer}
            </p>
          </div>
        </div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}

export default FAQItem;
