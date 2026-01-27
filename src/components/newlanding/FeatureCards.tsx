"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, Shield, TrendingUp, Building2, Coins } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FeatureCardsProps {
  className?: string;
}

const cards = [
  {
    id: "prime",
    title: "Introducing Anchorage Digital Prime",
    description:
      "Access deep liquidity, margin, and derivatives through our always-on trading desk and self-service platform. Settle seamlessly with Atlas—all on infrastructure trusted by institutions for years.",
    cta: "Discover Prime",
    href: "/platform/prime",
    icon: TrendingUp,
    gradient: "from-emerald-500/20 via-teal-500/10 to-transparent",
    featured: true,
  },
  {
    id: "banking",
    title: "One trusted partner for cash and crypto",
    description:
      "Anchorage Digital is your banking partner for both asset classes. Hold, send, and receive cash and crypto seamlessly, with visibility through the same integrated interface.",
    cta: "Learn more",
    href: "/banking",
    icon: Building2,
    gradient: "from-blue-500/20 via-indigo-500/10 to-transparent",
  },
  {
    id: "staking",
    title: "Stake and collect rewards",
    description:
      "Anchorage Digital Bank is the first U.S. federally chartered bank approved to offer staking services. Institutions can stake 20+ assets straight from secure custody—choose any validator and collect rewards.",
    cta: "Learn more about staking",
    href: "/platform/staking",
    icon: Coins,
    gradient: "from-purple-500/20 via-pink-500/10 to-transparent",
  },
  {
    id: "protocols",
    title: "Anchorage Digital for protocols",
    description:
      "Launch with confidence and scale post-mainnet. TGE with Anchorage Digital.",
    cta: "Explore protocol offerings",
    href: "/who-we-serve/protocols",
    icon: Shield,
    gradient: "from-orange-500/20 via-amber-500/10 to-transparent",
  },
];

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

export function FeatureCards({ className }: FeatureCardsProps) {
  return (
    <section
      id="features"
      className={cn(
        "relative bg-[#0a0a0a] py-20 px-4 sm:px-6 lg:px-8",
        className
      )}
    >
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-6"
        >
          {/* Featured card - full width */}
          <motion.div variants={fadeInUp}>
            <div
              className={cn(
                "relative overflow-hidden rounded-2xl",
                "bg-gradient-to-br from-emerald-900/40 via-gray-900/90 to-gray-900",
                "border border-emerald-500/20",
                "p-8 lg:p-12"
              )}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-r",
                  cards[0].gradient
                )}
              />
              <div className="relative z-10 grid lg:grid-cols-2 gap-8 items-center">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm">
                    <TrendingUp className="w-4 h-4" />
                    New
                  </div>
                  <h2 className="text-3xl lg:text-4xl font-bold text-white">
                    {cards[0].title}
                  </h2>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    {cards[0].description}
                  </p>
                  <Button
                    className="bg-black text-white hover:bg-gray-900 border border-gray-700 px-6 py-3"
                    asChild
                  >
                    <a href={cards[0].href}>
                      {cards[0].cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </a>
                  </Button>
                </div>
                <div className="relative aspect-video lg:aspect-square">
                  {/* Placeholder for Prime illustration */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-xl flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-4 rounded-xl bg-gradient-to-br from-emerald-500/30 to-teal-500/30 flex items-center justify-center">
                          <TrendingUp className="w-10 h-10 text-emerald-400" />
                        </div>
                        <div className="text-2xl font-bold text-white">Prime</div>
                        <div className="text-gray-500">Trading Platform</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Three column cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {cards.slice(1).map((card) => (
              <motion.div key={card.id} variants={fadeInUp}>
                <div
                  className={cn(
                    "group relative overflow-hidden rounded-2xl h-full",
                    "bg-gray-900 border border-gray-800",
                    "hover:border-gray-700 transition-all duration-300",
                    "p-6 lg:p-8"
                  )}
                >
                  <div
                    className={cn(
                      "absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity",
                      card.gradient
                    )}
                  />
                  <div className="relative z-10 space-y-4 h-full flex flex-col">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        card.id === "banking" && "bg-blue-500/10",
                        card.id === "staking" && "bg-purple-500/10",
                        card.id === "protocols" && "bg-orange-500/10"
                      )}
                    >
                      <card.icon
                        className={cn(
                          "w-6 h-6",
                          card.id === "banking" && "text-blue-400",
                          card.id === "staking" && "text-purple-400",
                          card.id === "protocols" && "text-orange-400"
                        )}
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white">
                      {card.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed flex-grow">
                      {card.description}
                    </p>
                    <Button
                      variant="ghost"
                      className="w-fit px-0 text-white hover:text-emerald-400 hover:bg-transparent"
                      asChild
                    >
                      <a href={card.href}>
                        {card.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default FeatureCards;
