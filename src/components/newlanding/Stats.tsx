"use client";

import { useState, useRef, useEffect } from "react";
import { motion, type Variants, useInView } from "framer-motion";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface StatsProps {
  className?: string;
}

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const statItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// CountUp Component
function CountUp({
  value,
  duration = 2,
  isVisible = true
}: {
  value: string;
  duration?: number;
  isVisible?: boolean;
}) {
  const [displayValue, setDisplayValue] = useState("0");
  const hasAnimatedRef = useRef(false);

  // Extract numeric value and suffix
  // Handle formats like: "$40B+", "2.5M", "99.99%", "140+"
  const match = value.match(/^([$]?)([\d,.]+)([BMK%\+]*)$/);
  const prefix = match ? match[1] : "";
  const numericStr = match ? match[2].replace(/,/g, "") : "0";
  const numericValue = parseFloat(numericStr) || 0;
  const suffix = match ? match[3] : "";

  useEffect(() => {
    if (!isVisible) {
      setDisplayValue("0");
      hasAnimatedRef.current = false;
      return;
    }

    if (hasAnimatedRef.current) return;

    hasAnimatedRef.current = true;

    const startTime = Date.now();
    const startValue = 0;
    const endValue = numericValue;

    const updateValue = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      // Easing function (easeOut)
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * eased;

      if (suffix.includes("B") || suffix.includes("M")) {
        setDisplayValue(prefix + current.toFixed(1) + suffix);
      } else if (suffix.includes("K")) {
        setDisplayValue(prefix + Math.floor(current).toLocaleString() + suffix);
      } else if (suffix.includes("%")) {
        setDisplayValue(Math.floor(current) + suffix);
      } else if (suffix.includes("+")) {
        setDisplayValue(prefix + Math.floor(current).toLocaleString() + suffix);
      } else {
        setDisplayValue(prefix + Math.floor(current).toLocaleString() + suffix);
      }

      if (progress < 1) {
        requestAnimationFrame(updateValue);
      } else {
        // Ensure final value is set correctly
        if (suffix.includes("B") || suffix.includes("M")) {
          setDisplayValue(prefix + endValue.toFixed(1) + suffix);
        } else {
          setDisplayValue(value);
        }
      }
    };

    requestAnimationFrame(updateValue);
  }, [numericValue, duration, isVisible, suffix, prefix, value]);

  return <span>{displayValue}</span>;
}

// DecryptedText Component
function DecryptedText({
  text,
  speed = 30,
  isVisible = true
}: {
  text: string;
  speed?: number;
  isVisible?: boolean;
}) {
  const [displayText, setDisplayText] = useState("");
  const prevTextRef = useRef(text);

  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/";

  useEffect(() => {
    if (!isVisible) {
      setDisplayText("");
      return;
    }

    if (prevTextRef.current !== text) {
      prevTextRef.current = text;
    }

    let currentIteration = 0;
    const totalIterations = text.length * 3;

    const interval = setInterval(() => {
      const progress = currentIteration / totalIterations;
      const revealedCount = Math.floor(progress * text.length);

      const newText = text
        .split("")
        .map((letter, index) => {
          if (letter === " " || letter === ":" || letter === "/" || letter === ".") return letter;
          if (index < revealedCount) {
            return text[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");

      setDisplayText(newText);

      currentIteration++;

      if (currentIteration >= totalIterations) {
        clearInterval(interval);
        setDisplayText(text);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, isVisible, chars]);

  if (!isVisible) {
    return <span>{text}</span>;
  }

  return <span>{displayText || text}</span>;
}

export function Stats({ className }: StatsProps) {
  const t = useTranslations("landing.stats");
  const statsRef = useRef(null);
  const isInView = useInView(statsRef, { once: true, amount: 0.3 });

  const stats = [
    { value: t("assetsUnderManagement.value"), label: t("assetsUnderManagement.label") },
    { value: t("unitsPowered.value"), label: t("unitsPowered.label") },
    { value: t("uptimeSLA.value"), label: t("uptimeSLA.label") },
    { value: t("apiIntegrations.value"), label: t("apiIntegrations.label") },
  ];

  return (
    <motion.section
      ref={statsRef}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={fadeInUp}
      className={cn("py-20 border-t border-border/50", className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={stagger}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center text-center"
        >
          {stats.map((stat, index) => (
            <motion.div key={index} variants={statItem} className="max-w-[200px]">
              <div className="text-3xl md:text-4xl font-light text-foreground mb-2 tracking-tight">
                <CountUp value={stat.value} duration={2} isVisible={isInView} />
              </div>
              <div className="text-sm text-muted-foreground min-h-[2.5rem] flex items-center justify-center">
                <DecryptedText text={stat.label} speed={30} isVisible={isInView} />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}
