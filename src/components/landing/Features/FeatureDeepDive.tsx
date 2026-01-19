"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  LayoutDashboard,
  UserCircle,
  Workflow,
  TrendingUp,
  FolderArchive,
  UsersRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SectionWrapper, SectionHeader } from "../shared/SectionWrapper";
import { staggerContainerSlow, reducedMotionContainer } from "../shared/animations";
import { FeatureCard } from "./FeatureCard";

// ============================================================================
// Types
// ============================================================================

interface FeatureDeepDiveProps {
  className?: string;
}

// ============================================================================
// Feature Data
// ============================================================================

const featureKeys = [
  { key: "portfolioDashboard", icon: LayoutDashboard },
  { key: "tenantSelfService", icon: UserCircle },
  { key: "automatedWorkflows", icon: Workflow },
  { key: "financialInsights", icon: TrendingUp },
  { key: "documentManagement", icon: FolderArchive },
  { key: "teamCollaboration", icon: UsersRound },
] as const;

// ============================================================================
// FeatureDeepDive Component
// ============================================================================

export function FeatureDeepDive({ className }: FeatureDeepDiveProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.1 });
  const shouldReduceMotion = useReducedMotion();
  const t = useTranslations("landing.features");

  const containerVariants = shouldReduceMotion
    ? reducedMotionContainer
    : staggerContainerSlow;

  return (
    <SectionWrapper
      ref={ref}
      id="features"
      background="muted"
      className={cn("relative", className)}
      ariaLabelledBy="features-heading"
      animate={false}
    >
      {/* Decorative diagonal accent */}
      <div
        className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-background to-transparent"
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
          titleId="features-heading"
          subtitle={t("subtitle")}
          centered
        />

        {/* Features List - Alternating Layout */}
        <div className="space-y-8 lg:space-y-16">
          {featureKeys.map((feature, index) => (
            <motion.div
              key={feature.key}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: shouldReduceMotion ? 0.01 : 0.6,
                    delay: shouldReduceMotion ? 0 : index * 0.1,
                    ease: "easeOut",
                  },
                },
              }}
            >
              <FeatureCard
                icon={feature.icon}
                title={t(`${feature.key}.title`)}
                description={t(`${feature.key}.description`)}
                position={index % 2 === 0 ? "left" : "right"}
                accentColor={index % 2 === 0 ? "primary" : "accent"}
              />

              {/* Divider between features (except last) */}
              {index < featureKeys.length - 1 && (
                <div
                  className="mt-8 lg:mt-16 flex justify-center"
                  aria-hidden="true"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-landing-primary/30 rotate-45" />
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-landing-primary/30 to-transparent" />
                    <div className="w-2 h-2 bg-landing-accent/30 rotate-45" />
                    <div className="w-24 h-px bg-gradient-to-r from-transparent via-landing-accent/30 to-transparent" />
                    <div className="w-2 h-2 bg-landing-primary/30 rotate-45" />
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Bottom decorative element */}
      <div
        className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent"
        aria-hidden="true"
      />
    </SectionWrapper>
  );
}

export default FeatureDeepDive;
