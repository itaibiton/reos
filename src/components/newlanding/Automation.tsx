"use client";

import { motion, type Variants } from "framer-motion";
import { Building, Landmark, Scale, Calculator, Receipt, FileCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface AutomationProps {
  className?: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const getAnimationVariant = (index: number): { initial: any; animate: any } => {
  const variants = [
    { initial: { opacity: 0, x: -60, y: 0 }, animate: { opacity: 1, x: 0, y: 0 } }, // Card 1 - from left
    { initial: { opacity: 0, x: 0, y: -60 }, animate: { opacity: 1, x: 0, y: 0 } }, // Card 2 - from top
    { initial: { opacity: 0, x: 60, y: 0 }, animate: { opacity: 1, x: 0, y: 0 } },  // Card 3 - from right
    { initial: { opacity: 0, x: -60, y: 0 }, animate: { opacity: 1, x: 0, y: 0 } }, // Card 4 - from left
    { initial: { opacity: 0, x: 60, y: 0 }, animate: { opacity: 1, x: 0, y: 0 } },  // Animation - from right
    { initial: { opacity: 0, x: 0, y: 60 }, animate: { opacity: 1, x: 0, y: 0 } },  // Card 5 - from bottom
  ];
  return variants[index] || variants[0];
};

export function Automation({ className }: AutomationProps) {
  const t = useTranslations("landing.automation");

  const providers = [
    {
      icon: Building,
      title: t("providers.brokers.title"),
      description: t("providers.brokers.description"),
    },
    {
      icon: Landmark,
      title: t("providers.mortgageAdvisors.title"),
      description: t("providers.mortgageAdvisors.description"),
    },
    {
      icon: Scale,
      title: t("providers.lawyers.title"),
      description: t("providers.lawyers.description"),
    },
    {
      icon: Calculator,
      title: t("providers.appraisers.title"),
      description: t("providers.appraisers.description"),
    },
    {
      icon: Receipt,
      title: t("providers.taxConsultants.title"),
      description: t("providers.taxConsultants.description"),
    },
  ];
  return (
    <section
      className={cn("py-24 relative overflow-hidden", className)}
    >
      {/* Diagonal split background - static, not animated */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-background"></div>
        {/* Mobile - gentler angle */}
        <svg
          className="absolute inset-0 w-full h-full md:hidden"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon
            points="0,0 100,5 100,100 0,100"
            fill="#050A12"
          />
          <line
            x1="0"
            y1="0"
            x2="100"
            y2="5"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.2"
          />
        </svg>
        {/* Desktop - original angle */}
        <svg
          className="hidden md:block absolute inset-0 w-full h-full"
          preserveAspectRatio="none"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <polygon
            points="0,0 100,15 100,100 0,100"
            fill="#050A12"
          />
          <line
            x1="0"
            y1="0"
            x2="100"
            y2="15"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="0.2"
          />
        </svg>
      </div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className="relative z-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Header */}
          <motion.div variants={fadeInUp} className="max-w-3xl mb-12 mt-16 md:mt-24">
            <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-white mb-6">
              {t("heading")} <br />
              <span className="text-white/40">{t("headingAccent")}</span>
            </h2>
            <p className="text-lg text-white/70 font-light leading-relaxed">
              {t("subheading")}
            </p>
          </motion.div>

          {/* Providers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Animation Card - First on mobile, positioned in grid on desktop */}
            <motion.div
              initial={getAnimationVariant(4).initial}
              whileInView={getAnimationVariant(4).animate}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative border border-white/10 bg-white/5 overflow-hidden md:col-span-2 lg:col-span-2 lg:row-span-2 order-first md:order-none md:col-start-2 md:row-start-1"
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-full h-full object-contain"
                style={{ imageRendering: 'crisp-edges' }}
              >
                <source src="/REOSOrchestration.mp4" type="video/mp4" />
              </video>
            </motion.div>

            {providers.map((provider, index) => {
              const Icon = provider.icon;
              const { initial, animate } = getAnimationVariant(index);
              return (
                <motion.div
                  key={index}
                  initial={initial}
                  whileInView={animate}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: (index + 1) * 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                  className="relative p-6 border border-white/10 transition-colors group"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 bg-white/10 flex items-center justify-center mb-4 transition-colors">
                    <Icon className="w-6 h-6 text-white/70" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-normal mb-2 text-white">
                    {provider.title}
                  </h3>
                  <p className="text-sm font-light leading-relaxed text-white/60">
                    {provider.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
