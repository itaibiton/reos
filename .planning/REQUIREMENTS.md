# Requirements: REOS

**Defined:** 2026-01-22
**Core Value:** Deal flow tracking from interest to close.

## v1.6 Requirements

Requirements for AI-Powered Investor Experience milestone. Each maps to roadmap phases.

### AI Infrastructure

- [ ] **INFRA-01**: AI conversation threads persist across sessions via Convex
- [ ] **INFRA-02**: AI responses stream token-by-token with typing indicator
- [ ] **INFRA-03**: AI context includes user profile from questionnaire
- [ ] **INFRA-04**: AI memory uses sliding window with summarization for long conversations

### Profile Summary

- [ ] **PROF-01**: Investor can view profile summary derived from questionnaire answers
- [ ] **PROF-02**: Profile summary shows all questionnaire sections in readable format
- [ ] **PROF-03**: Investor can inline edit any profile section from summary view
- [ ] **PROF-04**: Profile completeness indicator shows percentage and missing sections

### AI Chat Interface

- [ ] **CHAT-01**: Investor can send messages to AI assistant
- [ ] **CHAT-02**: AI responds with streaming text (token-by-token display)
- [ ] **CHAT-03**: Typing indicator shows while AI is generating response
- [ ] **CHAT-04**: Chat history displays previous messages in conversation
- [ ] **CHAT-05**: Quick reply buttons appear for common queries
- [ ] **CHAT-06**: AI can answer questions about investor's profile
- [ ] **CHAT-07**: AI can answer questions about properties in the system
- [ ] **CHAT-08**: AI can answer questions about service providers

### Property Recommendations

- [ ] **REC-01**: AI generates personalized property recommendations based on profile
- [ ] **REC-02**: Each recommendation includes 2-3 match factors explaining why
- [ ] **REC-03**: Recommendations display match score/confidence indicator
- [ ] **REC-04**: "Quick save all" button saves all recommended properties at once
- [ ] **REC-05**: Each property card links to full property detail page
- [ ] **REC-06**: AI shows loading indicator while searching properties
- [ ] **REC-07**: Recommendations are grounded in database (no hallucinated properties)

### Dream Team Builder

- [ ] **TEAM-01**: AI suggests 2-3 brokers that match investor profile and property preferences
- [ ] **TEAM-02**: AI suggests 2-3 mortgage advisors based on investor needs
- [ ] **TEAM-03**: AI suggests 2-3 lawyers for the investor's target locations
- [ ] **TEAM-04**: Each provider suggestion includes explanation of why they match
- [ ] **TEAM-05**: Investor can select which providers to add to their team
- [ ] **TEAM-06**: AI prompts investor to build team after viewing properties

### Summary Page Layout

- [ ] **PAGE-01**: Desktop layout shows two panels: profile summary (left) + AI assistant (right)
- [ ] **PAGE-02**: Page is accessible after onboarding completes
- [ ] **PAGE-03**: Page is accessible as ongoing investor profile page
- [ ] **PAGE-04**: AI assistant shows initial loading state while fetching recommendations

### Mobile Experience

- [ ] **MOB-01**: Mobile layout uses tabbed interface (Profile / AI Assistant)
- [ ] **MOB-02**: Tab switching is smooth with appropriate animations
- [ ] **MOB-03**: Chat input is keyboard-aware (adjusts when keyboard opens)
- [ ] **MOB-04**: All touch targets are minimum 44px
- [ ] **MOB-05**: Quick reply buttons are touch-optimized

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
| INFRA-01 | TBD | Pending |
| INFRA-02 | TBD | Pending |
| INFRA-03 | TBD | Pending |
| INFRA-04 | TBD | Pending |
| PROF-01 | TBD | Pending |
| PROF-02 | TBD | Pending |
| PROF-03 | TBD | Pending |
| PROF-04 | TBD | Pending |
| CHAT-01 | TBD | Pending |
| CHAT-02 | TBD | Pending |
| CHAT-03 | TBD | Pending |
| CHAT-04 | TBD | Pending |
| CHAT-05 | TBD | Pending |
| CHAT-06 | TBD | Pending |
| CHAT-07 | TBD | Pending |
| CHAT-08 | TBD | Pending |
| REC-01 | TBD | Pending |
| REC-02 | TBD | Pending |
| REC-03 | TBD | Pending |
| REC-04 | TBD | Pending |
| REC-05 | TBD | Pending |
| REC-06 | TBD | Pending |
| REC-07 | TBD | Pending |
| TEAM-01 | TBD | Pending |
| TEAM-02 | TBD | Pending |
| TEAM-03 | TBD | Pending |
| TEAM-04 | TBD | Pending |
| TEAM-05 | TBD | Pending |
| TEAM-06 | TBD | Pending |
| PAGE-01 | TBD | Pending |
| PAGE-02 | TBD | Pending |
| PAGE-03 | TBD | Pending |
| PAGE-04 | TBD | Pending |
| MOB-01 | TBD | Pending |
| MOB-02 | TBD | Pending |
| MOB-03 | TBD | Pending |
| MOB-04 | TBD | Pending |
| MOB-05 | TBD | Pending |

**Coverage:**
- v1.6 requirements: 37 total
- Mapped to phases: 0
- Unmapped: 37 (roadmap pending)

---
*Requirements defined: 2026-01-22*
*Last updated: 2026-01-22 after initial definition*
