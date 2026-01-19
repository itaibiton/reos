"use client";

import { useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import {
  Building2,
  Users,
  Wrench,
  LineChart,
  FileText,
  MessageSquare,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { SectionWrapper, SectionHeader } from "./shared/SectionWrapper";

// ============================================================================
// Types
// ============================================================================

interface Service {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  ctaText?: string;
}

interface ServiceCardProps extends Service {
  index: number;
  shouldReduceMotion: boolean | null;
}

interface ServicesGridProps {
  className?: string;
}

// ============================================================================
// Data
// ============================================================================

const services: Service[] = [
  {
    id: "property-management",
    icon: Building2,
    title: "Complete Property Control",
    description:
      "See your entire portfolio at a glance. Monitor occupancy, track lease renewals, and automate routine tasks so you can focus on growing your business instead of chasing spreadsheets.",
    href: "/services/property-management",
    ctaText: "Explore Features",
  },
  {
    id: "tenant-portal",
    icon: Users,
    title: "Self-Service Tenant Portal",
    description:
      "Give your tenants the independence they want. Online rent payments, maintenance requests, and document access mean fewer phone calls for you and faster answers for them.",
    href: "/services/tenant-portal",
    ctaText: "See the Portal",
  },
  {
    id: "maintenance-tracking",
    icon: Wrench,
    title: "Faster Issue Resolution",
    description:
      "Turn maintenance chaos into a smooth workflow. Tenants submit requests, you assign vendors, and everyone sees real-time progress. No more lost work orders or forgotten repairs.",
    href: "/services/maintenance",
    ctaText: "View Workflow",
  },
  {
    id: "financial-analytics",
    icon: LineChart,
    title: "Clear Financial Insights",
    description:
      "Know exactly how your properties perform. Track revenue, expenses, and cash flow across your portfolio with dashboards that turn complex data into confident decisions.",
    href: "/services/analytics",
    ctaText: "See Reports",
  },
  {
    id: "document-management",
    icon: FileText,
    title: "Organized Document Storage",
    description:
      "Find any lease, contract, or compliance document in seconds. Secure cloud storage keeps everything organized and accessible, with full audit trails for peace of mind.",
    href: "/services/documents",
    ctaText: "Discover More",
  },
  {
    id: "communication-hub",
    icon: MessageSquare,
    title: "Unified Communication",
    description:
      "Keep every conversation in one place. Message tenants, coordinate with vendors, and update your team without switching between apps or losing important context.",
    href: "/services/communication",
    ctaText: "Learn More",
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
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Reduced motion variants (instant transitions)
const reducedMotionContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.01,
    },
  },
};

const reducedMotionCardVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.01,
    },
  },
};

// ============================================================================
// ServiceCard Component
// ============================================================================

function ServiceCard({
  id,
  icon: Icon,
  title,
  description,
  href,
  ctaText = "Learn More",
  index,
  shouldReduceMotion,
}: ServiceCardProps) {
  const titleId = `service-title-${id}`;
  const isEven = index % 2 === 0;

  return (
    <motion.article
      variants={shouldReduceMotion ? reducedMotionCardVariants : cardVariants}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.02, y: -4 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 1 }}
      aria-labelledby={titleId}
      className={cn(
        "group relative flex flex-col",
        "min-h-[260px] sm:min-h-[280px] p-6",
        "bg-card text-card-foreground",
        "border border-border",
        "shadow-sm",
        "transition-all duration-300 ease-out",
        "hover:shadow-lg hover:border-landing-primary/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-primary focus-visible:ring-offset-2",
        "cursor-pointer",
        "overflow-hidden"
      )}
      style={{
        clipPath: "polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))",
      }}
      tabIndex={0}
      role="article"
    >
      {/* Geometric corner accent - top right */}
      <div
        className={cn(
          "absolute top-0 right-0 w-16 h-16",
          "transition-all duration-300",
          isEven ? "bg-landing-primary/5" : "bg-landing-accent/5",
          "group-hover:bg-landing-primary/10"
        )}
        style={{
          clipPath: "polygon(100% 0, 100% 100%, 0 0)",
        }}
        aria-hidden="true"
      />

      {/* Diagonal stripe on hover */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300",
          "group-hover:opacity-100",
          "pointer-events-none"
        )}
        style={{
          background: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            ${isEven ? "var(--landing-primary)" : "var(--landing-accent)"} 20px,
            ${isEven ? "var(--landing-primary)" : "var(--landing-accent)"} 21px
          )`,
          opacity: 0.03,
        }}
        aria-hidden="true"
      />

      {/* Icon Badge - Hexagonal */}
      <div
        className={cn(
          "relative z-10",
          "flex items-center justify-center",
          "w-12 h-12 sm:w-14 sm:h-14 mb-4",
          "clip-hexagon",
          isEven ? "bg-landing-primary/10" : "bg-landing-accent/10",
          "transition-colors duration-300",
          isEven ? "group-hover:bg-landing-primary/20" : "group-hover:bg-landing-accent/20"
        )}
        role="img"
        aria-label={`${title} icon`}
      >
        <Icon
          className={cn(
            "w-5 h-5 sm:w-6 sm:h-6",
            isEven ? "text-landing-primary" : "text-landing-accent",
            "transition-transform duration-300",
            !shouldReduceMotion && "group-hover:scale-110"
          )}
          aria-hidden="true"
        />
      </div>

      {/* Title */}
      <h3
        id={titleId}
        className="relative z-10 mb-2 text-xl font-semibold leading-tight text-landing-text"
      >
        {title}
      </h3>

      {/* Description */}
      <p className="relative z-10 mb-4 text-sm leading-relaxed text-muted-foreground flex-grow">
        {description}
      </p>

      {/* CTA Link */}
      {href && (
        <a
          href={href}
          className={cn(
            "relative z-10 inline-flex items-center gap-1",
            "text-sm font-medium",
            isEven ? "text-landing-primary" : "text-landing-accent",
            "hover:underline",
            "focus-visible:outline-none focus-visible:underline",
            "mt-auto"
          )}
          aria-label={`${ctaText} about ${title}`}
          onClick={(e) => e.stopPropagation()}
        >
          {ctaText}
          <ArrowRight
            className={cn(
              "w-4 h-4",
              "transition-transform duration-300",
              !shouldReduceMotion && "group-hover:translate-x-1"
            )}
            aria-hidden="true"
          />
        </a>
      )}

      {/* Bottom left corner accent */}
      <div
        className={cn(
          "absolute bottom-0 left-0 w-8 h-8",
          "transition-all duration-300",
          isEven ? "bg-landing-accent/5" : "bg-landing-primary/5",
          "group-hover:w-12 group-hover:h-12"
        )}
        style={{
          clipPath: "polygon(0 100%, 0 0, 100% 100%)",
        }}
        aria-hidden="true"
      />
    </motion.article>
  );
}

// ============================================================================
// ServicesGrid Component
// ============================================================================

export function ServicesGrid({ className }: ServicesGridProps) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();
  const t = useTranslations("landing.services");

  return (
    <SectionWrapper
      ref={ref}
      id="services"
      className={className}
      ariaLabelledBy="services-section-title"
      animate={false}
    >
      {/* Section Header */}
      <SectionHeader
        title={t("title")}
        titleId="services-section-title"
        subtitle={t("subtitle")}
        centered
      />

      {/* Services Grid */}
      <motion.div
        variants={
          shouldReduceMotion
            ? reducedMotionContainerVariants
            : containerVariants
        }
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className={cn(
          "grid",
          "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
          "gap-4 sm:gap-6"
        )}
      >
        {services.map((service, index) => (
          <ServiceCard
            key={service.id}
            {...service}
            index={index}
            shouldReduceMotion={shouldReduceMotion}
          />
        ))}
      </motion.div>
    </SectionWrapper>
  );
}

export default ServicesGrid;
