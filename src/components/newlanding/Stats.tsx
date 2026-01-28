"use client";

import { motion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface StatsProps {
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
      staggerChildren: 0.1,
    },
  },
};

const statItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function Stats({ className }: StatsProps) {
  const t = useTranslations("landing.stats");
  const stats = [
    { value: t("assetsUnderManagement.value"), label: t("assetsUnderManagement.label") },
    { value: t("unitsPowered.value"), label: t("unitsPowered.label") },
    { value: t("uptimeSLA.value"), label: t("uptimeSLA.label") },
    { value: t("apiIntegrations.value"), label: t("apiIntegrations.label") },
  ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className={cn("py-20 border-t border-border/50", className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div key={index} variants={statItem}>
              <div className="text-3xl md:text-4xl font-light text-foreground mb-2 tracking-tight">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
