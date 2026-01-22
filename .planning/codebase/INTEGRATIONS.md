# External Integrations

**Analysis Date:** 2026-01-22

## APIs & External Services

**AI & Language Models:**
- Anthropic Claude - AI conversation and summarization
  - SDK: `@anthropic-ai/sdk` (0.71.2) and `@ai-sdk/anthropic` (2.0.57)
  - Model: `claude-sonnet-4-20250514` (via investorAssistant)
  - Purpose: AI investor assistant for answering investment questions, profile guidance
  - Integration: `convex/ai/agent.ts` (investorAssistant agent configuration)
  - Auth: API key managed via Anthropic account
  - Implementation details:
    - createStreamingAgent approach with memory persistence via Convex
    - System instructions in `convex/ai/agent.ts` lines 31-56
    - Context options: recentMessages = 10 (matches summarization threshold)

**Image Services:**
- Unsplash - Stock images for property previews
  - Configuration: `next.config.ts` allows images.unsplash.com
  - Purpose: Property image sourcing and display

## Data Storage

**Databases:**
- Convex Backend Database
  - Connection: `NEXT_PUBLIC_CONVEX_URL` environment variable
  - Client: `convex/react` (React hooks) and convex SDK
  - Schema location: `convex/schema.ts`
  - Features:
    - Real-time subscriptions via useQuery, useMutation, useAction
    - File storage via Convex Storage (_storage table)
  - Main tables:
    - users - Core user records with Clerk integration
    - investorProfiles - Investor-specific investment preferences
    - serviceProviderProfiles - Broker, mortgage advisor, lawyer profiles
    - properties - Real estate listings with investment metrics
    - deals - Deal tracking with multi-provider collaboration
    - aiThreads - AI conversation threads and memory (for AI assistant)
    - messages, conversations, directMessages - Communication
    - notifications - User notifications
    - posts, postLikes, postComments, postReposts, userFollows - Social features
    - searchHistory - User search history tracking
    - And 10+ supporting tables for deals, files, reviews, analytics, etc.

**File Storage:**
- Convex Storage
  - Purpose: Deal document uploads (pdfs, images, etc.)
  - Integration: `dealFiles` table stores files with `storageId: v.id("_storage")`
  - Access: Through Convex mutations in `convex/dealFiles.ts`

**Search:**
- Convex Search Indexes
  - Full-text search on users table (searchField: "name")
  - Filters: role, onboardingComplete
  - Implementation: `convex/globalSearch.ts`, `convex/search.ts`

## Authentication & Identity

**Auth Provider:**
- Clerk - User authentication and session management
  - SDK: `@clerk/nextjs` (6.36.7)
  - Keys:
    - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Public key (test: pk_test_...)
    - `CLERK_SECRET_KEY` - Secret key (test: sk_test_...)
    - `CLERK_JWT_ISSUER_DOMAIN` - JWT issuer (test: https://glorious-boar-65.clerk.accounts.dev)
  - JWT Configuration:
    - Integrated with Convex via `convex/auth.config.ts`
    - Provider domain: `process.env.CLERK_JWT_ISSUER_DOMAIN`
    - Application ID: "convex"
  - Implementation:
    - `src/app/[locale]/layout.tsx` wraps app with `<ClerkProvider>`
    - User identity verified in Convex functions via `ctx.auth.getUserIdentity()`
    - User records linked via `clerkId` field

## Monitoring & Observability

**Error Tracking:**
- Not detected

**Logs:**
- Browser console and server logs (standard Next.js/Convex logging)
- AI chat error handling in `src/components/ai/hooks/useAIChat.ts` (error state management)

## CI/CD & Deployment

**Hosting:**
- Vercel (implied by Next.js App Router, next-themes, and deployment tooling)

**Backend Hosting:**
- Convex Cloud - `dev:famous-hornet-556` deployment
  - Team: itai-biton-72641
  - Project: reos

**CI Pipeline:**
- Not detected - No GitHub Actions, GitLab CI, or other CI/CD configuration found

## Environment Configuration

**Required env vars:**

*Development (.env.local):*
```
CONVEX_DEPLOYMENT=dev:famous-hornet-556
NEXT_PUBLIC_CONVEX_URL=https://famous-hornet-556.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://glorious-boar-65.clerk.accounts.dev
```

*Frontend-facing (NEXT_PUBLIC):*
- NEXT_PUBLIC_CONVEX_URL - Backend connection
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY - Clerk authentication

*Backend-only:*
- CONVEX_DEPLOYMENT - Convex project identifier
- CLERK_SECRET_KEY - Clerk secret for verification
- CLERK_JWT_ISSUER_DOMAIN - Clerk JWT domain

**Secrets Location:**
- `.env.local` file (git-ignored)
- Clerk dashboard for key management
- Convex dashboard for deployment settings

## Webhooks & Callbacks

**Incoming:**
- Not detected - No incoming webhook endpoints configured

**Outgoing:**
- Clerk webhooks (implied by @clerk/nextjs, but not explicitly configured in codebase)
- Convex agent streaming callbacks for AI responses (internal to Convex agents)

## Data Integration Patterns

**Real-time Subscriptions:**
- Implemented via Convex React hooks in client components:
  - `useQuery()` - Real-time queries
  - `useMutation()` - Server mutations
  - `useAction()` - Server actions (for AI chat, long-running operations)
- Examples:
  - `src/components/ai/hooks/useAIChat.ts` - useAction for AI chat, useQuery for threads
  - `src/hooks/useCurrentUser.ts` - useQuery for user data
  - `src/components/layout/Header.tsx` - Multiple useQuery calls for notifications, user data

**AI Assistant Integration:**
- Agent-based conversation through Convex agents
- Flow (`convex/ai/chat.ts`):
  1. User sends message via sendMessage action
  2. Get or create thread for user (stored in aiThreads table)
  3. Load profile context from questionnaire (investorProfiles)
  4. Stream response using investorAssistant with Claude
  5. Messages stored via saveStreamDeltas for persistence
  6. Trigger summarization when message count exceeds threshold
- Memory management:
  - Recent messages (10) kept verbatim in aiThreads
  - Older messages summarized to manage token usage
  - Summary stored in `aiThreads.summary` field
  - Context building in `convex/ai/context.ts`

**Search Integration:**
- Property search via `convex/search.ts` and `convex/globalSearch.ts`
- User search via Convex Search Index on users table
- Search history tracked in `searchHistory` table

## Third-party Libraries with External Services

**Maps & Location:**
- Leaflet (1.9.4) + react-leaflet (5.0.0) - JavaScript mapping library
  - No explicit external API key required (unless map tiles provider is added)
  - Used for property location visualization

**Analytics (Implied):**
- next-themes (0.4.6) - Theme management (no external service)
- No explicit analytics service configured (Google Analytics, Mixpanel, etc. not detected)

---

*Integration audit: 2026-01-22*
