"use client";

import { motion, type Variants } from "framer-motion";
import { ShieldCheck, TrendingUp, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeaturesProps {
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

const featureCard: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const features = [
  {
    icon: ShieldCheck,
    title: "Institutional Custody",
    description: "Bank-grade security standards for sensitive tenant data and financial records, fully compliant with SOC2 Type II.",
    color: "blue",
  },
  {
    icon: TrendingUp,
    title: "Real-time Settlements",
    description: "Automated rent collection and vendor payouts via integrated rails, reducing settlement times from days to seconds.",
    color: "purple",
  },
  {
    icon: Code2,
    title: "Programmable Assets",
    description: "Developer-first API allows you to build custom valuation models and automated maintenance triggers effortlessly.",
    color: "green",
  },
];

export function Features({ className }: FeaturesProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className={cn("py-24 relative", className)}
    >
      <div className="max-w-7xl mx-auto px-6">
        <motion.div variants={fadeInUp} className="max-w-3xl mb-16">
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-foreground mb-6">
            Infrastructure for the <br />
            <span className="text-foreground/40">digital asset era.</span>
          </h2>
          <p className="text-lg text-foreground/50 font-light leading-relaxed">
            REOS replaces fragmented spreadsheets and legacy ERPs with a single, secure, and programmable layer for your entire real estate operation.
          </p>
        </motion.div>

        <motion.div
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={featureCard}
              className="group p-8 rounded-xl border border-border/50 bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-colors relative overflow-hidden"
            >
              <div className={cn(
                "absolute top-0 right-0 w-32 h-32 blur-[50px] rounded-full transition-all",
                feature.color === "blue" && "bg-blue-500/10 group-hover:bg-blue-500/20",
                feature.color === "purple" && "bg-purple-500/10 group-hover:bg-purple-500/20",
                feature.color === "green" && "bg-green-500/10 group-hover:bg-green-500/20"
              )}></div>
              <div className="w-12 h-12 rounded-lg bg-foreground/5 flex items-center justify-center text-foreground mb-6 border border-border relative z-10">
                <feature.icon className="w-6 h-6" strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-normal text-foreground mb-3 relative z-10">{feature.title}</h3>
              <p className="text-sm text-foreground/50 leading-relaxed font-light relative z-10">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
