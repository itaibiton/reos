"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  UserPlus,
  Building2,
  Settings,
  Rocket,
  CheckCircle2,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SectionWrapper, SectionHeader } from "./shared/SectionWrapper";

// ============================================================================
// Types
// ============================================================================

interface ProcessStep {
  number: number;
  icon: LucideIcon;
  title: string;
  description: string;
  highlights: string[];
  ariaLabel: string;
}

interface ProcessStepItemProps {
  step: ProcessStep;
  shouldReduceMotion: boolean | null;
}

interface ProcessStepsProps {
  className?: string;
}

// ============================================================================
// Data
// ============================================================================

const processSteps: ProcessStep[] = [
  {
    number: 1,
    icon: UserPlus,
    title: "Create Your Account",
    description:
      "Sign up in under 2 minutes and start exploring immediately. No credit card required, no lengthy forms—just enter your details and you're in. Your 14-day free trial begins the moment you're ready.",
    highlights: [
      "Quick signup with email or Google",
      "Step-by-step profile setup",
      "Full access from day one",
    ],
    ariaLabel: "User registration icon",
  },
  {
    number: 2,
    icon: Building2,
    title: "Add Your Properties",
    description:
      "Bring your entire portfolio into REOS in minutes, not hours. Upload a spreadsheet, connect via API, or add properties one by one—our smart import handles the details so you don't have to.",
    highlights: [
      "Bulk import from CSV or Excel",
      "Automatic data validation",
      "Residential, commercial, or mixed-use",
    ],
    ariaLabel: "Property building icon",
  },
  {
    number: 3,
    icon: Settings,
    title: "Configure Your Workspace",
    description:
      "Make REOS work the way you do. Choose from ready-made templates or customize your dashboards, set up team permissions, and connect the tools you already use. Everything adapts to your workflow.",
    highlights: [
      "Pre-built workflow templates",
      "Role-based team permissions",
      "Accounting and payment integrations",
    ],
    ariaLabel: "Configuration settings icon",
  },
  {
    number: 4,
    icon: Rocket,
    title: "Start Managing Smarter",
    description:
      "You're all set. Invite tenants to their self-service portal, automate rent collection, and track everything from maintenance to financials in one place. Welcome to property management that runs itself.",
    highlights: [
      "Tenant portal with self-service features",
      "Automated payments and reminders",
      "Real-time insights and reports",
    ],
    ariaLabel: "Launch rocket icon",
  },
];

// ============================================================================
// Animation Variants
// ============================================================================

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1,
    },
  },
};

const stepVariants = {
  hidden: {
    opacity: 0,
    y: 30,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const badgeVariants = {
  hidden: {
    scale: 0,
    rotate: -180,
  },
  visible: {
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring" as const,
      stiffness: 200,
      damping: 15,
      delay: 0.1,
    },
  },
};

const connectorVariants = {
  hidden: {
    scaleX: 0,
    opacity: 0,
  },
  visible: (i: number) => ({
    scaleX: 1,
    opacity: 1,
    transition: {
      scaleX: {
        duration: 0.8,
        ease: "easeInOut" as const,
        delay: 0.3 + i * 0.3,
      },
      opacity: {
        duration: 0.3,
        delay: 0.3 + i * 0.3,
      },
    },
  }),
};

const mobileConnectorVariants = {
  hidden: {
    scaleY: 0,
    opacity: 0,
  },
  visible: {
    scaleY: 1,
    opacity: 1,
    transition: {
      scaleY: {
        duration: 1.5,
        ease: "easeOut" as const,
      },
      opacity: {
        duration: 0.4,
      },
    },
  },
};

// Reduced motion variants
const reducedMotionContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.01 },
  },
};

const reducedMotionStepVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.01 },
  },
};

// ============================================================================
// ProcessStepItem Component
// ============================================================================

function ProcessStepItem({
  step,
  shouldReduceMotion,
}: ProcessStepItemProps) {
  const Icon = step.icon;
  const titleId = `step-${step.number}-title`;
  const isOdd = step.number % 2 === 1;

  return (
    <motion.li
      variants={shouldReduceMotion ? reducedMotionStepVariants : stepVariants}
      className="relative group"
    >
      <article
        aria-labelledby={titleId}
        className="flex flex-col items-center text-center"
      >
        {/* Hexagonal Step Number Badge */}
        <motion.div
          variants={shouldReduceMotion ? reducedMotionStepVariants : badgeVariants}
          className={cn(
            "relative z-10 mb-4",
            "flex items-center justify-center",
            "w-14 h-14 md:w-16 md:h-16 lg:w-20 lg:h-20",
            "clip-hexagon",
            "transition-all duration-300",
            isOdd
              ? "bg-landing-primary group-hover:shadow-lg group-hover:shadow-landing-primary/30"
              : "bg-landing-accent group-hover:shadow-lg group-hover:shadow-landing-accent/30"
          )}
        >
          {/* Inner hexagon */}
          <div
            className={cn(
              "absolute inset-1",
              "clip-hexagon",
              "bg-card"
            )}
          />
          <span
            className={cn(
              "relative z-10",
              "font-display text-2xl md:text-3xl lg:text-4xl tracking-wide",
              isOdd ? "text-landing-primary" : "text-landing-accent"
            )}
            aria-hidden="true"
          >
            {step.number}
          </span>
        </motion.div>

        {/* Icon with geometric background */}
        <div
          role="img"
          aria-label={step.ariaLabel}
          className="mb-4 relative"
        >
          <div
            className={cn(
              "absolute inset-0 -m-2",
              "bg-gradient-to-br opacity-10",
              isOdd ? "from-landing-primary to-transparent" : "from-landing-accent to-transparent"
            )}
            style={{
              clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
            }}
            aria-hidden="true"
          />
          <Icon
            className={cn(
              "relative w-6 h-6 md:w-7 md:h-7 lg:w-8 lg:h-8",
              isOdd ? "text-landing-primary" : "text-landing-accent",
              "transition-transform duration-300",
              !shouldReduceMotion && "group-hover:scale-110"
            )}
            aria-hidden="true"
          />
        </div>

        {/* Title */}
        <h3
          id={titleId}
          className="mb-3 text-lg md:text-xl lg:text-2xl font-semibold leading-tight text-landing-text"
        >
          {step.title}
        </h3>

        {/* Description */}
        <p className="mb-4 text-sm md:text-base leading-relaxed text-muted-foreground">
          {step.description}
        </p>

        {/* Highlights with geometric checkmarks */}
        <ul className="space-y-2 text-left text-sm text-muted-foreground w-full">
          {step.highlights.map((highlight, i) => (
            <li key={i} className="flex items-start gap-2">
              <div
                className={cn(
                  "mt-0.5 flex-shrink-0 w-4 h-4",
                  "flex items-center justify-center",
                  "rotate-45",
                  isOdd ? "bg-landing-primary/10" : "bg-landing-accent/10"
                )}
              >
                <CheckCircle2
                  className={cn(
                    "h-3 w-3 -rotate-45",
                    isOdd ? "text-landing-primary" : "text-landing-accent"
                  )}
                  aria-hidden="true"
                />
              </div>
              <span>{highlight}</span>
            </li>
          ))}
        </ul>
      </article>
    </motion.li>
  );
}

// ============================================================================
// DesktopConnectors Component
// ============================================================================

function DesktopConnectors({
  inView,
  shouldReduceMotion,
}: {
  inView: boolean;
  shouldReduceMotion: boolean | null;
}) {
  // Three connectors between 4 steps
  const connectors = [0, 1, 2];

  return (
    <div
      className="absolute top-6 md:top-7 lg:top-8 left-0 right-0 hidden lg:block pointer-events-none"
      role="presentation"
      aria-hidden="true"
    >
      <div className="max-w-7xl mx-auto px-8 relative">
        {/* Position connectors between badges */}
        {connectors.map((index) => (
          <motion.div
            key={index}
            custom={index}
            variants={shouldReduceMotion ? reducedMotionStepVariants : connectorVariants}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
            className={cn(
              "absolute h-0.5",
              "border-t-2 border-dashed border-primary/30",
              "origin-left"
            )}
            style={{
              // Position each connector between step badges
              // Each column is 25% of the container width
              // Offset by badge radius (32px) from each side
              left: `calc(${(index + 1) * 25}% - 3%)`,
              width: "calc(25% - 6%)",
              top: "0",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MobileConnector Component
// ============================================================================

function MobileConnector({
  inView,
  shouldReduceMotion,
}: {
  inView: boolean;
  shouldReduceMotion: boolean | null;
}) {
  return (
    <motion.div
      variants={shouldReduceMotion ? reducedMotionStepVariants : mobileConnectorVariants}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      className={cn(
        "absolute start-6 top-16 bottom-16",
        "w-0 border-s-2 border-dashed border-primary/30",
        "lg:hidden",
        "origin-top"
      )}
      role="presentation"
      aria-hidden="true"
    />
  );
}

// ============================================================================
// ProcessSteps Component
// ============================================================================

export function ProcessSteps({ className }: ProcessStepsProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();
  const t = useTranslations("landing.process");

  return (
    <SectionWrapper
      ref={ref}
      id="process"
      background="muted"
      className={className}
      ariaLabelledBy="process-heading"
      animate={false}
    >
      {/* Section Header */}
      <SectionHeader
        title={t("title")}
        titleId="process-heading"
        subtitle={t("subtitle")}
        centered
      />

      {/* Steps Container with Connectors */}
      <div className="relative">
        {/* Desktop Horizontal Connectors */}
        <DesktopConnectors
          inView={isInView}
          shouldReduceMotion={shouldReduceMotion}
        />

        {/* Mobile Vertical Connector */}
        <MobileConnector
          inView={isInView}
          shouldReduceMotion={shouldReduceMotion}
        />

        {/* Steps Grid */}
        <motion.ol
          variants={
            shouldReduceMotion
              ? reducedMotionContainerVariants
              : containerVariants
          }
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className={cn(
            "relative z-10",
            "grid",
            "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
            "gap-8 md:gap-x-8 md:gap-y-12 lg:gap-12"
          )}
        >
          {processSteps.map((step) => (
            <ProcessStepItem
              key={step.number}
              step={step}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </motion.ol>
      </div>
    </SectionWrapper>
  );
}

export default ProcessSteps;
