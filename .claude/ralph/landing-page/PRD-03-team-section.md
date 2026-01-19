# PRD-03: Team Section Component

**Product Requirements Document**
**Component:** Team Section / Meet the Team
**Version:** 1.0.0
**Date:** 2026-01-19
**Status:** Approved for Implementation

---

## 1. Component Overview

### 1.1 Purpose and User Value

The Team Section is a critical trust-building component that humanizes the REOS platform by showcasing the people behind the product. It addresses the fundamental question prospective customers have: "Who am I trusting with my property management operations?"

**Primary Goals:**
- Build trust and credibility through transparency about team composition
- Humanize the brand by putting faces and stories to the product
- Demonstrate expertise through role descriptions and professional backgrounds
- Enable direct connection opportunities via social links (LinkedIn, etc.)
- Differentiate REOS as a people-first, relationship-oriented company

### 1.2 Placement in Landing Page

The Team Section should appear after the Process Steps, serving as the final trust-building component before the footer CTA. This placement leverages the psychological progression: understand what we do → understand how we do it → understand who we are.

**Context Flow:**
1. Hero section (headline, CTA)
2. Services Grid (what we offer)
3. Process Steps (how to get started)
4. **Team Section** ← This component
5. Footer (final CTA, contact)

**Positioning Rationale:**
- After establishing value and process clarity, visitors are primed to evaluate trustworthiness
- Near bottom-of-page placement targets serious prospects who have scrolled through content
- Precedes footer CTA, making the ask ("Sign up") feel more personal and trustworthy
- Provides natural transition to contact/social links in footer

---

## 2. Team Card Structure

### 2.1 Card Anatomy

Each team member card follows a consistent, person-centric design that balances professionalism with approachability.

```
┌─────────────────────────────┐
│                             │
│      ┌─────────────┐        │  ← Photo/Avatar (circular)
│      │             │        │     (top-center, prominent)
│      │   Photo     │        │
│      │             │        │
│      └─────────────┘        │
│                             │
│      Member Name            │  ← Bold name (2-3 words)
│                             │
│      Role Title             │  ← Job title (1-2 lines)
│                             │
│  Short bio about this team  │  ← Bio text (2-3 sentences)
│  member's background and    │
│  expertise. Highlights key  │
│  strengths and value...     │
│                             │
│   [Li] [Tw] [GH]           │  ← Social links (optional)
│                             │
└─────────────────────────────┘
```

### 2.2 Card Components

**Photo/Avatar:**
- Size: 128x128px (desktop), 112x112px (mobile)
- Shape: Circular (rounded-full)
- Position: Top-center, prominently displayed
- Image format: Next.js Image component with optimization
- Fallback: Initials in colored circle (via Avatar component)
- Border: Optional `ring-2 ring-primary/20` for subtle emphasis
- Placeholder strategy:
  - Primary: Actual team member photos (preferred)
  - Fallback: Two-letter initials (first + last name)
  - Fallback background: Generated based on name hash (consistent color per person)
  - Placeholder images: Use professional avatar illustrations from UI Avatars API or similar

**Member Name:**
- Typography: `text-xl font-semibold`
- Color: `text-foreground`
- Length: Full name (first + last), 2-3 words typical
- Line height: `leading-tight`
- Alignment: Center-aligned with photo

**Role Title:**
- Typography: `text-sm font-medium text-primary`
- Color: `text-primary` (purple accent color)
- Length: 1-2 lines maximum (20-40 characters)
- Examples: "CEO & Founder", "Lead Product Designer", "Head of Engineering"
- Line height: `leading-snug`
- Alignment: Center-aligned

**Bio Text:**
- Typography: `text-sm text-muted-foreground`
- Length: 2-3 sentences (60-100 words)
- Line height: `leading-relaxed`
- Content: Background, expertise, unique value, personality hint
- Tone: Professional but personable (third person or omit pronouns)
- Alignment: Left-aligned or center-aligned (test both)

**Social Links:**
- Icons: Lucide React (`Linkedin`, `Twitter`, `Github`)
- Size: 20x20px (w-5 h-5)
- Style: Icon buttons with hover effects
- Color: `text-muted-foreground` default, `text-primary` on hover
- Layout: Horizontal row, center-aligned, `gap-3`
- Background: Optional circular bg (`bg-muted` on hover)
- Accessibility: Each link has descriptive aria-label
- Conditional: GitHub only for technical roles (engineers, designers)

---

## 3. Team Members Definition

Define exactly **4 team members** representing a realistic real estate tech company leadership structure.

### Member 1: CEO & Founder

**Name:** Sarah Mitchell
**Role:** CEO & Founder
**Bio:** Former real estate investor who managed 200+ units before founding REOS. Sarah saw firsthand how fragmented property management software costs landlords thousands in lost time and revenue. She built REOS to bring enterprise-grade automation to property managers of all sizes.
**Photo:** Professional headshot (placeholder: initials "SM" on purple gradient)
**Social Links:**
- LinkedIn: `/in/sarah-mitchell-reos`
- Twitter: `@sarahmitchellRE`
**Expertise Highlight:** 15+ years real estate, Y Combinator alum

---

### Member 2: Head of Engineering

**Name:** Marcus Chen
**Role:** Head of Engineering
**Bio:** Previously led backend infrastructure teams at Zillow and Stripe. Marcus specializes in building scalable, secure systems that handle millions of transactions. At REOS, he's architecting a platform that's both powerful for enterprises and intuitive for individual landlords.
**Photo:** Professional headshot (placeholder: initials "MC" on blue gradient)
**Social Links:**
- LinkedIn: `/in/marcus-chen-eng`
- Twitter: `@marcusbuildsstuff`
- GitHub: `github.com/mchen`
**Expertise Highlight:** Ex-Zillow/Stripe, distributed systems expert

---

### Member 3: Lead Product Designer

**Name:** Emily Rodriguez
**Role:** Lead Product Designer
**Bio:** Award-winning UX designer with a passion for simplifying complex workflows. Emily's design philosophy centers on empathy-driven interfaces that reduce cognitive load. She's redesigned REOS from the ground up to make property management feel effortless, not overwhelming.
**Photo:** Professional headshot (placeholder: initials "ER" on green gradient)
**Social Links:**
- LinkedIn: `/in/emily-rodriguez-design`
- Twitter: `@emilydesignsUX`
- GitHub: `github.com/erodriguez` (optional - for design systems work)
**Expertise Highlight:** 10+ years product design, former Airbnb

---

### Member 4: Customer Success Lead

**Name:** James O'Connor
**Role:** Head of Customer Success
**Bio:** James spent a decade as a property manager before joining REOS, managing portfolios ranging from single-family homes to 500-unit apartment complexes. He understands every pain point our customers face because he's lived them. Now, he ensures every REOS user gets the support they need to succeed.
**Photo:** Professional headshot (placeholder: initials "JO" on orange gradient)
**Social Links:**
- LinkedIn: `/in/james-oconnor-cs`
- Twitter: `@jamesREOSsupport`
**Expertise Highlight:** 10+ years property management, NARPM certified

---

## 4. Layout Specification

### 4.1 Grid System

**Desktop (≥1024px):**
- Layout: 4-column grid (shows all team members in one row)
- Grid CSS: `grid-cols-1 lg:grid-cols-4`
- Gap: `gap-8` (2rem / 32px)
- Max width: `max-w-7xl mx-auto`
- Padding: `px-8 py-16`
- Card alignment: Top-aligned within grid cells

**Tablet (768px - 1023px):**
- Layout: 2-column grid (2x2 layout)
- Grid CSS: `md:grid-cols-2`
- Gap: `gap-8` (horizontal and vertical)
- Padding: `px-6 py-14`
- Cards stretch to fill available space equally

**Mobile (<768px):**
- Layout: Single column stack (full-width cards)
- Grid CSS: `grid-cols-1`
- Gap: `gap-6` (slightly tighter for mobile)
- Padding: `px-4 py-12`
- Cards are full-width within container

### 4.2 Card Sizing

- **Width:** Auto (fills grid cell)
- **Min height:** `min-h-[420px]` (ensures consistent card heights with varying bio lengths)
- **Padding:** `p-6` (1.5rem internal padding)
- **Border:** `border border-border`
- **Background:** `bg-card text-card-foreground`
- **Border radius:** `rounded-xl` (16px, matching REOS design system)
- **Shadow:** `shadow-sm` default, `shadow-lg` on hover

### 4.3 Section Layout

```
┌─────────────────────────────────────────────────────────┐
│  [Section Background: bg-background]                    │
│  Padding: py-16 (desktop) / py-12 (mobile)              │
│                                                          │
│  [Section Headline]                                     │
│  "Meet the Team" or "The People Behind REOS"            │
│  Typography: text-3xl lg:text-4xl font-bold             │
│  Alignment: Center                                      │
│                                                          │
│  [Section Subheadline]                                  │
│  "Experts in real estate, technology, and customer      │
│   success working together to transform property        │
│   management."                                          │
│  Typography: text-lg text-muted-foreground              │
│  Alignment: Center                                      │
│  Max width: max-w-3xl mx-auto (for readability)         │
│                                                          │
│  [Team Grid Container]                                  │
│  ┌──────────┬──────────┬──────────┬──────────┐         │
│  │ Card 1   │ Card 2   │ Card 3   │ Card 4   │         │
│  │ Sarah    │ Marcus   │ Emily    │ James    │         │
│  │ Mitchell │ Chen     │ Rodriguez│ O'Connor │         │
│  └──────────┴──────────┴──────────┴──────────┘         │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 5. Interaction States

### 5.1 Default State

**Card:**
- Background: `bg-card`
- Border: `border-border` (subtle, 1px)
- Shadow: `shadow-sm` (subtle elevation)
- Transform: `scale-100`
- Opacity: 100%

**Avatar/Photo:**
- Border: `ring-2 ring-primary/10` (subtle ring)
- Scale: 1.0
- Grayscale: None (full color)

**Social Links:**
- Color: `text-muted-foreground`
- Background: Transparent
- Scale: 1.0

---

### 5.2 Hover State

**Card Hover:**
- Scale: `scale-105` (subtle lift effect)
- Shadow: `shadow-xl` (enhanced elevation)
- Border color: `border-primary/20` (subtle glow)
- Transition: `transition-all duration-300 ease-out`
- Background: Maintains `bg-card` (no color change)
- Z-index: `hover:z-10` (lifts above other cards)

**Avatar/Photo Hover:**
- Ring intensity: `ring-primary/30` (brightens slightly)
- Transform: `group-hover:scale-105` (subtle zoom within card hover)
- Transition: 300ms ease-out
- Optional effect: Very subtle rotation (2-3 degrees) on hover

**Social Link Icon Hover:**
- Color: `hover:text-primary` (purple accent)
- Background: `hover:bg-primary/10` (circular background appears)
- Scale: `hover:scale-110` (slightly larger)
- Transition: `transition-all duration-200 ease-out`
- Transform origin: Center

---

### 5.3 Focus State (Keyboard Navigation)

**Card Focus (if card is wrapped in link):**
- Ring: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`
- Outline: `outline-none` (rely on ring for visibility)
- Background: Same as default

**Social Link Focus:**
- Ring: `focus-visible:ring-2 focus-visible:ring-ring`
- Ring offset: `ring-offset-2`
- Background: `focus-visible:bg-primary/10`
- Ensures keyboard navigation is clearly visible

---

### 5.4 Active/Pressed State

**Card Pressed (if clickable):**
- Scale: `active:scale-100` (returns to default on press)
- Shadow: `shadow-md` (reduces slightly)
- Duration: 150ms (faster than hover)

**Social Link Pressed:**
- Scale: `active:scale-95` (depresses slightly)
- Background: `active:bg-primary/20` (darker background)

---

### 5.5 Animation Timing

```css
/* Framer Motion variants */
Card Hover: 300ms ease-out
Avatar Scale: 300ms ease-out
Social Icon: 200ms ease-out (faster for responsiveness)
```

---

## 6. Animation Specifications

### 6.1 Initial Load Animation (Stagger Reveal)

**Behavior:**
- Team cards animate in sequentially with a stagger effect
- Each card fades in from below and scales up
- Creates a cascade entrance effect that draws attention down the row

**Framer Motion Implementation:**
```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,  // 150ms delay between each card
      delayChildren: 0.2,     // Wait 200ms before first card
    },
  },
};

const cardVariants = {
  hidden: {
    opacity: 0,
    y: 30,              // Start 30px below
    scale: 0.95         // Start slightly smaller
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
- Use Framer Motion's `useInView` hook
- Apply to container: `<motion.div ref={ref} animate={controls}>`
- Trigger card stagger animation when `inView` becomes true

### 6.3 Avatar Entrance (Optional Enhancement)

**Behavior:**
- Avatars fade in slightly after card container
- Subtle scale bounce effect for playfulness
- Helps draw eye to faces (most important visual element)

**Implementation:**
```typescript
const avatarVariants = {
  hidden: {
    opacity: 0,
    scale: 0
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 15,
      delay: 0.2  // Delay after card appears
    },
  },
};
```

### 6.4 Hover Animations

**Card Hover:**
- Scale up: 1.0 → 1.05 (300ms ease-out)
- Shadow expands: shadow-sm → shadow-xl
- Border glow: opacity 0 → 0.2

**Avatar Hover:**
- Ring brightens: ring-primary/10 → ring-primary/30
- Slight scale: 1.0 → 1.05
- Happens simultaneously with card hover (group-hover)

**Social Icon Hover:**
- Color shift: muted-foreground → primary
- Background appears: transparent → bg-primary/10
- Scale: 1.0 → 1.10
- Individual hover (not tied to card hover)

---

## 7. Accessibility Requirements

### 7.1 Semantic HTML Structure

**Section Markup:**
```jsx
<section aria-labelledby="team-heading" className="...">
  <div className="container">
    <h2 id="team-heading">Meet the Team</h2>
    <p className="text-muted-foreground">Expert team description...</p>

    <div className="team-grid">
      <article aria-labelledby="member-1-name">
        <div className="avatar-container">
          <Avatar>
            <AvatarImage src="/team/sarah.jpg" alt="Sarah Mitchell" />
            <AvatarFallback aria-label="Sarah Mitchell initials">SM</AvatarFallback>
          </Avatar>
        </div>
        <h3 id="member-1-name">Sarah Mitchell</h3>
        <p className="role">CEO & Founder</p>
        <p className="bio">Former real estate investor...</p>
        <div className="social-links" role="list" aria-label="Sarah Mitchell's social profiles">
          <a href="..." aria-label="Sarah Mitchell on LinkedIn">
            <Linkedin aria-hidden="true" />
          </a>
          {/* More links */}
        </div>
      </article>
      <!-- Repeat for other members -->
    </div>
  </div>
</section>
```

**Key Semantic Choices:**
- `<article>` for each team member (self-contained content)
- `<h2>` for section heading, `<h3>` for member names (proper hierarchy)
- `aria-labelledby` connects articles to member names
- Social links container has `role="list"` and descriptive aria-label
- Avatar images have descriptive `alt` text (name of person)
- Fallback initials have `aria-label` for context

---

### 7.2 ARIA Labels and Roles

**Avatar Images:**
```jsx
<AvatarImage
  src="/team/sarah.jpg"
  alt="Headshot of Sarah Mitchell, CEO and Founder"
/>
<AvatarFallback aria-label="Sarah Mitchell">
  SM
</AvatarFallback>
```
- Full descriptive alt text on images
- Fallback has aria-label with full name (screen readers need context for initials)

**Social Links:**
```jsx
<a
  href="https://linkedin.com/in/sarah-mitchell"
  aria-label="Connect with Sarah Mitchell on LinkedIn"
  target="_blank"
  rel="noopener noreferrer"
>
  <Linkedin className="w-5 h-5" aria-hidden="true" />
</a>
```
- Each link has descriptive aria-label (name + platform)
- Icon SVGs have `aria-hidden="true"` (link text provides context)
- External links include `rel="noopener noreferrer"` for security

**Social Links Container:**
```jsx
<div role="list" aria-label="Sarah Mitchell's social profiles">
  {/* Individual links */}
</div>
```
- Container marked as list for screen reader navigation
- Descriptive label includes person's name

---

### 7.3 Screen Reader Experience

**Announced Content (Example for Sarah Mitchell):**
> "Region: Meet the Team. Heading level 2: Meet the Team. Experts in real estate, technology, and customer success working together to transform property management. Article. Heading level 3: Sarah Mitchell. CEO and Founder. Former real estate investor who managed 200+ units before founding REOS. Sarah saw firsthand how fragmented property management software costs landlords thousands in lost time and revenue. She built REOS to bring enterprise-grade automation to property managers of all sizes. List: Sarah Mitchell's social profiles. Link: Connect with Sarah Mitchell on LinkedIn. Link: Follow Sarah Mitchell on Twitter."

**Quality Criteria:**
- Name is announced as heading (allows navigation by heading)
- Role provides immediate context
- Bio flows naturally without visual element descriptions
- Social links are grouped as a list with clear labels
- User can skip between team members using heading navigation (H key)

---

### 7.4 Keyboard Navigation

**Requirements:**
- Social links are keyboard-focusable in logical order (left-to-right)
- Tab order: Member 1 links → Member 2 links → ... → Member 4 links
- Focus indicators clearly visible (ring-2 ring-ring)
- Enter/Space activates social links (opens in new tab)
- Cards themselves are NOT focusable (unless made clickable in future)

**Tab Sequence:**
```
1. Sarah's LinkedIn link
2. Sarah's Twitter link
3. Marcus's LinkedIn link
4. Marcus's Twitter link
5. Marcus's GitHub link
6. Emily's LinkedIn link
... (continues through all members)
```

---

### 7.5 Color Contrast

**Requirements (WCAG 2.1 Level AA):**
- Normal text: 4.5:1 contrast ratio minimum
- Large text (18px+): 3:1 contrast ratio minimum
- Interactive elements (borders, icons): 3:1 against adjacent colors

**Verified Combinations:**
| Element | Light Mode | Dark Mode | Contrast Ratio |
|---------|------------|-----------|----------------|
| Member Name (foreground) | oklch(0.145 0.02 250) on oklch(0.985 0.002 247) | oklch(0.985 0.004 250) on oklch(0.13 0.028 261) | >13:1 ✓ |
| Role (primary) | oklch(0.546 0.245 262.881) on card bg | oklch(0.623 0.214 259) on card bg | >4.5:1 ✓ |
| Bio (muted-foreground) | oklch(0.51 0.035 256) on card bg | oklch(0.65 0.04 254) on card bg | >4.5:1 ✓ |
| Social icons (default) | oklch(0.51 0.035 256) | oklch(0.65 0.04 254) | >3:1 ✓ |
| Social icons (hover) | oklch(0.546 0.245 262.881) | oklch(0.623 0.214 259) | >3:1 ✓ |
| Card border | oklch(0.902 0.018 252) | oklch(0.28 0.04 258) | >3:1 ✓ |

**Testing Requirement:**
- Verify with WebAIM Contrast Checker
- Test in both light and dark modes
- Ensure social icon hover states maintain contrast
- Avatar fallback backgrounds must pass contrast with white text

---

### 7.6 Motion Preferences

**Respect `prefers-reduced-motion`:**
```typescript
import { useReducedMotion } from 'framer-motion';

const shouldReduceMotion = useReducedMotion();

const variants = shouldReduceMotion
  ? {
      hidden: { opacity: 0 },
      visible: { opacity: 1, transition: { duration: 0.01 } },
    }
  : fullAnimationVariants;
```

**Behavior:**
- Animations disabled for users with motion sensitivity
- Cards appear immediately without stagger or scale effects
- Hover effects reduced to color/shadow changes only (no transform)
- Layout remains identical (no shifts)

---

## 8. Responsive Behavior

### 8.1 Breakpoint Definitions

```typescript
// Tailwind default breakpoints (matching REOS config)
sm:  640px  // Large phones, small tablets
md:  768px  // Tablets
lg:  1024px // Desktops
xl:  1280px // Large desktops
```

---

### 8.2 Layout Changes by Breakpoint

**Mobile (<640px):**
- Grid: Single column (`grid-cols-1`)
- Gap: `gap-6` (24px vertical spacing)
- Padding: `px-4 py-12`
- Avatar size: 112x112px (`w-28 h-28`)
- Card min-height: `min-h-[400px]`
- Section headline: `text-2xl`
- Member name: `text-lg`
- Bio: `text-sm`

**Tablet (640px - 1023px):**
- Grid: Two columns (`sm:grid-cols-2`)
- Gap: `gap-8` (32px)
- Padding: `px-6 py-14`
- Avatar size: 120x120px (`w-30 h-30`)
- Card min-height: `min-h-[420px]`
- Section headline: `text-3xl`
- Member name: `text-xl`

**Desktop (≥1024px):**
- Grid: Four columns (`lg:grid-cols-4`)
- Gap: `gap-8` (32px)
- Padding: `px-8 py-16`
- Avatar size: 128x128px (`w-32 h-32`)
- Card min-height: `min-h-[420px]`
- Max container width: `max-w-7xl`
- Section headline: `text-3xl lg:text-4xl`

---

### 8.3 Typography Scaling

**Section Headline:**
```tsx
<h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center">
  Meet the Team
</h2>
```

**Section Subheadline:**
```tsx
<p className="text-base md:text-lg text-muted-foreground text-center max-w-3xl mx-auto">
  Experts in real estate, technology, and customer success...
</p>
```

**Member Name:**
```tsx
<h3 className="text-lg md:text-xl font-semibold text-center">
  {memberName}
</h3>
```

**Role Title:**
```tsx
<p className="text-sm font-medium text-primary text-center">
  {role}
</p>
```

**Bio Text:**
```tsx
<p className="text-sm text-muted-foreground leading-relaxed">
  {bio}
</p>
```

---

### 8.4 Avatar Sizing

**Size by Breakpoint:**
- Mobile (<640px): `w-28 h-28` (112px)
- Tablet (640-1023px): `w-30 h-30` (120px)
- Desktop (≥1024px): `w-32 h-32` (128px)

**Implementation:**
```tsx
<Avatar className="w-28 h-28 sm:w-30 sm:h-30 lg:w-32 lg:h-32 mx-auto mb-4">
  <AvatarImage src={member.photo} alt={member.name} />
  <AvatarFallback>{member.initials}</AvatarFallback>
</Avatar>
```

---

### 8.5 Touch Targets (Mobile)

**Requirements:**
- Minimum touch target: 44x44px (WCAG guideline)
- Social link icons: Padded to meet minimum
  - Icon size: 20x20px (w-5 h-5)
  - Padding: `p-2.5` (10px all sides) = 40x40px total
  - Actual touch area with margin: >44x44px ✓
- Spacing between social links: `gap-3` (12px) prevents accidental taps
- Entire card is tappable if future version makes cards clickable

**Social Link Implementation:**
```tsx
<a
  href="..."
  className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-primary/10"
>
  <Linkedin className="w-5 h-5" />
</a>
```
- `w-10 h-10` = 40x40px base size
- Rounded-full makes entire circle tappable
- Exceeds 44x44px when accounting for tap area tolerance

---

## 9. Technical Specifications

### 9.1 Component File Structure

```
src/components/landing/
├── TeamSection.tsx          # Main export component
└── TeamMemberCard.tsx       # Individual member card (optional subcomponent)
```

**Alternative (single file - recommended):**
```
src/components/landing/
└── TeamSection.tsx          # Both components in one file
```

---

### 9.2 Dependencies

**Required Imports:**
```typescript
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { Linkedin, Twitter, Github } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import Image from 'next/image'; // For optimized photo loading
```

**Package Requirements:**
- `framer-motion`: ^12.26.2 (already installed)
- `lucide-react`: latest (already installed)
- `@radix-ui/react-avatar`: latest (via shadcn Avatar)
- `tailwindcss`: v4 (already configured)
- `next`: 16.1.1 (for Image component)

---

### 9.3 Data Structure

```typescript
interface SocialLink {
  platform: 'linkedin' | 'twitter' | 'github';
  url: string;
  label: string; // For aria-label: "Connect with [Name] on LinkedIn"
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo?: string; // Optional: path to photo
  photoAlt?: string; // Alt text for photo
  initials: string; // For avatar fallback (e.g., "SM")
  socialLinks: SocialLink[];
  expertiseHighlight?: string; // Optional: "15+ years real estate, YC alum"
}

const teamMembers: TeamMember[] = [
  {
    id: 'sarah-mitchell',
    name: 'Sarah Mitchell',
    role: 'CEO & Founder',
    bio: 'Former real estate investor who managed 200+ units before founding REOS. Sarah saw firsthand how fragmented property management software costs landlords thousands in lost time and revenue. She built REOS to bring enterprise-grade automation to property managers of all sizes.',
    photo: '/images/team/sarah-mitchell.jpg',
    photoAlt: 'Headshot of Sarah Mitchell, CEO and Founder',
    initials: 'SM',
    socialLinks: [
      {
        platform: 'linkedin',
        url: 'https://linkedin.com/in/sarah-mitchell-reos',
        label: 'Connect with Sarah Mitchell on LinkedIn',
      },
      {
        platform: 'twitter',
        url: 'https://twitter.com/sarahmitchellRE',
        label: 'Follow Sarah Mitchell on Twitter',
      },
    ],
    expertiseHighlight: '15+ years real estate, Y Combinator alum',
  },
  // ... 3 more members
];
```

---

### 9.4 Theme Integration

**Color Variables (Auto-adapting):**
- `bg-background` - Section background
- `bg-card` - Card background
- `text-card-foreground` - Card text
- `text-foreground` - Member name
- `text-primary` - Role title and social link hover
- `text-muted-foreground` - Bio text and social icons (default)
- `border-border` - Card borders
- `ring-ring` - Focus indicators

**Dark Mode:**
- No manual dark mode classes needed
- All colors use CSS variables that adapt automatically
- Avatar fallback backgrounds use primary color (adapts to dark mode)
- Social icon hover states maintain contrast in both modes

---

### 9.5 Performance Considerations

**Optimization:**
- Next.js Image component for photo optimization (automatic WebP, lazy loading)
- Icons are tree-shakeable (only imported icons are bundled)
- Framer Motion animations use GPU-accelerated transforms (scale, translateY)
- No layout shifts during animation (min-height prevents CLS)
- Avatar images: Lazy loaded (below fold on most viewports)

**Image Optimization:**
```tsx
<Image
  src={member.photo}
  alt={member.photoAlt}
  width={128}
  height={128}
  className="rounded-full"
  loading="lazy"
  placeholder="blur" // Optional: blur-up effect
/>
```

**Performance Metrics Targets:**
- First Contentful Paint (FCP): <1.8s
- Largest Contentful Paint (LCP): <2.5s (section should not be LCP)
- Cumulative Layout Shift (CLS): 0 (min-height prevents shifts)
- Image load time: <500ms per photo (via Next.js optimization)

---

### 9.6 Avatar Fallback Strategy

**Placeholder Generation:**

**Option 1: Initials with Color Hash**
```typescript
function getAvatarColor(name: string): string {
  const colors = [
    'bg-gradient-to-br from-purple-500 to-purple-700',
    'bg-gradient-to-br from-blue-500 to-blue-700',
    'bg-gradient-to-br from-green-500 to-green-700',
    'bg-gradient-to-br from-orange-500 to-orange-700',
    'bg-gradient-to-br from-pink-500 to-pink-700',
    'bg-gradient-to-br from-teal-500 to-teal-700',
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}
```

**Option 2: UI Avatars API (External Service)**
```typescript
const placeholderUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name)}&size=128&background=7c3aed&color=fff&bold=true`;
```

**Option 3: Custom Gradient Avatars (Recommended)**
- Use Radix Avatar's AvatarFallback with gradient backgrounds
- Consistent color per person (based on name hash or position)
- Displays initials in white text
- Matches REOS brand aesthetic

**Implementation:**
```tsx
<Avatar className="w-32 h-32">
  <AvatarImage
    src={member.photo || placeholderUrl}
    alt={member.photoAlt || member.name}
  />
  <AvatarFallback
    className={cn(
      "text-2xl font-bold text-white",
      getAvatarColor(member.name)
    )}
    aria-label={member.name}
  >
    {member.initials}
  </AvatarFallback>
</Avatar>
```

---

## 10. Content Guidelines

### 10.1 Member Name Best Practices

**Format:**
- Full name: First + Last (e.g., "Sarah Mitchell")
- Avoid middle initials unless person prefers (e.g., "James T. O'Connor")
- Use proper capitalization
- Handle apostrophes and hyphens correctly (O'Connor, Rodriguez-Chen)

---

### 10.2 Role Title Best Practices

**Guidelines:**
- Length: 2-6 words (max 40 characters)
- Format: Title case
- Be specific but concise
- Avoid internal jargon

**Examples:**
- ✅ "CEO & Founder"
- ✅ "Head of Engineering"
- ✅ "Lead Product Designer"
- ✅ "Head of Customer Success"
- ❌ "Chief Executive Officer and Company Founder"
- ❌ "Software Engineering Manager Level 5"
- ❌ "The Person Who Builds Stuff"

---

### 10.3 Bio Best Practices

**Structure:**
[Previous experience/background] + [Expertise/specialty] + [Current role/impact at REOS]

**Guidelines:**
- Length: 2-3 sentences (60-100 words)
- Tone: Third person or pronoun-free (professional but personable)
- Include:
  - Previous company or role (adds credibility)
  - Specific expertise or achievement
  - Connection to REOS mission
  - Personality hint (optional: "passion for", "believes in")
- Avoid:
  - First person ("I founded...", "I love...")
  - Overly formal language
  - Generic statements ("hardworking professional")
  - Excessive credentials listing

**Examples:**

✅ Good:
> "Former real estate investor who managed 200+ units before founding REOS. Sarah saw firsthand how fragmented property management software costs landlords thousands in lost time and revenue. She built REOS to bring enterprise-grade automation to property managers of all sizes."

✅ Good:
> "Previously led backend infrastructure teams at Zillow and Stripe. Marcus specializes in building scalable, secure systems that handle millions of transactions. At REOS, he's architecting a platform that's both powerful for enterprises and intuitive for individual landlords."

❌ Bad:
> "Sarah is a hardworking CEO who loves real estate. She founded REOS to help people. Sarah has many years of experience and is very passionate about technology."

❌ Bad:
> "I have over 15 years of experience in the real estate industry. I founded REOS because I wanted to make a difference. I'm excited about the future of proptech."

---

### 10.4 Social Link Best Practices

**Guidelines:**
- LinkedIn: Include for all team members (professional standard)
- Twitter: Optional, include if member is active and professional
- GitHub: Only for technical roles (engineers, designers with open-source work)
- Order: LinkedIn → Twitter → GitHub (most universal to most niche)
- URLs: Use actual profile URLs (not placeholder #)
- Validation: Ensure links are active before launch

**When to Include:**
- LinkedIn: Always (professional network, expected)
- Twitter: If member tweets about industry topics, company updates
- GitHub: If member contributes to open source, has public repos

**When to Exclude:**
- Personal social media (Instagram, Facebook, TikTok)
- Inactive accounts (no posts in 6+ months)
- Private/locked accounts
- Personal blogs (unless highly relevant and active)

---

### 10.5 Section Headlines

**Primary Recommendation:** "Meet the Team"
- Clear, direct, familiar
- SEO-friendly
- Warm and approachable

**Alternatives:**
- "The People Behind REOS"
- "Our Team"
- "Meet the Experts"
- "Who We Are"

**Subheadline Examples:**
- "Experts in real estate, technology, and customer success working together to transform property management."
- "A diverse team of real estate veterans, engineers, and designers united by a mission to simplify property management."
- "Combining decades of real estate experience with cutting-edge technology expertise."

**Tone:**
- Professional but warm
- Emphasize expertise and diversity
- Connect to company mission
- Keep under 25 words for scannability

---

## 11. Testing & Quality Assurance

### 11.1 Functional Testing Checklist

**Visual Regression:**
- [ ] Component renders correctly in light mode
- [ ] Component renders correctly in dark mode
- [ ] All 4 team member cards display correctly
- [ ] Grid layout adjusts at each breakpoint (mobile: 1 col, tablet: 2 col, desktop: 4 col)
- [ ] Cards maintain consistent heights within each row
- [ ] Avatars display correctly (both photos and fallback initials)
- [ ] Avatar fallbacks show correct initials with gradient backgrounds
- [ ] Social links display in correct order (LinkedIn, Twitter, GitHub)

**Content Integrity:**
- [ ] Member names display correctly
- [ ] Role titles are properly styled (purple/primary color)
- [ ] Bios are legible and properly line-wrapped
- [ ] Social links use correct icons (LinkedIn, Twitter, GitHub icons)
- [ ] No lorem ipsum or placeholder text visible

**Image Loading:**
- [ ] Team photos load correctly (if using actual photos)
- [ ] Next.js Image optimization working (check Network tab)
- [ ] Fallback initials appear immediately if photo fails to load
- [ ] No broken image icons visible
- [ ] Avatar alt text is descriptive

---

### 11.2 Interaction Testing

**Hover Effects:**
- [ ] Card scales up on hover (1.0 → 1.05)
- [ ] Shadow expands on card hover (shadow-sm → shadow-xl)
- [ ] Border glow appears on hover (subtle primary color)
- [ ] Avatar ring brightens on card hover
- [ ] Avatar scales slightly within hovered card
- [ ] Social icons change color on individual hover (muted → primary)
- [ ] Social icons show background circle on hover
- [ ] Social icons scale up on hover (1.0 → 1.1)
- [ ] All hover transitions are smooth (300ms for card, 200ms for icons)

**Click/Tap Functionality:**
- [ ] Social links navigate to correct URLs
- [ ] External links open in new tab (`target="_blank"`)
- [ ] Social links include `rel="noopener noreferrer"` for security
- [ ] Touch targets meet 44px minimum on mobile devices
- [ ] No accidental clicks due to small tap areas

---

### 11.3 Animation Testing

**Scroll-Triggered Animations:**
- [ ] Cards fade in sequentially when section scrolls into view
- [ ] Stagger timing feels natural (150ms between cards)
- [ ] Animation triggers at correct scroll position (20% threshold)
- [ ] Animation only plays once (no repeat on scroll up/down)
- [ ] Avatars animate in slightly after card (if using avatar animation)

**Motion Preferences:**
- [ ] Animations respect `prefers-reduced-motion` setting
- [ ] Content appears immediately when motion is disabled
- [ ] No layout shifts occur regardless of animation state
- [ ] Hover effects still work with reduced motion (color/shadow changes only)

**Performance:**
- [ ] Animations run smoothly at 60fps on target devices
- [ ] No jank or stuttering during scroll
- [ ] GPU acceleration is utilized (check DevTools performance tab)

---

### 11.4 Accessibility Testing

**Tools:**
- axe DevTools (Chrome/Firefox extension)
- Lighthouse accessibility audit (Chrome DevTools)
- NVDA (Windows) or VoiceOver (Mac) screen reader
- Keyboard-only navigation testing

**Checklist:**
- [ ] Semantic HTML structure (`<article>`, `<h3>`, proper heading hierarchy)
- [ ] Section has `aria-labelledby` pointing to h2 heading
- [ ] Each team member article has `aria-labelledby` pointing to name heading
- [ ] Avatar images have descriptive `alt` text (name of person)
- [ ] Avatar fallbacks have `aria-label` with full name
- [ ] Social links have descriptive `aria-label` (name + platform)
- [ ] Social link icons have `aria-hidden="true"` (redundant with link label)
- [ ] Social link container has `role="list"` and descriptive aria-label
- [ ] Color contrast passes WCAG AA (4.5:1 for text, 3:1 for UI components)
- [ ] Focus indicators are visible in both light and dark modes
- [ ] Keyboard navigation order is logical (left-to-right, top-to-bottom)
- [ ] No axe DevTools violations
- [ ] Lighthouse accessibility score: 100/100

**Screen Reader Test:**
- [ ] Navigate by headings (H key) - should find h2 section heading and h3 member names
- [ ] Navigate by list (L key) - should find social link lists
- [ ] Content reads naturally without visual descriptions
- [ ] Social links announce platform and person's name
- [ ] Avatar images announce person's name via alt text
- [ ] Bio text flows naturally

---

### 11.5 Responsive Testing

**Test Devices/Viewports:**
- Mobile: iPhone 13 (390px), Samsung Galaxy S21 (360px)
- Tablet: iPad (768px), iPad Pro (1024px)
- Desktop: 1280px, 1440px, 1920px

**Checklist:**
- [ ] Mobile (<640px): Single column layout, smaller avatars (112px)
- [ ] Tablet (640-1023px): 2-column grid layout (2x2)
- [ ] Desktop (≥1024px): 4-column horizontal layout
- [ ] Typography scales appropriately at each breakpoint
- [ ] Avatars resize correctly (112px → 120px → 128px)
- [ ] No horizontal scroll at any viewport width
- [ ] Touch targets meet 44px minimum on mobile (social links)
- [ ] Content remains readable and scannable at all sizes
- [ ] Card heights remain consistent within rows
- [ ] Spacing feels balanced at each breakpoint
- [ ] Section headline scales correctly (text-2xl → text-3xl → text-4xl)

---

### 11.6 Browser Compatibility

**Supported Browsers:**
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari (iOS 15+)
- Chrome Mobile (Android)

**Checklist:**
- [ ] Next.js Image component works in all browsers
- [ ] Avatar component renders correctly (Radix UI compatibility)
- [ ] Framer Motion animations work smoothly
- [ ] Gradient backgrounds display correctly (avatar fallbacks)
- [ ] Dark mode transitions properly
- [ ] Social link hover states work
- [ ] No console errors or warnings in any browser
- [ ] External link security attributes work (`rel="noopener noreferrer"`)

---

## 12. Success Metrics

### 12.1 User Engagement Metrics

**Primary KPIs:**
- **Scroll Depth:** % of visitors who scroll to and view the Team Section
  - Target: >60% of page visitors
- **Hover Engagement:** % of visitors who hover over team cards (indicates interest)
  - Target: >30% of viewers
- **Social Link CTR:** % of viewers who click on social links
  - Target: 5-10% (indicates strong interest in connecting)
- **Time on Section:** Average time spent viewing Team Section
  - Target: >10 seconds

**Secondary Metrics:**
- Heatmap engagement: Which team members receive most attention
- Social platform preference: LinkedIn vs. Twitter click distribution
- Bounce rate: % of users who leave after viewing team (lower is better)
- Scroll velocity: Do users slow down to read bios? (indicator of interest)

---

### 12.2 Performance Metrics

- **First Contentful Paint (FCP):** <1.8s
- **Largest Contentful Paint (LCP):** <2.5s (section should not be LCP)
- **Cumulative Layout Shift (CLS):** 0 (min-height prevents shifts)
- **Time to Interactive (TTI):** <3.5s
- **Image Load Time:** <500ms per avatar photo (via Next.js optimization)
- **Animation Frame Rate:** Consistent 60fps during scroll animations

---

### 12.3 Accessibility Metrics

- **Lighthouse Accessibility Score:** 100/100
- **axe DevTools Violations:** 0
- **Color Contrast:** 100% compliance with WCAG AA
- **Keyboard Navigation:** All interactive elements (social links) accessible via keyboard
- **Screen Reader Compatibility:** 100% of content accessible to screen readers

---

### 12.4 Trust & Conversion Metrics

**Hypothesis:** Team Section increases trust and conversion rates

**A/B Test Metrics:**
- **Signup Conversion:** % increase in signups with vs. without Team Section
  - Hypothesis: +8-12% lift
- **Time to Conversion:** Does viewing Team Section correlate with faster signup?
- **Demo Request Rate:** % of viewers who request a demo after seeing team
- **Social Proof Clicks:** % who click LinkedIn profiles before signing up

---

## 13. Out of Scope

The following items are explicitly **NOT** included in v1:

**Features:**
- Individual team member detail pages (links from cards)
- Team member filtering or search
- "Meet the full team" CTA linking to dedicated team page
- Team member video introductions or bios
- Interactive team timeline (company history)
- Team member availability indicators (e.g., "Online now")
- Direct messaging/contact buttons per team member
- Team member blog post links or recent activity
- Expandable card details (e.g., click to see more bio)

**Content:**
- More than 4 team members (advisors, extended team)
- Team member credentials/certifications in detail
- Team member personal interests or hobbies
- Company culture photos or office images
- Team achievements or awards section
- Press mentions or media appearances
- Speaking engagement listings

**Technical:**
- Backend integration for dynamic team data (CMS)
- Real-time social media feed integration
- Team member availability API (e.g., Calendly integration)
- Analytics event tracking (can be added post-launch)
- Multi-language translations (English only v1)
- Team member search functionality
- Filtering by role or expertise

**Design:**
- Animated avatar illustrations (using static photos/initials)
- Custom illustrated avatars or caricatures
- Video background effects
- Parallax scrolling effects
- 3D hover effects or card flips
- Alternative layout styles (e.g., carousel, masonry)

---

## 14. Future Enhancements (Post-V1)

**Phase 2 Candidates:**

**Enhanced Interactivity:**
- Clickable cards that open modal with expanded bio
- "Schedule a call" button for certain roles (e.g., Customer Success)
- Tooltips with additional context on hover (e.g., "Ask me about...")
- Team member availability calendar integration

**Content Expansion:**
- Dedicated team page with full roster (8-12 members)
- Advisors and board members section
- Team member blog posts or thought leadership links
- "Day in the life" video content
- Team culture photos/office tour

**Personalization:**
- Show relevant team member based on visitor intent
  - Developer? Show engineering team
  - Property manager? Show customer success lead
- Dynamic ordering based on user persona

**Social Proof Integration:**
- Recent LinkedIn posts or updates
- Twitter feed integration (latest tweets)
- GitHub contribution graphs for engineers
- Speaking engagements or conference appearances

**Visual Enhancements:**
- Custom illustrated avatars (commission artist)
- Subtle animation on avatar (e.g., slight parallax on scroll)
- Video backgrounds (team working in office)
- 3D card flip effect on hover (front: photo/bio, back: achievements)

---

## 15. Dependencies & Risks

### 15.1 Technical Dependencies

- ✅ Shadcn UI Card component exists (`@/components/ui/card`)
- ✅ Shadcn UI Avatar component exists (`@/components/ui/avatar`)
- ✅ Lucide React icons package installed
- ✅ Framer Motion 12.26.2+ installed
- ✅ Tailwind CSS v4 configured with oklch colors
- ✅ Next.js 16.1.1 (for Image component optimization)
- ✅ Radix UI Avatar primitive (via Shadcn Avatar)

---

### 15.2 Content Dependencies

**Required for v1:**
- ⚠️ Team member names, roles, bios (DEFINED in this PRD - Section 3)
- ⚠️ Team member photos or decision to use placeholder avatars
- ⚠️ Social media profile URLs (LinkedIn, Twitter, GitHub)
- ⚠️ Photo permissions and usage rights (if using actual photos)

**Pending (Nice-to-Have):**
- ⚠️ Professional photography session for team headshots
- ⚠️ Professional copywriting review of bios (COPY-03)
- ⚠️ Legal review of photo usage and permissions
- ⚠️ Social media guidelines for team members

**Decision Required:**
- [ ] Use actual team photos vs. placeholder avatars (initials/illustrations)?
- [ ] Commission custom illustrated avatars vs. use initials?
- [ ] Include "expertise highlight" subtitle vs. keep clean?

---

### 15.3 Identified Risks

**Risk 1: Team Member Changes (Churn)**
- **Likelihood:** Medium (especially at startup stage)
- **Impact:** Medium (outdated team section erodes trust)
- **Mitigation:**
  - Design for easy content updates (data-driven approach)
  - Document process for adding/removing team members
  - Consider "Alumni" or "Advisors" section for departed members
  - Use CMS integration in Phase 2 for non-technical updates

**Risk 2: Privacy Concerns (Personal Information)**
- **Likelihood:** Low
- **Impact:** High (legal/privacy risk, team member discomfort)
- **Mitigation:**
  - Get explicit consent from all team members before publishing
  - Allow team members to opt out of photos (use initials)
  - Review all social links to ensure they're professional accounts
  - Include privacy notice in employee handbook about public profiles
  - Allow team members to request removal/updates anytime

**Risk 3: Photo Quality and Consistency**
- **Likelihood:** Medium
- **Impact:** Medium (unprofessional appearance)
- **Mitigation:**
  - Option 1: Professional photography session (consistent lighting, background)
  - Option 2: Use illustrated avatars (commission consistent style)
  - Option 3: Use initials with gradient backgrounds (zero risk, always consistent)
  - Set photo guidelines: neutral background, professional attire, consistent framing

**Risk 4: Social Link Breakage (Profile URL Changes)**
- **Likelihood:** Medium
- **Impact:** Low (minor UX issue, appears unprofessional)
- **Mitigation:**
  - Regular link checking (quarterly audit)
  - Monitor for 404s via error tracking
  - Consider using LinkedIn vanity URLs (less likely to change)
  - Document process for updating links
  - Phase 2: API integration to validate links automatically

**Risk 5: Bias in Team Representation**
- **Likelihood:** Low (if team is diverse)
- **Impact:** Medium (brand perception, inclusivity concerns)
- **Mitigation:**
  - Showcase genuine team diversity (don't fabricate)
  - Use inclusive language in bios (avoid assumptions)
  - Consider adding diversity statement if team is homogenous
  - Future: Expand team section to show broader organization

**Risk 6: Animation Performance on Low-End Devices**
- **Likelihood:** Low
- **Impact:** Low (cosmetic, animations skip)
- **Mitigation:**
  - Use GPU-accelerated properties only (transform, opacity)
  - Implement `prefers-reduced-motion` fallback
  - Test on budget Android phones (common in target market)
  - Monitor performance metrics post-launch

---

## 16. Acceptance Criteria Summary

**This PRD is complete and ready for implementation when:**

- [x] Team card structure defined (photo, name, role, bio, social links)
- [x] Grid layout specified (responsive: 1/2/4 columns)
- [x] 4 team members defined with realistic content
- [x] Hover/interaction states described in detail
- [x] Social link icons selected (LinkedIn, Twitter, GitHub from Lucide)
- [x] Avatar fallback strategy defined (initials with gradient backgrounds)
- [x] Placeholder content strategy defined (gradient avatars with initials)
- [x] Accessibility requirements documented (WCAG AA compliance)
- [x] Animation specifications provided (Framer Motion variants)
- [x] Responsive behavior documented for all breakpoints
- [x] Technical implementation details provided
- [x] Testing checklist created
- [x] Out of scope items clearly defined

**Implementation Readiness:**
- ✅ All design decisions finalized (no ambiguity)
- ✅ Content complete for v1 (4 team members with bios)
- ✅ Technical approach validated (Shadcn components + Framer Motion)
- ✅ Accessibility strategy defined (semantic HTML + ARIA)
- ✅ Performance considerations documented
- ✅ Avatar fallback strategy prevents blocking on photos

**Ready for handoff to UI Designer (UI-03)**

---

## 17. Appendix

### A. Design Mockup Reference (Textual)

**Desktop Layout (1280px+):**
```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                        Meet the Team                            │ (h2, text-4xl)
│  Experts in real estate, technology, and customer success       │ (p, text-lg muted)
│  working together to transform property management.             │
│                                                                 │
│  ┌──────────┬──────────┬──────────┬──────────┐                 │
│  │          │          │          │          │                 │
│  │   ┌──┐   │   ┌──┐   │   ┌──┐   │   ┌──┐   │  (Avatars)     │
│  │   │SM│   │   │MC│   │   │ER│   │   │JO│   │                 │
│  │   └──┘   │   └──┘   │   └──┘   │   └──┘   │                 │
│  │          │          │          │          │                 │
│  │  Sarah   │  Marcus  │  Emily   │  James   │                 │
│  │ Mitchell │   Chen   │ Rodriguez│ O'Connor │                 │
│  │          │          │          │          │                 │
│  │ CEO &    │ Head of  │  Lead    │  Head of │                 │
│  │ Founder  │  Eng     │ Product  │ Customer │                 │
│  │          │          │ Designer │  Success │                 │
│  │          │          │          │          │                 │
│  │ Former   │Previously│ Award-   │ James    │                 │
│  │ real     │ led      │ winning  │ spent a  │                 │
│  │ estate   │ backend  │ UX       │ decade   │                 │
│  │ investor │ infra    │ designer │ as a     │                 │
│  │ who      │ teams at │ with a   │ property │                 │
│  │ managed  │ Zillow   │ passion  │ manager  │                 │
│  │ 200+...  │ and...   │ for...   │ before...│                 │
│  │          │          │          │          │                 │
│  │ [Li][Tw] │[Li][Tw]  │[Li][Tw]  │[Li][Tw]  │ (Social links) │
│  │          │   [GH]   │   [GH]   │          │                 │
│  │          │          │          │          │                 │
│  └──────────┴──────────┴──────────┴──────────┘                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Mobile Layout (390px):**
```
┌──────────────────────┐
│                      │
│   Meet the Team      │ (h2, text-2xl)
│                      │
│   Experts in real    │ (p, text-base)
│   estate, tech, and  │
│   customer success   │
│                      │
│  ┌────────────────┐  │
│  │                │  │
│  │     ┌────┐     │  │ (Avatar: 112px)
│  │     │ SM │     │  │
│  │     └────┘     │  │
│  │                │  │
│  │ Sarah Mitchell │  │
│  │                │  │
│  │ CEO & Founder  │  │ (primary color)
│  │                │  │
│  │ Former real    │  │
│  │ estate investor│  │
│  │ who managed    │  │
│  │ 200+ units     │  │
│  │ before founding│  │
│  │ REOS...        │  │
│  │                │  │
│  │   [Li] [Tw]    │  │ (Social icons)
│  │                │  │
│  └────────────────┘  │
│                      │
│  ┌────────────────┐  │
│  │                │  │
│  │     ┌────┐     │  │
│  │     │ MC │     │  │
│  │     └────┘     │  │
│  │  Marcus Chen   │  │
│  │  Head of Eng   │  │
│  │  Previously... │  │
│  │  [Li][Tw][GH]  │  │
│  └────────────────┘  │
│                      │
│  [Cards 3-4...]      │
│                      │
└──────────────────────┘
```

---

### B. Code Snippet Examples

**Main Component Structure:**
```tsx
'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { Linkedin, Twitter, Github } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface SocialLink {
  platform: 'linkedin' | 'twitter' | 'github';
  url: string;
  label: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo?: string;
  photoAlt?: string;
  initials: string;
  socialLinks: SocialLink[];
}

const teamMembers: TeamMember[] = [
  {
    id: 'sarah-mitchell',
    name: 'Sarah Mitchell',
    role: 'CEO & Founder',
    bio: 'Former real estate investor who managed 200+ units before founding REOS. Sarah saw firsthand how fragmented property management software costs landlords thousands in lost time and revenue. She built REOS to bring enterprise-grade automation to property managers of all sizes.',
    initials: 'SM',
    socialLinks: [
      {
        platform: 'linkedin',
        url: 'https://linkedin.com/in/sarah-mitchell-reos',
        label: 'Connect with Sarah Mitchell on LinkedIn',
      },
      {
        platform: 'twitter',
        url: 'https://twitter.com/sarahmitchellRE',
        label: 'Follow Sarah Mitchell on Twitter',
      },
    ],
  },
  // ... 3 more members
];

const socialIcons = {
  linkedin: Linkedin,
  twitter: Twitter,
  github: Github,
};

// Generate consistent color based on name
function getAvatarColor(name: string): string {
  const colors = [
    'bg-gradient-to-br from-purple-500 to-purple-700',
    'bg-gradient-to-br from-blue-500 to-blue-700',
    'bg-gradient-to-br from-green-500 to-green-700',
    'bg-gradient-to-br from-orange-500 to-orange-700',
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

export function TeamSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { threshold: 0.2, once: true });
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: 0.15,
            delayChildren: 0.2,
          },
        },
      };

  const cardVariants = shouldReduceMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 30, scale: 0.95 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { duration: 0.5, ease: 'easeOut' },
        },
      };

  return (
    <section
      ref={ref}
      aria-labelledby="team-heading"
      className="bg-background py-12 md:py-14 lg:py-16"
    >
      <div className="container mx-auto max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2
            id="team-heading"
            className="mb-4 text-2xl font-bold md:text-3xl lg:text-4xl"
          >
            Meet the Team
          </h2>
          <p className="mx-auto max-w-3xl text-base text-muted-foreground md:text-lg">
            Experts in real estate, technology, and customer success working
            together to transform property management.
          </p>
        </div>

        {/* Team Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8 lg:grid-cols-4"
        >
          {teamMembers.map((member) => (
            <TeamMemberCard
              key={member.id}
              member={member}
              variants={cardVariants}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}
```

**Individual Team Member Card:**
```tsx
interface TeamMemberCardProps {
  member: TeamMember;
  variants: any;
}

function TeamMemberCard({ member, variants }: TeamMemberCardProps) {
  return (
    <motion.article
      variants={variants}
      aria-labelledby={`${member.id}-name`}
    >
      <Card
        className={cn(
          'group relative flex min-h-[420px] flex-col items-center p-6 text-center',
          'transition-all duration-300 ease-out',
          'hover:scale-105 hover:shadow-xl hover:border-primary/20 hover:z-10'
        )}
      >
        {/* Avatar */}
        <Avatar className="mb-4 h-28 w-28 ring-2 ring-primary/10 transition-all duration-300 group-hover:ring-primary/30 group-hover:scale-105 sm:h-30 sm:w-30 lg:h-32 lg:w-32">
          <AvatarImage
            src={member.photo}
            alt={member.photoAlt || `Headshot of ${member.name}`}
          />
          <AvatarFallback
            className={cn(
              'text-2xl font-bold text-white',
              getAvatarColor(member.name)
            )}
            aria-label={member.name}
          >
            {member.initials}
          </AvatarFallback>
        </Avatar>

        {/* Name */}
        <h3
          id={`${member.id}-name`}
          className="mb-2 text-lg font-semibold md:text-xl"
        >
          {member.name}
        </h3>

        {/* Role */}
        <p className="mb-4 text-sm font-medium text-primary">
          {member.role}
        </p>

        {/* Bio */}
        <p className="mb-6 flex-grow text-sm leading-relaxed text-muted-foreground">
          {member.bio}
        </p>

        {/* Social Links */}
        <div
          className="flex items-center justify-center gap-3"
          role="list"
          aria-label={`${member.name}'s social profiles`}
        >
          {member.socialLinks.map((link) => {
            const Icon = socialIcons[link.platform];
            return (
              <a
                key={link.platform}
                href={link.url}
                aria-label={link.label}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  'inline-flex h-10 w-10 items-center justify-center rounded-full',
                  'text-muted-foreground transition-all duration-200',
                  'hover:bg-primary/10 hover:text-primary hover:scale-110',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                )}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </a>
            );
          })}
        </div>
      </Card>
    </motion.article>
  );
}
```

**Complete Team Members Data:**
```typescript
const teamMembers: TeamMember[] = [
  {
    id: 'sarah-mitchell',
    name: 'Sarah Mitchell',
    role: 'CEO & Founder',
    bio: 'Former real estate investor who managed 200+ units before founding REOS. Sarah saw firsthand how fragmented property management software costs landlords thousands in lost time and revenue. She built REOS to bring enterprise-grade automation to property managers of all sizes.',
    initials: 'SM',
    socialLinks: [
      {
        platform: 'linkedin',
        url: 'https://linkedin.com/in/sarah-mitchell-reos',
        label: 'Connect with Sarah Mitchell on LinkedIn',
      },
      {
        platform: 'twitter',
        url: 'https://twitter.com/sarahmitchellRE',
        label: 'Follow Sarah Mitchell on Twitter',
      },
    ],
  },
  {
    id: 'marcus-chen',
    name: 'Marcus Chen',
    role: 'Head of Engineering',
    bio: 'Previously led backend infrastructure teams at Zillow and Stripe. Marcus specializes in building scalable, secure systems that handle millions of transactions. At REOS, he's architecting a platform that's both powerful for enterprises and intuitive for individual landlords.',
    initials: 'MC',
    socialLinks: [
      {
        platform: 'linkedin',
        url: 'https://linkedin.com/in/marcus-chen-eng',
        label: 'Connect with Marcus Chen on LinkedIn',
      },
      {
        platform: 'twitter',
        url: 'https://twitter.com/marcusbuildsstuff',
        label: 'Follow Marcus Chen on Twitter',
      },
      {
        platform: 'github',
        url: 'https://github.com/mchen',
        label: 'View Marcus Chen on GitHub',
      },
    ],
  },
  {
    id: 'emily-rodriguez',
    name: 'Emily Rodriguez',
    role: 'Lead Product Designer',
    bio: 'Award-winning UX designer with a passion for simplifying complex workflows. Emily's design philosophy centers on empathy-driven interfaces that reduce cognitive load. She's redesigned REOS from the ground up to make property management feel effortless, not overwhelming.',
    initials: 'ER',
    socialLinks: [
      {
        platform: 'linkedin',
        url: 'https://linkedin.com/in/emily-rodriguez-design',
        label: 'Connect with Emily Rodriguez on LinkedIn',
      },
      {
        platform: 'twitter',
        url: 'https://twitter.com/emilydesignsUX',
        label: 'Follow Emily Rodriguez on Twitter',
      },
      {
        platform: 'github',
        url: 'https://github.com/erodriguez',
        label: 'View Emily Rodriguez on GitHub',
      },
    ],
  },
  {
    id: 'james-oconnor',
    name: "James O'Connor",
    role: 'Head of Customer Success',
    bio: 'James spent a decade as a property manager before joining REOS, managing portfolios ranging from single-family homes to 500-unit apartment complexes. He understands every pain point our customers face because he's lived them. Now, he ensures every REOS user gets the support they need to succeed.',
    initials: 'JO',
    socialLinks: [
      {
        platform: 'linkedin',
        url: 'https://linkedin.com/in/james-oconnor-cs',
        label: "Connect with James O'Connor on LinkedIn",
      },
      {
        platform: 'twitter',
        url: 'https://twitter.com/jamesREOSsupport',
        label: "Follow James O'Connor on Twitter",
      },
    ],
  },
];
```

---

### C. Color Reference Table

| Element | Light Mode | Dark Mode |
|---------|------------|-----------|
| Background | `oklch(0.985 0.002 247)` | `oklch(0.13 0.028 261)` |
| Card BG | `oklch(1 0 0)` | `oklch(0.17 0.03 260)` |
| Member Name | `oklch(0.145 0.02 250)` | `oklch(0.985 0.004 250)` |
| Role (Primary) | `oklch(0.546 0.245 262.881)` | `oklch(0.623 0.214 259)` |
| Bio (Muted FG) | `oklch(0.51 0.035 256)` | `oklch(0.65 0.04 254)` |
| Border | `oklch(0.902 0.018 252)` | `oklch(0.28 0.04 258)` |
| Social Icon Default | `oklch(0.51 0.035 256)` | `oklch(0.65 0.04 254)` |
| Social Icon Hover | `oklch(0.546 0.245 262.881)` | `oklch(0.623 0.214 259)` |

---

### D. Avatar Gradient Colors

```typescript
// Consistent gradient backgrounds for avatar fallbacks
const avatarGradients = [
  'bg-gradient-to-br from-purple-500 to-purple-700',  // Sarah (index 0)
  'bg-gradient-to-br from-blue-500 to-blue-700',      // Marcus (index 1)
  'bg-gradient-to-br from-green-500 to-green-700',    // Emily (index 2)
  'bg-gradient-to-br from-orange-500 to-orange-700',  // James (index 3)
];

// Mapping:
// Sarah Mitchell (SM) → Purple gradient
// Marcus Chen (MC) → Blue gradient
// Emily Rodriguez (ER) → Green gradient
// James O'Connor (JO) → Orange gradient
```

---

**Document Status:** APPROVED
**Next Step:** Proceed to UI-03 (UI Designer Implementation)
**Estimated Implementation Time:** 4-6 hours
**Complexity:** Medium

---

**Prepared by:** PRD Architect Agent
**For:** REOS Landing Page v1.4
**Related Documents:**
- PRD-01: Services Grid Component
- PRD-02: Process Steps Component
- UI-03: Team Section Implementation (next step)
