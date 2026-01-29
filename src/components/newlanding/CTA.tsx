"use client";

import { motion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

interface CTAProps {
  className?: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function CTA({ className }: CTAProps) {
  const t = useTranslations("landing.cta");
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className={cn("py-24 relative overflow-hidden", className)}
    >
      <div className="absolute inset-0 bg-foreground"></div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-light tracking-tighter text-background mb-6">
          {t("heading")}
        </h2>
        <p className="text-lg text-background/50 font-light mb-10 max-w-xl mx-auto">
          {t("subheading")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/contact"
            className="px-8 py-4 bg-background text- rounded-full font-medium hover:bg-background/90 transition-colors w-full sm:w-auto inline-flex items-center justify-center"
          >
            {t("actions.contactSales")}
          </Link>
          <Link
            href="/pricing"
            className="px-8 py-4 bg-transparent border border-border text-background rounded-full font-medium hover:bg-background/5 transition-colors w-full sm:w-auto inline-flex items-center justify-center"
          >
            {t("actions.viewPricing")}
          </Link>
        </div>
      </div>
    </motion.section>
  );
}
