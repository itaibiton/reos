"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TradingSectionProps {
  className?: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1], delay: 0.2 },
  },
};

export function TradingSection({ className }: TradingSectionProps) {
  return (
    <section
      className={cn(
        "relative bg-[#0a0a0a] py-20 px-4 sm:px-6 lg:px-8",
        "border-t border-gray-800",
        className
      )}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center"
        >
          {/* Left content */}
          <motion.div variants={fadeInLeft} className="space-y-6">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
              Digital asset trading for institutions
            </h2>
            <p className="text-lg text-gray-400 leading-relaxed">
              Designed to meet the complex trading needs of institutions, 
              Anchorage Digital enables traders to access deep liquidity with 
              tight pricing—even in the most difficult market conditions.
            </p>
            <Button
              className="bg-white text-black hover:bg-gray-100 px-6 py-3"
              asChild
            >
              <a href="/platform/trading">
                Learn more about trading
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </motion.div>

          {/* Right - Trading UI mockup */}
          <motion.div variants={fadeInRight} className="relative">
            <div className="relative space-y-4">
              {/* Main chart card */}
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                      <span className="text-orange-400 font-bold">₿</span>
                    </div>
                    <div>
                      <div className="font-semibold text-white">BTC/USD</div>
                      <div className="text-sm text-gray-500">Bitcoin</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">$64,230.45</div>
                    <div className="text-sm text-emerald-400">+2.34%</div>
                  </div>
                </div>
                
                {/* Simplified chart */}
                <div className="h-32 flex items-end gap-1">
                  {[40, 45, 42, 55, 48, 60, 58, 65, 62, 70, 68, 75, 72, 80, 85].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-emerald-500/50 to-emerald-500/10 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
                
                <div className="flex justify-between mt-4 text-xs text-gray-500">
                  <span>9:00</span>
                  <span>12:00</span>
                  <span>15:00</span>
                  <span>18:00</span>
                  <span>21:00</span>
                </div>
              </div>

              {/* Order book preview */}
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-4 top-1/4 bg-gray-900 border border-gray-800 rounded-lg p-4 shadow-xl w-48"
              >
                <div className="text-xs text-gray-500 mb-2">Order Book</div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-red-400">64,235</span>
                    <span className="text-gray-500">0.45</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-red-400">64,234</span>
                    <span className="text-gray-500">1.23</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold border-y border-gray-800 py-1 my-1">
                    <span className="text-white">64,230</span>
                    <span className="text-gray-400">Mid</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-400">64,229</span>
                    <span className="text-gray-500">2.10</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-emerald-400">64,228</span>
                    <span className="text-gray-500">0.87</span>
                  </div>
                </div>
              </motion.div>

              {/* Trade execution */}
              <motion.div
                animate={{ y: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                className="absolute -left-4 bottom-8 bg-gray-900 border border-gray-800 rounded-lg p-4 shadow-xl"
              >
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-gray-400">Filled:</span>
                  <span className="text-white font-medium">2.5 BTC @ $64,228</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default TradingSection;
