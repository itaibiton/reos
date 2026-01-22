# Codebase Concerns

**Analysis Date:** 2026-01-22

## Tech Debt

**Extensive UI Coverage Without Backend Implementation:**
- Issue: 22 feature modules in `src/app/[locale]/(app)/` (accounting, appraisal, legal, mortgage, notary, tax, leads, etc.) have placeholder pages with minimal or no functional backend integration
- Files: `src/app/[locale]/(app)/accounting/*`, `src/app/[locale]/(app)/appraisal/*`, `src/app/[locale]/(app)/legal/*`, `src/app/[locale]/(app)/mortgage/*`, `src/app/[locale]/(app)/notary/*`, `src/app/[locale]/(app)/tax/*`, etc.
- Impact: UI is built but backend queries and mutations don't exist; features will fail at runtime when users navigate to these sections
- Fix approach: Inventory which modules are truly needed for MVP; either complete backend for critical features or remove placeholder UI pages; prioritize based on user flow

**N+1 Query Pattern in Service Requests:**
- Issue: `convex/serviceRequests.ts` (lines 61-94) loads requests then maps over each one calling `ctx.db.get()` individually for deal, investor, and property data
- Files: `convex/serviceRequests.ts` (listForProvider)
- Impact: For 100 requests, 300+ database calls; scales poorly with service provider load
- Fix approach: Implement batch loading or refactor to load related data in parallel before mapping; use indexed queries where possible

**Excessive .collect() Usage Without Pagination:**
- Issue: Multiple files call `.collect()` on full table queries then filter in memory: properties.ts, deals.ts, conversations.ts, globalSearch.ts, seed.ts
- Files: `convex/properties.ts` (line 75-78), `convex/deals.ts` (line 75), `convex/conversations.ts` (multiple), `convex/seed.ts` (throughout)
- Impact: Loading entire tables into memory becomes prohibitive at scale (50k+ deals/properties); memory consumption and latency spike
- Fix approach: Replace `.collect()` with indexed queries or implement cursor-based pagination; for seed operations, batch inserts in smaller chunks

**Untyped Generic (any) Usage:**
- Issue: `src/app/[locale]/(app)/clients/page.tsx` and `src/components/dashboard/ProviderDashboard.tsx` use `ReturnType<typeof useTranslations<any>>` to suppress type checking
- Files: `src/app/[locale]/(app)/clients/page.tsx`, `src/components/dashboard/ProviderDashboard.tsx`
- Impact: Reduces type safety for translation keys; strings can't be verified at compile time
- Fix approach: Extract proper generic type for translated hooks or use type-safe i18n patterns; enable stricter ESLint rules

**Console Error Logging Without Error Tracking Service:**
- Issue: Scattered `console.error()` calls (20+ instances) with no centralized error tracking or logging service
- Files: `src/app/[locale]/(app)/deals/[id]/page.tsx`, `src/app/[locale]/(app)/profile/investor/questionnaire/page.tsx`, `src/components/chat/*`, etc.
- Impact: Production errors are invisible; no observability of failure patterns; debuggability is poor
- Fix approach: Implement centralized error handler; integrate with error tracking (Sentry, LogRocket, etc.); add structured logging with context

**Large Component Files:**
- Issue: PropertyForm.tsx (1046 lines), deals/[id]/page.tsx (972 lines), sidebar.tsx (732 lines), InvestorSearchBar.tsx (642 lines) contain tightly coupled logic and markup
- Files: `src/components/properties/PropertyForm.tsx`, `src/app/[locale]/(app)/deals/[id]/page.tsx`, `src/components/ui/sidebar.tsx`, `src/components/layout/InvestorSearchBar.tsx`
- Impact: Difficult to test, maintain, reuse; cognitive load is high; changes to one feature risk breaking others in same file
- Fix approach: Break into smaller, focused components with extracted hooks; separate business logic from presentation

**Process.env Direct Access Without Validation:**
- Issue: `src/app/[locale]/ConvexClientProvider.tsx` uses `process.env.NEXT_PUBLIC_CONVEX_URL!` with non-null assertion; no validation that env var exists at runtime
- Files: `src/app/[locale]/ConvexClientProvider.tsx`
- Impact: Silent failure if env var missing; app crashes at runtime instead of build time
- Fix approach: Create validated config module that loads and validates all env vars at app startup; use Zod for schema validation

---

## Known Bugs

**Seed Data Dependency Chain Not Enforced:**
- Symptoms: Running `seed:seedDeals` or `seed:seedDealFlow` before `seed:seedProperties` silently returns empty or creates malformed data
- Files: `convex/seed.ts` (lines 244-329, 694-920)
- Trigger: Call seedDeals mutation without properties seeded first
- Workaround: Always run seedProperties first; no validation to prevent wrong order
- Fix approach: Add pre-flight checks that throw if prerequisites aren't met

**AI Thread Management Missing Error Handling:**
- Symptoms: If `investorAssistant.createThread()` or `continueThread()` fails, abort controller is never cleaned up, potentially leaking memory
- Files: `convex/ai/chat.ts` (lines 52-89)
- Trigger: Network error or agent service outage during chat session
- Workaround: None; user loses abort capability for that thread
- Fix approach: Wrap thread creation in try-finally; ensure cleanup of activeGenerations map on errors

**Service Request Enrichment Missing Null Safety:**
- Symptoms: If deal, investor, or property is deleted after request is created, enrichment logic returns null objects without proper type safety downstream
- Files: `convex/serviceRequests.ts` (lines 61-94)
- Trigger: Delete property that has active service requests
- Workaround: Must manually check null properties in UI
- Fix approach: Add non-null assertions or return type that properly reflects possible null values; add tests for orphaned records

**Summarization Background Task Doesn't Handle Failures Gracefully:**
- Symptoms: If summarization action fails, error is logged but chat stream already completed; user sees no error message about summary failure
- Files: `convex/ai/chat.ts` (lines 142-149)
- Trigger: Summarization service unavailable during long conversation
- Workaround: None; summary silently doesn't get created
- Fix approach: Store summary generation status in thread metadata; retry failed summarization on next message; notify user of summary failure if critical

---

## Security Considerations

**Clerk Auth Identity Not Validated Consistently:**
- Risk: Some endpoints check `ctx.auth.getUserIdentity()` but downstream queries still use unsafe lookups; identity could be spoofed if getUserIdentity fails
- Files: `convex/deals.ts`, `convex/serviceRequests.ts`, `convex/properties.ts` (multiple locations)
- Current mitigation: Clerk SDK handles verification; auth is enforced at middleware
- Recommendations: Add secondary validation checks for sensitive operations; implement role-based access control at query layer; add audit logs for sensitive mutations

**Seed Data Creates Hardcoded System Users:**
- Risk: System users with fixed emails (system@reos.dev, test_investor@reos.dev) are created during seeding; if seed runs in production, these become real accounts with API access
- Files: `convex/seed.ts` (lines 26-35, 267-276, 720-729)
- Current mitigation: Seed functions must be explicitly called; not automatic on deploy
- Recommendations: Make seed functions admin-only with explicit permission checks; add environment validation to prevent seed running in production; document seeding process clearly

**File Upload Permissions Not Validated:**
- Risk: dealFiles.ts likely allows any user to upload files to any deal if they know the dealId; no cross-check that user is deal participant
- Files: `convex/dealFiles.ts` (not fully read, but pattern suspected)
- Current mitigation: Unknown; needs verification
- Recommendations: Verify file uploads check that user is deal investor or assigned provider; implement deal participant validation before file operations

**Global Search Doesn't Filter by User Permissions:**
- Risk: globalSearch.ts searches across all public posts/properties/users but doesn't check visibility rules; users might see data they shouldn't
- Files: `convex/globalSearch.ts` (lines 44-65)
- Current mitigation: Search only returns public posts, available properties, onboarded users; but visibility model is loose
- Recommendations: Implement granular visibility checks (followers_only, deal_participants); add permission matrix for each result type; log search access

**AI Agent System Context Includes Sensitive Profile Data:**
- Risk: `convex/ai/chat.ts` (lines 58-74) loads full profile context and passes to agent; if agent conversation is logged or cached, sensitive investor profile exposure occurs
- Files: `convex/ai/chat.ts`, `convex/ai/context.ts`
- Current mitigation: Agent runs server-side; Convex handles data security
- Recommendations: Mask sensitive profile fields in system context (financial info, phone); implement content filtering on agent output; audit what data is passed to Claude

---

## Performance Bottlenecks

**In-Memory Property Filtering at Scale:**
- Problem: Properties query loads all available properties with `.collect()` then filters in JavaScript
- Files: `convex/properties.ts` (lines 75-96)
- Cause: Convex doesn't support multiple index filters; workaround loads full result set
- Current state: Fine for 100-200 properties; becomes slow >1000
- Improvement path: Create composite indexes for common filter combinations; implement vector search for complex queries; move filtering to Convex with multiple queries using Promise.all()

**Deal List Queries Per Role Load Entire Tables:**
- Problem: Each role (investor, broker, mortgage_advisor, lawyer) uses indexed query but then sorts all results in memory
- Files: `convex/deals.ts` (lines 44-91), `convex/deals.ts` (lines 120-151)
- Cause: Need to sort by createdAt but index only has role; must load all then sort
- Current state: Performance acceptable <1000 deals per role; degrades at scale
- Improvement path: Add composite index (role, createdAt); paginate results; implement cursor-based pagination

**Message Enrichment Creates Waterfall Requests:**
- Problem: serviceRequests.ts enriches each request sequentially; if 50 requests, 150 db.get calls happen serially
- Files: `convex/serviceRequests.ts` (lines 62-94)
- Cause: Promise.all wraps the map, but individual get() calls are still sequential within the Promise.all
- Current state: 50 requests take ~500ms at 10ms per query
- Improvement path: Batch load all deals/investors/properties in one step; cache by ID; refactor to use Promise.all on batched queries

**Conversation Message Pagination Missing:**
- Problem: conversations.ts and directMessages may load all messages for a conversation at once
- Files: `convex/conversations.ts`, `convex/directMessages.ts`
- Cause: No offset/limit pagination visible in initial read
- Current state: Fine for new conversations; old conversations with 1000+ messages may timeout
- Improvement path: Implement cursor-based pagination; lazy-load messages on scroll; add message archival for old conversations

---

## Fragile Areas

**Deal Stage Transition Logic:**
- Files: `convex/deals.ts` (VALID_TRANSITIONS object, mutation handlers)
- Why fragile: Hard-coded transition matrix; if new stage added, must update VALID_TRANSITIONS AND all reference code; no centralized state machine
- Safe modification: Create StageTransitionManager class; validate all transitions through it; add comprehensive tests for each transition path and invalid transitions
- Test coverage: Assumed minimal; no test files found for Convex mutations

**Investor Questionnaire Onboarding Flow:**
- Files: `src/app/[locale]/(app)/onboarding/questionnaire/page.tsx`, `src/app/[locale]/(app)/profile/investor/questionnaire/page.tsx`, corresponding Convex mutations
- Why fragile: Flow spans multiple components and database tables; skipping a step or navigating backward can leave partial data; no transaction support
- Safe modification: Create saga/orchestrator for onboarding flow; validate state before each step; use optimistic UI with rollback; add comprehensive error recovery
- Test coverage: Console.error calls visible but no unit tests found

**AI Summarization Checkpoint Logic:**
- Files: `convex/ai/chat.ts` (shouldSummarize check), `convex/ai/summarization.ts`
- Why fragile: Message count estimation is approximate (line 118-119 in chat.ts); off-by-one errors or message deletions could prevent summarization; no idempotency key
- Safe modification: Store explicit message count in thread metadata; track summarization state; add idempotency tokens; test with various message counts and deletions
- Test coverage: Not visible; background task error handling is minimal

**Service Provider Profile Data Consistency:**
- Files: `convex/users.ts` (user record), `convex/serviceProviderProfiles.ts`, `convex/seed.ts` (profile creation)
- Why fragile: User and profile are separate documents; no foreign key or cascading delete; deleting user leaves orphaned profile; seeding can create duplicates
- Safe modification: Add migration to clean up orphaned profiles; implement cascading delete handler; add unique constraint for user->profile relationship; strengthen seed idempotency
- Test coverage: Unknown; seed functions have no validation of final state

---

## Scaling Limits

**Database Growth Without Archival Strategy:**
- Current capacity: Convex on free/starter tier handles ~1M documents; project has 10+ tables potentially growing linearly with time
- Limit: At 100k active users with 10 deals each, 1M deal records; add posts (100k+), messages (1M+), activity logs (5M+), storage easily exceeds capacity
- Scaling path: Implement data archival (move old deals/messages to cold storage after 1 year); add denormalization strategy (store common joins in parent table); partition tables by date; monitor database size metrics

**Real-Time AI Agent Scaling:**
- Current capacity: Single investorAssistant instance; Anthropic API rate limits and token usage
- Limit: At 1000 concurrent users, token usage spikes; Claude API has rate limits; no queue or backpressure handling visible
- Scaling path: Implement request queuing with Bull or similar; add rate limiting per user; cache common responses; switch to faster model for simple queries; implement feedback loop to optimize prompts

**Search Index Scaling:**
- Current capacity: Search indexes in globalSearch.ts use basic full-text search
- Limit: At 100k posts/properties, search latency becomes noticeable; no ranking, relevance, or faceting
- Scaling path: Implement Meilisearch or Elasticsearch for advanced search; add result ranking by relevance; implement typo tolerance; add aggregations/facets

**Image Storage for Properties:**
- Current capacity: Properties have multiple image URLs (external Unsplash URLs in seed data); unclear if production uploads are handled
- Limit: If users upload images, storage and bandwidth costs scale linearly with properties and revisions
- Scaling path: Clarify image storage strategy (CDN, S3, Cloudinary); implement image optimization (lazy-load, WebP, responsive sizes); add image deletion on property removal; monitor CDN costs

---

## Dependencies at Risk

**@convex-dev/agent v0.3.2 - Experimental Framework:**
- Risk: Agent SDK is young (0.3.2); breaking changes likely in 0.4 or 1.0; documented interfaces may change; limited community support
- Impact: If breaking changes occur, AI chat system breaks; requires rework of agent configuration and message handling
- Migration plan: Pin agent version during development; monitor changelog; consider wrapper layer to abstract agent details; have fallback to simple prompt-response if agent system breaks

**Next-Intl v4.7.0 - Internationalization Layer:**
- Risk: Heavy use of next-intl throughout codebase; version 4 has stability; but tightly couples UI to i18n system; if major refactor needed, wide impact
- Impact: Changing i18n provider requires rewriting all components using useTranslations(); hard to switch to simpler solution if overhead becomes burden
- Migration plan: Create i18n abstraction layer; use dependency injection for translation function; avoid spreading useTranslations() calls throughout components

**React Hook Form v7.71.0 - Form Library:**
- Risk: Form system is heavily used in large components like PropertyForm.tsx; outdated compared to newer alternatives (TanStack Form); resolver pattern may become maintenance burden
- Impact: Complex forms become harder to maintain; validation logic scattered; if switching libraries needed, must refactor many components
- Migration plan: Consider extracting form logic into custom hooks; create form builder abstraction; monitor React ecosystem for better form solutions

**Tailwind v4 + PostCSS v4 - Build-Time Dependency:**
- Risk: Tailwind v4 is new; PostCSS v4 is cutting-edge; CSS generation could have edge cases; build times may increase
- Impact: Build failures; increased development loop time; potential CSS bloat if class generation is inefficient
- Migration plan: Monitor for bug reports; pin versions to avoid auto-upgrades; test build performance on each dependency update; have rollback plan to v3

---

## Missing Critical Features

**No Testing Infrastructure:**
- What's missing: No jest.config, vitest.config, or test files in src/; only node_modules test files visible
- Blocks: Cannot verify bug fixes; refactoring is risky; integration tests impossible; CI/CD can't validate functionality
- Priority: **HIGH** - Should be Phase 0 before feature development
- Approach: Set up Jest/Vitest, write unit tests for critical business logic (deal transitions, seed logic, AI chat); add integration tests for API endpoints; implement CI pipeline with test gates

**Error Tracking & Monitoring:**
- What's missing: No Sentry, LogRocket, or error service integrated; only console.error scattered throughout
- Blocks: Production issues are invisible; users hit bugs without reporting; no metrics on error frequency or severity
- Priority: **HIGH** - Should be before production launch
- Approach: Integrate Sentry or similar; wrap root-level error boundary; send console errors to service; add transaction monitoring for critical flows

**Database Migrations & Schema Versioning:**
- What's missing: Convex uses live schema; no migration system; if schema must change (add field, remove table), no rollback capability
- Blocks: Can't refactor data model safely; version upgrades risk data loss; no audit trail of schema changes
- Priority: **MEDIUM** - Blocks future scaling
- Approach: Document current schema as versioning baseline; plan migration strategy before major changes; consider data export/import for safety

**Rate Limiting & Abuse Prevention:**
- What's missing: No rate limiting visible on mutations; seed functions have no throttling; users could spam requests
- Blocks: Vulnerability to DoS; malicious users could flood database; cost control is impossible
- Priority: **MEDIUM** - Before scale-up
- Approach: Add rate limiting middleware; implement per-user request quotas; add CAPTCHA to critical endpoints; monitor unusual activity patterns

**Audit Logging & Compliance:**
- What's missing: Deal activity logging exists, but no cross-system audit trail; no user action logging; no data access logs
- Blocks: Cannot comply with data protection regs (GDPR, etc.); no proof of who did what when; hard to investigate incidents
- Priority: **MEDIUM** - Needed for enterprise features
- Approach: Create audit logger service; log all user mutations with context; log data access; implement data retention policy; add audit report generation

---

## Test Coverage Gaps

**Convex Mutation and Query Logic:**
- What's not tested: deal transitions, stage history generation, service request enrichment, message flows, seed data consistency
- Files: `convex/deals.ts`, `convex/serviceRequests.ts`, `convex/messages.ts`, `convex/seed.ts`, `convex/ai/chat.ts`
- Risk: Stage transitions could fail silently; seed data could be malformed; enrichment could return corrupted data; no regression protection
- Priority: **CRITICAL** - Core business logic
- Add tests for: Each valid/invalid stage transition; seed data consistency; N+1 query prevention; enrichment with missing data; error recovery

**React Components and Hooks:**
- What's not tested: PropertyForm (complex form with 50+ fields), DealPage (fetches & displays multiple data types), InvestorSearchBar (multi-filter search), ChatThread (real-time messaging)
- Files: `src/components/properties/PropertyForm.tsx`, `src/app/[locale]/(app)/deals/[id]/page.tsx`, `src/components/layout/InvestorSearchBar.tsx`, `src/components/chat/ChatThread.tsx`
- Risk: UI bugs only found in manual testing; refactoring breaks UI unexpectedly; regressions not caught
- Priority: **HIGH** - Used by all users
- Add tests for: Form validation, submission, error handling; data loading states; search filter combinations; chat message rendering and submission

**AI Agent Integration:**
- What's not tested: Thread creation, message streaming, summarization trigger, context building, agent fallback behavior
- Files: `convex/ai/chat.ts`, `convex/ai/agent.ts`, `convex/ai/summarization.ts`, `convex/ai/context.ts`
- Risk: AI chat breaks silently; summarization doesn't trigger or corrupts thread state; errors leave threads in bad state
- Priority: **HIGH** - Critical user feature
- Add tests for: Thread creation idempotency; streaming message handling; summarization threshold logic; agent error recovery; context building with various profile states

**Error Scenarios & Edge Cases:**
- What's not tested: Deleted records (property deleted with active deal), concurrent mutations (two users updating same deal), missing data (investor without profile), network failures
- Files: All Convex mutation files, all React hooks
- Risk: Orphaned data, race conditions, silent failures in production; user data corruption possible
- Priority: **MEDIUM** - Prevents data integrity issues
- Add tests for: Cascading deletes, orphan detection; concurrent mutation handling; null/undefined data in enrichment; network timeout and retry logic
