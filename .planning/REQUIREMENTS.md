# Requirements: REOS v1.10 Super AI Assistant

**Defined:** 2026-02-01
**Core Value:** Deal flow tracking from interest to close.

## v1.10 Requirements

Requirements for the platform-wide AI assistant. Each maps to roadmap phases.

### Panel UI

- [ ] **PANEL-01**: User can open/close an AI assistant side panel from any authenticated page via a persistent toggle button
- [ ] **PANEL-02**: On desktop, the panel renders as a right-side overlay Sheet that doesn't push page content
- [ ] **PANEL-03**: On mobile, the panel renders as a full-screen bottom sheet with a floating action button trigger above the tab bar
- [ ] **PANEL-04**: The panel persists its open/closed state across page navigation within a session

### Context Awareness

- [ ] **CTX-01**: The assistant detects the current page/route and pre-loads relevant entity data (property, deal, client, profile)
- [ ] **CTX-02**: The assistant adapts its greeting and behavior based on the current page context
- [ ] **CTX-03**: Context is injected server-side per message (lightweight entityType/entityId from frontend, full data resolved in backend)

### Actions & Tools

- [ ] **ACT-01**: The assistant can query real-time data (deals, properties, clients, stats) during conversation via read tools
- [ ] **ACT-02**: The assistant can execute write actions (save property, create deal, request provider) with confirm-first UI (inline confirmation buttons)
- [ ] **ACT-03**: Every tool enforces server-side auth — verifies calling user identity and role independently of the LLM
- [ ] **ACT-04**: The assistant can explain features, guide through workflows, and provide onboarding tips for the current role

### Multi-Role Support

- [ ] **ROLE-01**: The assistant provides role-specific system prompts, tools, and behavior for investor, broker, mortgage_advisor, lawyer, and admin
- [ ] **ROLE-02**: Admins using viewingAsRole get the assistant behavior matching their effective role
- [ ] **ROLE-03**: Each role has appropriate read/write tools scoped to their permissions

### Streaming & Memory

- [ ] **STRM-01**: Responses stream token-by-token in real-time (replacing current block-wait pattern)
- [ ] **STRM-02**: Conversations are session-based — fresh thread per session with cross-session memory (preferences, past context summaries)
- [ ] **STRM-03**: Tool results render inline as structured cards (property cards, deal summaries, action confirmations)

### Migration

- [ ] **MIG-01**: The v1.6 investor-only AI assistant is replaced by the new platform-wide assistant
- [ ] **MIG-02**: On the investor summary page, the assistant auto-opens on load (preserving current UX)
- [ ] **MIG-03**: Old AI components are removed after migration with no regression in investor functionality

### Proactive Nudges

- [ ] **NUDGE-01**: The assistant can surface event-driven nudges (deal stage changes, new client assignments) via the existing notification system
- [ ] **NUDGE-02**: Nudges are non-intrusive — delivered as notification badges, not auto-opening the panel

### i18n

- [ ] **I18N-01**: All assistant UI elements (panel, buttons, prompts, tool confirmations) support English and Hebrew with RTL layout

## Future Requirements

Deferred to later milestones. Tracked but not in current roadmap.

### Enhanced Intelligence

- **INTEL-01**: Suggested prompts — show 3-4 contextual prompt suggestions based on current page and role
- **INTEL-02**: Cross-entity intelligence — connect data across properties, deals, and clients for insights
- **INTEL-03**: Keyboard shortcut (Cmd+K) to open/close panel
- **INTEL-04**: Navigation actions — AI can navigate user to specific pages (auto-execute)

### Advanced UX

- **UX-01**: Panel resize/dock options for desktop
- **UX-02**: Slash commands for power users
- **UX-03**: Conversation threading/branching

## Out of Scope

| Feature | Reason |
|---------|--------|
| Autonomous actions without confirmation | Legal risk (Air Canada precedent), anti-pattern per research |
| Mixing AI chat with human-to-human chat | Causes confusion, research anti-feature |
| Pre-fetching AI responses on page load | Wastes tokens, annoys users |
| Multiple AI agents per role | Single agent with runtime role injection is simpler and maintainable |
| AI SDK 6 upgrade | Incompatible with @convex-dev/agent@0.3.2 (GitHub issue #202) |
| Voice input/output | Scope creep, not core to real estate platform |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| PANEL-01 | TBD | Pending |
| PANEL-02 | TBD | Pending |
| PANEL-03 | TBD | Pending |
| PANEL-04 | TBD | Pending |
| CTX-01 | TBD | Pending |
| CTX-02 | TBD | Pending |
| CTX-03 | TBD | Pending |
| ACT-01 | TBD | Pending |
| ACT-02 | TBD | Pending |
| ACT-03 | TBD | Pending |
| ACT-04 | TBD | Pending |
| ROLE-01 | TBD | Pending |
| ROLE-02 | TBD | Pending |
| ROLE-03 | TBD | Pending |
| STRM-01 | TBD | Pending |
| STRM-02 | TBD | Pending |
| STRM-03 | TBD | Pending |
| MIG-01 | TBD | Pending |
| MIG-02 | TBD | Pending |
| MIG-03 | TBD | Pending |
| NUDGE-01 | TBD | Pending |
| NUDGE-02 | TBD | Pending |
| I18N-01 | TBD | Pending |

**Coverage:**
- v1.10 requirements: 23 total
- Mapped to phases: 0
- Unmapped: 23 (pending roadmap creation)

---
*Requirements defined: 2026-02-01*
*Last updated: 2026-02-01 after initial definition*
