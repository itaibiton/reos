# Roadmap: REOS

## Milestones

- ✅ **v1.0 MVP** - Phases 1-8 (shipped)
- ✅ **v1.1 Investor Onboarding** - Phases 9-15 (shipped)
- ✅ **v1.2 Provider Experience** - Phases 16-20 (shipped)
- ✅ **v1.3 Social Feed** - Phases 21-27 (shipped)
- ✅ **v1.4 i18n & RTL** - Phases 28-34 (shipped)
- ✅ **v1.5 Mobile Experience** - Phases 35-39 (shipped)
- ✅ **v1.6 AI-Powered Investor Experience** - Phases 40-46 (shipped)
- ✅ **v1.7 Landing Page** - Phases 47-52 (shipped)
- ✅ **v1.8 Conversion & Essential Pages** - Phases 53-56 (shipped)
- ✅ **v1.9 Vendor Registration & Management** - Phases 57-60 (shipped)
- **v1.10 Super AI Assistant** - Phases 61-66 (in progress)

---

<details>
<summary>v1.9 Vendor Registration & Management (Phases 57-60) - SHIPPED 2026-02-01</summary>

### Phase 57: Vendor Onboarding & Admin Approval

**Goal:** Vendors can register with a structured questionnaire (including profile photo) and admins can approve or reject them before they appear on the platform.

**Depends on:** Nothing (first phase of v1.9)

**Requirements:** VEND-01, VEND-02, VEND-06

**Success Criteria** (what must be TRUE):
1. A new service provider can complete a multi-step onboarding questionnaire with all 12+ registration fields (name, phone, email, profession, experience, company, language, license number, bio, website, geographic area, external recommendations)
2. A vendor can upload a profile photo during onboarding and see it displayed on their profile
3. Submitted vendor profiles enter "pending" status and are NOT visible in the provider directory or search results until approved
4. An admin can view pending vendor applications, review full profile details, and approve or reject with an optional reason
5. Approved vendors become visible in the provider directory; rejected vendors see the rejection reason and can revise and resubmit

**Plans:** 3 plans

Plans:
- [x] 57-01-PLAN.md -- Schema extension and approval backend (Convex mutations, queries, approval state machine)
- [x] 57-02-PLAN.md -- Vendor onboarding questionnaire UI (multi-step form with photo upload, draft persistence)
- [x] 57-03-PLAN.md -- Admin approval interface and vendor visibility gating

---

### Phase 58: Client Management & Process Timeline

**Goal:** Approved vendors can view all their clients, access per-client documents, and see a visual timeline of each client's deal progress.

**Depends on:** Phase 57 (approved vendors only)

**Requirements:** VEND-03, VEND-04

**Success Criteria** (what must be TRUE):
1. A vendor can view a list of all their clients (investors assigned to their deals) with name, current deal stage, and deal start date
2. A vendor can access all documents attached to a specific client's deal, grouped by client
3. A vendor can view a visual process timeline for each client showing the 7-stage deal flow with the current stage highlighted
4. Stage transition dates are displayed on the timeline so the vendor can see when each stage was reached

Plans:
- [x] 58-01: Client list view with filtering and per-client document access
- [x] 58-02: Process timeline visualization component with stage transitions

---

### Phase 59: Vendor Statistics Dashboard

**Goal:** Vendors can see aggregate deal statistics that validate their performance on the platform.

**Depends on:** Phase 58 (client/deal data access established)

**Requirements:** VEND-05

**Success Criteria** (what must be TRUE):
1. A vendor can see their total number of deals (all deals assigned to them)
2. A vendor can see a breakdown of deal statuses (in-progress, closed)
3. Brokers specifically can see their total sales count (closed deals where they are the assigned broker)
4. Statistics update in real-time as deals progress through stages

Plans:
- [x] 59-01: Statistics dashboard with deal metrics and broker sales count

---

### Phase 60: Profile Polish & Public Display

**Goal:** Vendor public profiles display all onboarding data in a professional format that differentiates REOS from competitors.

**Depends on:** Phase 57 (profile data exists)

**Requirements:** (polish for VEND-01 fields -- geographic area, language, recommendations display on public profiles)

**Success Criteria** (what must be TRUE):
1. A vendor's public profile page displays their geographic service area, working languages as badges, and bio
2. External recommendations (if provided) are displayed on the vendor's public profile
3. The vendor's custom profile photo is displayed on their public profile, provider directory cards, and search results
4. All new profile fields are fully translated in both English and Hebrew with correct RTL layout

Plans:
- [x] 60-01: Public profile enhancement with all vendor fields and i18n

</details>

---

## v1.10 Super AI Assistant

**Milestone Goal:** Platform-wide context-aware AI assistant that replaces the investor-only AI, available to all roles (investors, service providers, admins) as a side panel on desktop and full-screen sheet on mobile -- with data lookups, quick actions, proactive suggestions, and help guidance.

**Active Requirements:**

| ID | Requirement | Phase |
|----|-------------|-------|
| PANEL-01 | AI assistant side panel accessible from any authenticated page | 61 |
| PANEL-02 | Desktop renders as right-side overlay Sheet | 61 |
| PANEL-03 | Mobile renders as full-screen bottom sheet with FAB trigger | 61 |
| PANEL-04 | Panel open/closed state persists across page navigation | 61 |
| STRM-01 | Responses stream token-by-token in real-time | 61 |
| STRM-02 | Session-based conversations with cross-session memory | 61 |
| STRM-03 | Tool results render inline as structured cards | 61 |
| I18N-01 | All assistant UI supports English and Hebrew with RTL | 61 |
| CTX-01 | Detects current page/route and pre-loads relevant entity data | 62 |
| CTX-02 | Adapts greeting and behavior based on current page context | 62 |
| CTX-03 | Context injected server-side per message (lightweight from frontend, resolved in backend) | 62 |
| ACT-04 | Explains features, guides workflows, provides onboarding tips | 62 |
| ROLE-01 | Role-specific system prompts, tools, and behavior for all 5 roles | 63 |
| ROLE-02 | Admin viewingAsRole gets assistant behavior matching effective role | 63 |
| ROLE-03 | Each role has read/write tools scoped to their permissions | 63 |
| ACT-03 | Every tool enforces server-side auth independently of the LLM | 63 |
| ACT-01 | Query real-time data (deals, properties, clients, stats) via read tools | 64 |
| ACT-02 | Execute write actions (save property, create deal, request provider) with confirm-first UI | 64 |
| MIG-01 | v1.6 investor-only AI replaced by new platform-wide assistant | 65 |
| MIG-02 | Investor summary page auto-opens assistant on load | 65 |
| MIG-03 | Old AI components removed with no regression in investor functionality | 65 |
| NUDGE-01 | Event-driven nudges (deal stage changes, new assignments) via notification system | 66 |
| NUDGE-02 | Nudges delivered as notification badges, not auto-opening the panel | 66 |

**Coverage:** 23/23 requirements mapped.

---

### Phase 61: Panel Shell + Streaming Infrastructure

**Goal:** Users on any authenticated page can open a responsive AI assistant panel with real-time streaming conversations, session management, and full i18n support -- the foundation everything else builds on.

**Depends on:** Nothing (first phase of v1.10)

**Requirements:** PANEL-01, PANEL-02, PANEL-03, PANEL-04, STRM-01, STRM-02, STRM-03, I18N-01

**Success Criteria** (what must be TRUE):
1. A user on any authenticated page can open the AI assistant via a persistent toggle button, and the panel slides in from the right on desktop as an overlay Sheet without pushing page content
2. On mobile, the same toggle appears as a floating action button above the bottom tab bar, opening a full-screen bottom sheet that does not conflict with tab navigation
3. The panel remains open when the user navigates between pages within the same session (no re-open required after clicking a sidebar link)
4. Messages stream token-by-token in real-time as the AI responds (no block-wait followed by full text dump), and tool results render as structured cards inline in the conversation
5. Conversations start fresh each session, but the assistant recalls user preferences and context summaries from previous sessions

**Plans:** TBD

Plans:
- [ ] 61-01: TBD
- [ ] 61-02: TBD
- [ ] 61-03: TBD

---

### Phase 62: Context Awareness + Help Guidance

**Goal:** The assistant understands what the user is looking at and adapts its behavior accordingly -- greeting, suggestions, and help guidance change based on the current page and entity.

**Depends on:** Phase 61 (panel must exist to inject context into)

**Requirements:** CTX-01, CTX-02, CTX-03, ACT-04

**Success Criteria** (what must be TRUE):
1. When a user opens the assistant on a property detail page, the assistant greets them with context about that specific property and offers relevant prompts (e.g., "Ask about ROI", "Save this property")
2. When a user opens the assistant on the deals page, the assistant pre-loads their active deals and offers deal-specific guidance without the user having to explain what they are looking at
3. The assistant can explain any feature on the current page, guide the user through a workflow step-by-step, and provide role-appropriate onboarding tips for first-time users
4. Page context is resolved server-side from a lightweight entityType/entityId sent by the frontend -- the assistant never receives raw client-side data that could be spoofed

---

### Phase 63: Multi-Role Agent + Auth Enforcement

**Goal:** The assistant serves all five platform roles with tailored behavior, tools, and permissions -- and every tool interaction is secured server-side regardless of what the LLM generates.

**Depends on:** Phase 62 (context awareness informs role-specific behavior)

**Requirements:** ROLE-01, ROLE-02, ROLE-03, ACT-03

**Success Criteria** (what must be TRUE):
1. An investor, broker, mortgage advisor, lawyer, and admin each receive a distinct assistant experience with role-appropriate system prompts, suggested actions, and available tools
2. An admin using viewingAsRole sees the assistant behave as the effective role (e.g., switching to broker view gives broker prompts and tools), with no data leakage from the admin context
3. Each role can only access tools scoped to their permissions -- a broker cannot invoke investor-only tools, and an investor cannot invoke admin tools
4. Every tool handler independently verifies the calling user's identity and role via server-side auth (ctx.auth), never relying on the LLM to enforce authorization

---

### Phase 64: Action Tools (Read + Write)

**Goal:** The assistant can look up live platform data and execute real actions on the user's behalf -- with explicit confirmation before any write operation.

**Depends on:** Phase 63 (role-scoped tools and auth patterns must be established first)

**Requirements:** ACT-01, ACT-02

**Success Criteria** (what must be TRUE):
1. A user can ask the assistant about their deals, properties, clients, or stats and receive accurate real-time data pulled from Convex within the conversation (not stale or hallucinated)
2. A user can ask the assistant to perform a write action (save a property, create a deal, request a provider) and the assistant shows an inline confirmation card with details before executing -- the action only runs after explicit user approval
3. After a confirmed write action, the user sees the result reflected both in the chat (success confirmation card) and in the actual platform UI (e.g., saved property appears in their saved list)

---

### Phase 65: Investor AI Migration

**Goal:** The v1.6 investor-only embedded AI is fully replaced by the new platform-wide assistant with zero regression in investor functionality.

**Depends on:** Phase 64 (new assistant must have full feature parity including read/write tools)

**Requirements:** MIG-01, MIG-02, MIG-03

**Success Criteria** (what must be TRUE):
1. The investor summary page no longer contains the embedded AI panel -- it renders as a full-width profile view with a prominent "Open AI Assistant" call-to-action
2. When an investor navigates to the summary page, the global AI assistant panel auto-opens with investor context pre-loaded and an appropriate greeting (preserving the current auto-greeting behavior)
3. All v1.6 AI capabilities (property recommendations, dream team builder, profile questions, batch save) are accessible through the new assistant, and old AI components (useAIChat hook, AIChatPanel embedding) are fully removed from the codebase

---

### Phase 66: Proactive Nudges

**Goal:** The assistant can proactively notify users about important events and actionable insights -- delivered as gentle notifications, never as intrusive interruptions.

**Depends on:** Phase 65 (core assistant fully operational and migration complete)

**Requirements:** NUDGE-01, NUDGE-02

**Success Criteria** (what must be TRUE):
1. When a deal stage changes or a new client is assigned, the user receives a notification badge on the AI assistant toggle button indicating the assistant has something relevant to share
2. Tapping the notification badge opens the assistant panel with the nudge displayed as a contextual message (not a system popup or modal) -- the user can engage with it or dismiss it naturally within the conversation flow
3. Nudges are non-intrusive -- they never auto-open the panel, never play sounds, and integrate with the existing notification system rather than creating a parallel notification channel

---

## Progress

**Execution Order:** 61 -> 62 -> 63 -> 64 -> 65 -> 66

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 57. Vendor Onboarding & Admin Approval | v1.9 | 3/3 | Complete | 2026-01-29 |
| 58. Client Management & Process Timeline | v1.9 | 2/2 | Complete | 2026-01-31 |
| 59. Vendor Statistics Dashboard | v1.9 | 1/1 | Complete | 2026-02-01 |
| 60. Profile Polish & Public Display | v1.9 | 1/1 | Complete | 2026-02-01 |
| 61. Panel Shell + Streaming Infrastructure | v1.10 | 0/3 | Not started | - |
| 62. Context Awareness + Help Guidance | v1.10 | 0/TBD | Not started | - |
| 63. Multi-Role Agent + Auth Enforcement | v1.10 | 0/TBD | Not started | - |
| 64. Action Tools (Read + Write) | v1.10 | 0/TBD | Not started | - |
| 65. Investor AI Migration | v1.10 | 0/TBD | Not started | - |
| 66. Proactive Nudges | v1.10 | 0/TBD | Not started | - |
