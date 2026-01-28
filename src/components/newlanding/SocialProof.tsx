"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface SocialProofProps {
  className?: string;
}

export function SocialProof({ className }: SocialProofProps) {
  const t = useTranslations("landing.socialProof");
  const sectionRef = useRef<HTMLElement>(null);

  // Track scroll progress for fade-in animation
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 0.5], [30, 0]);

  return (
    <motion.section
      ref={sectionRef}
      className={cn("py-12 border-b border-border/50 relative z-10", className)}
      style={{
        opacity,
        y,
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-sm font-light text-muted-foreground/75 mb-8">{t("label")}</p>
        <div className="flex flex-wrap justify-center gap-12 md:gap-20 opacity-40 grayscale">
          {/* VANGUARD */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-foreground rounded-sm"></div>
            <span className="font-bold text-lg tracking-tight">VANGUARD</span>
          </div>

          {/* OAKTREE */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border-2 border-foreground rounded-full"></div>
            <span className="font-bold text-lg tracking-tight">OAKTREE</span>
          </div>

          {/* APEX */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-foreground rotate-45"></div>
            <span className="font-bold text-lg tracking-tight">APEX</span>
          </div>

          {/* PILLAR */}
          <div className="flex items-center gap-2">
            <div className="flex gap-0.5">
              <div className="w-2 h-5 bg-foreground"></div>
              <div className="w-2 h-5 bg-foreground"></div>
            </div>
            <span className="font-bold text-lg tracking-tight">PILLAR</span>
          </div>

          {/* FRAME */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 border border-foreground"></div>
            <span className="font-bold text-lg tracking-tight">FRAME</span>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
