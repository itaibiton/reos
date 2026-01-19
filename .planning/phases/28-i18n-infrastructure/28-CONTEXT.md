# Phase 28: i18n Infrastructure - Context

**Gathered:** 2026-01-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Set up foundational internationalization infrastructure: next-intl v4 integration, middleware composition with Clerk, locale routing, DirectionProvider for RTL context, and Heebo font for Hebrew-Latin support. This phase establishes the framework — actual translations and CSS migrations are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Claude's Discretion

All infrastructure decisions delegated to Claude:

- **Locale routing strategy** — URL structure, default locale behavior, redirect rules
- **Language detection** — Browser preference vs stored preference, first-visit experience, persistence method
- **Font loading approach** — Heebo loading strategy, fallback fonts, performance considerations
- **Direction context scope** — Where DirectionProvider wraps, component tree structure

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches.

Research findings to guide decisions (from STATE.md):
- next-intl v4 for translation and routing
- @radix-ui/react-direction for Radix/Shadcn RTL context
- Heebo font for Hebrew-Latin support
- Middleware composition: Clerk wraps outer, returns intlMiddleware

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 28-i18n-infrastructure*
*Context gathered: 2026-01-19*
