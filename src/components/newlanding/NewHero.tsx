"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NewHeroProps {
  className?: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export function NewHero({ className }: NewHeroProps) {
  return (
    <section
      className={cn(
        "relative min-h-[80vh] bg-[#0a0a0a] text-white",
        "flex items-center justify-center",
        "py-20 px-4 sm:px-6 lg:px-8",
        "overflow-hidden",
        className
      )}
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#111] to-[#0a0a0a]" />
      
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }}
      />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto w-full"
      >
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8">
            {/* Badge */}
            <motion.div variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Trusted by Institutions
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-[1.1]"
            >
              The most secure
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                digital asset platform
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={fadeInUp}
              className="text-lg sm:text-xl text-gray-400 max-w-xl leading-relaxed"
            >
              Access deep liquidity, margin, and derivatives through our always-on 
              trading desk and self-service platform. Settle seamlessly with 
              Atlas—all on infrastructure trusted by institutions for years.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100 px-8 py-6 text-lg font-semibold rounded-lg"
                asChild
              >
                <a href="#contact">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </a>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-gray-700 text-white hover:bg-white/5 px-8 py-6 text-lg font-medium rounded-lg"
                asChild
              >
                <a href="#features">
                  Learn More
                </a>
              </Button>
            </motion.div>

            {/* Trust stats */}
            <motion.div
              variants={fadeInUp}
              className="flex items-center gap-8 pt-8 border-t border-gray-800"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-white">$50B+</div>
                <div className="text-sm text-gray-500">Assets Secured</div>
              </div>
              <div className="w-px h-12 bg-gray-800" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-sm text-gray-500">Institutional Clients</div>
              </div>
              <div className="w-px h-12 bg-gray-800" />
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-sm text-gray-500">Trading Support</div>
              </div>
            </motion.div>
          </div>

          {/* Right side - Visual */}
          <motion.div
            variants={fadeInUp}
            className="relative hidden lg:block"
          >
            <div className="relative aspect-square max-w-lg mx-auto">
              {/* Glowing orb effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 via-transparent to-teal-500/20 rounded-full blur-3xl" />
              
              {/* Concentric circles */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[90%] h-[90%] rounded-full border border-gray-800/50 animate-pulse" />
                <div className="absolute w-[70%] h-[70%] rounded-full border border-gray-700/50" />
                <div className="absolute w-[50%] h-[50%] rounded-full border border-emerald-500/30" />
                <div className="absolute w-[30%] h-[30%] rounded-full bg-gradient-to-br from-emerald-500/50 to-teal-500/50 blur-md" />
              </div>

              {/* Floating elements */}
              <motion.div
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-0 bg-gray-900 border border-gray-800 rounded-lg p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <span className="text-emerald-400">₿</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">BTC/USD</div>
                    <div className="text-xs text-emerald-400">+2.4%</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [10, -10, 10] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-1/4 right-0 bg-gray-900 border border-gray-800 rounded-lg p-4 shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                    <span className="text-blue-400">Ξ</span>
                  </div>
                  <div>
                    <div className="text-sm font-medium">ETH/USD</div>
                    <div className="text-xs text-emerald-400">+1.8%</div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export default NewHero;
