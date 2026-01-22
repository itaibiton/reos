# Phase 42: Property Recommendations - Context

**Gathered:** 2026-01-22
**Status:** Ready for planning

<domain>
## Phase Boundary

AI suggests properties matching investor profile with explanations. Uses RAG grounding to ensure every property mentioned exists in the database (no hallucinations). User can ask follow-up questions about specific properties and save recommendations. Creating properties, editing properties, or advanced filtering are separate concerns.

</domain>

<decisions>
## Implementation Decisions

### Recommendation Display
- Inline cards embedded directly in chat flow (like ChatGPT's link previews)
- Each card shows: photo, price, location, bedrooms, sqm — compact view
- 3 properties per recommendation (focused, not overwhelming)
- "Searching properties..." indicator with animation while AI searches
- Cards appear as part of AI message response

### Match Explanation Style
- Colored badges/tags on each property card (pill-shaped labels)
- Badges cover: Budget + Location + Property Type (core profile criteria)
- Badges show specific values (e.g., "Under ₪1.5M" "Tel Aviv" "3BR Apartment")
- AI includes contextual intro sentence before cards (e.g., "Based on your profile, here are 3 properties in Tel Aviv under ₪1.5M:")

### Property Interaction
- Tapping a property card opens modal overlay (stays in chat context)
- Modal shows full property details (everything from property page)
- Users can ask follow-up questions naturally in chat (e.g., "Tell me more about that Tel Aviv apartment")
- Each card has heart/bookmark icon for quick individual save

### Quick Save Behavior
- "Save All" button appears after the last property card
- Toast notification feedback: "3 properties saved"
- Silently handles duplicates (no error if already saved)
- Button replaced with "Saved ✓" after action completes

### Claude's Discretion
- Exact badge colors and styling
- Property card layout details and spacing
- Modal animation and close behavior
- Toast notification duration and positioning
- How AI maintains context about which properties were shown

</decisions>

<specifics>
## Specific Ideas

- Property cards should feel like rich embeds in modern chat apps
- Match badges should be visually distinct and scannable
- The modal should feel like you're still in the AI conversation, not navigating away
- Follow-up questions should work naturally ("what's the neighborhood like?" after seeing a property)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 42-property-recommendations*
*Context gathered: 2026-01-22*
