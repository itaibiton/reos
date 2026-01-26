# Roadmap: REOS v1.7 New Landing Page

## Overview

Create a modern, conversion-focused landing page that showcases REOS's value proposition to US investors looking to invest in Israeli real estate. The milestone builds from foundation (navbar, footer) through content sections (hero, trust, features) to interactive elements (testimonials, video, contact form), with responsive design and animations applied throughout.

## Milestones

- **v1.0 MVP** - Phases 1-8 (shipped 2026-01-17)
- **v1.1 Investor Onboarding** - Phases 9-15 (shipped 2026-01-18)
- **v1.2 Provider Experience** - Phases 16-20 (shipped 2026-01-19)
- **v1.3 Social Feed & Global Community** - Phases 21-27.2 (shipped 2026-01-19)
- **v1.4 Internationalization & RTL** - Phases 28-34.1 (shipped 2026-01-20)
- **v1.5 Mobile Responsive & Header Redesign** - Phases 35-39 (shipped 2026-01-22)
- **v1.6 AI-Powered Investor Experience** - Phases 40-46 (shipped 2026-01-26)
- **v1.7 New Landing Page** - Phases 47-52 (in progress)

## Phases

- [x] **Phase 47: Landing Page Foundation** - Navbar, footer, page layout structure
- [ ] **Phase 48: Hero Section** - Full 100vh hero with headline, CTA, visuals, animations
- [ ] **Phase 49: Trust & Value Props** - Logo section and value propositions
- [ ] **Phase 50: Feature Cards** - Four feature cards showcasing platform capabilities
- [ ] **Phase 51: Testimonials & Video** - Client testimonials carousel and video section
- [ ] **Phase 52: Contact Form & Polish** - Lead capture form with Convex, responsive polish

## Phase Details

### Phase 47: Landing Page Foundation
**Goal**: Users can navigate the landing page with consistent header and footer across all sections
**Depends on**: Nothing (first phase of v1.7)
**Requirements**: NAV-01, NAV-02, FOOT-01, FOOT-02, FOOT-03, FOOT-04, FOOT-05
**Success Criteria** (what must be TRUE):
  1. Fixed navbar stays visible while scrolling through landing page
  2. Mobile users can open hamburger menu and navigate to all sections
  3. Footer displays logo, navigation links, social links, and legal information
  4. CTA button in navbar navigates to sign-up or contact section
  5. Page layout structure ready to receive content sections
**Plans:** 2 plans
Plans:
- [x] 47-01-PLAN.md — Update navbar links and layout structure for v1.7 sections
- [x] 47-02-PLAN.md — Update footer with REOS content and proper links

### Phase 48: Hero Section
**Goal**: Users immediately understand REOS's value proposition upon landing
**Depends on**: Phase 47
**Requirements**: HERO-01, HERO-02, HERO-03, HERO-04, HERO-05
**Success Criteria** (what must be TRUE):
  1. Hero section fills full viewport (100vh) with compelling headline visible above fold
  2. Subheadline clearly explains REOS connects US investors with Israeli properties
  3. Primary CTA button ("Start Investing" or similar) is prominently visible
  4. Hero visual (property images, gradient, or animation) creates professional impression
  5. Scroll indicator animates to guide users to continue scrolling
**Plans:** 1 plan
Plans:
- [ ] 48-01-PLAN.md — Update Hero component with investor messaging, id attribute, and CTA to #contact

### Phase 49: Trust & Value Props
**Goal**: Users see social proof and understand key platform benefits
**Depends on**: Phase 48
**Requirements**: LOGO-01, LOGO-02, VAL-01, VAL-02, VAL-03
**Success Criteria** (what must be TRUE):
  1. "Trusted by" or "Featured in" section displays partner/media logos
  2. 3-4 value propositions appear with distinct icons
  3. Each value proposition has brief, scannable description
  4. Sections animate into view as user scrolls (fade-in effect)
**Plans**: TBD (created during phase planning)

### Phase 50: Feature Cards
**Goal**: Users understand the four core platform capabilities
**Depends on**: Phase 49
**Requirements**: FEAT-01, FEAT-02, FEAT-03, FEAT-04, FEAT-05
**Success Criteria** (what must be TRUE):
  1. Property Discovery card explains smart search and AI recommendations
  2. Deal Flow card explains 7-stage tracking and service provider network
  3. Communication card explains real-time chat and notifications
  4. AI Assistant card explains personalized recommendations
  5. Cards have hover/interaction animations that invite exploration
**Plans**: TBD (created during phase planning)

### Phase 51: Testimonials & Video
**Goal**: Users see social proof from clients and can watch platform demo
**Depends on**: Phase 50
**Requirements**: TEST-01, TEST-02, TEST-03, VID-01, VID-02, VID-03
**Success Criteria** (what must be TRUE):
  1. Client testimonials display with quotes, photos/avatars, and names
  2. Testimonials arranged in carousel or grid layout
  3. Video section has embedded player or animated demo placeholder
  4. Play button overlay invites users to watch video
  5. Fallback image displays when video cannot load
**Plans**: TBD (created during phase planning)

### Phase 52: Contact Form & Polish
**Goal**: Users can submit their information and page works flawlessly on all devices
**Depends on**: Phase 51
**Requirements**: FORM-01, FORM-02, FORM-03, FORM-04, RESP-01, RESP-02, RESP-03, RESP-04
**Success Criteria** (what must be TRUE):
  1. Contact form captures name, email, and investor type
  2. Form shows validation errors for invalid/missing fields
  3. Success state confirms submission with clear feedback
  4. Form submission persists lead data to Convex backend
  5. All sections display correctly on mobile (320px+), tablet, and desktop
  6. Scroll-triggered animations work smoothly across all sections
  7. Section transitions are smooth without jank or layout shift
**Plans**: TBD (created during phase planning)

## Progress

**Execution Order:** Phases 47 -> 48 -> 49 -> 50 -> 51 -> 52

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 47. Landing Page Foundation | v1.7 | 2/2 | Complete | 2026-01-26 |
| 48. Hero Section | v1.7 | 0/1 | Planned | — |
| 49. Trust & Value Props | v1.7 | 0/0 | Pending | — |
| 50. Feature Cards | v1.7 | 0/0 | Pending | — |
| 51. Testimonials & Video | v1.7 | 0/0 | Pending | — |
| 52. Contact Form & Polish | v1.7 | 0/0 | Pending | — |

---
*Roadmap created: 2026-01-26*
*Milestone: v1.7 New Landing Page*
*Requirements: 36 mapped to 6 phases*
