# Phase 51: Testimonials & Video - Research

**Researched:** 2026-01-26
**Domain:** Testimonials carousel, video embed, i18n, accessibility
**Confidence:** HIGH

## Summary

Phase 51 implements client testimonials carousel and video demo section for the landing page. The project has all required dependencies: embla-carousel-react 8.6.0 with RTL support, Framer Motion 12.26.2 for animations, and established patterns from SectionWrapper, animations.ts, and ui/carousel.tsx.

Key findings: embla-carousel already in project with full RTL support via Radix useDirection hook. Testimonials should use carousel (TEST-03) with staggered card animations. Video section should use lazy-loaded iframe with play button overlay (VID-02) and fallback image (VID-03). All animations must respect useReducedMotion().

**Primary recommendation:** Create TestimonialsVideoSection as combined section with two subsections (testimonials carousel + video embed). Use existing ui/carousel.tsx components. Follow TrustSection/FeatureCards patterns for structure. Support both YouTube embeds and placeholder demos.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| embla-carousel-react | 8.6.0 | Testimonials carousel | Already in project, RTL-aware, accessible, keyboard nav |
| Framer Motion | 12.26.2 | Scroll/hover animations | Established patterns in animations.ts |
| next-intl | 4.7.0 | i18n translations | Established pattern in all landing sections |
| Lucide React | 0.562.0 | Icons (play, quote, stars) | Project icon library |

### Supporting
| Library | Purpose | When to Use |
|---------|---------|-------------|
| @/components/ui/carousel | Carousel primitives | Wrap embla with project styling |
| SectionWrapper | Section structure | Scroll animations, aria labels |
| SectionHeader | Title/subtitle | Consistent section headers |
| animations.ts | Animation variants | fadeInUp, staggerContainer, clipRevealFromBottom |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| embla-carousel | swiper | Swiper larger bundle, not in project |
| YouTube iframe | HTML5 video | HTML5 needs video hosting, YouTube free |
| Grid layout | Carousel | Grid simpler but less engaging, carousel recommended |

## Architecture Patterns

### Recommended Project Structure
```
src/components/landing/
├── TestimonialsVideo/
│   ├── index.ts                      # Exports
│   ├── TestimonialsVideoSection.tsx  # Main combined section
│   ├── TestimonialsCarousel.tsx      # Carousel with navigation
│   ├── TestimonialCard.tsx           # Individual testimonial
│   └── VideoEmbed.tsx                # Video player with overlay
└── shared/
    ├── SectionWrapper.tsx            # Already exists - reuse
    ├── SectionHeader.tsx             # Already exists - reuse
    └── animations.ts                 # Already exists - reuse
```

### Pattern 1: Testimonials Carousel (TEST-01, TEST-02, TEST-03)
**What:** Carousel of testimonial cards with quotes, avatars, names
**When to use:** TEST-03 requirement for carousel layout
**Example:**
```typescript
// File: TestimonialsCarousel.tsx
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

interface Testimonial {
  id: string;
  quote: string;      // TEST-01
  author: string;     // TEST-02
  role?: string;
  avatar?: string;    // TEST-02
}

export function TestimonialsCarousel({ items }: { items: Testimonial[] }) {
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
        <CarouselContent className="-ml-4">
          {items.map((testimonial) => (
            <CarouselItem
              key={testimonial.id}
              className="pl-4 basis-full md:basis-1/2 lg:basis-1/3"
            >
              <TestimonialCard testimonial={testimonial} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </motion.div>
      <CarouselPrevious className="hidden sm:flex -left-4" />
      <CarouselNext className="hidden sm:flex -right-4" />
    </Carousel>
  );
}
```

### Pattern 2: Testimonial Card (TEST-01, TEST-02)
**What:** Individual testimonial with quote, avatar, author info
**When to use:** Each testimonial item in carousel
**Example:**
```typescript
// File: TestimonialCard.tsx
"use client";

import { motion, useReducedMotion } from "framer-motion";
import { fadeInUp } from "../shared/animations";
import { Quote } from "lucide-react";
import { cn } from "@/lib/utils";

interface TestimonialCardProps {
  testimonial: {
    quote: string;
    author: string;
    role?: string;
    avatar?: string;
  };
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.article
      variants={fadeInUp}
      whileHover={
        shouldReduceMotion
          ? undefined
          : { scale: 1.02, y: -4, transition: { duration: 0.2 } }
      }
      className={cn(
        "flex flex-col h-full p-6 rounded-xl",
        "bg-card/50 backdrop-blur-sm",
        "border border-border/50",
        "hover:shadow-lg hover:border-landing-primary/30",
        "transition-shadow duration-300"
      )}
    >
      {/* Quote icon */}
      <Quote
        className="w-8 h-8 text-landing-primary/30 mb-4"
        aria-hidden="true"
      />

      {/* Quote text - TEST-01 */}
      <blockquote className="text-base leading-relaxed text-landing-text flex-grow mb-6">
        "{testimonial.quote}"
      </blockquote>

      {/* Author info - TEST-02 */}
      <div className="flex items-center gap-3">
        {testimonial.avatar && (
          <img
            src={testimonial.avatar}
            alt=""
            className="w-12 h-12 rounded-full object-cover"
          />
        )}
        <div>
          <p className="font-semibold text-landing-text">{testimonial.author}</p>
          {testimonial.role && (
            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
          )}
        </div>
      </div>
    </motion.article>
  );
}
```

### Pattern 3: Video Embed with Play Button (VID-01, VID-02, VID-03)
**What:** Video section with lazy-loaded iframe and play button overlay
**When to use:** Platform demo video
**Example:**
```typescript
// File: VideoEmbed.tsx
"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Play } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoEmbedProps {
  videoId: string;
  fallbackImage: string;
  title: string;
  playLabel?: string;
}

export function VideoEmbed({
  videoId,
  fallbackImage,
  title,
  playLabel = "Play video",
}: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted shadow-lg">
      {/* Fallback image - VID-03 */}
      {!isPlaying && (
        <img
          src={fallbackImage}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}

      {/* Play button overlay - VID-02 */}
      {!isPlaying && (
        <motion.button
          initial={shouldReduceMotion ? {} : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={shouldReduceMotion ? undefined : { scale: 1.1 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
          onClick={() => setIsPlaying(true)}
          className={cn(
            "absolute inset-0 flex items-center justify-center z-10",
            "bg-black/30 hover:bg-black/40 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-primary"
          )}
          aria-label={playLabel}
        >
          <div className="w-20 h-20 rounded-full bg-landing-primary flex items-center justify-center shadow-xl">
            <Play className="w-10 h-10 text-white fill-white ms-1" />
          </div>
        </motion.button>
      )}

      {/* YouTube iframe - VID-01 */}
      {isPlaying && (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      )}
    </div>
  );
}
```

### Pattern 4: Translation Structure
**What:** i18n translations for testimonials and video content
**Example:**
```json
// messages/en.json
{
  "landing": {
    "testimonialsVideo": {
      "heading": "What Our Investors Say",
      "subheading": "Join thousands of investors who trust REOS for their Israeli real estate journey",
      "ariaLabel": "Client testimonials and platform demonstration",
      "testimonials": [
        {
          "id": "testimonial-1",
          "quote": "REOS transformed how I manage my Israeli property investments. The deal flow tracking is exceptional.",
          "author": "Sarah Johnson",
          "role": "Real Estate Investor"
        }
      ],
      "video": {
        "title": "See REOS in Action",
        "description": "Watch how REOS simplifies your investment journey from discovery to closing",
        "playLabel": "Play demonstration video"
      }
    }
  }
}
```

## RTL Considerations

The project has established RTL patterns:
- ui/carousel.tsx already uses `useDirection()` from Radix for RTL-aware navigation
- Use logical properties: `ms-*` (margin-start), `ps-*` (padding-start), `start-*`, `end-*`
- Carousel navigation buttons use `start-*`/`end-*` positioning
- Quote icons/text alignment handled by parent RTL dir

## Common Pitfalls

### Pitfall 1: Carousel Not RTL-Aware
**What goes wrong:** Carousel slides wrong direction in Hebrew
**How to avoid:** Use existing ui/carousel.tsx which has `useDirection()` built in

### Pitfall 2: Video Autoplay Without User Interaction
**What goes wrong:** Browser blocks autoplay, video fails silently
**How to avoid:** Only load iframe after user clicks play button (pattern 3)

### Pitfall 3: Missing Reduced Motion
**What goes wrong:** Animations cause vestibular issues for some users
**How to avoid:** Always check `useReducedMotion()` and provide static fallback

### Pitfall 4: Carousel Navigation Hidden on Mobile
**What goes wrong:** No way to navigate carousel on small screens
**How to avoid:** Use swipe gestures (embla default) + optional dots indicator

## Code Examples

### Complete TestimonialsVideoSection
```typescript
"use client";

import { useTranslations } from "next-intl";
import { SectionWrapper, SectionHeader } from "../shared";
import { TestimonialsCarousel } from "./TestimonialsCarousel";
import { VideoEmbed } from "./VideoEmbed";
import { motion, useReducedMotion, useInView } from "framer-motion";
import { useRef } from "react";
import { fadeInUp } from "../shared/animations";

export function TestimonialsVideoSection() {
  const t = useTranslations("landing.testimonialsVideo");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });
  const shouldReduceMotion = useReducedMotion();

  const testimonials = t.raw("testimonials") as Array<{
    id: string;
    quote: string;
    author: string;
    role?: string;
    avatar?: string;
  }>;

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
        ref={ref}
        variants={shouldReduceMotion ? undefined : fadeInUp}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center"
      >
        <div>
          <h3 className="text-2xl lg:text-3xl font-bold text-landing-text mb-4">
            {t("video.title")}
          </h3>
          <p className="text-muted-foreground leading-relaxed">
            {t("video.description")}
          </p>
        </div>
        <VideoEmbed
          videoId="dQw4w9WgXcQ"
          fallbackImage="/images/landing/video-thumbnail.jpg"
          title={t("video.title")}
          playLabel={t("video.playLabel")}
        />
      </motion.div>
    </SectionWrapper>
  );
}
```

## Sources

### Primary (HIGH confidence)
- Existing ui/carousel.tsx - RTL-aware carousel implementation
- Existing animations.ts - fadeInUp, staggerContainer variants
- Existing SectionWrapper/SectionHeader - Section patterns
- embla-carousel-react documentation
- Framer Motion gestures documentation

### Secondary (MEDIUM confidence)
- YouTube embed API documentation
- WCAG 2.1 carousel accessibility guidelines

## Metadata

**Confidence breakdown:**
- Carousel implementation: HIGH - embla already in project, patterns proven
- Video embed: HIGH - Standard YouTube iframe pattern
- Animations: HIGH - Reusing existing variants
- Accessibility: HIGH - Following WCAG guidelines

**Research date:** 2026-01-26
**Valid until:** ~30 days - Stack stable, patterns established
