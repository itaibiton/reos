"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ============================================================================
// Types
// ============================================================================

interface PricingCardProps {
  name: string;
  description: string;
  price: string;
  period: string;
  units: string;
  features: string[];
  cta: string;
  ctaHref?: string;
  isPopular?: boolean;
  popularLabel?: string;
  index?: number;
  className?: string;
}

// ============================================================================
// Animation Variants
// ============================================================================

const cardVariants = {
  hidden: {
    opacity: 0,
    rotateY: 90,
    scale: 0.8,
  },
  visible: (i: number) => ({
    opacity: 1,
    rotateY: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
      delay: i * 0.15,
    },
  }),
};

const reducedMotionVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.01 },
  },
};

// ============================================================================
// PricingCard Component
// ============================================================================

export function PricingCard({
  name,
  description,
  price,
  period,
  units,
  features,
  cta,
  ctaHref,
  isPopular = false,
  popularLabel,
  index = 0,
  className,
}: PricingCardProps) {
  const locale = useLocale();
  const cardRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);

  // 3D tilt effect values
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring animation for tilt
  const springConfig = { stiffness: 300, damping: 30 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), springConfig);

  // Handle mouse move for 3D effect
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    x.set((event.clientX - centerX) / rect.width);
    y.set((event.clientY - centerY) / rect.height);
  };

  const handleMouseLeave = () => {
    if (shouldReduceMotion) return;
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const defaultHref = isPopular
    ? `/${locale}/sign-up?plan=professional`
    : name.toLowerCase() === "enterprise"
      ? `/${locale}/contact`
      : `/${locale}/sign-up?plan=${name.toLowerCase()}`;

  return (
    <div className={cn("perspective-1000", className)}>
      <motion.div
        ref={cardRef}
        custom={index}
        variants={shouldReduceMotion ? reducedMotionVariants : cardVariants}
        style={
          shouldReduceMotion
            ? {}
            : {
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }
        }
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "relative flex flex-col h-full",
          "p-6 sm:p-8",
          "bg-card text-card-foreground",
          "border rounded-lg",
          "transition-shadow duration-300",
          isPopular
            ? "border-landing-accent shadow-lg shadow-landing-accent/20"
            : "border-border hover:border-landing-primary/30",
          isHovered && !shouldReduceMotion && "shadow-xl"
        )}
      >
        {/* Popular badge */}
        {isPopular && popularLabel && (
          <div
            className={cn(
              "absolute -top-3 left-1/2 -translate-x-1/2",
              "px-4 py-1",
              "bg-landing-accent text-white",
              "text-xs font-semibold uppercase tracking-wider",
              "clip-corner-cut-tr clip-corner-cut-bl"
            )}
          >
            {popularLabel}
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-landing-text mb-2">
            {name}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Price */}
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span
              className={cn(
                "font-display text-4xl sm:text-5xl",
                "tracking-tight",
                isPopular ? "text-landing-accent" : "text-landing-primary"
              )}
            >
              {price}
            </span>
            {period && (
              <span className="text-muted-foreground text-sm">{period}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-2">{units}</p>
        </div>

        {/* Divider */}
        <div
          className={cn(
            "h-px mb-6",
            "bg-gradient-to-r",
            isPopular
              ? "from-transparent via-landing-accent/30 to-transparent"
              : "from-transparent via-border to-transparent"
          )}
          aria-hidden="true"
        />

        {/* Features */}
        <ul className="flex-grow space-y-3 mb-8">
          {features.map((feature, i) => (
            <li key={i} className="flex items-start gap-3">
              <div
                className={cn(
                  "flex-shrink-0 w-5 h-5 mt-0.5",
                  "flex items-center justify-center",
                  "rounded-full",
                  isPopular
                    ? "bg-landing-accent/10 text-landing-accent"
                    : "bg-landing-primary/10 text-landing-primary"
                )}
              >
                <Check className="w-3 h-3" aria-hidden="true" />
              </div>
              <span className="text-sm text-muted-foreground">{feature}</span>
            </li>
          ))}
        </ul>

        {/* CTA Button */}
        <Button
          className={cn(
            "w-full",
            isPopular
              ? "bg-landing-accent text-white hover:bg-landing-accent/90"
              : "bg-landing-primary text-white hover:bg-landing-primary/90",
            "clip-corner-cut-tr",
            "transition-all duration-200"
          )}
          size="lg"
          asChild
        >
          <Link href={ctaHref || defaultHref}>{cta}</Link>
        </Button>

        {/* Decorative corner accent for popular card */}
        {isPopular && (
          <div
            className={cn(
              "absolute bottom-0 right-0 w-24 h-24",
              "bg-landing-accent/5",
              "pointer-events-none"
            )}
            style={{
              clipPath: "polygon(100% 0, 100% 100%, 0 100%)",
            }}
            aria-hidden="true"
          />
        )}
      </motion.div>
    </div>
  );
}

export default PricingCard;
