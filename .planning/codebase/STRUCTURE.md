# Codebase Structure

**Analysis Date:** 2026-01-28

## Directory Layout

```
/Users/Kohelet/Code/REOS/
├── src/                           # Next.js application source
│   ├── app/                       # Next.js App Router
│   │   ├── [locale]/              # Dynamic locale segment for i18n routing
│   │   │   ├── layout.tsx         # Root layout with providers
│   │   │   ├── ConvexClientProvider.tsx
│   │   │   ├── Providers.tsx      # Theme, i18n, direction providers
│   │   │   ├── (main)/            # Public/landing routes
│   │   │   │   └── page.tsx       # Landing page - composes newlanding components
│   │   │   ├── (auth)/            # Authentication routes (Clerk managed)
│   │   │   │   ├── layout.tsx
│   │   │   │   ├── sign-in/
│   │   │   │   └── sign-up/
│   │   │   └── (app)/             # Protected authenticated app routes
│   │   │       ├── layout.tsx     # Auth gate and AppShell wrapper
│   │   │       ├── dashboard/
│   │   │       ├── properties/    # Property browsing and management
│   │   │       ├── deals/         # Deal workflow pages
│   │   │       ├── chat/          # Chat/messaging
│   │   │       ├── profile/       # User profile pages
│   │   │       ├── settings/      # User settings
│   │   │       └── [service]/     # Service-specific pages (mortgage, legal, appraisal, notary, accounting)
│   │   ├── globals.css            # Global Tailwind styles
│   │   └── favicon.ico
│   ├── components/                # Reusable React components
│   │   ├── ui/                    # shadcn/ui + Radix UI primitives (45+ files)
│   │   ├── newlanding/            # NEW: Landing page sections (9 components)
│   │   │   ├── Navigation.tsx     # Sticky nav with dropdowns and mobile menu
│   │   │   ├── Hero.tsx           # Hero section with scroll-driven dashboard mockup
│   │   │   ├── SocialProof.tsx    # Client logos section
│   │   │   ├── Features.tsx       # LayoutGrid feature cards
│   │   │   ├── Automation.tsx     # Provider integration grid with diagonal background
│   │   │   ├── Testimonials.tsx   # NEW: Client testimonials carousel
│   │   │   ├── Stats.tsx          # UPDATED: Key metrics with CountUp/DecryptedText
│   │   │   ├── CTA.tsx            # Call-to-action section
│   │   │   ├── Footer.tsx         # Footer with links
│   │   │   └── index.ts           # Barrel export of all landing components
│   │   ├── layout/                # Layout components (AppShell, Sidebar, Header, MobileBottomNav)
│   │   ├── ai/                    # AI chat components and hooks
│   │   ├── chat/                  # Chat/conversation components
│   │   ├── properties/            # Property display and filtering components
│   │   ├── deals/                 # Deal management UI components
│   │   ├── feed/                  # User feed/activity components
│   │   ├── profile/               # User profile components
│   │   ├── dashboard/             # Dashboard components
│   │   ├── questionnaire/         # Investor onboarding questionnaire steps
│   │   ├── search/                # Global search components
│   │   ├── settings/              # Settings UI components
│   │   ├── notifications/         # Notification components
│   │   ├── header/                # Header-related components (AvatarDropdown, MobileSearchExpander)
│   │   ├── theme/                 # Theme utilities
│   │   ├── discovery/             # Discovery/matching components
│   │   └── IncompleteProfileReminder.tsx
│   ├── hooks/                     # Custom React hooks
│   │   ├── useCurrentUser.ts      # Current user context with role utilities
│   │   └── use-mobile.ts          # Responsive mobile detection
│   ├── i18n/                      # Internationalization
│   │   ├── routing.ts             # next-intl routing config (en, he locales)
│   │   ├── request.ts             # i18n request adapter
│   │   └── navigation.ts          # Locale-aware Link and useRouter
│   ├── lib/                       # Utilities and constants
│   │   ├── utils.ts               # cn() - Tailwind class merger
│   │   ├── constants.ts           # App-wide constants (USER_ROLES, etc)
│   │   ├── deal-constants.ts      # Deal stage definitions and flow
│   │   ├── navigation.ts          # Navigation helpers
│   │   └── search-actions.ts      # Search utilities
│   └── env.ts                     # Environment variable validation (if present)
├── convex/                        # Convex backend
│   ├── schema.ts                  # Database schema + type definitions
│   ├── auth.config.ts             # Clerk authentication config
│   ├── convex.config.ts           # Convex project config
│   ├── _generated/                # Auto-generated Convex API types
│   │   ├── api.ts                 # Generated API types for all handlers
│   │   └── dataModel.d.ts         # Generated TypeScript types for schema
│   ├── ai/                        # AI-specific functions
│   │   ├── chat.ts                # Main chat action (sendMessage)
│   │   ├── messages.ts            # Message storage and retrieval
│   │   ├── agent.ts               # Anthropic agent setup with system prompt
│   │   ├── context.ts             # User profile context building for prompts
│   │   ├── threads.ts             # Conversation thread management
│   │   └── summarization.ts       # Automatic conversation summarization
│   ├── users.ts                   # User queries/mutations (getCurrentUser, getOrCreateUser, setUserRole, etc)
│   ├── properties.ts              # Property catalog queries
│   ├── deals.ts                   # Deal workflow mutations/queries
│   ├── favorites.ts               # Favorite properties
│   ├── dealFiles.ts               # File upload/download for deals
│   ├── conversations.ts           # Group and direct message conversations
│   ├── directMessages.ts          # Direct message queries/mutations
│   ├── messages.ts                # Message storage in conversations
│   ├── notifications.ts           # User notifications
│   ├── clients.ts                 # Client management for providers
│   ├── serviceProviderProfiles.ts # Service provider profiles
│   ├── providerAvailability.ts    # Provider availability/scheduling
│   ├── investorProfiles.ts        # Investor profile data
│   ├── investorQuestionnaires.ts  # Questionnaire responses
│   ├── search.ts                  # Property search filters
│   ├── globalSearch.ts            # Global search across resources
│   ├── searchHistory.ts           # User search history
│   ├── dashboard.ts               # Dashboard queries
│   ├── priceHistory.ts            # Property price tracking
│   ├── seed.ts                    # Seed data for development
│   ├── seedAnalyticsData.ts       # Analytics data seeding
│   └── analytics.ts               # Analytics tracking
├── public/                        # Static assets
│   └── images/
├── messages/                      # i18n message files (auto-generated or manual)
├── .planning/                     # GSD planning artifacts
│   ├── codebase/                  # Codebase analysis docs
│   ├── phases/                    # Phase implementation plans
│   ├── milestones/                # Milestone tracking
│   └── research/                  # Research notes
├── package.json                   # Project dependencies
├── tsconfig.json                  # TypeScript config with @ path alias
├── next.config.ts                 # Next.js with next-intl plugin
├── eslint.config.mjs              # ESLint config (Next.js + TypeScript)
└── tailwind.config.ts             # Tailwind CSS config (v4)
```

## Directory Purposes

**src/app/[locale]:**
- Purpose: Next.js App Router pages and layouts with i18n routing
- Contains: Page components, layout wrappers, authentication gates
- Key files: `layout.tsx` (root), `(app)/layout.tsx` (protected), page.tsx files for routes

**src/components:**
- Purpose: Reusable React components organized by feature domain
- Contains: 191 TypeScript component files across 27 directories
- Key files: `ui/` (design system primitives), `layout/` (shell structure), `ai/` (AI chat UI), feature-specific folders

**src/components/newlanding:**
- Purpose: Landing page section components with scroll-driven animations
- Contains: 9 fully self-contained motion components with framer-motion
- Key files:
  - `Navigation.tsx`: Sticky nav with scroll awareness, desktop/mobile variants
  - `Hero.tsx`: Main banner with 400vh scrollable section, dashboard mockup with content swapping
  - `SocialProof.tsx`: Client logo grid with scroll-driven fade
  - `Features.tsx`: LayoutGrid with feature cards and embedded video
  - `Automation.tsx`: Provider grid with diagonal background and directional animations
  - `Testimonials.tsx`: NEW - Carousel of client testimonials with hover effects
  - `Stats.tsx`: UPDATED - Metric cards with CountUp and DecryptedText animations
  - `CTA.tsx`: Call-to-action banner with two button options
  - `Footer.tsx`: Multi-column footer with links and social icons
  - `index.ts`: Barrel export for clean imports in landing page

**src/hooks:**
- Purpose: Custom React hooks for state and data fetching
- Contains: useCurrentUser (role/auth context), use-mobile (responsive), AI chat hooks
- Key files: `useCurrentUser.ts` (central user context)

**src/i18n:**
- Purpose: Internationalization configuration and routing
- Contains: Locale routing setup, next-intl integration, i18n message loading
- Key files: `routing.ts` (locale config), `request.ts` (SSR adapter), `navigation.ts` (locale-aware Link/useRouter)

**src/lib:**
- Purpose: Shared utilities, constants, and helpers
- Contains: Tailwind utilities, app constants, deal workflow definitions, search helpers
- Key files: `utils.ts` (cn helper), `constants.ts` (USER_ROLES, etc), `deal-constants.ts` (stage definitions)

**convex:**
- Purpose: Backend API layer - queries, mutations, and actions
- Contains: Database schema, authentication config, domain-specific handler modules
- Key files: `schema.ts` (all data models), `ai/` (AI features), `users.ts`, `deals.ts`, `properties.ts`

**convex/_generated:**
- Purpose: Auto-generated TypeScript types from Convex schema and handlers
- Contains: Type definitions for all queries/mutations/actions, database ID types
- Key files: `api.ts` (generated API client), `dataModel.d.ts` (schema types)

## Key File Locations

**Landing Page Entry Points:**
- `src/app/[locale]/(main)/page.tsx`: Assembles 7 landing sections in sequence
- `src/components/newlanding/index.ts`: Barrel export of all 9 landing components
- `src/components/newlanding/Hero.tsx`: Largest component (810 lines), handles dashboard mockup and scroll orchestration
- `src/components/newlanding/Navigation.tsx`: 438 lines, manages scroll-aware nav and mobile menu

**App Entry Points:**
- `src/app/[locale]/layout.tsx`: Root app layout with all providers
- `src/app/[locale]/(app)/layout.tsx`: Protected app layout with auth gate
- `src/app/[locale]/ConvexClientProvider.tsx`: Convex client initialization

**Configuration:**
- `tsconfig.json`: TypeScript config with `@/*` path alias pointing to `./src/*`
- `next.config.ts`: Next.js config with next-intl plugin
- `convex/schema.ts`: Database schema and all type definitions
- `convex/auth.config.ts`: Clerk authentication provider config

**Core Logic:**
- `src/hooks/useCurrentUser.ts`: Central user context and role utilities
- `src/components/layout/AppShell.tsx`: Main app layout component with sidebar/header
- `convex/ai/chat.ts`: AI message streaming action
- `convex/deals.ts`: Deal workflow mutations and queries

**UI Components:**
- `src/components/ui/`: 45+ shadcn/ui components (button, dialog, card, etc)
- `src/components/newlanding/`: 9 landing section components
- `src/components/ai/`: AI chat components (AIChatPanel, ChatMessageList, AIChatInput)

**Utilities:**
- `src/lib/utils.ts`: `cn()` function for Tailwind class merging
- `src/lib/constants.ts`: App-wide enums and constants
- `src/lib/deal-constants.ts`: Deal stage definitions and stage transitions

**Testing:**
- Not applicable - no test files present in codebase

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `AIChatPanel.tsx`, `ChatMessageList.tsx`, `Hero.tsx`, `Testimonials.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useCurrentUser.ts`, `use-mobile.ts`)
- Utilities/Functions: camelCase (e.g., `utils.ts`, `constants.ts`)
- Styles: PascalCase matching component (e.g., `Button.tsx` with internal styles)
- Pages: lowercase or index.tsx (e.g., `page.tsx`, `[id]/page.tsx`)

**Directories:**
- Feature-based: lowercase or PascalCase (e.g., `components/ai/`, `components/newlanding/`, `convex/ai/`)
- Dynamic segments: square brackets (e.g., `[locale]`, `[id]`, `[email]`)
- Route groups: parentheses (e.g., `(app)`, `(auth)`, `(main)`)

**Exports:**
- Barrel files: `index.ts` or `index.tsx` re-export all public exports from directory
- Example: `src/components/newlanding/index.ts` exports all 9 landing components

**Imports:**
- Absolute imports via `@/` alias (maps to `src/`)
- Example: `import { Hero } from "@/components/newlanding"`

## Where to Add New Code

**New Landing Page Section:**
- Component file: `src/components/newlanding/[SectionName].tsx`
- Pattern:
  ```typescript
  "use client";

  import { motion, type Variants } from "framer-motion";
  import { useTranslations } from "next-intl";
  import { cn } from "@/lib/utils";

  const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  export function [SectionName]({ className }: { className?: string }) {
    const t = useTranslations("landing.[section]");

    return (
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeInUp}
        className={cn("py-20 md:py-24 border-t border-border/50", className)}
      >
        {/* Content */}
      </motion.section>
    );
  }
  ```
- Export: Add to `src/components/newlanding/index.ts`
- Use: Import in `src/app/[locale]/(main)/page.tsx` and place in component sequence

**New Feature (pages + components + backend):**
- Backend logic: Create new file in `convex/[domain].ts` (e.g., `convex/feedback.ts`)
- Page route: `src/app/[locale]/(app)/[feature]/page.tsx`
- Components: `src/components/[feature]/[ComponentName].tsx`
- Hooks: `src/components/[feature]/hooks/use[Feature].ts` (if feature-specific)

**New Component/Module:**
- Shared component: `src/components/[feature]/[ComponentName].tsx`
- UI primitive: `src/components/ui/[component-name].tsx` (shadcn style)
- Landing section: `src/components/newlanding/[SectionName].tsx` (for new sections)
- Barrel export: Create `src/components/[feature]/index.ts` with re-exports

**Utilities:**
- Shared helpers: `src/lib/utils.ts` (small) or `src/lib/[domain]-utils.ts` (larger)
- Constants: Add to `src/lib/constants.ts` or create `src/lib/[domain]-constants.ts`
- Hooks: `src/hooks/use[Name].ts` (app-wide) or `src/components/[feature]/hooks/use[Name].ts` (feature-specific)

**Backend Operations:**
- Queries (read): `convex/[domain].ts` with `export const [name] = query({...})`
- Mutations (write): `convex/[domain].ts` with `export const [name] = mutation({...})`
- Actions (long-running): `convex/[domain].ts` or `convex/[domain]/[name].ts` with `export const [name] = action({...})`
- AI features: Always place in `convex/ai/` subdirectory

## Special Directories

**src/components/newlanding/:**
- Purpose: Landing page section components with scroll-driven animations
- Generated: No
- Committed: Yes
- Modification: Add new sections following existing pattern (motion.section, fadeInUp variant, useTranslations, cn utilities)

**convex/_generated/:**
- Purpose: Auto-generated TypeScript types
- Generated: Yes (auto-generated by Convex CLI on every `convex dev`)
- Committed: Yes (committed to git for type safety)
- Modification: Never edit directly - regenerated automatically

**public/:**
- Purpose: Static assets served directly by Next.js
- Generated: No
- Committed: Yes
- Modification: Place images, icons, videos here and reference via `/` paths (e.g., `/AIChatAdvisor.mp4`, `/logos/testimonials/client1.svg`)

**messages/:**
- Purpose: i18n message translations (en, he)
- Generated: May be auto-generated or manually maintained
- Committed: Yes
- Modification: Add translation keys here for use in components via `useTranslations()` (e.g., `landing.hero`, `landing.testimonials`)

**.next/:**
- Purpose: Next.js build output
- Generated: Yes
- Committed: No (in .gitignore)
- Modification: Never edit

---

*Structure analysis: 2026-01-28*
