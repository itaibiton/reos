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
import { cn } from "@/lib/utils";

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
  shouldReduceMotion,
}: ServiceCardProps) {
  const titleId = `service-title-${id}`;

  return (
    <motion.article
      variants={shouldReduceMotion ? reducedMotionCardVariants : cardVariants}
      whileHover={shouldReduceMotion ? undefined : { scale: 1.05 }}
      whileTap={shouldReduceMotion ? undefined : { scale: 1 }}
      aria-labelledby={titleId}
      className={cn(
        "group relative flex flex-col",
        "min-h-[260px] sm:min-h-[280px] p-6",
        "bg-card text-card-foreground",
        "border border-border rounded-xl shadow-sm",
        "transition-all duration-300 ease-out",
        "hover:shadow-lg hover:border-primary/30",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "cursor-pointer"
      )}
      tabIndex={0}
      role="article"
    >
      {/* Icon Badge */}
      <div
        className={cn(
          "flex items-center justify-center",
          "w-10 h-10 sm:w-12 sm:h-12 mb-4",
          "rounded-full bg-primary/10"
        )}
        role="img"
        aria-label={`${title} icon`}
      >
        <Icon
          className={cn(
            "w-5 h-5 sm:w-6 sm:h-6 text-primary",
            "transition-transform duration-300",
            !shouldReduceMotion && "group-hover:rotate-6"
          )}
          aria-hidden="true"
        />
      </div>

      {/* Title */}
      <h3
        id={titleId}
        className="mb-2 text-xl font-semibold leading-tight text-foreground"
      >
        {title}
      </h3>

      {/* Description */}
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground flex-grow">
        {description}
      </p>

      {/* CTA Link */}
      {href && (
        <a
          href={href}
          className={cn(
            "inline-flex items-center gap-1",
            "text-sm font-medium text-primary",
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

  return (
    <section
      ref={ref}
      className={cn(
        "py-12 sm:py-14 lg:py-16",
        "px-4 sm:px-6 lg:px-8",
        className
      )}
      aria-labelledby="services-section-title"
    >
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-10 lg:mb-12">
          <h2
            id="services-section-title"
            className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-4"
          >
            Everything You Need, All in One Place
          </h2>
          <p className="text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto">
            Stop juggling multiple tools and systems. REOS brings property
            management, tenant communication, and financial insights together so
            you can run your portfolio with confidence.
          </p>
        </div>

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
      </div>
    </section>
  );
}

export default ServicesGrid;
