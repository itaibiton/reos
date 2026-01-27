# Requirements: REOS v1.8 Landing Page Mobile Responsive

**Defined:** 2026-01-27
**Core Value:** Deal flow tracking from interest to close.

## Milestone Goal

Make every component and layout on the landing page fully mobile responsive with adaptive layouts optimized for small screens (320px-768px), while preserving the desktop experience.

## Success Criteria

- [ ] All 8 landing components display correctly on mobile devices (320px, 375px, 640px, 768px)
- [ ] Adaptive layouts implemented (not just scaled) — single column grids, stacked sections
- [ ] All interactive elements have 44px+ touch targets
- [ ] Text is readable on all screen sizes (no overflow, proper line heights)
- [ ] Animations work smoothly on mobile (simplified where needed)
- [ ] Desktop experience unchanged above 768px
- [ ] No horizontal scrolling on any mobile viewport
- [ ] All content accessible without zooming

## Component Requirements

### 1. Hero Component (`Hero.tsx`)

**Current State:**
- Desktop-optimized with two-column layout (text + dashboard mockup)
- Rotating text animation for role types
- Stats grid with card swap animation
- Dashboard preview with complex nested elements

**Mobile Requirements:**
- [ ] **HERO-M01**: Stack text and dashboard vertically on mobile
- [ ] **HERO-M02**: Reduce heading font size progressively (3xl on mobile, 5xl on desktop)
- [ ] **HERO-M03**: Adjust rotating text size and animation speed for mobile
- [ ] **HERO-M04**: Stats grid: 2x2 on mobile (640px+), 1x4 stacked on small phones (320px-640px)
- [ ] **HERO-M05**: Dashboard mockup: Reduce scale and complexity on mobile
- [ ] **HERO-M06**: CTA buttons: Stack vertically on mobile (< 640px), horizontal on tablet+
- [ ] **HERO-M07**: Badge text: Smaller font size on mobile
- [ ] **HERO-M08**: Viewport height: Use min-h-screen instead of fixed heights

### 2. Navigation Component (`Navigation.tsx`)

**Current State:**
- Desktop navigation with dropdown menus
- Animated padding/border-radius on scroll
- "Get Started" and "Log in" CTAs

**Mobile Requirements:**
- [ ] **NAV-M01**: Implement hamburger menu for mobile (< 768px)
- [ ] **NAV-M02**: Slide-out or dropdown mobile menu with smooth animation
- [ ] **NAV-M03**: Menu items stack vertically in mobile menu
- [ ] **NAV-M04**: Platform/Solutions dropdowns become accordion items in mobile menu
- [ ] **NAV-M05**: Logo + hamburger + CTA button layout on mobile
- [ ] **NAV-M06**: Hide "Log in" text below 640px (show only "Get Started")
- [ ] **NAV-M07**: Adjust scroll animation thresholds for mobile (less padding reduction)
- [ ] **NAV-M08**: Touch targets: 44px+ for all menu items and buttons
- [ ] **NAV-M09**: Close menu on link click or outside tap

### 3. SocialProof Component (`SocialProof.tsx`)

**Current State:**
- Horizontal scrolling logo strip
- "TRUSTED BY INNOVATIVE PROPERTY TEAMS" label

**Mobile Requirements:**
- [ ] **SOCIAL-M01**: Maintain horizontal scroll but with mobile-friendly spacing
- [ ] **SOCIAL-M02**: Reduce logo sizes on mobile
- [ ] **SOCIAL-M03**: Adjust padding and gap between logos for mobile
- [ ] **SOCIAL-M04**: Label text: Smaller font size on mobile
- [ ] **SOCIAL-M05**: Ensure smooth scroll performance on touch devices

### 4. Features Component (`Features.tsx`)

**Current State:**
- 4 feature cards in LayoutGrid component
- Complex grid layout (2 large cards, 2 small cards)
- Different animation directions per card

**Mobile Requirements:**
- [ ] **FEAT-M01**: Stack all 4 cards vertically on mobile (< 640px)
- [ ] **FEAT-M02**: 2-column grid on tablet (640px-768px)
- [ ] **FEAT-M03**: Maintain 4-card grid on desktop (768px+)
- [ ] **FEAT-M04**: Adjust card heights for mobile (remove fixed aspect ratios)
- [ ] **FEAT-M05**: Simplify animations on mobile (reduce movement distance)
- [ ] **FEAT-M06**: Heading: Reduce font size (2xl on mobile, 4xl on desktop)
- [ ] **FEAT-M07**: Card content: Adjust padding and text sizes for mobile
- [ ] **FEAT-M08**: Ensure images scale properly within cards

### 5. Automation Component (`Automation.tsx`)

**Current State:**
- Grid layout with 5 provider cards + large video card
- Diagonal split background
- Complex grid positioning (video spans 2 columns × 2 rows)

**Mobile Requirements:**
- [ ] **AUTO-M01**: Stack all cards vertically on mobile (< 640px)
- [ ] **AUTO-M02**: Video card: Full width, reduced height on mobile
- [ ] **AUTO-M03**: 2-column grid on tablet (640px-768px)
- [ ] **AUTO-M04**: Maintain complex grid on desktop (768px+)
- [ ] **AUTO-M05**: Diagonal background: Adjust angle for mobile (less dramatic)
- [ ] **AUTO-M06**: Heading: Reduce font size (2xl on mobile, 4xl on desktop)
- [ ] **AUTO-M07**: Provider cards: Adjust padding and icon sizes for mobile
- [ ] **AUTO-M08**: Video: Ensure proper aspect ratio and playback on mobile
- [ ] **AUTO-M09**: Stagger animations differently for vertical layout

### 6. Stats Component (`Stats.tsx`)

**Current State:**
- 4 stats in horizontal grid
- Large numbers with labels

**Mobile Requirements:**
- [ ] **STATS-M01**: Stack stats vertically on small phones (< 640px)
- [ ] **STATS-M02**: 2x2 grid on tablet (640px-768px)
- [ ] **STATS-M03**: Maintain horizontal layout on desktop (768px+)
- [ ] **STATS-M04**: Reduce stat value font size on mobile
- [ ] **STATS-M05**: Adjust spacing and padding for mobile
- [ ] **STATS-M06**: Ensure numbers remain readable without truncation

### 7. CTA Component (`CTA.tsx`)

**Current State:**
- Centered heading and subheading
- Two action buttons side-by-side

**Mobile Requirements:**
- [ ] **CTA-M01**: Stack buttons vertically on mobile (< 640px)
- [ ] **CTA-M02**: Reduce heading font size (2xl on mobile, 4xl on desktop)
- [ ] **CTA-M03**: Adjust padding and spacing for mobile
- [ ] **CTA-M04**: Full-width buttons on mobile (with max-width constraint)
- [ ] **CTA-M05**: Maintain button sizing for touch targets (44px+ height)

### 8. Footer Component (`Footer.tsx`)

**Current State:**
- Multi-column layout (logo/tagline + Product + Solutions + Company + Legal)
- Social media links
- Copyright notice

**Mobile Requirements:**
- [ ] **FOOT-M01**: Stack all columns vertically on mobile (< 768px)
- [ ] **FOOT-M02**: Logo/tagline section full width on mobile
- [ ] **FOOT-M03**: Link columns: 2x2 grid on tablet, stacked on mobile
- [ ] **FOOT-M04**: Social icons: Horizontal row, centered on mobile
- [ ] **FOOT-M05**: Copyright: Centered on mobile
- [ ] **FOOT-M06**: Adjust font sizes and spacing for mobile
- [ ] **FOOT-M07**: Touch targets: 44px+ for all links and icons

## Technical Requirements

### Breakpoints

Use Tailwind's mobile-first breakpoints:
- **Base (< 640px)**: Small phones (320px-639px)
- **sm (640px+)**: Large phones
- **md (768px+)**: Tablets (preserve desktop layout here)
- **lg (1024px+)**: Desktop (existing styles)

### Touch Interactions

- [ ] **TOUCH-01**: All interactive elements: min-height 44px, min-width 44px
- [ ] **TOUCH-02**: Adequate spacing between touch targets (8px minimum)
- [ ] **TOUCH-03**: No hover-only interactions (use click/tap instead)
- [ ] **TOUCH-04**: Form inputs: Large enough for mobile keyboards

### Typography

- [ ] **TYPE-01**: Headings scale progressively across breakpoints
  - H1: text-3xl (mobile), text-4xl (sm), text-5xl (md+)
  - H2: text-2xl (mobile), text-3xl (sm), text-4xl (md+)
- [ ] **TYPE-02**: Body text: text-sm (mobile), text-base (sm+)
- [ ] **TYPE-03**: Line heights: Increased for better readability (1.6-1.8)
- [ ] **TYPE-04**: No text truncation or overflow on any viewport

### Layouts

- [ ] **LAYOUT-01**: Grid layouts: 1 column (mobile) → 2 columns (tablet) → 3-4 columns (desktop)
- [ ] **LAYOUT-02**: Flexbox: column direction on mobile, row on desktop
- [ ] **LAYOUT-03**: Padding: Reduced on mobile (px-4 instead of px-6)
- [ ] **LAYOUT-04**: Max-width containers: Full bleed on mobile, constrained on desktop

### Animations

- [ ] **ANIM-01**: Reduce animation distances on mobile (30px → 15px)
- [ ] **ANIM-02**: Adjust animation delays for stacked layouts
- [ ] **ANIM-03**: Consider prefers-reduced-motion for accessibility
- [ ] **ANIM-04**: Ensure animations don't cause layout shifts on mobile

### Performance

- [ ] **PERF-01**: Images: Responsive srcset for mobile optimization
- [ ] **PERF-02**: Video: Preload="metadata" on mobile to save bandwidth
- [ ] **PERF-03**: Fonts: Ensure proper loading on slow mobile connections
- [ ] **PERF-04**: No layout shifts during loading

## Testing Checklist

### Viewport Testing

- [ ] **TEST-V01**: 320px (iPhone SE, small phones)
- [ ] **TEST-V02**: 375px (iPhone 12/13/14)
- [ ] **TEST-V03**: 390px (iPhone 14 Pro)
- [ ] **TEST-V04**: 414px (iPhone 12 Pro Max)
- [ ] **TEST-V05**: 640px (large phones, small tablets)
- [ ] **TEST-V06**: 768px (iPad, tablet portrait)

### Device Testing

- [ ] **TEST-D01**: iOS Safari (iPhone)
- [ ] **TEST-D02**: Chrome Mobile (Android)
- [ ] **TEST-D03**: Firefox Mobile
- [ ] **TEST-D04**: Samsung Internet

### Orientation Testing

- [ ] **TEST-O01**: Portrait mode on all devices
- [ ] **TEST-O02**: Landscape mode on phones (optional, but test)

### Interaction Testing

- [ ] **TEST-I01**: Touch targets are easy to tap
- [ ] **TEST-I02**: Scrolling is smooth
- [ ] **TEST-I03**: Menus open/close correctly
- [ ] **TEST-I04**: Forms are usable with mobile keyboards
- [ ] **TEST-I05**: No horizontal scroll anywhere

### Content Testing

- [ ] **TEST-C01**: All text readable without zooming
- [ ] **TEST-C02**: No text overflow or truncation
- [ ] **TEST-C03**: Images load and scale properly
- [ ] **TEST-C04**: Videos play correctly on mobile
- [ ] **TEST-C05**: No content hidden off-screen

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Native mobile app functionality | MVP is web responsive only |
| Mobile-specific features (swipe gestures) | Beyond standard scrolling not needed |
| Performance optimization beyond basics | Focus is layout, not deep performance tuning |
| Desktop design changes | Goal is preserve desktop, only fix mobile |
| New content or features | Mobile responsive only, no new functionality |
| PWA features | Future milestone |

## Acceptance Criteria

**A component is considered "mobile responsive" when:**

1. ✅ It displays correctly on 320px viewport without horizontal scroll
2. ✅ All text is readable without zooming
3. ✅ All interactive elements have 44px+ touch targets
4. ✅ Layout adapts appropriately at 640px and 768px breakpoints
5. ✅ Animations work smoothly on mobile
6. ✅ Desktop experience (768px+) is unchanged
7. ✅ No console errors or warnings on mobile devices

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

*To be populated during roadmap creation*

---
*Requirements defined: 2026-01-27*
*Last updated: 2026-01-27*
