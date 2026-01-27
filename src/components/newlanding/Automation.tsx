"use client";

import { motion, type Variants } from "framer-motion";
import { CheckCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutomationProps {
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

const listItem: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } },
};

const features = [
  "Custom trigger-based logic engines",
  "Direct integration with banking & IoT hardware",
  "Granular permissioning for team access",
];

export function Automation({ className }: AutomationProps) {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className={cn("py-24 border-t border-border/50 bg-foreground/[0.01]", className)}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div variants={stagger}>
            <motion.div variants={fadeInUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 mb-6">
                <span className="text-xs font-medium tracking-wide text-blue-400 uppercase">Automation</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-foreground mb-6">
                Workflows that <br />run themselves.
              </h2>
              <p className="text-lg text-foreground/50 font-light mb-8 leading-relaxed">
                Define logic for any scenario. Whether it's lease renewals, maintenance dispatch, or financial reporting, REOS handles the execution so you can focus on strategy.
              </p>
            </motion.div>

            <motion.ul variants={stagger} className="space-y-4 mb-8">
              {features.map((feature, index) => (
                <motion.li key={index} variants={listItem} className="flex items-start gap-3">
                  <CheckCircle className="text-blue-500 mt-0.5 shrink-0" size={20} />
                  <span className="text-sm text-foreground/70 font-light">{feature}</span>
                </motion.li>
              ))}
            </motion.ul>

            <motion.a
              variants={fadeInUp}
              href="#"
              className="inline-flex items-center text-sm font-medium text-foreground hover:text-blue-400 transition-colors"
            >
              Explore Documentation <ArrowRight className="ml-2 w-4 h-4" />
            </motion.a>
          </motion.div>

          {/* Right: Visual */}
          <motion.div variants={fadeInUp} className="relative">
            {/* Workflow UI Card */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-2xl relative z-10">
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-medium text-foreground">Lease Renewal Logic</h4>
                <div className="w-8 h-5 bg-blue-600 rounded-full p-0.5 flex items-center justify-end cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>

              {/* Workflow Step 1 */}
              <div className="flex gap-4 mb-6">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-foreground/10 border border-border flex items-center justify-center text-foreground">
                    1
                  </div>
                  <div className="h-full w-px bg-border my-1"></div>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-xs text-muted-foreground font-mono mb-1">TRIGGER</p>
                  <div className="p-3 bg-foreground/5 border border-border rounded-lg text-sm text-foreground/90">
                    When <span className="text-blue-400">Lease Expiry</span> is{" "}
                    <span className="text-purple-400">90 days</span> away
                  </div>
                </div>
              </div>

              {/* Workflow Step 2 */}
              <div className="flex gap-4 mb-6">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-foreground/10 border border-border flex items-center justify-center text-foreground">
                    2
                  </div>
                  <div className="h-full w-px bg-border my-1"></div>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-xs text-muted-foreground font-mono mb-1">ACTION</p>
                  <div className="p-3 bg-foreground/5 border border-border rounded-lg text-sm text-foreground/90">
                    Send <span className="text-green-400">Renewal Offer</span> email to Tenant
                  </div>
                </div>
              </div>

              {/* Workflow Step 3 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-foreground/10 border border-border flex items-center justify-center text-foreground">
                    3
                  </div>
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-xs text-muted-foreground font-mono mb-1">CONDITION</p>
                  <div className="p-3 bg-foreground/5 border border-border rounded-lg text-sm text-foreground/90 flex justify-between items-center">
                    <span>If no response in 7 days</span>
                    <span className="text-xs text-muted-foreground bg-foreground/10 px-2 py-1 rounded">
                      Notify PM
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Background */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-xl blur-xl -z-10 opacity-50"></div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
