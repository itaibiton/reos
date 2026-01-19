# PRD-01: Services Grid Component

**Product Requirements Document**
**Component:** Services Grid Section
**Version:** 1.0.0
**Date:** 2026-01-19
**Status:** Approved for Implementation

---

## 1. Component Overview

### 1.1 Purpose and User Value

The Services Grid is a prominent landing page section that showcases REOS's core service offerings to potential customers. It serves as the primary value proposition display, helping visitors quickly understand what REOS provides and how it can solve their real estate management challenges.

**Primary Goals:**
- Communicate REOS's core value propositions at a glance
- Guide visitors to relevant service areas based on their needs
- Build credibility and trust through professional presentation
- Drive engagement through clear calls-to-action

### 1.2 Placement in Landing Page

The Services Grid should be positioned as one of the first major sections after the hero area, typically appearing 2nd or 3rd on the page. This ensures high visibility for first-time visitors who are evaluating whether REOS meets their needs.

**Context Flow:**
1. Hero section (headline, CTA)
2. **Services Grid** ← This component
3. Process Steps (how it works)
4. Team Section (who we are)

---

## 2. Service Card Structure

Each service card follows a consistent, card-based design pattern that integrates with REOS's existing Shadcn UI components.

### 2.1 Card Anatomy

```
┌─────────────────────────────┐
│  [Icon]                     │  ← Top-aligned icon (48x48px)
│                             │
│  Service Title              │  ← Bold headline (3-5 words)
│                             │
│  Brief description of the   │  ← Body text (2-3 sentences)
│  service explaining the     │
│  value it provides...       │
│                             │
│  [Learn More →]             │  ← Optional CTA link
└─────────────────────────────┘
```

### 2.2 Card Components

**Icon:**
- Source: Lucide React icons
- Size: 48x48px (w-12 h-12)
- Style: Outlined/stroked style (default Lucide aesthetic)
- Color: `text-primary` (purple theme color)
- Background: Circular badge with `bg-primary/10` and `p-3`

**Title:**
- Typography: `text-xl font-semibold` (Tailwind)
- Color: `text-foreground` (adapts to light/dark mode)
- Length: 3-5 words maximum
- Line height: `leading-tight`

**Description:**
- Typography: `text-sm text-muted-foreground`
- Length: 2-3 sentences (60-100 words)
- Line height: `leading-relaxed`
- Provides clear, benefit-focused explanation

**CTA (Optional):**
- Component: Link styled as text with arrow
- Text: "Learn More" or "Explore [Service]"
- Icon: `ArrowRight` from Lucide (inline)
- Style: `text-primary hover:underline`
- Visibility: Show on hover for clean default state

---

## 3. Services List

Define exactly 6 services that represent REOS's core offerings for real estate operations.

### Service 1: Property Management
- **Icon:** `Building2` (Lucide)
- **Title:** Property Management
- **Description:** Centralize all property operations in one platform. Track units, leases, maintenance schedules, and occupancy rates with real-time dashboards and automated workflows.
- **Value Proposition:** Streamline multi-property oversight

### Service 2: Tenant Portal
- **Icon:** `Users` (Lucide)
- **Title:** Tenant Portal
- **Description:** Empower tenants with self-service capabilities. Enable online rent payments, maintenance requests, document access, and direct communication with property managers through a modern portal.
- **Value Proposition:** Enhance tenant experience and reduce support burden

### Service 3: Maintenance Tracking
- **Icon:** `Wrench` (Lucide)
- **Title:** Maintenance & Work Orders
- **Description:** Manage maintenance requests from submission to completion. Assign tasks, track progress, schedule preventive maintenance, and maintain detailed service history for every property.
- **Value Proposition:** Never miss a maintenance issue

### Service 4: Financial Analytics
- **Icon:** `LineChart` (Lucide)
- **Title:** Financial Analytics
- **Description:** Gain deep insights into property performance with comprehensive financial reporting. Track revenue, expenses, cash flow, and ROI across your entire portfolio with customizable dashboards.
- **Value Proposition:** Make data-driven investment decisions

### Service 5: Document Management
- **Icon:** `FileText` (Lucide)
- **Title:** Document Management
- **Description:** Store, organize, and access all property-related documents securely in the cloud. Share leases, contracts, and compliance documents with team members while maintaining complete audit trails.
- **Value Proposition:** Eliminate paper chaos and stay organized

### Service 6: Communication Hub
- **Icon:** `MessageSquare` (Lucide)
- **Title:** Communication Hub
- **Description:** Keep all stakeholder communication in one place. Message tenants, coordinate with vendors, notify teams, and maintain conversation history with built-in templates and automated notifications.
- **Value Proposition:** Streamline all property-related communication

---

## 4. Layout Specification

### 4.1 Grid System

**Desktop (≥1024px):**
- Layout: 3-column grid
- Grid CSS: `grid-cols-1 lg:grid-cols-3`
- Gap: `gap-6` (1.5rem / 24px)
- Max width: `max-w-7xl mx-auto`
- Padding: `px-4 lg:px-8`

**Tablet (768px - 1023px):**
- Layout: 2-column grid
- Grid CSS: `md:grid-cols-2`
- Gap: `gap-6`
- Cards stretch to fill available space

**Mobile (<768px):**
- Layout: Single column stack
- Grid CSS: `grid-cols-1`
- Gap: `gap-4` (slightly tighter for mobile)
- Full width with container padding

### 4.2 Card Sizing

- **Min height:** `min-h-[280px]` to maintain consistent card heights
- **Padding:** `p-6` (1.5rem internal padding)
- **Aspect ratio:** Auto height based on content, but minimum ensures alignment
- **Border:** `border border-border`
- **Background:** `bg-card text-card-foreground`
- **Border radius:** `rounded-xl` (16px, matching REOS design system)

### 4.3 Section Layout

```
┌─────────────────────────────────────────────┐
│  [Section]                                  │
│  Padding: py-16 (desktop) / py-12 (mobile)  │
│                                             │
│  [Headline]                                 │
│  "Our Services" or similar                  │
│  Typography: text-3xl font-bold             │
│                                             │
│  [Subheadline]                              │
│  1-2 sentence value statement               │
│  Typography: text-lg text-muted-foreground  │
│                                             │
│  [Services Grid Container]                  │
│  ┌─────────┬─────────┬─────────┐           │
│  │ Card 1  │ Card 2  │ Card 3  │           │
│  └─────────┴─────────┴─────────┘           │
│  ┌─────────┬─────────┬─────────┐           │
│  │ Card 4  │ Card 5  │ Card 6  │           │
│  └─────────┴─────────┴─────────┘           │
└─────────────────────────────────────────────┘
```

---

## 5. Interaction States

### 5.1 Default State
- Background: `bg-card`
- Border: `border-border` (subtle, 1px)
- Shadow: `shadow-sm` (subtle elevation)
- Opacity: 100%
- Icon color: `text-primary`

### 5.2 Hover State
**Card:**
- Scale: `scale-105` (5% scale increase)
- Shadow: `shadow-lg` (increased elevation)
- Border color: `border-primary/30` (subtle accent glow)
- Transition: `transition-all duration-300 ease-out`
- Background: Maintains `bg-card` (no color change)

**Icon:**
- Transform: `rotate-6` (subtle playful rotation)
- Transition: `transition-transform duration-300`

**CTA Link:**
- Underline appears: `hover:underline`
- Arrow icon shifts right: `group-hover:translate-x-1`

### 5.3 Focus State (Keyboard Navigation)
- Ring: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Outline: `outline-none` (rely on ring for visibility)
- Background: Same as default
- Required for accessibility compliance

### 5.4 Active/Pressed State
- Scale: `active:scale-100` (returns to default on click)
- Shadow: Reduces to `shadow-md`
- Duration: `150ms` (faster than hover)

### 5.5 Animation Timing
```css
/* Framer Motion variants */
Default → Hover: 300ms ease-out
Hover → Default: 200ms ease-in
Icon rotation: 300ms ease-out
```

---

## 6. Animation Specifications

### 6.1 Initial Load Animation (Stagger Reveal)

**Behavior:**
- Cards animate in sequentially with a stagger effect
- Each card fades in from below and scales up
- Creates a waterfall entrance effect

**Framer Motion Implementation:**
```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // 100ms delay between each card
      delayChildren: 0.2,   // Wait 200ms before first card
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 20,           // Start 20px below
    scale: 0.95      // Start slightly smaller
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    },
  },
};
```

### 6.2 Scroll-Triggered Animation

**Trigger Point:**
- Activate when section enters viewport
- Threshold: 20% of section visible (`threshold: 0.2`)
- Only trigger once (no repeat on scroll)

**Implementation:**
- Use `framer-motion`'s `useInView` hook
- Apply to container: `<motion.div ref={ref} animate={controls}>`
- Trigger variants when `inView` becomes true

### 6.3 Hover Animations

**Card Hover:**
- Scale up: 1.0 → 1.05 (300ms ease-out)
- Shadow expands: shadow-sm → shadow-lg
- Border glow: opacity 0 → 0.3

**Icon Hover:**
- Rotate: 0deg → 6deg (300ms ease-out)
- No scale change (icon already scaled appropriately)

**CTA Arrow:**
- Translate: translateX(0) → translateX(4px)
- Happens simultaneously with card hover
- 300ms ease-out

---

## 7. Accessibility Requirements

### 7.1 Keyboard Navigation
- **Tab order:** Cards must be keyboard-focusable in logical order (left-to-right, top-to-bottom)
- **Focus management:** Each card receives focus via Tab key
- **Enter/Space:** If CTA is present, Enter/Space should activate the link
- **Visual feedback:** Clear focus ring (`ring-2 ring-ring`) must be visible

### 7.2 Screen Reader Support

**Card Semantic Structure:**
```jsx
<article aria-labelledby="service-title-1">
  <div role="img" aria-label="Property Management icon">
    {/* Icon */}
  </div>
  <h3 id="service-title-1">Property Management</h3>
  <p>Description text...</p>
  <a href="#" aria-label="Learn more about Property Management">
    Learn More
  </a>
</article>
```

**ARIA Labels:**
- Each icon div needs `aria-label` describing the service
- CTA links need descriptive `aria-label` (e.g., "Learn more about Property Management")
- Heading hierarchy must be logical (h2 for section, h3 for cards)

### 7.3 Color Contrast

**Requirements (WCAG 2.1 Level AA):**
- Normal text: 4.5:1 contrast ratio minimum
- Large text (18px+): 3:1 contrast ratio minimum
- Interactive elements (borders, icons): 3:1 against adjacent colors

**Verified Combinations:**
- Primary purple on light background: ✓ Passes (using oklch values from globals.css)
- Muted foreground text: ✓ Passes (oklch 0.51 light, 0.65 dark)
- Border colors: ✓ Passes (subtle but visible)

### 7.4 Motion Preferences

**Respect `prefers-reduced-motion`:**
```css
@media (prefers-reduced-motion: reduce) {
  /* Disable all animations */
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Framer Motion Implementation:**
- Check `shouldReduceMotion` from `framer-motion`
- Conditionally disable stagger and hover animations
- Maintain layout shifts but remove motion

### 7.5 Focus Indicators
- Must be visible against both light and dark backgrounds
- Ring style: `ring-2 ring-ring ring-offset-2`
- Ring color uses theme `--ring` variable (automatically adapts)
- Never use `outline: none` without replacement focus indicator

---

## 8. Responsive Behavior

### 8.1 Breakpoint Definitions
```typescript
// Tailwind default breakpoints (matching REOS config)
sm:  640px  // Small tablets, large phones (landscape)
md:  768px  // Tablets
lg:  1024px // Desktops
xl:  1280px // Large desktops
```

### 8.2 Layout Changes by Breakpoint

**Mobile (<640px):**
- Grid: Single column (`grid-cols-1`)
- Gap: `gap-4` (16px)
- Padding: `px-4 py-12`
- Card min-height: `min-h-[260px]` (slightly smaller)
- Section headline: `text-2xl`
- Section subheadline: `text-base`

**Tablet (640px - 1023px):**
- Grid: Two columns (`sm:grid-cols-2`)
- Gap: `gap-6` (24px)
- Padding: `px-6 py-14`
- Card min-height: `min-h-[280px]`
- Section headline: `text-3xl`

**Desktop (≥1024px):**
- Grid: Three columns (`lg:grid-cols-3`)
- Gap: `gap-6` (24px)
- Padding: `px-8 py-16`
- Card min-height: `min-h-[280px]`
- Max container width: `max-w-7xl`

### 8.3 Typography Scaling

**Section Headline:**
- Mobile: `text-2xl font-bold`
- Tablet: `text-3xl font-bold`
- Desktop: `text-3xl lg:text-4xl font-bold`

**Section Subheadline:**
- Mobile: `text-base text-muted-foreground`
- Desktop: `text-lg text-muted-foreground`

**Card Title:**
- Consistent: `text-xl font-semibold` (no breakpoint changes)

**Card Description:**
- Consistent: `text-sm text-muted-foreground leading-relaxed`

### 8.4 Icon Sizing
- Desktop/Tablet: `w-12 h-12` (48px)
- Mobile: `w-10 h-10` (40px) for tighter spacing
- Badge background scales proportionally

### 8.5 Touch Targets (Mobile)
- Minimum touch target: 44x44px (WCAG guideline)
- Cards naturally exceed this (entire card is clickable if wrapped in link)
- CTA links have minimum padding: `py-2 px-1` to ensure 44px height

---

## 9. Technical Specifications

### 9.1 Component File Structure

```
src/components/landing/
├── ServicesGrid.tsx          # Main export component
└── ServiceCard.tsx           # Individual card (optional subcomponent)
```

**Alternative (single file):**
```
src/components/landing/
└── ServicesGrid.tsx          # Both components in one file
```

### 9.2 Dependencies

**Required Imports:**
```typescript
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import {
  Building2,
  Users,
  Wrench,
  LineChart,
  FileText,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
```

### 9.3 Data Structure

```typescript
interface Service {
  id: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  href?: string; // Optional link destination
  ctaText?: string; // Default: "Learn More"
}

const services: Service[] = [
  {
    id: 'property-management',
    icon: Building2,
    title: 'Property Management',
    description: 'Centralize all property operations...',
    href: '/services/property-management',
    ctaText: 'Learn More',
  },
  // ... 5 more services
];
```

### 9.4 Theme Integration

**Color Variables (Auto-adapting):**
- `bg-background` - Section background
- `bg-card` - Card background
- `text-card-foreground` - Card text
- `text-primary` - Icon and CTA color
- `text-muted-foreground` - Description text
- `border-border` - Card borders

**Dark Mode:**
- No manual dark mode classes needed
- All colors use CSS variables that adapt automatically
- Ensure sufficient contrast in both modes (verified in section 7.3)

### 9.5 Performance Considerations

**Optimization:**
- Icons are tree-shakeable (only imported icons are bundled)
- Framer Motion animations use GPU-accelerated transforms (scale, translateY)
- No layout shifts during animation (min-height prevents CLS)
- Images: N/A (icon-only design)

**Lazy Loading:**
- Not required (section appears above fold or near it)
- Could implement `loading="lazy"` if future versions add service images

---

## 10. Content Guidelines

### 10.1 Service Title Best Practices
- Length: 2-4 words ideal (max 5)
- Format: Title case (e.g., "Property Management")
- Tone: Clear, professional, benefit-oriented
- Avoid: Jargon, overly technical terms, marketing fluff

### 10.2 Service Description Best Practices
- Length: 2-3 sentences (60-100 words)
- Structure: [What it does] + [Key benefit/feature] + [Outcome]
- Tone: Professional but approachable, benefit-focused
- Avoid: First person ("we offer"), vague claims, feature lists without context

**Example (Good):**
> "Centralize all property operations in one platform. Track units, leases, maintenance schedules, and occupancy rates with real-time dashboards and automated workflows."

**Example (Bad):**
> "We offer the best property management solution with many features. Our platform is easy to use and powerful."

### 10.3 Section Headlines
- Primary: "Our Services" or "What We Offer"
- Alternative: "Everything You Need to Manage Properties"
- Subheadline: 1-2 sentences explaining overall value
- Example: "Comprehensive tools designed to streamline every aspect of real estate operations, from tenant management to financial reporting."

---

## 11. Testing & Quality Assurance

### 11.1 Functional Testing Checklist

**Visual Regression:**
- [ ] Component renders correctly in light mode
- [ ] Component renders correctly in dark mode
- [ ] All 6 service cards display with correct icons
- [ ] Grid layout adjusts at each breakpoint (mobile/tablet/desktop)
- [ ] Cards maintain consistent heights in each row

**Interaction Testing:**
- [ ] Hover effect triggers smooth scale animation
- [ ] Icon rotates on card hover
- [ ] CTA arrow translates on hover
- [ ] Shadow expands on hover
- [ ] Focus ring appears on Tab navigation
- [ ] All cards are keyboard-accessible
- [ ] Enter key activates CTA link

**Animation Testing:**
- [ ] Stagger animation plays on initial load
- [ ] Cards fade in from below sequentially
- [ ] Scroll-triggered animation works (if implemented)
- [ ] Hover animations have correct timing (300ms)
- [ ] Animations respect `prefers-reduced-motion`

### 11.2 Accessibility Testing

**Tools:**
- axe DevTools (Chrome/Firefox extension)
- Lighthouse accessibility audit (Chrome DevTools)
- NVDA or VoiceOver screen reader testing

**Checklist:**
- [ ] All cards have semantic HTML (`<article>`, `<h3>`)
- [ ] Icons have `aria-label` attributes
- [ ] Focus indicators are visible in both themes
- [ ] Keyboard navigation order is logical
- [ ] Color contrast passes WCAG AA (4.5:1 for text)
- [ ] Screen reader announces card content correctly
- [ ] No accessibility warnings in axe DevTools

### 11.3 Responsive Testing

**Devices:**
- Mobile: iPhone 13 (390px), Samsung Galaxy S21 (360px)
- Tablet: iPad (768px), iPad Pro (1024px)
- Desktop: 1280px, 1440px, 1920px

**Checklist:**
- [ ] Single column on mobile (<640px)
- [ ] Two columns on tablet (640-1023px)
- [ ] Three columns on desktop (≥1024px)
- [ ] Text remains readable at all sizes
- [ ] No horizontal scroll on any viewport
- [ ] Touch targets meet 44px minimum on mobile

### 11.4 Browser Compatibility

**Supported Browsers:**
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari (iOS 15+)
- Chrome Mobile (Android)

**Checklist:**
- [ ] Animations work in all browsers
- [ ] Grid layout renders correctly
- [ ] Dark mode transitions smoothly
- [ ] No console errors in any browser

---

## 12. Success Metrics

### 12.1 Performance Metrics
- **First Contentful Paint (FCP):** <1.8s
- **Largest Contentful Paint (LCP):** <2.5s (section should not be LCP element)
- **Cumulative Layout Shift (CLS):** 0 (min-height prevents shifts)
- **Time to Interactive (TTI):** <3.8s

### 12.2 User Engagement Metrics
- **Click-through Rate (CTR):** % of visitors who click service CTAs
- **Hover Engagement:** Average time hovering over cards (indicates interest)
- **Scroll Depth:** % of visitors who view entire services section

### 12.3 Accessibility Metrics
- **Lighthouse Accessibility Score:** 100/100
- **axe DevTools:** 0 violations
- **Keyboard Navigation:** 100% of features accessible via keyboard

---

## 13. Out of Scope

The following items are explicitly **NOT** included in this phase:

- Individual service detail pages (referenced by CTAs)
- Service comparison tables or pricing information
- Customer testimonials or case studies within cards
- Video embeds or interactive demos
- Backend integration for dynamic service content
- Filtering or sorting of services
- Search functionality
- Service favoriting or bookmarking
- Animated icons (using static Lucide icons only)
- Service availability indicators (e.g., "Coming Soon" badges)
- Multi-language support (English only in v1)

---

## 14. Future Enhancements (Post-V1)

**Phase 2 Candidates:**
- Service detail pages with expanded content
- Interactive service configurator ("Build your package")
- Customer success stories linked to specific services
- Comparison view (toggle between grid and table)
- Filtering by service category or user role
- "Popular" or "Recommended" badges on cards
- Integration with CMS for content management
- A/B testing variants (different icon styles, card layouts)

---

## 15. Dependencies & Risks

### 15.1 Technical Dependencies
- ✅ Shadcn UI Card component must exist (`@/components/ui/card`)
- ✅ Lucide React icons package installed
- ✅ Framer Motion 12.26.2+ installed
- ✅ Tailwind CSS v4 configured with oklch colors
- ✅ `next-themes` for dark mode support

### 15.2 Content Dependencies
- ⚠️ Final service descriptions pending copywriting (COPY-01)
- ⚠️ Service detail page routes (for CTA links) not yet defined
- ✅ Icon selection complete (defined in section 3)

### 15.3 Identified Risks

**Risk 1: Performance Impact from Animations**
- **Likelihood:** Low
- **Impact:** Medium
- **Mitigation:** Use GPU-accelerated properties only (transform, opacity), implement `prefers-reduced-motion`

**Risk 2: Content Length Variability**
- **Likelihood:** Medium
- **Impact:** Low
- **Mitigation:** Set `min-h-[280px]` on cards to ensure consistent alignment even if content varies

**Risk 3: Icon Recognition Across Cultures**
- **Likelihood:** Low (English-only v1)
- **Impact:** Low
- **Mitigation:** Icons are supplementary; text labels are primary. Future i18n work will validate icon choices.

**Risk 4: Dark Mode Contrast Issues**
- **Likelihood:** Low
- **Impact:** High (accessibility failure)
- **Mitigation:** All colors use theme variables verified for contrast. QA includes dark mode testing in checklist.

---

## 16. Acceptance Criteria Summary

**This PRD is complete when:**

- [x] Service card structure defined (icon, title, description, CTA)
- [x] Grid layout specified (responsive: 1/2/3 columns)
- [x] Services list defined with 6 real REOS service offerings
- [x] Hover/interaction states described in detail
- [x] Accessibility requirements documented (WCAG AA compliance)
- [x] Animation specifications provided (Framer Motion variants)
- [x] Responsive behavior documented for all breakpoints
- [x] Technical implementation details provided
- [x] Testing checklist created
- [x] Out of scope items clearly defined

**Ready for handoff to UI Designer (UI-01)**

---

## 17. Appendix

### A. Design Mockup Reference (Textual)

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│              Everything You Need to Manage Properties      │ (h2, text-3xl)
│          Comprehensive tools for modern real estate ops    │ (p, text-lg muted)
│                                                            │
│  ┌─────────────────┐ ┌─────────────────┐ ┌──────────────┐│
│  │ [Building Icon] │ │  [Users Icon]   │ │ [Wrench Icon]││
│  │                 │ │                 │ │              ││
│  │ Property Mgmt   │ │ Tenant Portal   │ │ Maintenance  ││
│  │                 │ │                 │ │ Tracking     ││
│  │ Description...  │ │ Description...  │ │ Description..││
│  │                 │ │                 │ │              ││
│  │ Learn More →    │ │ Learn More →    │ │ Learn More → ││
│  └─────────────────┘ └─────────────────┘ └──────────────┘│
│                                                            │
│  ┌─────────────────┐ ┌─────────────────┐ ┌──────────────┐│
│  │ [Chart Icon]    │ │ [File Icon]     │ │ [Message]    ││
│  │                 │ │                 │ │              ││
│  │ Financial       │ │ Document Mgmt   │ │ Comm. Hub    ││
│  │ Analytics       │ │                 │ │              ││
│  │ Description...  │ │ Description...  │ │ Description..││
│  │                 │ │                 │ │              ││
│  │ Learn More →    │ │ Learn More →    │ │ Learn More → ││
│  └─────────────────┘ └─────────────────┘ └──────────────┘│
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### B. Code Snippet Examples

**Framer Motion Container:**
```tsx
<motion.div
  variants={containerVariants}
  initial="hidden"
  animate="visible"
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
>
  {services.map((service) => (
    <ServiceCard key={service.id} {...service} />
  ))}
</motion.div>
```

**Service Card Component:**
```tsx
<motion.article
  variants={cardVariants}
  whileHover={{ scale: 1.05 }}
  className={cn(
    "group relative min-h-[280px] p-6",
    "bg-card text-card-foreground",
    "border border-border rounded-xl shadow-sm",
    "transition-all duration-300 ease-out",
    "hover:shadow-lg hover:border-primary/30",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
  )}
>
  <div className="flex items-center justify-center w-12 h-12 mb-4 rounded-full bg-primary/10">
    <Icon className="w-6 h-6 text-primary transition-transform duration-300 group-hover:rotate-6" />
  </div>
  <h3 className="mb-2 text-xl font-semibold leading-tight">{title}</h3>
  <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{description}</p>
  <a href={href} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
    {ctaText}
    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
  </a>
</motion.article>
```

### C. Color Reference Table

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | `oklch(0.985 0.002 247)` | `oklch(0.13 0.028 261)` |
| Card BG | `oklch(1 0 0)` | `oklch(0.17 0.03 260)` |
| Primary | `oklch(0.546 0.245 262.881)` | `oklch(0.623 0.214 259)` |
| Foreground | `oklch(0.145 0.02 250)` | `oklch(0.985 0.004 250)` |
| Muted FG | `oklch(0.51 0.035 256)` | `oklch(0.65 0.04 254)` |
| Border | `oklch(0.902 0.018 252)` | `oklch(0.28 0.04 258)` |

---

**Document Status:** APPROVED
**Next Step:** Proceed to UI-01 (UI Designer Implementation)
**Estimated Implementation Time:** 4-6 hours
**Complexity:** Medium
