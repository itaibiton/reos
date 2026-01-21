"use client";

import { useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SectionWrapper, SectionHeader } from "../shared/SectionWrapper";
import { staggerContainer, reducedMotionContainer } from "../shared/animations";
import { PricingCard } from "./PricingCard";

// ============================================================================
// Types
// ============================================================================

interface PricingPlansProps {
  className?: string;
}

// ============================================================================
// Billing Toggle Component
// ============================================================================

function BillingToggle({
  isYearly,
  onToggle,
  monthlyLabel,
  yearlyLabel,
  saveLabel,
}: {
  isYearly: boolean;
  onToggle: () => void;
  monthlyLabel: string;
  yearlyLabel: string;
  saveLabel: string;
}) {
  return (
    <div className="flex items-center justify-center gap-4 mb-10">
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          !isYearly ? "text-landing-text" : "text-muted-foreground"
        )}
      >
        {monthlyLabel}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={isYearly}
        onClick={onToggle}
        className={cn(
          "relative w-14 h-7 rounded-full",
          "bg-landing-primary/20",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-primary focus-visible:ring-offset-2"
        )}
      >
        <span
          className={cn(
            "absolute top-1 w-5 h-5 rounded-full",
            "bg-landing-primary",
            "transition-transform duration-200",
            isYearly ? "translate-x-8" : "translate-x-1"
          )}
        />
      </button>

      <span
        className={cn(
          "text-sm font-medium transition-colors",
          isYearly ? "text-landing-text" : "text-muted-foreground"
        )}
      >
        {yearlyLabel}
      </span>

      {/* Save badge */}
      <span
        className={cn(
          "px-2 py-0.5",
          "bg-landing-accent/10 text-landing-accent",
          "text-xs font-semibold",
          "rounded-full"
        )}
      >
        {saveLabel}
      </span>
    </div>
  );
}

// ============================================================================
// PricingPlans Component
// ============================================================================

export function PricingPlans({ className }: PricingPlansProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();
  const [isYearly, setIsYearly] = useState(false);
  const t = useTranslations("landing.pricing");

  const containerVariants = shouldReduceMotion
    ? reducedMotionContainer
    : staggerContainer;

  // Get pricing tiers from translations
  const pricingTiers = [
    {
      key: "starter",
      isPopular: false,
    },
    {
      key: "professional",
      isPopular: true,
    },
    {
      key: "enterprise",
      isPopular: false,
    },
  ];

  return (
    <SectionWrapper
      ref={ref}
      id="pricing"
      background="default"
      className={cn("relative", className)}
      ariaLabelledBy="pricing-heading"
      animate={false}
    >
      {/* Decorative background elements */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 bg-landing-primary/5 rounded-full blur-3xl -z-10"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-landing-accent/5 rounded-full blur-3xl -z-10"
        aria-hidden="true"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        {/* Section Header */}
        <SectionHeader
          title={t("title")}
          titleId="pricing-heading"
          subtitle={t("subtitle")}
          centered
        />

        {/* Billing Toggle */}
        <motion.div
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: {
              opacity: 1,
              y: 0,
              transition: { duration: shouldReduceMotion ? 0.01 : 0.4 },
            },
          }}
        >
          <BillingToggle
            isYearly={isYearly}
            onToggle={() => setIsYearly(!isYearly)}
            monthlyLabel={t("monthly")}
            yearlyLabel={t("yearly")}
            saveLabel={t("save")}
          />
        </motion.div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {pricingTiers.map((tier, index) => {
            // Get features as an array - check if key exists before translating
            const features: string[] = [];
            for (let i = 0; i < 6; i++) {
              const key = `${tier.key}.features.${i}` as const;
              if (t.has(key)) {
                features.push(t(key));
              } else {
                break;
              }
            }

            return (
              <PricingCard
                key={tier.key}
                name={t(`${tier.key}.name`)}
                description={t(`${tier.key}.description`)}
                price={t(`${tier.key}.price`)}
                period={t(`${tier.key}.period`)}
                units={t(`${tier.key}.units`)}
                features={features}
                cta={t(`${tier.key}.cta`)}
                isPopular={tier.isPopular}
                popularLabel={tier.isPopular ? t(`${tier.key}.popular`) : undefined}
                index={index}
              />
            );
          })}
        </div>

        {/* Trust note */}
        <motion.p
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { duration: shouldReduceMotion ? 0.01 : 0.4, delay: 0.6 },
            },
          }}
          className="text-center text-sm text-muted-foreground mt-10"
        >
          14-day free trial on all plans. No credit card required.
        </motion.p>
      </motion.div>
    </SectionWrapper>
  );
}

export default PricingPlans;
