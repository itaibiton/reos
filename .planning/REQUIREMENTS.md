# Requirements: REOS

**Defined:** 2026-01-22
**Core Value:** Deal flow tracking from interest to close.

## v1.6 Requirements

Requirements for AI-Powered Investor Experience milestone. Each maps to roadmap phases.

### AI Infrastructure

- [x] **INFRA-01**: AI conversation threads persist across sessions via Convex
- [x] **INFRA-02**: AI responses stream token-by-token with typing indicator
- [x] **INFRA-03**: AI context includes user profile from questionnaire
- [x] **INFRA-04**: AI memory uses sliding window with summarization for long conversations

### Profile Summary

- [x] **PROF-01**: Investor can view profile summary derived from questionnaire answers
- [x] **PROF-02**: Profile summary shows all questionnaire sections in readable format
- [x] **PROF-03**: Investor can inline edit any profile section from summary view
- [x] **PROF-04**: Profile completeness indicator shows percentage and missing sections

### AI Chat Interface

- [x] **CHAT-01**: Investor can send messages to AI assistant
- [x] **CHAT-02**: AI responds with streaming text (token-by-token display)
- [x] **CHAT-03**: Typing indicator shows while AI is generating response
- [x] **CHAT-04**: Chat history displays previous messages in conversation
- [x] **CHAT-05**: Quick reply buttons appear for common queries
- [x] **CHAT-06**: AI can answer questions about investor's profile
- [x] **CHAT-07**: AI can answer questions about properties in the system
- [x] **CHAT-08**: AI can answer questions about service providers

### Property Recommendations

- [x] **REC-01**: AI generates personalized property recommendations based on profile
- [x] **REC-02**: Each recommendation includes 2-3 match factors explaining why
- [x] **REC-03**: Recommendations display match score/confidence indicator
- [x] **REC-04**: "Quick save all" button saves all recommended properties at once
- [x] **REC-05**: Each property card links to full property detail page
- [x] **REC-06**: AI shows loading indicator while searching properties
- [x] **REC-07**: Recommendations are grounded in database (no hallucinated properties)

### Dream Team Builder

- [x] **TEAM-01**: AI suggests 2-3 brokers that match investor profile and property preferences
- [x] **TEAM-02**: AI suggests 2-3 mortgage advisors based on investor needs
- [x] **TEAM-03**: AI suggests 2-3 lawyers for the investor's target locations
- [x] **TEAM-04**: Each provider suggestion includes explanation of why they match
- [x] **TEAM-05**: Investor can select which providers to add to their team
- [x] **TEAM-06**: AI prompts investor to build team after viewing properties

### Summary Page Layout

- [x] **PAGE-01**: Desktop layout shows two panels: profile summary (left) + AI assistant (right)
- [x] **PAGE-02**: Page is accessible after onboarding completes
- [x] **PAGE-03**: Page is accessible as ongoing investor profile page
- [x] **PAGE-04**: AI assistant shows initial loading state while fetching recommendations

### Mobile Experience

- [x] **MOB-01**: Mobile layout uses tabbed interface (Profile / AI Assistant)
- [x] **MOB-02**: Tab switching is smooth with appropriate animations
- [x] **MOB-03**: Chat input is keyboard-aware (adjusts when keyboard opens)
- [x] **MOB-04**: All touch targets are minimum 44px
- [x] **MOB-05**: Quick reply buttons are touch-optimized

### AI Auto-Flow

- [x] **AUTO-01**: AI sends greeting automatically after questionnaire completion (no user prompt)
- [x] **AUTO-02**: AI automatically triggers property search and displays results as cards
- [x] **AUTO-03**: Property cards have individual Save buttons AND batch "Save All" button
- [x] **AUTO-04**: AI automatically suggests providers after properties, grouped by role
- [x] **AUTO-05**: Questionnaire popup persists on each visit until completed (skip is temporary)

## Future Requirements

Deferred to subsequent milestones. Tracked but not in v1.6 roadmap.

### Enhanced AI Features

- **AI-01**: Proactive new property alerts when matching listings added
- **AI-02**: Preference contradiction detection and suggestions
- **AI-03**: Market insights and investment predictions
- **AI-04**: Conversation search and summarization

### Team Management

- **TEAM-07**: Save team configuration for reuse across deals
- **TEAM-08**: Team comparison view
- **TEAM-09**: Request all team members simultaneously

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Voice input for chat | Adds complexity, text-first for v1.6 |
| Auto-contact providers | Users want control; explicit action required |
| Auto-save recommendations | Users want control; explicit save required |
| AI scheduling viewings | High complexity, beyond chat scope |
| AI negotiation assistance | Legal/liability concerns, defer indefinitely |
| Push notifications for AI updates | Notifications exist, AI-specific push is v2 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | Phase 40 | Complete |
| INFRA-02 | Phase 40 | Complete |
| INFRA-03 | Phase 40 | Complete |
| INFRA-04 | Phase 40 | Complete |
| CHAT-01 | Phase 41 | Complete |
| CHAT-02 | Phase 41 | Complete |
| CHAT-03 | Phase 41 | Complete |
| CHAT-04 | Phase 41 | Complete |
| REC-01 | Phase 42 | Complete |
| REC-02 | Phase 42 | Complete |
| REC-03 | Phase 42 | Complete |
| REC-04 | Phase 42 | Complete |
| REC-05 | Phase 42 | Complete |
| REC-06 | Phase 42 | Complete |
| REC-07 | Phase 42 | Complete |
| CHAT-06 | Phase 42 | Complete |
| CHAT-07 | Phase 42 | Complete |
| TEAM-01 | Phase 43 | Complete |
| TEAM-02 | Phase 43 | Complete |
| TEAM-03 | Phase 43 | Complete |
| TEAM-04 | Phase 43 | Complete |
| TEAM-05 | Phase 43 | Complete |
| TEAM-06 | Phase 43 | Complete |
| CHAT-08 | Phase 43 | Complete |
| PROF-01 | Phase 44 | Complete |
| PROF-02 | Phase 44 | Complete |
| PROF-03 | Phase 44 | Complete |
| PROF-04 | Phase 44 | Complete |
| PAGE-01 | Phase 44 | Complete |
| PAGE-02 | Phase 44 | Complete |
| PAGE-03 | Phase 44 | Complete |
| PAGE-04 | Phase 44 | Complete |
| CHAT-05 | Phase 44 | Complete |
| MOB-01 | Phase 45 | Complete |
| MOB-02 | Phase 45 | Complete |
| MOB-03 | Phase 45 | Complete |
| MOB-04 | Phase 45 | Complete |
| MOB-05 | Phase 45 | Complete |
| AUTO-01 | Phase 46 | Complete |
| AUTO-02 | Phase 46 | Complete |
| AUTO-03 | Phase 46 | Complete |
| AUTO-04 | Phase 46 | Complete |
| AUTO-05 | Phase 46 | Complete |

**Coverage:**
- v1.6 requirements: 42 total
- Mapped to phases: 42
- Unmapped: 0

---
*Requirements defined: 2026-01-22*
*Last updated: 2026-01-26 after Phase 46 completion*
