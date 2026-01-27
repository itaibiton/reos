"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Card = {
  id: number;
  content: React.ReactNode;
  className: string;
  thumbnail: string;
};

export const LayoutGrid = ({ cards }: { cards: Card[] }) => {
  // Different animation directions for each card
  const getAnimationVariant = (index: number) => {
    switch (index) {
      case 0: // Top-left large card - from left
        return { initial: { opacity: 0, x: -60, y: 0 }, animate: { opacity: 1, x: 0, y: 0 } };
      case 1: // Top-right small card - from top
        return { initial: { opacity: 0, x: 0, y: -60 }, animate: { opacity: 1, x: 0, y: 0 } };
      case 2: // Bottom-left small card - from bottom
        return { initial: { opacity: 0, x: 0, y: 60 }, animate: { opacity: 1, x: 0, y: 0 } };
      case 3: // Bottom-right large card - from right
        return { initial: { opacity: 0, x: 60, y: 0 }, animate: { opacity: 1, x: 0, y: 0 } };
      default:
        return { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 } };
    }
  };

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-3 max-w-7xl mx-auto gap-4 relative h-[60vh] md:h-[65vh]">
      {cards.map((card, i) => {
        const { initial, animate } = getAnimationVariant(i);
        return (
          <div key={i} className={cn(card.className, "")}>
            <motion.div
              initial={initial}
              whileInView={animate}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.2, ease: [0.25, 0.1, 0.25, 1] }}
              className={cn(
                card.className,
                "relative overflow-hidden rounded-xl h-full border border-border group",
                !card.thumbnail && "bg-[#050A12]",
                card.thumbnail === "white" && "bg-white dark:bg-zinc-900",
                card.thumbnail === "custom" && "bg-transparent"
              )}
            >
              {card.thumbnail && card.thumbnail !== "white" && card.thumbnail !== "custom" && <BlurImage card={card} />}
              {card.thumbnail === "custom" ? (
                <div className="relative h-full w-full z-10">{card.content}</div>
              ) : (
                <CardContent card={card} hasImage={!!card.thumbnail && card.thumbnail !== "white"} />
              )}
            </motion.div>
          </div>
        );
      })}
    </div>
  );
};

const BlurImage = ({ card }: { card: Card }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <img
      src={card.thumbnail}
      onLoad={() => setLoaded(true)}
      className={cn(
        "object-cover object-center absolute inset-0 h-full w-full transition duration-200 grayscale blur-sm",
        loaded ? "" : "blur-md"
      )}
      alt="thumbnail"
    />
  );
};

const CardContent = ({ card, hasImage }: { card: Card; hasImage: boolean }) => {
  return (
    <div className="bg-transparent h-full w-full flex flex-col justify-end rounded-lg relative z-10">
      {/* Dark overlay for text readability - only when there's an image */}
      {hasImage && (
        <div className="absolute inset-0 h-full w-full bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      )}

      {/* Content */}
      <div className="relative px-6 pb-6 z-20">
        {card.content}
      </div>
    </div>
  );
};
