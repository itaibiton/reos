"use client";

import { motion, type Variants } from "framer-motion";
import { Search, Workflow, Users, Bot } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { LayoutGrid } from "@/components/ui/layout-grid";

interface FeaturesProps {
  className?: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const SkeletonOne = ({ t }: { t: any }) => {
  return (
    <div className="h-full w-full">
      <p className="font-light text-4xl text-black dark:text-white">{t("cards.smartDiscovery.title")}</p>
      <p className="font-normal text-base my-4 max-w-lg text-black/70 dark:text-white/70">
        {t("cards.smartDiscovery.description")}
      </p>
    </div>
  );
};

const SkeletonTwo = ({ t }: { t: any }) => {
  return (
    <div className="h-full w-full">
      <p className="font-light text-4xl text-white">{t("cards.dealFlow.title")}</p>
      <p className="font-normal text-base my-4 max-w-lg text-white/70">
        {t("cards.dealFlow.description")}
      </p>
    </div>
  );
};

const SkeletonThree = ({ t }: { t: any }) => {
  return (
    <div className="h-full w-full">
      <p className="font-light text-4xl text-white">{t("cards.vettedProviders.title")}</p>
      <p className="font-normal text-base my-4 max-w-lg text-white/70">
        {t("cards.vettedProviders.description")}
      </p>
    </div>
  );
};

const SkeletonFour = ({ t }: { t: any }) => {
  return (
    <div className="h-full w-full flex flex-col md:flex-row">
      {/* Text section - Top on mobile, Left on desktop */}
      <div className="w-full md:w-1/2 bg-white dark:bg-zinc-900 p-6 md:p-8 flex flex-col justify-center">
        <p className="font-light text-3xl md:text-4xl text-black dark:text-white mb-4">{t("cards.aiAdvisor.title")}</p>
        <p className="font-normal text-base text-black/70 dark:text-white/70">
          {t("cards.aiAdvisor.description")}
        </p>
      </div>

      {/* Video section - Bottom on mobile, Right on desktop */}
      <div className="w-full md:w-1/2 relative overflow-hidden min-h-[300px] md:min-h-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/AIChatAdvisor.mp4" type="video/mp4" />
        </video>
      </div>
    </div>
  );
};

export function Features({ className }: FeaturesProps) {
  const t = useTranslations("landing.features");

  const cards = [
    {
      id: 1,
      content: <SkeletonOne t={t} />,
      className: "md:col-span-2",
      thumbnail: "white",
    },
    {
      id: 2,
      content: <SkeletonTwo t={t} />,
      className: "col-span-1",
      thumbnail: "/pexels-karola-g-7875996.jpg",
    },
    {
      id: 3,
      content: <SkeletonThree t={t} />,
      className: "col-span-1",
      thumbnail: "",
    },
    {
      id: 4,
      content: <SkeletonFour t={t} />,
      className: "md:col-span-2",
      thumbnail: "custom",
    },
  ];

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className={cn("py-12 md:py-16 relative min-h-screen flex items-center", className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div variants={fadeInUp} className="max-w-3xl mb-8 md:mb-12">
          <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-foreground mb-4">
            {t("heading")} <br />
            <span className="text-foreground/40">{t("headingAccent")}</span>
          </h2>
          <p className="text-lg text-foreground/50 font-light leading-relaxed">
            {t("subheading")}
          </p>
        </motion.div>

        <LayoutGrid cards={cards} />
      </div>
    </motion.section>
  );
}
