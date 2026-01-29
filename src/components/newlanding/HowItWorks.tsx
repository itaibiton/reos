"use client";

import { useRef, useState, useEffect } from "react";
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { User, Search, BarChart3 } from "lucide-react";
import { cn } from "@/lib/utils";

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const swipeRight: Variants = {
  hidden: { opacity: 0, x: -50 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
      delay: i * 0.2, // Staggered delay
    },
  }),
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: "easeOut", delay: 0.3 } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8, delay: 0.1 } },
};

// Typing animation component
const TypingSearch = () => {
  const [textIndex, setTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const searchQueries = [
    "3 bed in Tel Aviv",
    "Penthouse sea view",
    "Investment < $2M",
    "Villa in Herzliya"
  ];

  useEffect(() => {
    const currentQuery = searchQueries[textIndex];
    const typeSpeed = isDeleting ? 50 : 100;
    const holdTime = 2000;

    const timer = setTimeout(() => {
      if (!isDeleting && displayText === currentQuery) {
        // Finished typing, wait before deleting
        setTimeout(() => setIsDeleting(true), holdTime);
      } else if (isDeleting && displayText === "") {
        // Finished deleting, move to next query
        setIsDeleting(false);
        setTextIndex((prev) => (prev + 1) % searchQueries.length);
      } else {
        // Typing or deleting
        const nextText = isDeleting
          ? currentQuery.substring(0, displayText.length - 1)
          : currentQuery.substring(0, displayText.length + 1);
        setDisplayText(nextText);
      }
    }, typeSpeed);

    return () => clearTimeout(timer);
  }, [displayText, isDeleting, textIndex]);

  return (
    <div className="bg-white rounded-lg border border-neutral-200 p-2 flex items-center gap-2 mb-3 z-20 relative">
      <div className="flex-1 bg-neutral-50 rounded px-3 py-1.5 text-xs sm:text-sm text-neutral-600 font-mono h-8 flex items-center overflow-hidden">
        <span className="whitespace-nowrap">
          {displayText}
          <span className="animate-pulse border-r-2 border-primary ml-0.5 h-4 inline-block align-middle"></span>
        </span>
      </div>
      <div className="bg-foreground/10 rounded p-1.5 flex-shrink-0">
        <Search className="w-3 h-3 sm:w-4 sm:h-4 text-foreground" />
      </div>
    </div>
  );
};

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();
  const t = useTranslations("landing.howItWorks");

  const stepsData = [
    {
      key: "step1",
      icon: User,
      // Using chart-1 (Purple/Primary-ish) for Step 1
      badgeColor: "bg-foreground/10",
      iconColor: "text-foreground",
      visual: (
        <div className="absolute inset-0">
          {/* Profile Interface Mockup */}
          {/* Removed background/border from container */}
          <div className="w-full">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-full bg-foreground/10 flex items-center justify-center">
                <User className="w-4 h-4 text-foreground" />
              </div>
              <div className="h-2 w-24 bg-neutral-900/10 rounded-full"></div>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-full bg-neutral-100 rounded-full"></div>
              <div className="h-2 w-4/5 bg-neutral-100 rounded-full"></div>
              <div className="h-2 w-3/4 bg-neutral-100 rounded-full"></div>
            </div>
            <div className="flex gap-2 mt-4">
              <div className="h-6 w-16 bg-foreground/10 rounded-md flex items-center justify-center">
                <div className="h-1 w-8 bg-foreground rounded-full"></div>
              </div>
              <div className="h-6 w-20 bg-neutral-100 rounded-md"></div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "step2",
      icon: Search,
      // Using chart-2 (likely Blue/Teal) for Step 2
      badgeColor: "bg-foreground/10",
      iconColor: "text-foreground",
      visual: (
        // Removed gradient background
        <div className="relative h-full w-full overflow-hidden flex flex-col">
          <TypingSearch />
          <div className="grid grid-cols-2 gap-3 flex-1 overflow-hidden">
            {/* Property Cards Mockup */}
            {[
              { color: "bg-foreground/10", icon: "bg-foreground/20" },
              { color: "bg-foreground/10", icon: "bg-foreground/20" },
              { color: "bg-foreground/10", icon: "bg-foreground/20" },
              { color: "bg-foreground/10", icon: "bg-foreground/20" },
            ].map((item, i) => (
              <div key={i} className="bg-white border border-neutral-200 rounded-lg p-2 sm:p-3 shadow-sm  flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full ${item.color}`}></div>
                  <div className="h-1.5 w-10 sm:w-12 bg-neutral-200 rounded-full"></div>
                </div>
                <div className="space-y-1">
                  <div className="h-1 w-full bg-neutral-100 rounded-full"></div>
                  <div className="h-1 w-2/3 bg-neutral-100 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      key: "step4",
      icon: BarChart3,
      // Using chart-3/4 for step 3
      badgeColor: "bg-foreground/10",
      iconColor: "text-foreground",
      visual: (
        // Removed bg-white/50
        <div className="w-full h-full">
          {/* Dashboard Mockup */}
          {/* Kept border on inner card to define the 'dashboard' area, but distinct from container */}
          <div className="bg-white border border-neutral-200 rounded-lg h-full shadow-sm p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-foreground/10 rounded-md flex items-center justify-center">
                  <BarChart3 className="w-3 h-3 text-foreground" />
                </div>
                <div className="h-2 w-16 bg-neutral-900/10 rounded-full"></div>
              </div>
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-destructive/60"></div>
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              </div>
            </div>

            <div className="flex gap-2 items-end h-16  justify-center pb-2 border-b border-neutral-100">
              <div className="w-4 bg-foreground/40 rounded-t-sm h-8"></div>
              <div className="w-4 bg-foreground/60 rounded-t-sm h-12"></div>
              <div className="w-4 bg-foreground rounded-t-sm h-10"></div>
              <div className="w-4 bg-foreground/80 rounded-t-sm h-14"></div>
              <div className="w-4 bg-foreground rounded-t-sm h-12"></div>
            </div>

            <div className="mt-3 flex justify-between gap-2">
              <div className="h-1.5 w-1/3 bg-neutral-100 rounded-full"></div>
              <div className="h-1.5 w-1/4 bg-neutral-100 rounded-full"></div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      className="py-12 md:py-16 relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <motion.div variants={fadeInUp} className="max-w-3xl mb-8 md:mb-12">
        <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-foreground mb-4">
          {t("heading")}
        </h2>
        <p className="text-lg text-foreground/50 font-light leading-relaxed">
          {t("subheading")}
        </p>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Step 1 */}
        <motion.div
          variants={swipeRight}
          custom={1}
          className="lg:col-span-4 bg-white border border-neutral-200 p-6 lg:p-8 relative hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
        >
          {/* <span className="absolute -top-4 left-6 inline-flex items-center px-4 py-1.5 border border-neutral-200 bg-white text-xs sm:text-sm text-neutral-800 font-medium tracking-tight shadow-sm">
            STEP 1
          </span> */}
          <h3 className="text-2xl sm:text-3xl text-neutral-900 font-sans tracking-tight leading-tight mb-3 flex items-center gap-2">
            <p className="bg-foreground w-8 h-8 text-lg font-bold flex items-center justify-center text-background">1</p>{t(`steps.${stepsData[0].key}.title`)}
          </h3>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6">
            {t(`steps.${stepsData[0].key}.description`)}
          </p>
          <div className="relative h-48 sm:h-56  overflow-hidden">
            {stepsData[0].visual}
          </div>


        </motion.div>

        {/* Step 2 */}
        <motion.div
          variants={swipeRight}
          custom={2}
          className="lg:col-span-4 bg-white border border-neutral-200 p-6 lg:p-8 relative hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
        >
          {/* <span className="absolute -top-4 left-6 inline-flex items-center px-4 py-1.5 border border-neutral-200 bg-white text-xs sm:text-sm text-neutral-800 font-medium tracking-tight shadow-sm">
            STEP 2
          </span> */}

          <h3 className="text-2xl sm:text-3xl text-neutral-900 font-sans tracking-tight leading-tight mb-3 flex items-center gap-2">
            <p className="bg-foreground w-8 h-8 text-lg font-bold flex items-center justify-center text-background">2</p>{t(`steps.${stepsData[1].key}.title`)}
          </h3>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6">
            {t(`steps.${stepsData[1].key}.description`)}
          </p>
          <div className="relative h-48 sm:h-56 overflow-hidden">
            {stepsData[1].visual}
          </div>

        </motion.div>

        {/* Step 3 */}
        <motion.div
          variants={swipeRight}
          custom={3}
          className="lg:col-span-4 bg-white border border-neutral-200 p-6 lg:p-8 relative hover:shadow-lg transition-shadow duration-300 flex flex-col h-full"
        >
          {/* <span className="absolute -top-4 left-6 inline-flex items-center px-4 py-1.5 border border-neutral-200 bg-white text-xs sm:text-sm text-neutral-800 font-medium tracking-tight shadow-sm">
            STEP 3
          </span> */}

          <h3 className="text-2xl sm:text-3xl text-neutral-900 font-sans tracking-tight leading-tight mb-3 flex items-center gap-2">
            <p className="bg-foreground w-8 h-8 text-lg font-bold flex items-center justify-center text-background">3</p>{t(`steps.${stepsData[2].key}.title`)}
          </h3>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed mb-6">
            {t(`steps.${stepsData[2].key}.description`)}
          </p>
          <div className="relative h-48 sm:h-56  overflow-hidden">
            {stepsData[2].visual}
          </div>

        </motion.div>
      </div>
    </motion.section>
  );
}
