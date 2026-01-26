"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { SectionWrapper, SectionHeader } from "../shared";
import { TestimonialsCarousel } from "./TestimonialsCarousel";
import { VideoEmbed } from "./VideoEmbed";
import { fadeInUp } from "../shared/animations";

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

interface VideoConfig {
  title: string;
  description: string;
  playLabel: string;
  videoId: string;
  fallbackImage: string;
}

// ============================================================================
// TestimonialsVideoSection Component
// ============================================================================

export function TestimonialsVideoSection() {
  const t = useTranslations("landing.testimonialsVideo");
  const videoRef = useRef<HTMLDivElement>(null);
  const isVideoInView = useInView(videoRef, { once: true, amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();

  const testimonials = t.raw("testimonials") as Testimonial[];
  const video = t.raw("video") as VideoConfig;

  return (
    <SectionWrapper
      id="testimonials"
      background="muted"
      animate={true}
      ariaLabel={t("ariaLabel")}
    >
      <SectionHeader
        title={t("heading")}
        subtitle={t("subheading")}
        centered={true}
      />

      {/* Testimonials Carousel */}
      <div className="mb-16 lg:mb-20">
        <TestimonialsCarousel items={testimonials} />
      </div>

      {/* Video Section */}
      <motion.div
        ref={videoRef}
        variants={shouldReduceMotion ? undefined : fadeInUp}
        initial="hidden"
        animate={isVideoInView ? "visible" : "hidden"}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
      >
        <div>
          <h3 className="text-2xl lg:text-3xl font-bold text-landing-text mb-4">
            {video.title}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {video.description}
          </p>
        </div>
        <VideoEmbed
          videoId={video.videoId}
          fallbackImage={video.fallbackImage}
          title={video.title}
          playLabel={video.playLabel}
        />
      </motion.div>
    </SectionWrapper>
  );
}

export default TestimonialsVideoSection;
