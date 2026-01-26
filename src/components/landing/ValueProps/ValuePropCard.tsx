"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { fadeInUp } from "../shared/animations";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

interface ValuePropCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

// ============================================================================
// ValuePropCard Component
// ============================================================================

export function ValuePropCard({ icon: Icon, title, description }: ValuePropCardProps) {
  return (
    <motion.div
      variants={fadeInUp}
      className={cn(
        "flex flex-col items-center text-center",
        "p-6 rounded-lg",
        "transition-all duration-300",
        "hover:bg-muted/30"
      )}
    >
      {/* Icon container */}
      <div
        className={cn(
          "w-16 h-16 mb-4",
          "rounded-xl",
          "bg-landing-primary/10",
          "flex items-center justify-center",
          "transition-transform duration-300",
          "hover:scale-110"
        )}
      >
        <Icon className="w-8 h-8 text-landing-primary" aria-hidden="true" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold mb-2 text-landing-text">
        {title}
      </h3>

      {/* Description */}
      <p className="text-muted-foreground leading-relaxed text-sm">
        {description}
      </p>
    </motion.div>
  );
}

export default ValuePropCard;
