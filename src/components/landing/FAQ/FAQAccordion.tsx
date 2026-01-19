"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SectionWrapper, SectionHeader } from "../shared/SectionWrapper";
import { staggerContainer, fadeInUp, reducedMotionContainer, reducedMotionInstant } from "../shared/animations";
import { FAQItem } from "./FAQItem";

// ============================================================================
// Types
// ============================================================================

interface FAQAccordionProps {
  className?: string;
}

// ============================================================================
// FAQ Questions Keys
// ============================================================================

const faqKeys = [
  "whatIs",
  "pricing",
  "services",
  "trial",
  "getStarted",
] as const;

// ============================================================================
// FAQAccordion Component
// ============================================================================

export function FAQAccordion({ className }: FAQAccordionProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();
  const t = useTranslations("landing.faq");

  const containerVariants = shouldReduceMotion
    ? reducedMotionContainer
    : staggerContainer;

  const itemVariants = shouldReduceMotion ? reducedMotionInstant : fadeInUp;

  return (
    <SectionWrapper
      ref={ref}
      id="faq"
      background="muted"
      className={cn("relative", className)}
      ariaLabelledBy="faq-heading"
      animate={false}
    >
      {/* Decorative diagonal lines */}
      <div
        className="absolute top-0 right-0 w-64 h-64 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <svg
          className="w-full h-full opacity-10"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1="0"
            x2="100"
            y2="100"
            stroke="currentColor"
            strokeWidth="1"
            className="text-landing-primary"
          />
          <line
            x1="20"
            y1="0"
            x2="100"
            y2="80"
            stroke="currentColor"
            strokeWidth="1"
            className="text-landing-accent"
          />
          <line
            x1="40"
            y1="0"
            x2="100"
            y2="60"
            stroke="currentColor"
            strokeWidth="1"
            className="text-landing-primary"
          />
        </svg>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Section Header */}
        <SectionHeader
          title={t("title")}
          titleId="faq-heading"
          subtitle={t("subtitle")}
          centered
        />

        {/* FAQ Accordion */}
        <motion.div
          variants={itemVariants}
          className="max-w-3xl mx-auto"
        >
          <AccordionPrimitive.Root
            type="single"
            collapsible
            className={cn(
              "bg-card",
              "border border-border rounded-lg",
              "overflow-hidden",
              "shadow-sm"
            )}
          >
            {faqKeys.map((key, index) => (
              <motion.div
                key={key}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: {
                    opacity: 1,
                    x: 0,
                    transition: {
                      duration: shouldReduceMotion ? 0.01 : 0.4,
                      delay: shouldReduceMotion ? 0 : index * 0.1,
                    },
                  },
                }}
              >
                <FAQItem
                  value={key}
                  question={t(`questions.${key}.question`)}
                  answer={t(`questions.${key}.answer`)}
                />
              </motion.div>
            ))}
          </AccordionPrimitive.Root>
        </motion.div>

        {/* Additional help CTA */}
        <motion.div
          variants={itemVariants}
          className="text-center mt-10"
        >
          <p className="text-muted-foreground mb-4">
            Still have questions?
          </p>
          <a
            href="#"
            className={cn(
              "inline-flex items-center gap-2",
              "text-landing-primary font-medium",
              "hover:text-landing-primary/80",
              "transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-primary focus-visible:ring-offset-2"
            )}
          >
            Contact our support team
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
        </motion.div>
      </motion.div>

      {/* Bottom decorative element */}
      <div
        className="absolute bottom-0 left-0 w-64 h-64 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        <svg
          className="w-full h-full opacity-10"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <line
            x1="0"
            y1="100"
            x2="100"
            y2="0"
            stroke="currentColor"
            strokeWidth="1"
            className="text-landing-accent"
          />
          <line
            x1="0"
            y1="80"
            x2="80"
            y2="0"
            stroke="currentColor"
            strokeWidth="1"
            className="text-landing-primary"
          />
        </svg>
      </div>
    </SectionWrapper>
  );
}

export default FAQAccordion;
