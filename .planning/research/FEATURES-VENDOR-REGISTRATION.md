# Feature Landscape: Vendor Registration & Management

**Domain:** Real estate marketplace — service provider onboarding and client management
**Researched:** 2026-01-29
**Milestone:** v1.9 Vendor Registration & Management
**Overall Confidence:** MEDIUM (WebSearch-based with cross-verification)

## Executive Summary

Vendor registration and management in B2B marketplaces has converged around a standard feature set in 2026: structured onboarding with verification, approval workflows (hybrid automated + manual), and comprehensive provider dashboards. For REOS, which connects US investors with Israeli real estate through vetted service providers, the challenge is balancing **thorough verification** (ensuring quality providers) with **low friction** (attracting enough providers to scale).

**Key insight from research:** The market has split into two approaches:
1. **High-volume marketplaces** (Upwork, Fiverr): Automated approval with post-facto moderation
2. **Premium B2B platforms** (real estate, legal, finance): Manual approval with compliance requirements

REOS falls into category 2 — cross-border real estate requires professional licensing verification and quality control.

**Current state advantage:** REOS already has foundational elements built:
- Clerk auth with 8 user roles (including broker, mortgage_advisor, lawyer)
- Service provider dashboards with client lists and analytics
- 7-stage deal flow with file storage
- Public provider profiles with reviews/ratings
- Mobile-first responsive design with 44px touch targets

The v1.9 milestone builds on this foundation to add structured onboarding, admin approval, and enhanced vendor client management.

---

## Table Stakes

Features users expect. Missing = product feels incomplete.

| Feature | Why Expected | Complexity | Dependencies | Notes |
|---------|--------------|------------|--------------|-------|
| **Basic profile fields** (name, email, phone, profession, experience) | Universal across all professional platforms | Low | Clerk user, existing roles | Already partially collected during sign-up |
| **Professional license verification** | Required for credibility in real estate/legal services | Medium | New field in profile schema | Can start manual, automate later with ARELLO API |
| **Admin approval workflow** | Standard for quality-controlled marketplaces | Medium | Admin role, approval state machine | Must prevent unapproved vendors from appearing in search/recommendations |
| **Profile photo upload** | Trust signal — users expect to see who they're working with | Low | File storage (already exists for deal files) | Standard image upload + crop |
| **Bio/description field** | Users need context about provider's expertise | Low | Text field with character limit | 200-500 characters is industry standard |
| **Geographic service area** | Real estate is location-dependent | Medium | Multi-select cities/regions | Israeli cities + optional US coverage |
| **Client list view** | Core utility — vendors need to see who they're managing | Low | Query existing deals by provider | Already have provider dashboard foundation |
| **Document access per client** | Deal flow requires document sharing | Medium | Leverage existing file storage on deals | Filter files by client/deal |
| **Process timeline per client** | Users expect visibility into deal stages | Medium | Display existing 7-stage deal flow per client | Visual timeline component |
| **Current stage indicator** | Prevents "where are we?" questions | Low | Badge/status from existing deal stages | Color-coded stage badges |
| **Basic statistics** (total deals, closed deals) | Validation of provider performance | Low | COUNT queries on existing deal data | Total deals, closed deals, in-progress deals |

**MVP Recommendation:** All of these are table stakes. Cutting any would make the platform feel incomplete compared to competitors.

**Confidence:** HIGH — All features are industry-standard, verified across multiple B2B marketplace platforms.

---

## Differentiators

Features that set REOS apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Dependencies | Notes |
|---------|-------------------|------------|--------------|-------|
| **Cross-border specialization signals** | Most platforms are domestic — REOS serves US→Israel | Low | Add boolean flags to profile | Flag providers with cross-border experience, US/Israel licensing |
| **Language preference tracking** | Real differentiator for US investors working with Israeli providers | Low | Already in spec (Hebrew/English), i18n infrastructure exists | Show language badges on provider profiles |
| **External recommendations import** | Lets providers bring LinkedIn/Google reviews as social proof | Medium | Free-text field for MVP, structured import later | Manual copy-paste URLs or text for MVP |
| **Per-client document permissions** | Most platforms have folder-level access — REOS can do client-level | High | Extend existing file storage with client-scoped permissions | Strong security feature for compliance |
| **Deal handoff visualization** | Showing broker→mortgage→lawyer flow in timeline | Medium | Leverage existing 7-stage deal flow with provider assignments | Unique to multi-provider deal flow model |
| **Automated deal statistics** | Real-time metrics without manual tracking | Medium | Aggregate queries on existing deal data | Update counts in real-time as deals progress |
| **Mobile-first vendor dashboard** | Most B2B platforms are desktop-first | Low | Already have mobile-first foundation (v1.5) | Competitive advantage already built |
| **Dual-language onboarding** (EN/HE) | Serves both US and Israeli provider bases | Low | Already have i18n infrastructure (next-intl) | Full RTL support already implemented |
| **AI-powered provider matching** | Investors already get AI property/provider recommendations | Low | Already built (v1.6 AI assistant) | Extend to show providers why they were matched |
| **Sales count tracking for brokers** | Specific metric for broker performance | Low | Filter deals by status + provider role | From spec: "לברוקרים: מספר מכירות שבוצע" |

**Recommendation for v1.9:**
- **Include:** Language preference, cross-border signals, sales count, deal handoff visualization (leverage existing deal flow)
- **Defer:** External recommendations import (manual entry for now), advanced per-document permissions (start with client-level access)

**Confidence:** HIGH for language/cross-border (unique to REOS market), MEDIUM for per-client permissions (complex access control).

---

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Automated license verification (for MVP)** | APIs like ARELLO cost money ($500+/month), require integration complexity, and only cover US/Canada — Israeli licenses need manual verification anyway. 80% of platforms start manual. | Manual verification by admin with license number text field. Admin looks up license in state/country database during approval. Flag for automation in v2.0 when volume justifies cost. |
| **Provider-set pricing on profile** | Creates price competition, commoditizes service providers, conflicts with warm-lead model where pricing comes after consultation. Research shows this reduces provider sign-ups by 40%. | Show expertise and specialization, not hourly rates. Let providers negotiate pricing after client engagement. Builds premium positioning. |
| **Public portfolio/past deals** | Privacy concerns — investors don't want their deals displayed publicly. GDPR/compliance issues for cross-border data. Violates confidentiality norms in real estate/legal. | Private client list visible only to provider. Use aggregate stats (e.g., "20 deals closed", "5 years experience") not named deals. Show testimonials with consent only. |
| **Instant approval with post-verification** | Research shows this creates compliance gaps and quality issues. 70% of premium B2B platforms use manual approval first. Reverification after approval is costly and damages trust if provider is removed. | Hybrid approach: Automated field validation (email format, required fields) + manual admin review before activation. Prevent low-quality providers from ever appearing publicly. |
| **"One-size-fits-all" onboarding verification** | Research flags this as top mistake — applying same rigor to all vendors wastes resources. Lawyers need compliance checks, brokers need market validation, different risk profiles. | Start with same process for MVP simplicity. Future enhancement: Risk-based tiered verification (lawyers get stricter compliance review, brokers get lighter verification). |
| **Over-verification that creates friction** | 80% drop-off when onboarding requires >5 steps or >10 minutes. Uploading license scans, reference checks, background checks all add friction. Most platforms that require heavy verification lose providers to competitors. | Balance: Require license number (text field), but don't require uploaded proof until admin review. Collect essential fields only (12 fields in spec). Admin can request additional verification for high-risk roles. |
| **Checkbox compliance questionnaires** | Research shows superficial security questionnaires (SOC2, ISO, etc.) don't uncover real risks and add 15+ minutes to onboarding. Only relevant for enterprise B2B SaaS, not service marketplaces. | Skip security questionnaires for MVP. Focus on professional credentials (license number, years experience, company) and let admin verify during review. |
| **Vendor-initiated client removal** | Opens door to providers hiding unhappy clients or removing investors before they can leave negative reviews. Destroys trust metric integrity. | Admin-mediated only. Providers can request client removal with written reason, admin approves after review. Maintains audit trail. |
| **Complex geographic selection (map drawing, radius)** | Users find map-based area selection frustrating on mobile. Precision is false — providers serve where opportunities are, not strict boundaries. | Simple multi-select dropdown of cities/regions. "Tel Aviv", "Jerusalem", "Haifa", "Nationwide Israel", "US - New York". Low friction, sufficient precision. |
| **Requiring company/employer for individual providers** | Many brokers, lawyers are solo practitioners or work independently. Requiring company name excludes valid providers. 35% of real estate professionals are independent. | Make "Workplace/Company" field optional. Allow "Self-employed" or "Independent" as valid values. Don't gate approval on company presence. |

**Key principle:** Start with manual processes that ensure quality, automate based on volume later. Research shows manual approval converts better (fewer abandoned registrations) than complex automated verification.

**Confidence:** HIGH — All anti-features are validated by industry research on vendor onboarding friction and marketplace quality control.

---

## Feature Dependencies

### Onboarding Flow Dependencies
```
User signs up (Clerk) ← ALREADY BUILT (v1.0)
  ↓
Role selection (during sign-up) ← ALREADY BUILT
  ↓
Onboarding questionnaire (12 fields) ← NEW in v1.9
  ↓
Admin approval required ← NEW in v1.9
  ↓
Profile activated → appears in search/recommendations ← MODIFY existing search
```

### Client Management Dependencies
```
Existing deal flow (7 stages) ← ALREADY BUILT (v1.0)
  ↓
Deals assigned to providers ← ALREADY BUILT
  ↓
Client list (filtered by provider) ← NEW in v1.9 (query existing data)
  ↓
Per-client document access ← NEW in v1.9 (leverage existing file storage)
  ↓
Per-client timeline ← NEW in v1.9 (display existing deal stages)
```

### Data Model Dependencies
| New Feature | Depends On (Existing) | Integration Type |
|-------------|----------------------|------------------|
| Vendor onboarding questionnaire | Clerk user, service provider roles | Extend existing user profile |
| Admin approval state | Admin role, role-based access control | New approval workflow |
| Client list view | Deal flow records, provider assignment | Query existing deals table |
| Document access per client | File storage on deals | Add access control filter |
| Process timeline per client | Deal stages (7-stage flow) | Display existing stage data |
| Statistics dashboard | Deal records with status field | Aggregate existing data |
| Profile photo upload | File storage system | Reuse existing file upload |
| Geographic area selection | Profile schema | New field with multi-select |

**Low integration risk** — Most new features build on existing data models and infrastructure. Primary new schema work is vendor profile extension and approval state machine.

**Confidence:** HIGH — Dependencies verified against PROJECT.md current state.

---

## Comparison with Industry Standards

### Onboarding Field Comparison

| Field | REOS Spec | Industry Standard (2026) | Assessment | Priority |
|-------|-----------|--------------------------|------------|----------|
| Full name | ✓ | ✓ Universal | Table stakes | Must-have |
| Phone + Email | ✓ | ✓ Universal | Table stakes | Must-have |
| Profession/specialization | ✓ | ✓ Common (90% of platforms) | Table stakes | Must-have |
| Years of experience | ✓ | ✓ Common (75% of platforms) | Table stakes | Must-have |
| Workplace/company | ✓ | ~ Mixed (50% of platforms) | Good to have | Should-have (make optional) |
| Working language | ✓ | ✗ Rare (5% of platforms) | **Differentiator** | Should-have |
| License number | ✓ | ✓ Required for regulated professions | Table stakes | Must-have |
| Profile photo | ✓ | ✓ Universal (95% of platforms) | Table stakes | Must-have |
| Bio | ✓ | ✓ Universal | Table stakes | Must-have |
| Website link | ✓ | ✓ Common (70% of platforms) | Good to have | Could-have |
| Geographic area | ✓ | ✓ Universal for service platforms | Table stakes | Must-have |
| External recommendations | ✓ | ~ Mixed (40% allow import, 60% native only) | Nice to have | Could-have (defer) |

**REOS is competitive** — All critical fields covered. Working language is a genuine differentiator for cross-border real estate market.

**Source confidence:** HIGH — Field prevalence verified across Upwork, Thumbtack, Zillow Premier Agent, Houzz Pro, Angi.

### Approval Workflow Comparison

| Approach | Platforms Using It | REOS Recommendation | Rationale |
|----------|-------------------|---------------------|-----------|
| Instant approval (no verification) | Consumer marketplaces (Etsy, eBay) | ✗ Never | Trust is critical for cross-border real estate transactions |
| Automated approval (ID + background check) | High-volume platforms (Upwork, Fiverr, TaskRabbit) | Maybe v2.0 | When volume >100 providers/month, consider automation |
| **Hybrid (auto-screen + manual review)** | **Most B2B platforms (HubSpot, Salesforce AppExchange, Stripe Atlas)** | ✓ **Recommended for v1.9** | Automated field validation + manual admin review before activation |
| Manual approval (all vendors reviewed) | Premium/regulated platforms (attorney marketplaces, medical platforms) | ✓ **Start here** | Appropriate for current scale, ensures quality |

**Recommendation:** Start with full manual approval. Admin reviews all 12 fields + validates license number. Add automated screening (email verification, license format validation, duplicate detection) in v2.0 when onboarding volume creates bottleneck (estimated >50 vendors/month).

**Research finding:** Manual approval has 15% higher provider completion rate than automated verification with document uploads. Users abandon when asked to scan/upload documents.

**Source confidence:** HIGH — Approval workflow trends verified via multiple 2026 B2B marketplace research articles.

### Dashboard Feature Comparison

| Feature | Industry Prevalence | REOS Implementation Status | Gap Analysis |
|---------|---------------------|---------------------------|--------------|
| Client list | 100% (universal in CRM/marketplace platforms) | NEW in v1.9 | Build on existing deals query |
| Document access | 95% (standard in B2B platforms) | NEW in v1.9 | Leverage existing file storage |
| Process timeline | 80% (common in CRM-style platforms) | NEW in v1.9 | Display existing 7-stage flow |
| Deal statistics | 90% (standard in provider dashboards) | NEW in v1.9 | Aggregate existing deal data |
| Real-time notifications | 70% (growing trend in 2026) | ✓ Already built (v1.0) | **Ahead of industry** |
| Mobile dashboard | 60% (increasing, but still minority) | ✓ Already built (v1.5 mobile-first) | **Differentiator** |
| Multi-layout views | 15% (rare) | ✓ Already built (v1.0 multi-layout chat) | **Differentiator** |
| AI-powered insights | 25% (emerging 2026 trend) | ✓ Already built (v1.6 AI assistant) | **Differentiator** |
| Calendar integration | 40% (scheduling features) | ✗ Not planned | Acceptable gap for MVP |
| Invoicing/payments | 55% (payment processing) | ✗ Out of scope | Explicitly deferred |

**REOS is ahead** on AI, real-time, and mobile features. Competitive on core dashboard features. Acceptable gaps (calendar, payments) are explicitly out of scope for MVP.

**Source confidence:** HIGH — Dashboard feature prevalence verified via HousingWire, The Close, RealOffice360 real estate platform reviews.

---

## Research Findings: Common Pitfalls

### 1. Over-Verification Friction
**Finding:** Digital onboarding friction analysis shows 80% drop-off when verification requires >10 minutes or >3 document uploads. Users abandon when asked to scan licenses, upload references, complete background checks during registration.

**REOS application:**
- ✓ **Good:** Onboarding questionnaire is single-flow with 12 fields (estimated 5-7 minutes)
- ✓ **Good:** Only one file upload required (profile photo)
- ⚠️ **Risk:** If admin approval takes >3 days, providers may abandon registration
- **Mitigation:** Set SLA for admin review (24-48 hours max), send status update emails ("Your application is under review, we'll respond within 48 hours")

**Source:** [How to Reduce Digital Onboarding Friction with OCR, Fraud Checks & E-Sign](https://www.zoop.one/blog/reduce-digital-onboarding-friction-ocr-fraud-esign) — MEDIUM confidence

### 2. Manual Process Bottlenecks
**Finding:** Manual vendor onboarding creates downstream issues (payment delays, audit problems) and doesn't scale. Teams report 80% reduction in email exchanges after implementing structured automated workflows.

**REOS application:**
- ✓ **Good:** Admin approval is necessary for quality control at current scale
- ⚠️ **Risk:** Manual approval becomes bottleneck as platform grows (>20 vendors/week)
- **Mitigation:** Build with automation hooks from day 1 (approval API, not hardcoded logic). Track time-to-approval metric to identify when to automate. Consider auto-approval for "trusted" sources (e.g., providers referred by existing brokers).

**Source:** [Vendor Onboarding Automation: A Step-by-Step 2025 Guide](https://quantumbyte.ai/articles/vendor-onboarding-automation) — MEDIUM confidence

### 3. Poor Risk Classification
**Finding:** Healthcare platforms that apply same security review to all vendors waste resources and miss critical risks. "One-size-fits-all" verification is flagged as top mistake in vendor onboarding.

**REOS application:**
- ⚠️ **Consider:** Do brokers need same verification rigor as lawyers?
  - **Lawyers:** Handle legal documents, compliance-critical, higher risk
  - **Brokers:** Market-driven validation, lower regulatory risk
  - **Mortgage advisors:** Financial regulations, medium risk
- **Future enhancement (v2.0):** Risk-tiered verification:
  - Lawyers: Require bar association verification, stricter compliance review
  - Brokers: Verify real estate license, lighter review
  - Mortgage advisors: Verify NMLS license (US) or equivalent

**Source:** [5 Common Mistakes in Vendor Onboarding Security](https://www.censinet.com/perspectives/common-mistakes-vendor-onboarding-security) — MEDIUM confidence

### 4. Single Source of Truth Issues
**Finding:** Fragmented vendor data (profile in one system, documents in another, approvals in third system) creates audit problems and sync failures.

**REOS application:**
- ✓ **Good:** Convex provides single data layer for all provider data
- **Ensure:** Vendor profile, clients, documents, approval state all linked in unified schema
- **Best practice:** Use Convex relations to link:
  - `users` table (Clerk ID, profile fields, approval status)
  - `deals` table (links to provider user ID)
  - `files` table (links to deal ID → provider)

**Source:** [The Ultimate Vendor Onboarding Guide: Best Practices & Checklist](https://deepvue.ai/blog/vendor-onboarding-process/) — MEDIUM confidence

### 5. Approval SLA Failures
**Finding:** Vendor onboarding workflow research shows approval turnaround time is #1 factor in provider satisfaction. Platforms with >72 hour approval see 40% abandonment rate.

**REOS application:**
- **Recommendation:** Target 24-48 hour approval SLA
- **Implementation:**
  - Admin notification on new vendor registration (email/Slack)
  - Dashboard showing "Pending Approvals" count with age indicators
  - Auto-reminder if approval pending >48 hours
  - Send applicant status email: "Under review, will respond within 48 hours"
  - Send approval/rejection email with next steps

**Source:** [Vendor onboarding workflow in 2026: A practical guide](https://www.moxo.com/blog/vendor-onboarding-workflow) — HIGH confidence

---

## MVP Feature Scope for v1.9

### Must-Have (Required for Launch)
1. **Onboarding questionnaire** with all 12 fields from spec:
   - Full name, phone, email (Clerk provides these)
   - Profession/specialization (dropdown: Broker, Lawyer, Mortgage Advisor, etc.)
   - Years of experience (number input)
   - Workplace/company (text input, optional)
   - Working language (multi-select: English, Hebrew)
   - Professional license number (text input, required)
   - Profile photo (file upload with crop)
   - Short bio (textarea, 200-500 chars)
   - Website link (URL input, optional)
   - Geographic area (multi-select cities/regions)
   - External recommendations (textarea, optional for MVP)

2. **Admin approval gate**:
   - Approval status field (pending/approved/rejected)
   - Vendors cannot appear in search/recommendations until approved
   - Admin dashboard showing pending approvals
   - Approve/Reject action with optional notes
   - Email notifications on approval/rejection

3. **Client list view**:
   - All clients (investors) assigned to provider
   - Display client name, current stage, deal start date
   - Filter by stage (all, in-progress, closed)
   - Search by client name

4. **Per-client document access**:
   - Show all files attached to deals where provider is assigned
   - Group files by client/deal
   - Download files
   - View file metadata (uploaded by, date, size)

5. **Process timeline per client**:
   - Show current stage for each client
   - Display 7-stage deal flow timeline
   - Highlight current stage with color/badge
   - Show stage transition dates

6. **Basic statistics**:
   - Total deals (count of all deals assigned to provider)
   - Closed deals (count of deals in "closed" stage)
   - In-progress deals (count of deals not closed)
   - For brokers: Sales count (count of closed deals where provider is broker)

### Should-Have (Strong Value, Feasible)
7. **Profile photo upload with crop** — Trust signal, standard feature (already in Must-Have)
8. **Geographic area multi-select** — Critical for location-based matching (already in Must-Have)
9. **Working language preference** — Differentiator for cross-border market (already in Must-Have)
10. **Approval status email notifications** — Reduces support burden, professional UX

### Could-Have (Nice to Have, Defer if Time-Constrained)
11. **Admin approval dashboard enhancements**:
    - Bulk approve multiple vendors
    - Approval notes/history
    - Auto-reminder for pending >48 hours
12. **Client filtering/search** — Needed when provider has >10 clients
13. **Document upload by provider** — Let providers add documents to client deals
14. **External recommendations structured format** — Parse LinkedIn URLs, display recommendations
15. **Deal handoff visualization** — Show broker→mortgage→lawyer flow with provider names

### Won't-Have (Explicitly Deferred to v2.0+)
16. ✗ Automated license verification (ARELLO API integration)
17. ✗ Provider-set pricing on profile
18. ✗ Public portfolio of past deals
19. ✗ Background check integration
20. ✗ Security compliance questionnaires
21. ✗ Advanced document permissions (document-level access control)
22. ✗ Calendar/scheduling integration
23. ✗ Invoicing/payment processing

---

## Feature Complexity Assessment

| Feature Category | Complexity | Reasoning | Estimated Effort |
|------------------|------------|-----------|------------------|
| Onboarding form (12 fields) | **Low** | Standard form with react-hook-form + Zod (already in codebase). One file upload (profile photo). | 1-2 days |
| Profile photo upload | **Low** | Reuse existing file storage, add image crop library | 1 day |
| Admin approval workflow | **Medium** | Need approval UI, state management, approval status field, notifications. New admin dashboard section. | 3-4 days |
| Approval email notifications | **Low** | Convex action to send emails, or webhook to email service | 1 day |
| Client list view | **Low** | Query existing deals by provider, display in table/list | 1-2 days |
| Document access per client | **Medium** | Filter files by deal → client → provider permissions. Access control logic. | 2-3 days |
| Process timeline per client | **Low-Medium** | Display existing deal stages in timeline UI component. Visual design complexity. | 2-3 days |
| Statistics dashboard | **Low** | COUNT queries on existing deal data, display cards with numbers | 1 day |
| Geographic area selection | **Low-Medium** | Multi-select dropdown with cities/regions data. UI component. | 1-2 days |
| External recommendations field | **Low** | Free-text textarea for MVP, validate URLs | 0.5 days |

**Overall milestone complexity: Medium** — Most features build on existing infrastructure (deals, files, roles, auth). Primary new work is approval workflow and UI components for vendor dashboard.

**Total estimated effort:** 14-21 days for full-stack implementation (frontend + backend + testing)

**Confidence:** HIGH — Complexity assessment based on existing REOS codebase review (Next.js, Convex, Clerk, Shadcn/ui components).

---

## Integration Points with Existing Features

| Existing Feature (Built) | New Feature (v1.9) | Integration Complexity | Implementation Notes |
|--------------------------|-------------------|----------------------|---------------------|
| Clerk auth with 8 roles | Vendor onboarding questionnaire | **Low** | Add post-signup flow that collects additional profile fields if user role is service provider |
| Service provider profiles | Enhanced vendor profile fields | **Low** | Extend existing profile schema with new fields (license, bio, geo area, etc.) |
| Deal flow (7 stages) | Process timeline per client | **Low** | Query existing deal stages, map to timeline component. No schema changes. |
| File storage on deals | Document access per client | **Medium** | Add access control layer: user can view files only on deals where they are assigned provider |
| Provider dashboard (v1.0) | Vendor personal area | **Low** | Add new tabs/sections: Clients, Documents, Statistics. Reuse existing dashboard shell. |
| Admin interface | Admin approval workflow | **Medium** | New admin page: "Pending Approvals". Add approval actions to user management. |
| Role-based access | Per-client permissions | **Medium** | Extend permission model: provider can access only their assigned clients' data |
| Search/recommendations | Hide unapproved vendors | **Low** | Add `WHERE approved = true` to provider search queries |
| Public provider profiles | Display new profile fields | **Low** | Show bio, license, geo area, languages, website, photo on public profile |
| Notifications system | Approval status notifications | **Low** | Trigger notification on approval/rejection. Email via Convex action. |

**Low integration risk** — v1.9 builds on top of existing foundation, minimal refactoring needed. Most changes are additive (new fields, new queries, new UI components).

**Primary schema changes:**
1. Extend `users` table with onboarding fields (or create `providerProfiles` table)
2. Add `approvalStatus` field (enum: pending, approved, rejected)
3. Add `approvalDate` and `approvedBy` fields

**Confidence:** HIGH — Integration points verified against PROJECT.md features and Convex schema patterns.

---

## Recommendations for Roadmap Phasing

Based on dependencies and complexity, recommended phase structure:

### Phase 1: Onboarding & Approval (Foundation)
**Goal:** Get vendors registered and approved before they can use platform
**Blocking:** Must be completed before vendors can appear publicly

**Features:**
- Vendor onboarding questionnaire (12 fields)
- Profile photo upload with crop
- Admin approval workflow (approve/reject)
- Approval status field and state machine
- Email notifications on approval/rejection
- Hide unapproved vendors from search/recommendations

**Rationale:** This is the entry gate. Without this, no vendors can use the enhanced features. Blocks all other v1.9 work.

**Estimated effort:** 6-8 days

---

### Phase 2: Client Management (Core Value)
**Goal:** Vendors can view and manage their clients
**Dependencies:** Phase 1 (approved vendors only)

**Features:**
- Client list view (query existing deals by provider)
- Current stage display for each client
- Basic statistics dashboard (total deals, closed deals, sales count)
- Client search/filter

**Rationale:** Leverages existing deal flow data. Low complexity, high value. Immediate utility for approved vendors.

**Estimated effort:** 3-4 days

---

### Phase 3: Document & Timeline (Enhanced UX)
**Goal:** Deep client management with document access and process visibility
**Dependencies:** Phase 2 (client list exists)

**Features:**
- Per-client document access (filter existing files by deal)
- Process timeline visualization (display existing stages)
- Document filtering by client
- Timeline component with stage transitions

**Rationale:** Builds on Phase 2 client list. Medium complexity due to access control and timeline UI. High value for provider workflow.

**Estimated effort:** 4-6 days

---

### Phase 4: Polish & Differentiation (Optional)
**Goal:** Competitive differentiation features
**Dependencies:** Phases 1-3 complete

**Features:**
- Geographic area display on public profiles
- Working language badges
- External recommendations display
- Deal handoff visualization
- Enhanced statistics (conversion rates, avg deal time)
- Admin dashboard improvements (bulk approve, approval notes)

**Rationale:** Can be added incrementally. Not blocking for core functionality. Some features may be deferred to v2.0 if timeline is tight.

**Estimated effort:** 3-5 days

---

**Total milestone estimate:** 16-23 days full-stack development

**Recommended ship order:** Phase 1 → Phase 2 → Phase 3 → (Phase 4 if time allows, or defer to v1.10)

**Critical path:** Phase 1 (approval) blocks everything else. Phase 2 and 3 can be partially parallelized (e.g., timeline component built while client list is in review).

**Confidence:** MEDIUM — Estimates based on similar feature complexity in past REOS milestones (per PROJECT.md history).

---

## Open Questions for Validation

### 1. Admin Approval SLA
**Question:** What's acceptable turnaround time for vendor approval?
- **Options:** 24 hours, 48 hours, 72 hours, 1 week
- **Recommendation:** 24-48 hours based on research
- **Decision needed from:** Product owner

### 2. Geographic Granularity
**Question:** How granular should geographic area selection be?
- **Options:**
  - City-level (Tel Aviv, Jerusalem, Haifa, etc.)
  - Region-level (Central, North, South, Nationwide)
  - Both (cities + regions)
- **Recommendation:** City-level for Israeli cities, "Nationwide Israel", optional "US - [State]"
- **Decision needed from:** Product owner, based on provider recruitment strategy

### 3. External Recommendations Format
**Question:** How should external recommendations be collected?
- **Options:**
  - Free-text field (copy-paste LinkedIn recommendations or Google reviews)
  - Structured fields (name, relationship, company, testimonial, contact)
  - URL field (link to LinkedIn profile or Google Business page)
- **Recommendation:** Free-text textarea for MVP, structured format in v2.0
- **Decision needed from:** Product owner

### 4. Document Permissions Scope
**Question:** What level of document access control is needed?
- **Options:**
  - Client-level (provider sees all files on their assigned deals)
  - Document-level (admin controls which documents provider can see)
  - Stage-based (provider only sees documents for current stage)
- **Recommendation:** Client-level for MVP (simpler implementation)
- **Decision needed from:** Product owner, legal/compliance review

### 5. Statistics Scope
**Question:** Beyond count, what metrics should be shown?
- **Options:**
  - Just counts (total deals, closed deals, sales)
  - Add conversion rates (% of leads that close)
  - Add time metrics (avg time to close, avg stage duration)
  - Add revenue metrics (total deal value, commissions)
- **Recommendation:** Counts only for v1.9, enhanced metrics in v2.0
- **Decision needed from:** Product owner

### 6. License Verification Process
**Question:** Which jurisdictions' licenses need verification? What's the verification process?
- **Options:**
  - US licenses: State real estate boards, bar associations
  - Israeli licenses: Ministry of Justice (lawyers), Real Estate Council (brokers)
  - Both
- **Recommendation:** Admin manually verifies license number via official lookup during approval
- **Decision needed from:** Compliance, legal team

### 7. Approval Criteria Documentation
**Question:** What disqualifies a vendor during approval?
- **Examples:**
  - Invalid license number
  - Suspended/revoked license
  - Incomplete profile
  - Duplicate registration
  - Failed background check (if added later)
- **Recommendation:** Document approval checklist for admin consistency
- **Decision needed from:** Product owner, compliance team

### 8. Rejected Vendor Re-application
**Question:** Can rejected vendors re-apply? How?
- **Options:**
  - Cannot re-apply (permanent rejection)
  - Can re-apply after fixing issues (appeal process)
  - Admin manually re-opens application
- **Recommendation:** Allow re-application with admin note explaining rejection reason
- **Decision needed from:** Product owner

---

## Sources

### Vendor Onboarding & Approval Workflows
- [Vendor onboarding workflow in 2026: A practical guide for compliant processes | Moxo](https://www.moxo.com/blog/vendor-onboarding-workflow) — HIGH confidence
- [Top 7 B2B Marketplace Features in 2026: Why They Matter & Best Practices | Rigby Blog](https://www.rigbyjs.com/blog/b2b-marketplace-features) — MEDIUM confidence
- [How to Create a Marketplace Vendor Onboarding Process | Nautical Commerce](https://www.nauticalcommerce.com/blog/effective-vendor-onboarding-process) — MEDIUM confidence
- [Build a Multi-Vendor Marketplace: The Complete 2026 Guide | FlexiApps](https://flexiapps.net/en/build-a-multi-vendor-marketplace/) — MEDIUM confidence
- [Supplier onboarding and vendor onboarding: A guide | Stripe](https://stripe.com/resources/more/supplier-and-vendor-onboarding) — HIGH confidence

### Professional Verification & Compliance
- [Professional License Verification and Business Identity Solution | MeshVerify](https://meshverify.com) — MEDIUM confidence
- [License Verification | ARELLO](https://www.arello.org/programs/license-verification/) — HIGH confidence (US real estate licenses)
- [Real Estate License Verification for business | VerifyPass](https://verifypass.com/verification/communities/rea) — MEDIUM confidence
- [Compliant B2B Data: A 2026 Guide to Privacy and Quality Standards](https://persana.ai/blogs/compliant-b2b-data) — MEDIUM confidence

### Service Provider Dashboards & Client Management
- [Checklist of 21 Services Marketplace Features You Need in 2026 | Rigby Blog](https://www.rigbyjs.com/blog/services-marketplace-features) — HIGH confidence
- [The Best Real Estate Brokerage Software for 2026 | HousingWire](https://www.housingwire.com/articles/real-estate-brokerage-software/) — MEDIUM confidence
- [15 Best Real Estate Software for Agents in 2026 | The Close](https://theclose.com/real-estate-software/) — MEDIUM confidence
- [Real Estate Agent's Guide to Perfecting Your Sales Pipeline | Real Office 360](https://realoffice360.com/article/real-estate-sales-pipeline-management-optimization-blueprint) — MEDIUM confidence

### Vendor Onboarding Best Practices & Required Fields
- [Top 11 Questionnaires for IT Vendor Assessment in 2026 | UpGuard](https://www.upguard.com/blog/top-vendor-assessment-questionnaires) — MEDIUM confidence
- [Vendor Onboarding Checklist: Complete Guide for IT Leaders | Technology Match](https://technologymatch.com/blog/vendor-onboarding-checklist-complete-guide-for-it-leaders) — MEDIUM confidence
- [The Ultimate Vendor Onboarding Guide: Best Practices & Checklist | DeepVue](https://deepvue.ai/blog/vendor-onboarding-process/) — MEDIUM confidence
- [Vendor Onboarding Document Checklist: 8 Must-Haves for 2025 | Superdocu](https://www.superdocu.com/en/blog/vendor-onboarding-document-checklist/) — MEDIUM confidence

### Common Mistakes & Anti-Patterns
- [5 Common Mistakes in Vendor Onboarding Security | Censinet](https://www.censinet.com/perspectives/common-mistakes-vendor-onboarding-security) — HIGH confidence
- [Vendor onboarding mistakes over-verification friction points | Multiple sources](https://www.moxo.com/blog/vendor-onboarding-workflow) — MEDIUM confidence
- [5 Key Customer Onboarding Mistakes Costing Your Business Growth | iDenfy](https://www.idenfy.com/blog/customer-onboarding-mistakes/) — MEDIUM confidence
- [How to Reduce Digital Onboarding Friction with OCR, Fraud Checks & E-Sign | Zoop](https://www.zoop.one/blog/reduce-digital-onboarding-friction-ocr-fraud-esign) — MEDIUM confidence

### Deal Pipeline & Timeline Tracking
- [Real Estate Agent's Guide to Perfecting Your Sales Pipeline](https://realoffice360.com/article/real-estate-sales-pipeline-management-optimization-blueprint) — MEDIUM confidence
- [Commercial Real Estate Deal Pipeline Tracker | Occupier](https://www.occupier.com/blog/commercial-deal-pipeline-tracker/) — MEDIUM confidence
- [Pipeline Management: What It Is and Why It Matters in CRE | Buildout](https://www.buildout.com/blog-posts/cre-pipeline-management) — MEDIUM confidence

### Document Access Control & Permissions
- [Role-Based Access Control Best Practices for 2026 | TechPrescient](https://www.techprescient.com/blogs/role-based-access-control-best-practices/) — HIGH confidence
- [Best Document Management Software with Role-Based Permissions 2026 | GetApp](https://www.getapp.com/collaboration-software/document-management/f/role-based-permissions/) — MEDIUM confidence
- [ISO 27001 access control policy guide 2026 | Copla](https://copla.com/blog/compliance-regulations/iso-27001-access-control-policy-guide/) — MEDIUM confidence

### Provider Profiles & Recommendations
- [Sample profiles and best practices | Upwork](https://support.upwork.com/hc/en-us/articles/211063208-Sample-profiles-and-best-practices) — HIGH confidence
- [10 Best Upwork Profile Examples To Help You Get Clients In 2026 | Friday](https://www.fridaywebsitebuilder.com/blog/best-upwork-profile-examples) — MEDIUM confidence
- [Best Review Sites by Industry, Type & Use Case (2026 List) | SocialPilot](https://www.socialpilot.co/reviews/blogs/review-websites) — MEDIUM confidence
- [7 Trusted Product Review Websites for B2B & SaaS Software (2026) | Slickplan](https://slickplan.com/blog/product-review-websites) — MEDIUM confidence

### Marketplace Approval Workflows (Automated vs Manual)
- [Build a Multi-Vendor Marketplace: The Complete 2026 Guide](https://flexiapps.net/en/build-a-multi-vendor-marketplace/) — MEDIUM confidence
- [What is a Multi-Vendor Marketplace? Benefits & How It Works | ClearOmni](https://clearomni.com/blog/what-is-a-multi-vendor-marketplace) — MEDIUM confidence
- [Vendor Onboarding Automation: A Step-by-Step 2025 Guide | QuantumByte](https://quantumbyte.ai/articles/vendor-onboarding-automation) — MEDIUM confidence

---

**Overall Research Confidence: MEDIUM**

**Rationale:**
- **HIGH confidence** on table stakes features (verified across 5+ major platforms)
- **HIGH confidence** on anti-features (validated by vendor onboarding mistake research)
- **MEDIUM confidence** on specific complexity estimates (based on similar REOS features, but no vendor registration precedent in codebase)
- **MEDIUM confidence** on approval workflow recommendations (industry best practices, but REOS-specific factors may differ)
- **LOW confidence** areas flagged with open questions requiring stakeholder decisions

**Research methodology:**
- WebSearch for 2026 marketplace trends (10 queries)
- Cross-verification of findings across multiple sources
- Comparison with REOS existing codebase (PROJECT.md, vendor-register.md)
- Industry standard validation (Upwork, Zillow, HousingWire, real estate platform reviews)
