"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { TestimonialCard } from "./TestimonialCard";
import { motion, useReducedMotion } from "framer-motion";
import { staggerContainer } from "../shared/animations";

// ============================================================================
// Types
// ============================================================================

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
}

interface TestimonialsCarouselProps {
  items: Testimonial[];
}

// ============================================================================
// TestimonialsCarousel Component
// ============================================================================

export function TestimonialsCarousel({ items }: TestimonialsCarouselProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Carousel
      opts={{
        loop: true,
        align: "start",
      }}
      className="w-full"
    >
      <motion.div
        variants={shouldReduceMotion ? undefined : staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        <CarouselContent className="-ms-4">
          {items.map((testimonial) => (
            <CarouselItem
              key={testimonial.id}
              className="ps-4 basis-full md:basis-1/2 lg:basis-1/3"
            >
              <TestimonialCard testimonial={testimonial} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </motion.div>
      <CarouselPrevious className="hidden sm:flex -start-4" />
      <CarouselNext className="hidden sm:flex -end-4" />
    </Carousel>
  );
}

export default TestimonialsCarousel;
