# Phase 43: Dream Team Builder - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

<domain>
## Phase Boundary

AI suggests service providers per role (brokers, mortgage advisors, lawyers) with match explanations based on investor profile. Users can select providers from suggestions to add to their team. Provider profiles and team management infrastructure already exist — this phase adds AI-powered discovery and match explanations.

</domain>

<decisions>
## Implementation Decisions

### Provider Card Presentation
- Compact layout: photo, name, role, 1-line match reason
- Show star rating on card
- Show availability status (e.g., "Available now" or "Typically responds in 2 hours")
- Tapping card opens profile modal (slide-up with full details)

### Match Explanation Style
- Bullet points format for match reasons
- 1-2 reasons per provider (only the strongest matches)
- Reference specific investor profile data (e.g., "Matches your $500K budget" not just "Budget match")
- No ranking explanation — present providers without comparing them

### Team Selection Flow
- Direct "Add" button on each card (immediate action, no checkbox workflow)
- After adding: card shows "Added ✓" state AND toast confirms "Added to your team"
- If provider already on team: show "On Team" badge, disable add button
- Multiple providers per role: Claude's discretion based on role type

### Role-Based Grouping
- Present all roles at once in one message (sections: Brokers, Advisors, Lawyers)
- Collapsible accordion sections per role
- All sections start expanded (user can collapse)
- Summary count before sections: "Found 8 providers: 3 brokers, 3 advisors, 2 lawyers"

### Claude's Discretion
- Whether to allow multiple providers per role (may vary by role type)
- Exact card spacing and visual details
- How to handle edge cases (no providers found for a role, etc.)

</decisions>

<specifics>
## Specific Ideas

- Cards should feel similar to property recommendation cards from Phase 42 (consistent design language)
- Match reasons should be personalized with actual profile data, not generic labels

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 43-dream-team-builder*
*Context gathered: 2026-01-22*
