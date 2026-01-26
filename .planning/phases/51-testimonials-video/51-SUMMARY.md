---
phase: 51-testimonials-video
plan: 01
subsystem: ui
tags: [react, framer-motion, embla-carousel, next-intl, landing-page, video-embed]

# Dependency graph
requires:
  - phase: 47-foundation
    provides: SectionWrapper, SectionHeader, animations, GeometricDivider
  - phase: 50-feature-cards
    provides: Landing page layout patterns, reduced motion pattern
provides:
  - TestimonialsVideoSection component with carousel and video embed
  - TestimonialsCarousel using existing ui/carousel components
  - TestimonialCard with hover animations
  - VideoEmbed with lazy-loaded YouTube iframe
  - landing.testimonialsVideo translations (en/he)
affects: [52-faq, 53-contact]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Embla carousel with RTL support via ui/carousel
    - Lazy-loaded video iframe with play button overlay
    - useReducedMotion hook for accessibility
    - Staggered card animations with staggerContainer

key-files:
  created:
    - src/components/landing/TestimonialsVideo/TestimonialsVideoSection.tsx
    - src/components/landing/TestimonialsVideo/TestimonialsCarousel.tsx
    - src/components/landing/TestimonialsVideo/TestimonialCard.tsx
    - src/components/landing/TestimonialsVideo/VideoEmbed.tsx
    - src/components/landing/TestimonialsVideo/index.ts
  modified:
    - messages/en.json
    - messages/he.json
    - src/app/[locale]/(main)/page.tsx

key-decisions:
  - "Carousel: embla-carousel via ui/carousel with RTL support via useDirection()"
  - "Video: lazy-load iframe only after user clicks play button for performance"
  - "Cards: whileHover scale 1.02x + y:-4px for subtle lift effect"
  - "Reduced motion: all animations conditionally disabled with useReducedMotion()"

patterns-established:
  - "Carousel: use existing ui/carousel components for consistency and RTL support"
  - "Video embed: fallback image + play overlay, iframe loads on click"
  - "Testimonials: semantic blockquote with Quote icon, author info below"
  - "RTL: logical properties (ms-*, ps-*, start-*, end-*) throughout"

# Metrics
duration: 10min
completed: 2026-01-26
---

# Phase 51 Plan 01: Testimonials & Video Summary

**Client testimonials carousel and video demo section showcasing social proof and platform demonstration, integrated into landing page with full i18n support (en/he)**

## Performance

- **Duration:** 10 min
- **Started:** 2026-01-26
- **Completed:** 2026-01-26
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- TestimonialsVideoSection with combined testimonials carousel and video embed
- TestimonialsCarousel using embla-carousel with RTL support and looping
- TestimonialCard with Quote icon, blockquote, author info, and hover animations
- VideoEmbed with fallback image, animated play button overlay, lazy-loaded YouTube iframe
- Reduced motion support with useReducedMotion hook (WCAG 2.3.3)
- Keyboard accessibility with focus-visible ring on play button
- Full i18n support with 4 testimonials in English and Hebrew
- Integrated into landing page after FeatureCardsSection

## Task Commits

Each task was committed atomically:

1. **Task 1: Create TestimonialsVideo components** - `213428d` (feat)
   - TestimonialsVideoSection.tsx with combined section layout
   - TestimonialsCarousel.tsx using ui/carousel with staggerContainer animation
   - TestimonialCard.tsx with whileHover scale/lift animation
   - VideoEmbed.tsx with play overlay and lazy iframe loading
   - index.ts for module exports
   - Reduced motion support via useReducedMotion()

2. **Task 2: Add translations** - `1c831b1` (feat)
   - landing.testimonialsVideo section in en.json
   - Hebrew translations in he.json
   - 4 testimonials with id, quote, author, role
   - Video config: title, description, playLabel, videoId, fallbackImage

3. **Task 3: Integrate into landing page** - `3846757` (feat)
   - Imported TestimonialsVideoSection into page.tsx
   - Positioned after FeatureCardsSection
   - Accessible via #testimonials anchor for navigation

## Files Created/Modified

### Created
- `src/components/landing/TestimonialsVideo/TestimonialsVideoSection.tsx` - Main section with SectionWrapper, SectionHeader, carousel, and video grid layout
- `src/components/landing/TestimonialsVideo/TestimonialsCarousel.tsx` - Carousel using ui/carousel components with loop and RTL support
- `src/components/landing/TestimonialsVideo/TestimonialCard.tsx` - Card with Quote icon, blockquote, author info, whileHover animation (scale 1.02x, y:-4px)
- `src/components/landing/TestimonialsVideo/VideoEmbed.tsx` - Video with fallback image, play button overlay, lazy-loaded YouTube iframe
- `src/components/landing/TestimonialsVideo/index.ts` - Module exports

### Modified
- `messages/en.json` - Added landing.testimonialsVideo with 4 testimonials and video config
- `messages/he.json` - Added Hebrew translations for testimonialsVideo
- `src/app/[locale]/(main)/page.tsx` - Imported and rendered TestimonialsVideoSection after FeatureCardsSection

## Decisions Made

**CAROUSEL-IMPLEMENTATION**: Use existing ui/carousel with embla
- **Rationale**: embla-carousel already in project with RTL support via useDirection()
- **Implementation**: Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext from ui/carousel
- **RTL support**: Built into ui/carousel, uses logical properties (ms-*, ps-*, start-*, end-*)

**VIDEO-LAZY-LOAD**: Load iframe only after user clicks play
- **Rationale**: Performance optimization, avoids loading YouTube scripts until needed
- **Implementation**: useState(isPlaying), show fallback image + play button, load iframe on click
- **Accessibility**: Play button has aria-label, focus-visible ring, whileTap feedback

**CARD-ANIMATION**: Scale 1.02x + y:-4px on hover
- **Rationale**: Consistent with FeatureCards pattern but slightly more subtle (1.02 vs 1.03)
- **Implementation**: Framer Motion whileHover with 0.2s easeOut duration
- **WCAG compliance**: Conditionally disabled with useReducedMotion()

**TESTIMONIAL-STRUCTURE**: Quote icon + blockquote + author
- **Rationale**: Semantic HTML for accessibility, visual Quote icon for design
- **Implementation**: motion.article with Quote icon (lucide-react), blockquote element, author div
- **Styling**: bg-card/50 backdrop-blur-sm, border-border/50, hover shadow-lg

## Deviations from Plan

None - plan executed as written:
- All 5 component files created
- Translations added for en/he with 4 testimonials each
- Landing page integration completed
- Carousel with RTL support working
- Video lazy loading with play overlay working
- Reduced motion support implemented

## Issues Encountered

None - implementation proceeded without issues.

## User Setup Required

**Video Thumbnail**: Replace placeholder video configuration when real demo video is available
- Current videoId: `dQw4w9WgXcQ` (placeholder)
- Current fallbackImage: `/images/landing/video-thumbnail.jpg` (needs to be created)

## Next Phase Readiness

**Ready for Phase 52 (FAQ Section):**
- Testimonials & Video section complete with carousel and video embed
- Section ID (#testimonials) ready for hash navigation
- Translation patterns established for FAQ content
- Landing page structure ready for next section

**Pending work:**
- Replace placeholder video ID with actual demo video
- Add video thumbnail image to public/images/landing/

**No blockers.**

---
*Phase: 51-testimonials-video*
*Completed: 2026-01-26*
