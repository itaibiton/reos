"use client";

import { useRef } from "react";
import { motion, type Variants, useInView, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { UserPlus, Building2, Users, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface HowItWorksProps {
  className?: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const stepItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const STEP_ICONS = [UserPlus, Building2, Users, CheckCircle];

export function HowItWorks({ className }: HowItWorksProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();
  const t = useTranslations("landing.howItWorks");

  const steps = ["step1", "step2", "step3", "step4"] as const;

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={shouldReduceMotion ? undefined : stagger}
      className={cn("py-20 md:py-24 border-t border-border/50", className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div variants={shouldReduceMotion ? undefined : fadeInUp} className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-light tracking-tighter text-foreground mb-4">
            {t("heading")}
          </h2>
          <p className="text-lg text-foreground/50 font-light max-w-2xl mx-auto">
            {t("subheading")}
          </p>
        </motion.div>

        {/* Steps grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative">
          {/* Visual connector line (desktop only) */}
          <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px bg-border/50" aria-hidden="true" />

          {steps.map((stepKey, index) => {
            const Icon = STEP_ICONS[index];
            return (
              <motion.div
                key={stepKey}
                variants={shouldReduceMotion ? undefined : stepItem}
                className="relative flex flex-col items-center text-center"
              >
                {/* Step number + icon circle */}
                <div className="relative z-10 w-24 h-24 rounded-full bg-foreground/5 border border-border/50 flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-foreground/70" />
                  <span className="absolute -top-2 -end-2 w-7 h-7 rounded-full bg-foreground text-background text-xs font-semibold flex items-center justify-center">
                    {index + 1}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {t(`steps.${stepKey}.title`)}
                </h3>

                {/* Description */}
                <p className="text-sm text-foreground/50 font-light leading-relaxed max-w-xs">
                  {t(`steps.${stepKey}.description`)}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* CTA button */}
        <motion.div variants={shouldReduceMotion ? undefined : fadeInUp} className="text-center mt-16">
          <a
            href="/questionnaire"
            className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background rounded-full font-medium hover:bg-foreground/90 transition-colors"
          >
            {t("cta")}
          </a>
        </motion.div>
      </div>
    </motion.section>
  );
}
