# Requirements: REOS v1.5

**Defined:** 2026-01-21
**Core Value:** Deal flow tracking from interest to close

## v1 Requirements

Requirements for v1.5 Mobile Responsive & Header Redesign. Each maps to roadmap phases.

### Foundation

- [ ] **FND-01**: Viewport uses 100dvh for full-height layouts (not 100vh)
- [ ] **FND-02**: CSS env() safe-area-inset variables configured
- [ ] **FND-03**: ThemeProvider properly wraps application
- [ ] **FND-04**: useIsMobile() hook used consistently for responsive behavior

### Theme Switching

- [ ] **THM-01**: Settings tab contains Light/Dark/System toggle
- [ ] **THM-02**: Theme preference persists across sessions (localStorage)
- [ ] **THM-03**: No theme flash on page load (proper hydration)
- [ ] **THM-04**: System option respects OS dark mode preference
- [ ] **THM-05**: Theme transition animates smoothly

### Mobile Navigation

- [ ] **NAV-01**: App displays bottom tab bar on mobile (<768px) with 5 tabs
- [ ] **NAV-02**: Tab bar shows role-specific tabs (investors: Properties, Feed, Chat, Deals, Profile)
- [ ] **NAV-03**: Tab bar shows role-specific tabs (providers: Dashboard, Clients, Chat, Feed, Profile)
- [ ] **NAV-04**: Active tab shows visual indicator (filled icon, color highlight)
- [ ] **NAV-05**: Tabs display badge for unread counts (notifications, messages)
- [ ] **NAV-06**: Tab bar respects iOS safe area insets (no content behind home indicator)
- [ ] **NAV-07**: Tab transitions animate smoothly with Framer Motion
- [ ] **NAV-08**: Sidebar is hidden on mobile, replaced by bottom tabs

### Header Redesign

- [ ] **HDR-01**: Header shows search icon on mobile that expands to full search input on tap
- [ ] **HDR-02**: Header shows single avatar dropdown button on right side
- [ ] **HDR-03**: Dropdown contains Notifications tab with unread items
- [ ] **HDR-04**: Dropdown contains Settings tab with theme and language switches
- [ ] **HDR-05**: Dropdown shows Sign Out button at bottom
- [ ] **HDR-06**: Dropdown trigger shows unread notification badge
- [ ] **HDR-07**: Breadcrumbs hidden on mobile, shown on desktop
- [ ] **HDR-08**: Search expansion animates smoothly
- [ ] **HDR-09**: Notifications grouped by type in dropdown
- [ ] **HDR-10**: Custom UI built with Clerk functions (no Clerk components)

### Responsive Layouts

- [ ] **RSP-01**: Property cards stack vertically (full-width) on mobile
- [ ] **RSP-02**: All form inputs are full-width on mobile
- [ ] **RSP-03**: Modals display as bottom sheets on mobile
- [ ] **RSP-04**: Touch targets are minimum 44px for all interactive elements
- [ ] **RSP-05**: Pull-to-refresh available on feed pages
- [ ] **RSP-06**: Desktop layouts remain unchanged (no regressions)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Mobile

- **MOB-01**: Gesture navigation (swipe to go back)
- **MOB-02**: Haptic feedback on interactions
- **MOB-03**: Offline indicator when connection lost
- **MOB-04**: PWA install prompt

### Advanced Theme

- **THM-06**: Custom accent color picker
- **THM-07**: High contrast mode for accessibility

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Native mobile app | Web responsive first, native apps in future milestone |
| Hamburger menu | Research shows 40% slower task completion than bottom tabs |
| Full search bar on mobile | Takes too much header space, icon trigger is standard |
| Breadcrumbs on mobile | Screen real estate too limited |
| Pure black (#000000) dark mode | Too harsh, use dark gray instead |
| Clerk UserButton component | Want custom UI matching our design system |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FND-01 | Phase 35 | Pending |
| FND-02 | Phase 35 | Pending |
| FND-03 | Phase 35 | Pending |
| FND-04 | Phase 35 | Pending |
| THM-01 | Phase 36 | Pending |
| THM-02 | Phase 36 | Pending |
| THM-03 | Phase 36 | Pending |
| THM-04 | Phase 36 | Pending |
| THM-05 | Phase 36 | Pending |
| NAV-01 | Phase 37 | Pending |
| NAV-02 | Phase 37 | Pending |
| NAV-03 | Phase 37 | Pending |
| NAV-04 | Phase 37 | Pending |
| NAV-05 | Phase 37 | Pending |
| NAV-06 | Phase 37 | Pending |
| NAV-07 | Phase 37 | Pending |
| NAV-08 | Phase 37 | Pending |
| HDR-01 | Phase 38 | Pending |
| HDR-02 | Phase 38 | Pending |
| HDR-03 | Phase 38 | Pending |
| HDR-04 | Phase 38 | Pending |
| HDR-05 | Phase 38 | Pending |
| HDR-06 | Phase 38 | Pending |
| HDR-07 | Phase 38 | Pending |
| HDR-08 | Phase 38 | Pending |
| HDR-09 | Phase 38 | Pending |
| HDR-10 | Phase 38 | Pending |
| RSP-01 | Phase 39 | Pending |
| RSP-02 | Phase 39 | Pending |
| RSP-03 | Phase 39 | Pending |
| RSP-04 | Phase 39 | Pending |
| RSP-05 | Phase 39 | Pending |
| RSP-06 | Phase 39 | Pending |

**Coverage:**
- v1 requirements: 32 total
- Mapped to phases: 32
- Unmapped: 0

---
*Requirements defined: 2026-01-21*
*Last updated: 2026-01-21 after roadmap creation*
