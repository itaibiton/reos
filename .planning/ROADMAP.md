# Roadmap: REOS v1.6 AI-Powered Investor Experience

## Overview

Transform the post-onboarding experience into an intelligent investor hub. This milestone builds AI infrastructure (streaming, memory, context), then layers conversational capabilities, property recommendations with RAG grounding, dream team builder for provider matching, a two-panel summary page integrating profile and AI assistant, and finally mobile-optimized interaction patterns. Every feature flows through persistent, streaming AI that understands the investor's profile.

## Milestones

- ✅ **v1.0 MVP** - Phases 1-8 (shipped 2026-01-17)
- ✅ **v1.1 Investor Onboarding** - Phases 9-15 (shipped 2026-01-18)
- ✅ **v1.2 Provider Experience** - Phases 16-20 (shipped 2026-01-19)
- ✅ **v1.3 Social Feed & Global Community** - Phases 21-27.2 (shipped 2026-01-19)
- ✅ **v1.4 Internationalization & RTL** - Phases 28-34.1 (shipped 2026-01-20)
- ✅ **v1.5 Mobile Responsive & Header Redesign** - Phases 35-39 (shipped 2026-01-22)
- 🚧 **v1.6 AI-Powered Investor Experience** - Phases 40-45 (in progress)

## Phases

- [ ] **Phase 40: AI Infrastructure Foundation** - Streaming, memory persistence, context management
- [ ] **Phase 41: Conversational AI Core** - Basic chat UI with streaming responses
- [ ] **Phase 42: Property Recommendations** - RAG-grounded property matching with explanations
- [ ] **Phase 43: Dream Team Builder** - Provider suggestions per role with match reasons
- [ ] **Phase 44: Investor Summary Page** - Two-panel layout integrating profile and AI
- [ ] **Phase 45: Mobile Experience** - Tabbed interface and touch-optimized chat

## Phase Details

### Phase 40: AI Infrastructure Foundation
**Goal**: Establish streaming AI responses with persistent memory and profile context
**Depends on**: Nothing (first phase of v1.6)
**Requirements**: INFRA-01, INFRA-02, INFRA-03, INFRA-04
**Success Criteria** (what must be TRUE):
  1. AI conversation persists across browser sessions (close tab, return, history intact)
  2. AI responses stream token-by-token with visible typing indicator within 200ms
  3. AI references investor's questionnaire answers without being re-told
  4. Long conversations (20+ messages) maintain coherent context without degradation
**Plans**: 3 plans in 3 waves

Plans:
- [ ] 40-01-PLAN.md — Agent component setup, schema extension, base agent definition
- [ ] 40-02-PLAN.md — Profile context builder, thread management, summarization logic
- [ ] 40-03-PLAN.md — Streaming chat action with stop button, end-to-end wiring

### Phase 41: Conversational AI Core
**Goal**: Users can chat with AI assistant and see streaming responses
**Depends on**: Phase 40
**Requirements**: CHAT-01, CHAT-02, CHAT-03, CHAT-04
**Success Criteria** (what must be TRUE):
  1. User can type message and send to AI assistant
  2. AI response appears token-by-token as it generates (not all at once)
  3. Typing indicator visible while waiting for first token
  4. Previous messages in conversation visible when returning to chat
**Plans**: TBD

Plans:
- [ ] 41-01: TBD
- [ ] 41-02: TBD

### Phase 42: Property Recommendations
**Goal**: AI suggests properties matching investor profile with explanations
**Depends on**: Phase 41
**Requirements**: REC-01, REC-02, REC-03, REC-04, REC-05, REC-06, REC-07, CHAT-06, CHAT-07
**Success Criteria** (what must be TRUE):
  1. AI recommends 3-5 properties based on investor's budget, locations, property type preferences
  2. Each recommendation shows 2-3 reasons why it matches (e.g., "Within your $500K budget", "In Tel Aviv, your preferred area")
  3. User can ask AI questions about specific properties and get accurate answers from database
  4. User can save all recommended properties with single "Quick Save All" action
  5. Every property mentioned by AI exists in database (no hallucinated properties)
**Plans**: TBD

Plans:
- [ ] 42-01: TBD
- [ ] 42-02: TBD
- [ ] 42-03: TBD

### Phase 43: Dream Team Builder
**Goal**: AI suggests service providers per role with match explanations
**Depends on**: Phase 42
**Requirements**: TEAM-01, TEAM-02, TEAM-03, TEAM-04, TEAM-05, TEAM-06, CHAT-08
**Success Criteria** (what must be TRUE):
  1. AI suggests 2-3 brokers matching investor's target locations and property interests
  2. AI suggests 2-3 mortgage advisors based on investor's budget and financial needs
  3. AI suggests 2-3 lawyers for investor's target locations
  4. Each provider suggestion includes explanation of why they match
  5. User can select providers from suggestions to add to their team
**Plans**: TBD

Plans:
- [ ] 43-01: TBD
- [ ] 43-02: TBD

### Phase 44: Investor Summary Page
**Goal**: Two-panel page with profile summary and AI assistant working together
**Depends on**: Phase 43
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04, PAGE-01, PAGE-02, PAGE-03, PAGE-04, CHAT-05
**Success Criteria** (what must be TRUE):
  1. Desktop shows two panels: profile summary (left) and AI assistant (right)
  2. Profile summary displays all questionnaire sections in readable format
  3. User can edit any profile section inline without leaving the page
  4. Profile completeness indicator shows percentage and lists missing sections
  5. Quick reply buttons appear for common queries (e.g., "Show me properties", "Build my team")
  6. Page accessible after onboarding completes AND as ongoing profile page
**Plans**: TBD

Plans:
- [ ] 44-01: TBD
- [ ] 44-02: TBD
- [ ] 44-03: TBD

### Phase 45: Mobile Experience
**Goal**: Touch-optimized AI experience with tabbed navigation
**Depends on**: Phase 44
**Requirements**: MOB-01, MOB-02, MOB-03, MOB-04, MOB-05
**Success Criteria** (what must be TRUE):
  1. Mobile shows tabbed interface switching between Profile and AI Assistant views
  2. Tab switching animates smoothly (no jarring transitions)
  3. Chat input stays visible above keyboard when keyboard opens
  4. All interactive elements have minimum 44px touch targets
  5. Quick reply buttons are easily tappable without accidental adjacent presses
**Plans**: TBD

Plans:
- [ ] 45-01: TBD
- [ ] 45-02: TBD

## Progress

**Execution Order:** Phases 40 → 41 → 42 → 43 → 44 → 45

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 40. AI Infrastructure Foundation | v1.6 | 0/3 | Planned | - |
| 41. Conversational AI Core | v1.6 | 0/? | Not started | - |
| 42. Property Recommendations | v1.6 | 0/? | Not started | - |
| 43. Dream Team Builder | v1.6 | 0/? | Not started | - |
| 44. Investor Summary Page | v1.6 | 0/? | Not started | - |
| 45. Mobile Experience | v1.6 | 0/? | Not started | - |

---
*Roadmap created: 2026-01-22*
*Milestone: v1.6 AI-Powered Investor Experience*
*Requirements: 37 mapped to 6 phases*
