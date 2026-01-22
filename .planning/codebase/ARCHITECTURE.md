# Architecture

**Analysis Date:** 2026-01-22

## Pattern Overview

**Overall:** Multi-layered full-stack application using Next.js 16 with App Router, Convex backend, and React 19 frontend with role-based access patterns.

**Key Characteristics:**
- Server-side rendering (SSR) and streaming for core pages with client-side interactive features
- Real-time data synchronization via Convex API with React hooks
- Role-based architecture supporting five distinct user types (investor, broker, mortgage_advisor, lawyer, admin)
- Internationalization (i18n) support with locale routing (English/Hebrew with RTL support)
- Component-driven UI with shadcn/ui design system wrapped in Radix UI primitives
- Modular backend with Convex actions, mutations, and queries organized by domain

## Layers

**Presentation Layer (Frontend):**
- Purpose: User interface components and page layouts
- Location: `src/components/`, `src/app/`
- Contains: React components (pages, layouts, UI primitives), landing page sections, feature-specific component groups
- Depends on: React hooks, Convex API client, i18n routing, form libraries
- Used by: Browser (public), authenticated app users

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

**State Management:**
- **Client State:** React hooks (useState) for UI-only state (isLoading, isStreaming, modals)
- **Server State:** Convex queries/mutations as source of truth (user data, properties, deals)
- **Optimistic Updates:** Components add user messages optimistically, refetch to reconcile on success
- **Real-time:** useQuery subscriptions auto-update when backend data changes

## Key Abstractions

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

**AI Thread Model:**
- Purpose: Conversation context for user-specific AI assistance
- Examples: `convex/ai/threads.ts`, `src/components/ai/`
- Pattern: One thread per user, messages stored separately with lazy loading

**Provider Service Model:**
- Purpose: Service provider profiles (broker, mortgage advisor, lawyer) with availability/specialization
- Examples: `convex/serviceProviderProfiles.ts`, `src/components/profile/`
- Pattern: Role-based profiles with service types, language preferences, contact methods

## Entry Points

**Next.js Root:**
- Location: `src/app/[locale]/layout.tsx`
- Triggers: App startup
- Responsibilities: Wraps entire app with providers (Clerk, Convex, i18n, theme); loads fonts; sets metadata

**Protected App Layout:**
- Location: `src/app/[locale]/(app)/layout.tsx`
- Triggers: Navigation to any route in (app) group
- Responsibilities: Authentication gate; role-aware onboarding redirect; user context initialization

**Landing Page:**
- Location: `src/app/[locale]/(main)/page.tsx`
- Triggers: User visits root route without authentication
- Responsibilities: Renders landing page sections; no auth required

**Auth Routes:**
- Location: `src/app/[locale]/(auth)/`
- Triggers: Unauthenticated navigation to `/sign-in` or `/sign-up`
- Responsibilities: Clerk-provided sign-in/sign-up forms; post-auth redirect to dashboard

**Dashboard:**
- Location: `src/app/[locale]/(app)/dashboard/page.tsx`
- Triggers: Authenticated user navigates to `/dashboard`
- Responsibilities: Role-aware dashboard (provider dashboard for service providers, property recommendations for investors)

## Error Handling

**Strategy:** Async try-catch for server operations; fallback UI states (loading spinners, error messages); user-friendly toast notifications via sonner.

**Patterns:**
- Convex actions throw errors automatically caught by React hooks → state error + display message
- Query failures handled via undefined state (loading) → component renders skeleton/spinner
- Form validation via react-hook-form + Zod → display inline field errors
- Critical auth errors trigger redirect to `/sign-in` via `useEffect` in layout
- API action failures display error toast notification and revert optimistic updates

## Cross-Cutting Concerns

**Logging:** No structured logging system; uses `console.error` for debugging in development. Production errors logged client-side only (e.g., in AI chat catch blocks).

**Validation:** Zod schema definitions in `convex/schema.ts` for all data types; react-hook-form validates client-side form inputs before submission.

**Authentication:** Clerk OAuth session management + Convex auth integration for API calls; user identity extracted via `ctx.auth.getUserIdentity()` in backend actions.

**Authorization:** Role-based access control in `useCurrentUser()` hook returns `effectiveRole` (admin viewingAsRole or actual role); components render conditionally on `isServiceProvider`, `isAdmin`, `isInvestor` flags.

**Internationalization:** next-intl handles routing, message loading, and locale context; components use `useTranslations()` hook to fetch i18n strings; RTL support via DirectionProvider for Hebrew locale.

---

*Architecture analysis: 2026-01-22*
