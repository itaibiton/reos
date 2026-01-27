"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface TestimonialsProps {
  className?: string;
}

const testimonials = [
  {
    id: 1,
    logo: "BlackRock",
    quote:
      "As demand for digital asset products increases, and as our footprint in the ecosystem grows, we continue to expand our network of service providers with a focus on the highest quality institutional providers. After a thorough evaluation, Anchorage Digital clearly meets these standards.",
    author: "Robert Mitchnick",
    position: "Head of Digital Assets, BlackRock",
  },
  {
    id: 2,
    logo: "REX Shares",
    quote:
      "Anchorage Digital Prime provides reliable access to trading, settlement, custody, and other digital asset services - all on secure infrastructure we trust.",
    author: "Greg King",
    position: "Founder and CEO, REX Shares",
  },
  {
    id: 3,
    logo: "Grayscale",
    quote:
      "We are pleased to work with Anchorage given their high-quality solutions which support the evolving needs of our investors. This collaboration underscores our shared focus on high operational standards and responsible growth in the crypto asset class.",
    author: "Diana Zhang",
    position: "Chief Operating Officer, Grayscale",
  },
  {
    id: 4,
    logo: "Electric Capital",
    quote:
      "Anchorage Digital is the safest place to store crypto assets, bar none.",
    author: "Avichal Garg",
    position: "Managing Partner, Electric Capital",
  },
  {
    id: 5,
    logo: "Arca Labs",
    quote:
      "As the crypto industry is receiving increasing demand for higher security and compliance standards, Anchorage Digital Bank was a natural choice as a custody partner due to its unique regulatory protections and secure custody solution.",
    author: "Jerald David",
    position: "President, Arca Labs",
  },
  {
    id: 6,
    logo: "Starkware",
    quote:
      "Working with Anchorage Digital has been seamless, providing unmatched ease of use and a reliable partnership that empowers our team to focus on scaling blockchain technology.",
    author: "Ran Grinshtein",
    position: "CFO, Starkware",
  },
];

export function Testimonials({ className }: TestimonialsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prev) => {
      let next = prev + newDirection;
      if (next < 0) next = testimonials.length - 1;
      if (next >= testimonials.length) next = 0;
      return next;
    });
  };

  // Auto-advance
  useEffect(() => {
    const interval = setInterval(() => {
      paginate(1);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section
      className={cn(
        "relative bg-[#0a0a0a] py-20 px-4 sm:px-6 lg:px-8",
        "border-t border-gray-800",
        className
      )}
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Client testimonials
          </h2>
          <p className="text-gray-400">
            Trusted by the world&apos;s leading institutions
          </p>
        </motion.div>

        {/* Testimonial carousel */}
        <div ref={containerRef} className="relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
              className="relative"
            >
              <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 lg:p-12">
                {/* Quote icon */}
                <div className="mb-6">
                  <Quote className="w-12 h-12 text-emerald-500/30" />
                </div>

                {/* Logo placeholder */}
                <div className="mb-6">
                  <span className="text-2xl font-bold text-white/80">
                    {currentTestimonial.logo}
                  </span>
                </div>

                {/* Quote */}
                <blockquote className="text-xl lg:text-2xl text-gray-300 leading-relaxed mb-8">
                  &ldquo;{currentTestimonial.quote}&rdquo;
                </blockquote>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                    <span className="text-lg font-bold text-emerald-400">
                      {currentTestimonial.author.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="font-semibold text-white">
                      {currentTestimonial.author}
                    </div>
                    <div className="text-sm text-gray-500">
                      {currentTestimonial.position}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={() => paginate(-1)}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>

            {/* Dots */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setDirection(index > currentIndex ? 1 : -1);
                    setCurrentIndex(index);
                  }}
                  className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    index === currentIndex
                      ? "w-8 bg-emerald-500"
                      : "bg-gray-700 hover:bg-gray-600"
                  )}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              className="border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
              onClick={() => paginate(1)}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Testimonials;
