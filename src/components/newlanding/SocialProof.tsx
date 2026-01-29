"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import Image from "next/image";

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
            <Image src="/logos/testimonials/yahad.png" alt="Vanguard" width={200} height={200} />
          </div>
          <div className="flex items-center gap-2">
            {/* <Image src="/logos/testimonials/judaa.png" alt="Vanguard" width={200} height={200} /> */}
            <div className="flex flex-col items-center">
              <p className="font-bold text-3xl tracking-tight leading-none font-hebrew">יהודה לוי</p>
              <p className="tracking-tight leading-none font-hebrew">בנייה ואנרגיה בעולם</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Image src="/logos/testimonials/a-credit.png" alt="Vanguard" width={100} height={100} />
          </div>


        </div>
      </div>
    </motion.section>
  );
}
