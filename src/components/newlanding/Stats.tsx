"use client";

import { motion, type Variants } from "framer-motion";
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
  const stats = [
    { value: "$40B+", label: "Assets under management" },
    { value: "2.5M", label: "Units powered" },
    { value: "99.99%", label: "Uptime SLA" },
    { value: "140+", label: "API Integrations" },
  ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className={cn("py-20 border-t border-border/50", className)}
    >
      <div className="max-w-7xl mx-auto px-6">
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
