"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FeaturedNewsProps {
  className?: string;
}

const articles = [
  {
    id: 1,
    title: "Introducing Anchorage Digital Prime",
    image: "/images/news/prime.jpg",
    href: "#",
    category: "Product",
  },
  {
    id: 2,
    title: "Anchorage Digital Publishes Stablecoin Safety Matrix",
    image: "/images/news/stablecoin.jpg",
    href: "#",
    category: "Announcement",
  },
  {
    id: 3,
    title:
      "Anchorage Digital Bank Named Staking Partner for First SEC-Registered Staking ETF",
    image: "/images/news/staking.jpg",
    href: "#",
    category: "Partnership",
  },
  {
    id: 4,
    title:
      "Anchorage Digital Bank Becomes First Federally Chartered Bank to Enable Solana Liquid Staking",
    image: "/images/news/solana.jpg",
    href: "#",
    category: "Product",
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
    transition: { staggerChildren: 0.1 },
  },
};

export function FeaturedNews({ className }: FeaturedNewsProps) {
  return (
    <section
      className={cn(
        "relative bg-[#0a0a0a] py-20 px-4 sm:px-6 lg:px-8",
        "border-t border-gray-800",
        className
      )}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-white">
            Featured
          </h2>
          <Button
            variant="ghost"
            className="text-gray-400 hover:text-white"
            asChild
          >
            <a href="/insights">
              View all
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </motion.div>

        {/* Articles grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {articles.map((article) => (
            <motion.article
              key={article.id}
              variants={fadeInUp}
              className="group"
            >
              <a
                href={article.href}
                className="block h-full bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-gray-700 transition-all duration-300"
              >
                {/* Image placeholder */}
                <div className="relative aspect-video bg-gradient-to-br from-gray-800 to-gray-900 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl font-bold text-gray-700/30">
                      {article.id}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-60" />
                  
                  {/* Category badge */}
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-1 bg-black/50 backdrop-blur-sm rounded-md text-xs text-gray-300">
                      {article.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="text-white font-semibold group-hover:text-emerald-400 transition-colors line-clamp-3">
                    {article.title}
                  </h3>
                  <div className="flex items-center gap-1 mt-4 text-sm text-gray-500 group-hover:text-emerald-400 transition-colors">
                    <span>Read more</span>
                    <ExternalLink className="w-3 h-3" />
                  </div>
                </div>
              </a>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

export default FeaturedNews;
