# Requirements: REOS v1.4

**Defined:** 2026-01-19
**Core Value:** Deal flow tracking from interest to close

## v1 Requirements

Requirements for v1.4 Internationalization & RTL Support. Each maps to roadmap phases.

### Infrastructure

- [x] **INFRA-01**: App supports URL-based locale routing with `/he/` and `/en/` path prefixes
- [x] **INFRA-02**: Middleware correctly chains Clerk auth with next-intl locale handling
- [x] **INFRA-03**: App wrapped with DirectionProvider for Radix/Shadcn RTL support
- [x] **INFRA-04**: Existing route groups `(app)`, `(auth)`, `(main)` preserved under `[locale]` segment

### RTL Layout

- [x] **RTL-01**: HTML `dir` attribute set to `rtl` when locale is Hebrew
- [ ] **RTL-02**: All directional CSS classes converted to logical properties (`ml-` to `ms-`, etc.)
- [ ] **RTL-03**: Shadcn Sidebar component works correctly in RTL mode
- [ ] **RTL-04**: Shadcn Sheet, DropdownMenu, and other positioned components work in RTL
- [ ] **RTL-05**: Directional icons (arrows, chevrons) flip appropriately in RTL mode

### Translation

- [ ] **TRANS-01**: All UI strings extracted to JSON translation files
- [ ] **TRANS-02**: Hebrew translations provided for all extracted UI strings
- [ ] **TRANS-03**: Translation files organized by namespace/feature

### Formatting

- [ ] **FMT-01**: Dates displayed in locale-appropriate format
- [ ] **FMT-02**: Numbers displayed with locale-appropriate separators
- [ ] **FMT-03**: Currency displayed with locale-appropriate symbol and format

### User Experience

- [ ] **UX-01**: Language switcher component available in UI
- [ ] **UX-02**: User locale preference persisted across sessions
- [ ] **UX-03**: Locale auto-detected on first visit based on browser settings

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Translation

- **TRANS-04**: ICU message syntax for complex plurals and interpolation
- **TRANS-05**: TypeScript type-safe translation keys
- **TRANS-06**: Machine translation fallback for missing strings

### Additional Languages

- **LANG-01**: Arabic language support (RTL)
- **LANG-02**: Russian language support
- **LANG-03**: Spanish language support

### SEO

- **SEO-01**: hreflang tags for language alternates
- **SEO-02**: Locale-specific meta descriptions
- **SEO-03**: Locale-specific Open Graph tags

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| User-generated content translation | User content stays in original language per requirements |
| Real-time translation API | Too complex for MVP, defer to v2+ |
| Per-field language selection | Overkill for initial release |
| Subdomain-based locale (he.reos.com) | URL path approach simpler and better for SEO |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| INFRA-01 | 28 | Complete |
| INFRA-02 | 28 | Complete |
| INFRA-03 | 28 | Complete |
| INFRA-04 | 28 | Complete |
| RTL-01 | 28 | Complete |
| RTL-02 | 29 | Pending |
| RTL-03 | 30 | Pending |
| RTL-04 | 30 | Pending |
| RTL-05 | 30 | Pending |
| TRANS-01 | 31 | Pending |
| TRANS-02 | 33 | Pending |
| TRANS-03 | 31 | Pending |
| FMT-01 | 32 | Pending |
| FMT-02 | 32 | Pending |
| FMT-03 | 32 | Pending |
| UX-01 | 34 | Pending |
| UX-02 | 34 | Pending |
| UX-03 | 34 | Pending |

**Coverage:**
- v1 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0

---
*Requirements defined: 2026-01-19*
*Last updated: 2026-01-19 after roadmap creation*
