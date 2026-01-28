# Architecture

**Analysis Date:** 2026-01-28

## Pattern Overview

**Overall:** Multi-layered full-stack application using Next.js 16 with App Router, Convex backend, and React 19 frontend with role-based access patterns. Landing page implemented as component-based scroll-driven animation system.

**Key Characteristics:**
- Server-side rendering (SSR) and streaming for core pages with client-side interactive features
- Real-time data synchronization via Convex API with React hooks
- Role-based architecture supporting five distinct user types (investor, broker, mortgage_advisor, lawyer, admin)
- Internationalization (i18n) support with locale routing (English/Hebrew with RTL support)
- Component-driven UI with shadcn/ui design system wrapped in Radix UI primitives
- Modular backend with Convex actions, mutations, and queries organized by domain
- Landing page sections composed of self-contained motion components with scroll-triggered animations

## Layers

**Presentation Layer (Frontend):**
- Purpose: User interface components and page layouts
- Location: `src/components/`, `src/app/`
- Contains: React components (pages, layouts, UI primitives), landing page sections, feature-specific component groups
- Depends on: React hooks, Convex API client, i18n routing, form libraries
- Used by: Browser (public), authenticated app users

**Landing Page Components:**
- Purpose: Render animated landing page sections with scroll-driven interactions
- Location: `src/components/newlanding/`
- Contains: 9 sections (Hero, Navigation, Features, Automation, Testimonials, Stats, CTA, SocialProof, Footer)
- Depends on: `framer-motion`, `next-intl`, UI primitives (carousel, navigation-menu, accordion)
- Used by: `src/app/[locale]/(main)/page.tsx`
- Key patterns: Variant-based animations, viewport observers, scroll transforms, CountUp/DecryptedText animations

**Business Logic Layer (Frontend):**
- Purpose: State management, data fetching orchestration, role-based logic
- Location: `src/hooks/`, `src/components/*/hooks/`
- Contains: Custom hooks (useCurrentUser, useAIChat, useMobile), query/mutation wrappers
- Depends on: Convex React SDK, React state/effects
- Used by: Presentation layer components

**Backend API Layer:**
- Purpose: Data mutations, queries, real-time actions, integration with external services
- Location: `convex/`
- Contains: Query definitions (read-only), mutations (state changes), actions (external integrations, long-running tasks)
- Depends on: Convex framework, external SDKs (Anthropic for AI, authentication)
- Used by: Frontend via React Convex hooks and direct calls

**Data & Schema Layer:**
- Purpose: Database schema definition, data validation
- Location: `convex/schema.ts`
- Contains: Convex table definitions, value validators (Zod patterns), type definitions for all data models
- Depends on: Convex/values library
- Used by: All backend queries/mutations

**Utilities & Constants:**
- Purpose: Shared helper functions, configuration, constants
- Location: `src/lib/` (utils.ts, constants.ts, deal-constants.ts, navigation.ts, search-actions.ts)
- Contains: TailwindCSS class merging, app constants, deal stage definitions, search utilities
- Depends on: External libraries (clsx, tailwind-merge)
- Used by: All layers

## Data Flow

**Landing Page Composition:**

1. User navigates to `/` → Next.js routes to `src/app/[locale]/(main)/page.tsx`
2. Page component imports landing section components from `src/components/newlanding/index.ts`
3. Sections rendered in sequence: Navigation → Hero → SocialProof → Features → Automation → Testimonials → Stats → CTA → Footer
4. Each section's animations fire independently based on viewport entry or scroll progress

**Scroll-Triggered Content Swap (Hero Section):**

1. User scrolls past hero section start
2. Hero component calculates scroll progress via `useScroll({ target: heroRef, offset: ["start start", "end end"] })`
3. `useTransform` maps scroll range [0.4, 0.6] to opacity/scale values
4. Initial content (Overview stats/chart) fades and scales out via `initialContentOpacity`, `initialContentScale`
5. Switched content (Properties grid/table) fades and scales in simultaneously via `switchedContentOpacity`, `switchedContentScale`
6. Dashboard mockup URL updates dynamically based on `activeMenuItem` state (Overview or Properties)
7. Stats below mockup swap in parallel with main content using same scroll-driven transforms

**Viewport Entry Animations:**

1. Component enters viewport
2. `initial="hidden"` state applied (opacity: 0, y: 30)
3. `whileInView="visible"` triggers when viewport `amount` threshold met (typically 0.3)
4. Variant executes with configured duration (0.5s) and easing
5. Animation fires once (`viewport={{ once: true }}`)
6. Example: `src/components/newlanding/Stats.tsx` (lines 182-207), `src/components/newlanding/Features.tsx` (lines 109-130)

**Animation Composition (Stats & Testimonials):**

1. Parent container uses stagger variant with `staggerChildren: 0.1`
2. Child items animate with individual delays staggered by 100ms
3. CountUp animations trigger based on `isInView` visibility flag
4. DecryptedText animations progress character-by-character when visible
5. All nested animations respect parent stagger timing

**State Management:**

- Scroll progress: `useScroll()` hook with element target reference (`scrollYProgress`)
- Animation visibility: Component-level boolean refs (`hasAnimatedRef`, `initialStatsVisible`, `switchedStatsVisible`)
- User input: onClick handlers for interactive elements (sidebar toggle, menu clicks, mobile menu open/close)
- Visual state: Conditional className application based on `scrolled`/`sidebarExpanded` flags
- Motion values: Cached via `useMotionValue` in transforms to prevent recalculations

**User Authentication Flow:**
1. Clerk OAuth/sign-in captures identity → `clerk/nextjs` handles session
2. Root layout (`src/app/[locale]/layout.tsx`) wraps app with ClerkProvider + ConvexClientProvider
3. `ConvexClientProvider` initializes Convex client with auth token from Clerk
4. Protected layout (`src/app/[locale]/(app)/layout.tsx`) checks `useConvexAuth()` + `useCurrentUser()` hook
5. If authenticated: Route to dashboard/app, else redirect to `/sign-in`
6. `useCurrentUser()` hook queries `api.users.getCurrentUser` and syncs user record on first login via `getOrCreateUser` mutation

**Property Discovery Flow:**
1. User navigates to `/properties` → page queries `api.properties.list` with filters
2. Component uses `useQuery(api.properties.list, { status, ...filters })`
3. Convex returns paginated/filtered results, component renders PropertyCard components
4. User favorites property → `useMutation(api.favorites.toggle)` → instant local update + backend sync
5. User clicks property detail → Next.js routes to `/properties/[id]` → page queries `api.properties.get` for full details

**Deal Management Flow:**
1. Provider creates deal → `useMutation(api.deals.create)` with investor + property IDs
2. Deal enters initial stage (e.g., "broker_review") → deal record created with status
3. Provider updates stage → `useMutation(api.deals.updateStage, { stageId, nextStage })`
4. Each stage change triggers activity log entry via `api.deals.getActivityLog`
5. When stage requires handoff to next provider → `useMutation(api.deals.handoffToNextProvider)`
6. Receiving provider accepts via `useMutation(api.deals.acceptHandoff)`

**AI Chat Flow:**
1. User opens AIChatPanel component → `useAIChat()` hook initializes
2. Hook calls `api.ai.messages.listMessages` action to fetch thread history
3. User sends message → `api.ai.chat.sendMessage` action called
4. Action retrieves user profile context via `api.ai.context.buildProfileContext`
5. Convex agent (@anthropic-ai/sdk) generates response with system prompt
6. Response streamed to client via `saveStreamDeltas` for word-chunked persistence
7. After message completes, messages refetched to display full response
8. If conversation exceeds threshold, `api.ai.summarization.summarizeThread` auto-triggers

## Key Abstractions

**Animation Variants (Landing Page):**

- `fadeInUp`: opacity 0→1, y: 30px→0, duration 0.5s (used across 8 landing components)
- `stagger`: Parent container with 0.1s staggerChildren delay (Hero, Stats)
- `statItem`: opacity and y offset animation for individual stat cards (Stats component)
- Custom directional variants: `initial` x/y offsets, directional entry from left/right/top/bottom (Automation component)

- Examples: `src/components/newlanding/Hero.tsx` (lines 28-41), `src/components/newlanding/Stats.tsx` (lines 12-30), `src/components/newlanding/Automation.tsx` (lines 17-27)

**CountUp Component:**

- Purpose: Animate numeric values with suffix parsing (B, M, K, %, +)
- Pattern: requestAnimationFrame loop with easing (easeOut cubic), prevents duplicate animation via `hasAnimatedRef`
- Shared by: Hero.tsx (lines 59-145), Stats.tsx (lines 33-104)
- Logic: Regex extraction of prefix/numeric/suffix → animated value → formatted display
- Handles: "$1.5B+", "2.5M", "99.99%", "140+", "24/7"

**DecryptedText Component:**

- Purpose: Progressive character reveal animation (simulates decryption/unscrambling)
- Pattern: Character-by-character replacement with random chars until reveal
- Shared by: Hero.tsx (lines 148-213), Stats.tsx (lines 107-167)
- Preserves: Whitespace, special characters (`:`, `/`, `.`)
- Timing: Total iterations = text.length * 3, progresses based on iteration count

**Navigation Model (App-wide):**
- Purpose: Role-based navigation structure with locale-aware routing
- Examples: `src/lib/navigation.ts`, `src/components/newlanding/Navigation.tsx`
- Pattern: Menu items loaded dynamically via translations; scroll-aware styling

**User Model:**
- Purpose: Represents authenticated user with role, profile, and provider-specific data
- Examples: `convex/users.ts`, `src/hooks/useCurrentUser.ts`
- Pattern: Query-based with fallback to create-on-first-login; role system with viewingAsRole for admins

**Deal Model:**
- Purpose: Represents real estate investment transaction with multi-stage workflow
- Examples: `convex/deals.ts`, `src/components/deals/`
- Pattern: Stage-driven state machine (broker_review → appraisal → mortgage → legal → closing)

**Property Model:**
- Purpose: Real estate asset with investment metrics and status tracking
- Examples: `convex/properties.ts`, `src/app/[locale]/(app)/properties/`
- Pattern: Searchable, filterable catalog with favorites and tour scheduling

## Entry Points

**Navigation (Landing Page):**
- Location: `src/components/newlanding/Navigation.tsx`
- Triggers: Page load (desktop/mobile switch), scroll events
- Responsibilities: Top navigation bar with dropdowns, scroll-aware styling, mobile menu via Sheet component

**Hero (Landing Page):**
- Location: `src/components/newlanding/Hero.tsx`
- Triggers: Page load, scroll through 400vh section
- Responsibilities: Main banner, dashboard mockup preview, content swapping animation, sidebar interaction, stats animation

**Landing Page Assembly:**
- Location: `src/app/[locale]/(main)/page.tsx`
- Triggers: Navigation to `/`
- Responsibilities: Sequential component composition, metadata definition

**Next.js Root:**
- Location: `src/app/[locale]/layout.tsx`
- Triggers: App startup
- Responsibilities: Wraps entire app with providers (Clerk, Convex, i18n, theme); loads fonts; sets metadata

**Protected App Layout:**
- Location: `src/app/[locale]/(app)/layout.tsx`
- Triggers: Navigation to any route in (app) group
- Responsibilities: Authentication gate; role-aware onboarding redirect; user context initialization

**Auth Routes:**
- Location: `src/app/[locale]/(auth)/`
- Triggers: Unauthenticated navigation to `/sign-in` or `/sign-up`
- Responsibilities: Clerk-provided sign-in/sign-up forms; post-auth redirect to dashboard

**Dashboard:**
- Location: `src/app/[locale]/(app)/dashboard/page.tsx`
- Triggers: Authenticated user navigates to `/dashboard`
- Responsibilities: Role-aware dashboard (provider dashboard for service providers, property recommendations for investors)

## Error Handling

**Strategy (Landing Page):** Defensive prop defaults and visibility flags; graceful animation fallbacks

**Patterns:**
- Optional `className` props with fallback to empty string via `cn()` utility
- `isVisible` flags prevent duplicate animation initialization via `hasAnimatedRef`
- CountUp handles unparseable numeric formats gracefully (falls back to "0")
- DecryptedText returns raw text if `isVisible=false` instead of animating
- Scroll event listeners use requestAnimationFrame throttling to prevent jank

**Strategy (App):** Async try-catch for server operations; fallback UI states (loading spinners, error messages); user-friendly toast notifications via sonner.

**Patterns:**
- Convex actions throw errors automatically caught by React hooks → state error + display message
- Query failures handled via undefined state (loading) → component renders skeleton/spinner
- Form validation via react-hook-form + Zod → display inline field errors
- Critical auth errors trigger redirect to `/sign-in` via `useEffect` in layout
- API action failures display error toast notification and revert optimistic updates

## Cross-Cutting Concerns

**Logging:** Console-free on landing page; uses React DevTools for motion debugging. App-wide: No structured logging system; uses `console.error` for debugging in development.

**Validation:**
- Landing page: Translation keys validated at build time by `next-intl`; Image paths validated by Next.js Image component
- App-wide: Zod schema definitions in `convex/schema.ts` for all data types; react-hook-form validates client-side form inputs

**Authentication:** Landing page is public. App-wide: Clerk OAuth session management + Convex auth integration for API calls; user identity extracted via `ctx.auth.getUserIdentity()` in backend actions.

**Authorization:** Landing page is public. App-wide: Role-based access control in `useCurrentUser()` hook returns `effectiveRole` (admin viewingAsRole or actual role); components render conditionally on `isServiceProvider`, `isAdmin`, `isInvestor` flags.

**Internationalization:**
- Landing page: Uses next-intl for menu items, headings, descriptions, section content
- App-wide: next-intl handles routing, message loading, and locale context; components use `useTranslations()` hook to fetch i18n strings; RTL support via DirectionProvider for Hebrew locale.

**Responsive Design (Landing Page):**
- Mobile-first Tailwind breakpoints (sm, md, lg) applied throughout
- Hero dashboard mockup: hidden sidebar on mobile, sticky positioning adjusted via top offset
- Navigation: Separate desktop (NavigationMenu) and mobile (Sheet) implementations
- Testimonials carousel: basis-full (mobile) → basis-1/2 (md) → basis-1/3 (lg)
- Features: min-h-screen flexbox with responsive grid-based LayoutGrid component

**Performance Optimization (Landing Page):**
- Scroll event listener uses requestAnimationFrame throttling (Navigation.tsx, lines 76-94)
- `passive: true` event listeners for scroll performance
- Motion values cached via `useMotionValue` to prevent recalculations
- Video autoplay with `muted`, `playsInline` for mobile compatibility (Automation, Features)
- Images use Next.js Image component with lazy loading (Testimonials)
- CSS Grid for complex layouts (Hero dashboard mockup)

**Styling Strategy (Landing Page):**
- Utility-first Tailwind CSS with custom theme variables
- Dark mode support via `dark:` prefixes throughout
- Color semantic tokens: `foreground`, `background`, `muted-foreground`, `border`, `card`
- Consistent spacing scale applied across components
- Sticky positioning for navigation and mockup during scroll

---

*Architecture analysis: 2026-01-28*
