"use client";

import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

interface CTAProps {
  className?: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export function CTA({ className }: CTAProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className={cn("py-24 relative overflow-hidden", className)}
    >
      <div className="absolute inset-0 bg-blue-900/5"></div>
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-light tracking-tighter text-foreground mb-6">
          Ready to upgrade your OS?
        </h2>
        <p className="text-lg text-foreground/50 font-light mb-10 max-w-xl mx-auto">
          Join the leading institutional owners running their portfolios on REOS.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className="px-8 py-4 bg-foreground text-background rounded-full font-medium hover:bg-foreground/90 transition-colors w-full sm:w-auto">
            Contact Sales
          </button>
          <button className="px-8 py-4 bg-transparent border border-border text-foreground rounded-full font-medium hover:bg-foreground/5 transition-colors w-full sm:w-auto">
            View Pricing
          </button>
        </div>
      </div>
    </motion.section>
  );
}
