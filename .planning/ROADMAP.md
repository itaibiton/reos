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
- 🚧 **v1.9 Vendor Registration & Management** - Phases 57-60 (in progress)

---

## 🚧 v1.9 Vendor Registration & Management

**Milestone Goal:** Rebuild the service provider experience with structured onboarding, admin approval, and a revamped vendor personal area -- client management, process timeline, and deal statistics.

**Active Requirements:**

| ID | Requirement | Phase |
|----|-------------|-------|
| VEND-01 | Vendor onboarding questionnaire with all registration fields | 57 |
| VEND-02 | Admin approval gate for new vendors | 57 |
| VEND-03 | Vendor personal area: client management with document access | 58 |
| VEND-04 | Process timeline per client with current stage display | 58 |
| VEND-05 | Vendor deal statistics dashboard | 59 |
| VEND-06 | Profile photo upload for vendors | 57 |

**Coverage:** 6/6 requirements mapped.

---

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

**Plans:** TBD

Plans:
- [x] 58-01: Client list view with filtering and per-client document access ✅
- [x] 58-02: Process timeline visualization component with stage transitions ✅

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

**Plans:** TBD

Plans:
- [ ] 59-01: Statistics dashboard with deal metrics and broker sales count

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

**Plans:** TBD

Plans:
- [ ] 60-01: Public profile enhancement with all vendor fields and i18n

---

## Progress

**Execution Order:** 57 → 58 → 59 → 60

| Phase | Milestone | Plans Complete | Status | Completed |
|-------|-----------|----------------|--------|-----------|
| 57. Vendor Onboarding & Admin Approval | v1.9 | 3/3 | ✅ Complete | 2026-01-29 |
| 58. Client Management & Process Timeline | v1.9 | 0/2 | Not started | - |
| 59. Vendor Statistics Dashboard | v1.9 | 0/1 | Not started | - |
| 60. Profile Polish & Public Display | v1.9 | 0/1 | Not started | - |
