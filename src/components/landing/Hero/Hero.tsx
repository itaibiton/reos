"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { HeroBackground } from "./HeroBackground";
import { HeroEcosystem } from "./HeroEcosystem";

// ============================================================================
// Types
// ============================================================================

interface HeroProps {
  className?: string;
}

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const textRevealVariants = {
  hidden: {
    opacity: 0,
    clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)",
    y: 30,
  },
  visible: {
    opacity: 1,
    clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0 100%)",
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 1, 0.5, 1],
    },
  },
};

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
};

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
    },
  },
};

// Reduced motion variants
const reducedMotionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.01 },
  },
};

// ============================================================================
// Accent Badge Component
// ============================================================================

function AccentBadge({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={fadeUpVariants}
      className={cn(
        "inline-flex items-center gap-2",
        "px-4 py-1.5 mb-6",
        "bg-landing-accent/10 border border-landing-accent/20",
        "text-landing-accent text-sm font-medium",
        "clip-corner-cut-tr"
      )}
    >
      <span className="w-2 h-2 rounded-full bg-landing-accent animate-pulse" />
      {children}
    </motion.div>
  );
}

// ============================================================================
// Hero Content Component
// ============================================================================

function HeroContent({ shouldReduceMotion }: { shouldReduceMotion: boolean | null }) {
  const t = useTranslations("landing.hero");
  const locale = useLocale();

  return (
    <motion.div
      variants={shouldReduceMotion ? reducedMotionVariants : containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center text-center lg:items-start lg:text-left"
    >
      {/* Accent badge */}
      <AccentBadge>{t("badge")}</AccentBadge>

      {/* Main headline */}
      <motion.h1
        variants={shouldReduceMotion ? reducedMotionVariants : textRevealVariants}
        className={cn(
          "font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
          "tracking-wide uppercase leading-[0.9]",
          "text-landing-text",
          "mb-4"
        )}
      >
        {t("headline")}
      </motion.h1>

      {/* Subheadline with serif accent */}
      <motion.p
        variants={shouldReduceMotion ? reducedMotionVariants : textRevealVariants}
        className={cn(
          "font-serif-display text-xl sm:text-2xl md:text-3xl",
          "text-landing-primary italic",
          "mb-6"
        )}
      >
        {t("subheadline")}
      </motion.p>

      {/* Description */}
      <motion.p
        variants={shouldReduceMotion ? reducedMotionVariants : fadeUpVariants}
        className={cn(
          "text-base sm:text-lg md:text-xl",
          "text-muted-foreground",
          "max-w-xl mb-8",
          "leading-relaxed"
        )}
      >
        {t("description")}
      </motion.p>

      {/* CTA Buttons */}
      <motion.div
        variants={shouldReduceMotion ? reducedMotionVariants : fadeUpVariants}
        className="flex flex-col sm:flex-row items-center gap-4"
      >
        <motion.div
          variants={shouldReduceMotion ? {} : buttonVariants}
          whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
        >
          <Button
            size="lg"
            className={cn(
              "bg-landing-primary text-white",
              "hover:bg-landing-primary/90",
              "clip-corner-cut-tr",
              "px-8 py-6 text-lg font-semibold",
              "shadow-lg shadow-landing-primary/20",
              "transition-all duration-200"
            )}
            asChild
          >
            <Link href={`/${locale}/sign-up`}>
              {t("ctaPrimary")}
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Link>
          </Button>
        </motion.div>

        <motion.div
          variants={shouldReduceMotion ? {} : buttonVariants}
          whileHover={shouldReduceMotion ? {} : { scale: 1.02 }}
          whileTap={shouldReduceMotion ? {} : { scale: 0.98 }}
        >
          <Button
            size="lg"
            variant="outline"
            className={cn(
              "border-landing-primary/30 text-landing-text",
              "hover:bg-landing-primary/10 hover:border-landing-primary/50",
              "px-8 py-6 text-lg font-medium",
              "transition-all duration-200"
            )}
          >
            <Play className="mr-2 h-5 w-5" aria-hidden="true" />
            {t("ctaSecondary")}
          </Button>
        </motion.div>
      </motion.div>

      {/* Trust indicators */}
      <motion.div
        variants={shouldReduceMotion ? reducedMotionVariants : fadeUpVariants}
        className="mt-10 pt-8 border-t border-landing-primary/10"
      >
        <p className="text-sm text-muted-foreground mb-3">{t("trustLabel")}</p>
        <div className="flex items-center justify-center lg:justify-start gap-6 text-landing-text/60">
          {/* Trust badges/stats */}
          <div className="text-center">
            <div className="font-display text-2xl text-landing-primary">500+</div>
            <div className="text-xs">{t("trustProperties")}</div>
          </div>
          <div className="w-px h-8 bg-landing-primary/20" />
          <div className="text-center">
            <div className="font-display text-2xl text-landing-primary">98%</div>
            <div className="text-xs">{t("trustSatisfaction")}</div>
          </div>
          <div className="w-px h-8 bg-landing-primary/20" />
          <div className="text-center">
            <div className="font-display text-2xl text-landing-primary">24/7</div>
            <div className="text-xs">{t("trustSupport")}</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// Hero Component
// ============================================================================

export function Hero({ className }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      ref={ref}
      className={cn(
        "relative min-h-screen",
        "flex items-center",
        "pt-20 pb-16 sm:pt-24 md:pt-28 lg:pt-32",
        "px-4 sm:px-6 lg:px-8",
        "overflow-hidden",
        className
      )}
      aria-label="Hero section"
    >
      {/* Animated background */}
      <HeroBackground />

      {/* Main content */}
      <div className="relative z-10 mx-auto max-w-7xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Text content */}
          <HeroContent shouldReduceMotion={shouldReduceMotion} />

          {/* Ecosystem visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={shouldReduceMotion ? { duration: 0.01 } : { duration: 0.8, delay: 0.3 }}
            className="relative lg:order-last"
          >
            <HeroEcosystem className="w-full max-w-lg mx-auto" />
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        transition={shouldReduceMotion ? { duration: 0.01 } : { delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={shouldReduceMotion ? {} : { y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-2 text-landing-text/50"
        >
          <span className="text-xs uppercase tracking-widest">Scroll</span>
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default Hero;
