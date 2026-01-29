# Architecture Integration: Vendor Onboarding & Management

**Domain:** Real Estate Operating System (REOS) - Vendor Management Milestone
**Researched:** 2026-01-29
**Confidence:** HIGH (based on direct codebase analysis)

## Executive Summary

This document details how NEW vendor onboarding, admin approval, and vendor personal area features integrate with the existing REOS architecture. The existing platform already has substantial vendor infrastructure (service providers), which provides a strong foundation. The key architectural decisions center on:

1. **Reusing existing service provider infrastructure** - vendor onboarding extends the current provider pattern
2. **Adding approval status to existing tables** - no new approval tables needed
3. **Integrating vendor routes into existing (app) group** - follows established routing patterns
4. **Leveraging Convex storage for profile photos** - consistent with deal file uploads

## Existing Architecture Foundation

### Current Stack

| Component | Technology | Role |
|-----------|-----------|------|
| Frontend Framework | Next.js 15 App Router | Page routing, SSR, i18n |
| Routing Pattern | `[locale]/(main)/(app)` route groups | Locale-based navigation with auth-protected app section |
| Backend | Convex | Real-time database, mutations, queries, file storage |
| Auth | Clerk | Authentication with JWT, role metadata sync |
| i18n | next-intl | Translation management (EN + HE) |
| Real-time | Convex subscriptions | Live updates for chat, notifications, deal updates |

### Existing Tables (Relevant to Vendor Features)

```typescript
// From schema.ts
users: {
  clerkId: string
  email: string
  name?: string
  imageUrl?: string
  role?: "investor" | "broker" | "mortgage_advisor" | "lawyer" | "admin"
  viewingAsRole?: userRoles  // Admin-only role switching
  onboardingComplete: boolean
  onboardingStep?: number
  createdAt: number
  updatedAt: number
}

serviceProviderProfiles: {
  userId: Id<"users">
  providerType: "broker" | "mortgage_advisor" | "lawyer"
  companyName?: string
  licenseNumber?: string
  yearsExperience?: number
  specializations: string[]
  serviceAreas: string[]  // Israeli cities/regions
  languages: ("english" | "hebrew" | "russian" | "french" | "spanish")[]
  bio?: string
  phoneNumber?: string
  preferredContact?: "email" | "phone" | "whatsapp"
  acceptingNewClients?: boolean
  notificationPreferences?: {
    emailNotifications: boolean
    inAppNotifications: boolean
    newMessageNotify: boolean
    dealStageNotify: boolean
    fileUploadedNotify: boolean
    requestReceivedNotify: boolean
  }
  createdAt: number
  updatedAt: number
}
```

### Existing Onboarding Pattern (Investor Model)

**Flow:**
1. User signs up via Clerk → auto-creates user record in Convex (via `users.getOrCreateUser`)
2. User redirected to `/onboarding` → selects role → calls `users.setUserRole`
3. **Investors:** Role selection sets `onboardingComplete = false`, redirects to `/onboarding/questionnaire`
4. **Service providers:** Role selection sets `onboardingComplete = true`, redirects to `/dashboard`

**Key mutations:**
- `users.setUserRole` - Sets role, initializes onboarding state
- `users.completeOnboarding` - Marks onboarding as complete
- `investorQuestionnaires.saveAnswers` - Saves multi-step questionnaire data

### Existing Provider Routes

```
/app/[locale]/(app)/providers/
  page.tsx              → Provider directory (tabs for broker/mortgage/lawyer)
  [id]/page.tsx         → Provider profile page (public view)
```

**Query pattern:**
- `serviceProviderProfiles.listByType` - List providers by type with filters
- `serviceProviderProfiles.getPublicProfile` - Full profile with stats, reviews, portfolio

### Existing File Upload Pattern (Deal Files)

**Flow:**
1. Client calls `dealFiles.generateUploadUrl` mutation → gets upload URL
2. Client uploads file to Convex storage via fetch to upload URL
3. Client calls `dealFiles.saveFile` with `storageId` → saves metadata to `dealFiles` table
4. Convex returns public download URL via `ctx.storage.getUrl(storageId)`

**Storage location:** Convex `_storage` table (managed storage with automatic CDN)

---

## Integration Architecture for Vendor Features

### 1. Vendor Onboarding Data Model

**Decision:** Extend existing `serviceProviderProfiles` table with approval status field.

**Rationale:**
- Vendor onboarding data is identical to service provider profile data
- Reusing existing profile fields (companyName, licenseNumber, bio, serviceAreas, etc.) avoids duplication
- Approval status is a lifecycle stage, not separate entity

**Schema additions:**

```typescript
serviceProviderProfiles: defineTable({
  // ... existing fields ...

  // NEW: Approval workflow fields
  approvalStatus: v.union(
    v.literal("pending"),     // Submitted, awaiting admin review
    v.literal("approved"),    // Admin approved, publicly visible
    v.literal("rejected"),    // Admin rejected
    v.literal("draft")        // Not yet submitted
  ),
  submittedAt?: v.number(),   // Timestamp when submitted for approval
  reviewedAt?: v.number(),    // Timestamp when admin approved/rejected
  reviewedBy?: v.id("users"), // Admin who reviewed
  rejectionReason?: v.string(), // Optional reason for rejection

  // ... existing fields ...
})
```

**Migration strategy:**
- Existing providers default to `approvalStatus: "approved"` (grandfathered)
- New vendor registrations start with `approvalStatus: "draft"`

**Alternative considered:** Separate `vendorApprovals` table
- **Why rejected:** Adds unnecessary complexity with joins, duplicate foreign keys, and lifecycle sync issues

### 2. Vendor Onboarding Flow

**Flow:**

```
1. User signs up → Clerk creates account → Convex creates user record
2. User visits /onboarding → selects "broker" | "mortgage_advisor" | "lawyer" role
   → calls users.setUserRole(role)
   → sets onboardingComplete = false (unlike current service providers)
3. User redirected to /onboarding/vendor-profile
   → Multi-step form: Basic Info → Company Details → Service Areas → Review
   → Saves draft to serviceProviderProfiles (approvalStatus: "draft")
4. User submits → calls serviceProviderProfiles.submitForApproval
   → sets approvalStatus: "pending", submittedAt: now
   → creates notification for admins
   → redirects to /dashboard with "pending approval" banner
5. Admin reviews in /admin/vendors/pending
   → calls serviceProviderProfiles.approveVendor or rejectVendor
   → updates approvalStatus, reviewedAt, reviewedBy
   → creates notification for vendor
6. If approved:
   → vendor profile becomes publicly visible in /providers directory
   → vendor can access full dashboard features
   If rejected:
   → vendor can revise and resubmit
```

**New mutations needed:**

```typescript
// convex/serviceProviderProfiles.ts

// Submit vendor profile for approval (vendor-facing)
export const submitForApproval = mutation({
  args: {},
  handler: async (ctx) => {
    // Get current user
    const user = await getCurrentUser(ctx);
    // Get draft profile
    const profile = await getProfileByUser(ctx, user._id);
    // Validate required fields
    if (!profile.companyName || !profile.serviceAreas.length) {
      throw new Error("Missing required fields");
    }
    // Update status
    await ctx.db.patch(profile._id, {
      approvalStatus: "pending",
      submittedAt: Date.now(),
      updatedAt: Date.now(),
    });
    // Notify admins
    await notifyAdminsOfNewVendor(ctx, user, profile);
  },
});

// Approve vendor (admin-only)
export const approveVendor = mutation({
  args: { profileId: v.id("serviceProviderProfiles") },
  handler: async (ctx, args) => {
    // Auth check: admin only
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin") throw new Error("Unauthorized");

    // Update profile
    await ctx.db.patch(args.profileId, {
      approvalStatus: "approved",
      reviewedAt: Date.now(),
      reviewedBy: user._id,
      updatedAt: Date.now(),
    });

    // Notify vendor
    const profile = await ctx.db.get(args.profileId);
    await notifyVendorOfApproval(ctx, profile.userId);
  },
});

// Reject vendor (admin-only)
export const rejectVendor = mutation({
  args: {
    profileId: v.id("serviceProviderProfiles"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Auth check: admin only
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin") throw new Error("Unauthorized");

    // Update profile
    await ctx.db.patch(args.profileId, {
      approvalStatus: "rejected",
      reviewedAt: Date.now(),
      reviewedBy: user._id,
      rejectionReason: args.reason,
      updatedAt: Date.now(),
    });

    // Notify vendor
    const profile = await ctx.db.get(args.profileId);
    await notifyVendorOfRejection(ctx, profile.userId, args.reason);
  },
});
```

**New queries needed:**

```typescript
// convex/serviceProviderProfiles.ts

// List pending vendors (admin-only)
export const listPendingVendors = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (user.role !== "admin") return [];

    const profiles = await ctx.db
      .query("serviceProviderProfiles")
      .filter(q => q.eq(q.field("approvalStatus"), "pending"))
      .order("desc", "submittedAt")
      .collect();

    // Enrich with user data
    return await enrichWithUserData(ctx, profiles);
  },
});

// Get vendor approval status (vendor-facing)
export const getMyApprovalStatus = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    const profile = await getProfileByUser(ctx, user._id);
    if (!profile) return null;

    return {
      status: profile.approvalStatus,
      submittedAt: profile.submittedAt,
      reviewedAt: profile.reviewedAt,
      rejectionReason: profile.rejectionReason,
    };
  },
});
```

### 3. Admin Approval Interface

**Location:** `/app/[locale]/(app)/admin/vendors/pending`

**Access control:**
- Route protected by middleware checking `user.role === "admin"`
- Queries filtered by role in Convex (double-check)

**UI components:**
- Vendor list table: name, company, type, submitted date, actions
- Detail modal: full profile preview with approve/reject buttons
- Rejection modal: text area for rejection reason

**Data flow:**
1. Page loads → calls `listPendingVendors` query
2. Admin clicks "Review" → modal shows full profile data
3. Admin clicks "Approve" → calls `approveVendor` mutation → vendor notified
4. Admin clicks "Reject" → modal opens → inputs reason → calls `rejectVendor` mutation

### 4. Vendor Personal Area Integration

**Decision:** Vendor personal area is the existing provider dashboard, enhanced with approval status awareness.

**Route structure:**

```
/app/[locale]/(app)/
  dashboard/              → Existing dashboard (role-aware)
    page.tsx              → Shows different content based on user.role

  providers/              → Existing provider directory
    page.tsx              → Lists approved providers only
    [id]/page.tsx         → Provider profile (public view)

  settings/               → Existing settings
    page.tsx              → Profile edit for vendors
```

**Approval status banner:**
- If `approvalStatus === "pending"` → Show banner: "Your profile is under review"
- If `approvalStatus === "rejected"` → Show banner: "Your profile was rejected. Reason: [reason]. Click to revise."
- If `approvalStatus === "approved"` → No banner, full dashboard access

**Dashboard features (role-gated):**
- **Pending vendors:** Limited access - can view profile, can't accept deals
- **Approved vendors:** Full access - analytics, clients, deals, availability calendar

**Modification to existing queries:**

```typescript
// convex/serviceProviderProfiles.ts

// Modify listByType to only show approved vendors
export const listByType = query({
  args: { providerType, city? },
  handler: async (ctx, args) => {
    let providers = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_provider_type", q => q.eq("providerType", args.providerType))
      .filter(q => q.eq(q.field("approvalStatus"), "approved"))  // NEW: Only approved
      .collect();

    // ... rest of query ...
  },
});

// Modify getPublicProfile to only return approved vendors (or own profile)
export const getPublicProfile = query({
  args: { providerId },
  handler: async (ctx, args) => {
    const profile = await getProfileByUser(ctx, args.providerId);
    if (!profile) return null;

    const currentUser = await getCurrentUser(ctx);
    const isOwnProfile = currentUser?._id === args.providerId;
    const isAdmin = currentUser?.role === "admin";

    // NEW: Only show approved profiles publicly (unless own profile or admin)
    if (profile.approvalStatus !== "approved" && !isOwnProfile && !isAdmin) {
      return null;
    }

    // ... rest of query ...
  },
});
```

### 5. Profile Photo Upload

**Decision:** Use Convex file storage (same as deal files).

**Schema addition:**

```typescript
users: defineTable({
  // ... existing fields ...
  imageUrl?: v.string(),  // EXISTING: Clerk profile photo URL
  customImageStorageId?: v.id("_storage"),  // NEW: Convex-uploaded profile photo
  // ... existing fields ...
})
```

**Upload flow:**
1. User clicks "Upload Photo" → file picker opens
2. Client calls `users.generateProfilePhotoUploadUrl` mutation
3. Client uploads to Convex storage via returned URL
4. Client calls `users.saveProfilePhoto({ storageId })` mutation
5. Mutation saves `customImageStorageId`, generates public URL via `ctx.storage.getUrl()`
6. Public URL replaces `imageUrl` in profile displays

**New mutations:**

```typescript
// convex/users.ts

export const generateProfilePhotoUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveProfilePhoto = mutation({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    // Delete old photo if exists
    if (user.customImageStorageId) {
      await ctx.storage.delete(user.customImageStorageId);
    }

    // Save new photo reference
    await ctx.db.patch(user._id, {
      customImageStorageId: args.storageId,
      updatedAt: Date.now(),
    });

    // Return public URL
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getProfilePhotoUrl = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    // Prefer custom upload over Clerk image
    if (user.customImageStorageId) {
      return await ctx.storage.getUrl(user.customImageStorageId);
    }

    return user.imageUrl;  // Fallback to Clerk
  },
});
```

**File size limits:**
- Max 5MB per upload (enforced client-side)
- Image formats: JPEG, PNG, WebP
- Auto-resize on client before upload to 512x512px

**Alternative considered:** External storage (Cloudinary, S3)
- **Why rejected:** Adds external dependency, billing complexity, and Convex storage already handles CDN distribution

---

## Component Boundaries

### New Components Needed

| Component | Location | Purpose |
|-----------|----------|---------|
| `VendorOnboardingWizard` | `src/components/vendor/VendorOnboardingWizard.tsx` | Multi-step form for vendor profile |
| `VendorApprovalBanner` | `src/components/vendor/VendorApprovalBanner.tsx` | Status banner for pending/rejected vendors |
| `VendorApprovalModal` | `src/components/admin/VendorApprovalModal.tsx` | Admin review interface |
| `ProfilePhotoUpload` | `src/components/shared/ProfilePhotoUpload.tsx` | Reusable photo upload component |
| `PendingVendorsTable` | `src/components/admin/PendingVendorsTable.tsx` | Admin vendor list table |

### Modified Components

| Component | Location | Modifications |
|-----------|----------|--------------|
| `OnboardingPage` | `src/app/[locale]/(app)/onboarding/page.tsx` | Add vendor role redirect logic |
| `DashboardPage` | `src/app/[locale]/(app)/dashboard/page.tsx` | Add approval status banner |
| `ProvidersPage` | `src/app/[locale]/(app)/providers/page.tsx` | Filter approved vendors only |
| `ProviderProfilePage` | `src/app/[locale]/(app)/providers/[id]/page.tsx` | Hide unapproved vendors |

### New Routes Needed

```
/app/[locale]/(app)/
  onboarding/
    vendor-profile/
      page.tsx             → Vendor onboarding wizard

  admin/
    vendors/
      pending/
        page.tsx           → Admin vendor approval queue
      approved/
        page.tsx           → List of approved vendors (optional)
      rejected/
        page.tsx           → List of rejected vendors (optional)
```

---

## Data Flow Diagrams

### Vendor Registration → Approval → Public Visibility

```
┌─────────────────────────────────────────────────────────────────────┐
│ 1. REGISTRATION                                                     │
└─────────────────────────────────────────────────────────────────────┘
  User signs up
    ↓
  Clerk creates account → clerkId: "user_xyz"
    ↓
  users.getOrCreateUser mutation
    ↓
  Convex creates user record:
    { clerkId: "user_xyz", onboardingComplete: false, role: undefined }
    ↓
  Redirect to /onboarding

┌─────────────────────────────────────────────────────────────────────┐
│ 2. ROLE SELECTION                                                   │
└─────────────────────────────────────────────────────────────────────┘
  User selects "Broker" role
    ↓
  users.setUserRole({ role: "broker" })
    ↓
  Updates user:
    { role: "broker", onboardingComplete: false }  ← KEY: Not auto-completed
    ↓
  Redirect to /onboarding/vendor-profile

┌─────────────────────────────────────────────────────────────────────┐
│ 3. PROFILE CREATION                                                 │
└─────────────────────────────────────────────────────────────────────┘
  User fills multi-step form
    ↓
  Each step saves draft via serviceProviderProfiles.upsertProfile
    ↓
  Draft profile created:
    { userId: "xyz", approvalStatus: "draft", companyName: "...", ... }
    ↓
  User clicks "Submit for Approval"
    ↓
  serviceProviderProfiles.submitForApproval()
    ↓
  Updates profile:
    { approvalStatus: "pending", submittedAt: 1738195200000 }
    ↓
  Creates notification for admins:
    { type: "vendor_pending", userId: adminId, message: "New vendor..." }
    ↓
  Redirect to /dashboard with "pending approval" banner

┌─────────────────────────────────────────────────────────────────────┐
│ 4. ADMIN REVIEW                                                     │
└─────────────────────────────────────────────────────────────────────┘
  Admin visits /admin/vendors/pending
    ↓
  listPendingVendors query returns vendors where approvalStatus = "pending"
    ↓
  Admin clicks "Review" → modal shows full profile
    ↓
  Admin clicks "Approve"
    ↓
  serviceProviderProfiles.approveVendor({ profileId })
    ↓
  Updates profile:
    { approvalStatus: "approved", reviewedAt: now, reviewedBy: adminId }
    ↓
  Creates notification for vendor:
    { type: "vendor_approved", userId: vendorId, message: "Approved!" }
    ↓
  users.completeOnboarding() called
    ↓
  Updates user:
    { onboardingComplete: true }

┌─────────────────────────────────────────────────────────────────────┐
│ 5. PUBLIC VISIBILITY                                                │
└─────────────────────────────────────────────────────────────────────┘
  Vendor now appears in /providers directory
    ↓
  listByType query filters:
    WHERE providerType = "broker" AND approvalStatus = "approved"
    ↓
  Vendor profile page accessible at /providers/[vendorId]
    ↓
  Vendor dashboard fully unlocked (can accept deals, view analytics)
```

### Profile Photo Upload Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│ CLIENT                                                              │
└─────────────────────────────────────────────────────────────────────┘
  User selects photo from file picker
    ↓
  Client resizes to 512x512px (client-side)
    ↓
  Calls users.generateProfilePhotoUploadUrl()
    ↓
  Receives upload URL: https://convex.cloud/api/upload/xyz

┌─────────────────────────────────────────────────────────────────────┐
│ CONVEX STORAGE                                                      │
└─────────────────────────────────────────────────────────────────────┘
  Client POSTs file to upload URL
    ↓
  Convex stores file in _storage table
    ↓
  Returns storageId: "kg1234567890abcdef"

┌─────────────────────────────────────────────────────────────────────┐
│ METADATA SAVE                                                       │
└─────────────────────────────────────────────────────────────────────┘
  Client calls users.saveProfilePhoto({ storageId })
    ↓
  Mutation deletes old photo if exists:
    await ctx.storage.delete(user.customImageStorageId)
    ↓
  Updates user record:
    { customImageStorageId: "kg1234567890abcdef" }
    ↓
  Generates public URL:
    await ctx.storage.getUrl(storageId)
    ↓
  Returns URL to client:
    https://convex.cloud/api/storage/kg1234567890abcdef
    ↓
  Client displays new photo immediately
```

---

## Scalability Considerations

| Concern | At 100 vendors | At 1,000 vendors | At 10,000 vendors |
|---------|----------------|------------------|-------------------|
| **Approval queue** | Manual admin review works | Need approval assignment/routing | Multi-tiered approval with auto-approval rules |
| **Public directory** | Full list pagination works | Add search/filter indexes | Elasticsearch or Algolia for search |
| **Profile photos** | Convex storage sufficient | Convex storage sufficient | Consider CDN optimization or image service |
| **Notification load** | Direct mutations work | Batch notifications | Queue-based notification system |
| **Admin dashboard** | Single admin works | Multiple admin roles | Admin team management with audit logs |

**Current approach optimized for:** 100-1,000 vendors (early-stage marketplace)

**Scaling triggers:**
- 500+ pending approvals → Add approval routing
- 5,000+ vendors → Add search infrastructure
- 10,000+ vendors → Implement auto-approval with ML

---

## Build Order Recommendation

**Phase 1: Backend Foundation (Build First)**
1. Add `approvalStatus` field to `serviceProviderProfiles` schema
2. Write approval mutations (`submitForApproval`, `approveVendor`, `rejectVendor`)
3. Write approval queries (`listPendingVendors`, `getMyApprovalStatus`)
4. Add profile photo upload mutations (`generateProfilePhotoUploadUrl`, `saveProfilePhoto`)
5. Modify existing queries (`listByType`, `getPublicProfile`) to filter by approval status

**Phase 2: Vendor Onboarding UI (Build Second)**
1. Create `VendorOnboardingWizard` component
2. Create `/onboarding/vendor-profile` route
3. Integrate with backend mutations
4. Add form validation and draft persistence

**Phase 3: Admin Approval UI (Build Third)**
1. Create `PendingVendorsTable` component
2. Create `VendorApprovalModal` component
3. Create `/admin/vendors/pending` route
4. Wire up approve/reject actions

**Phase 4: Vendor Dashboard Integration (Build Fourth)**
1. Add `VendorApprovalBanner` to dashboard
2. Modify dashboard to show limited features for pending vendors
3. Add profile edit route at `/settings/profile`

**Phase 5: Profile Photo Upload (Build in Parallel with Phase 2/3)**
1. Create `ProfilePhotoUpload` component
2. Integrate into onboarding wizard
3. Add to settings page for profile editing

**Rationale:**
- Backend first ensures UI can integrate cleanly without placeholder data
- Onboarding before approval ensures vendors can submit profiles to test approval flow
- Profile photo can be built in parallel as it's independent feature
- Dashboard integration last ensures other features are stable before gating

**Dependencies:**
- Phase 2 depends on Phase 1 (needs mutations)
- Phase 3 depends on Phase 1 (needs queries)
- Phase 4 depends on Phase 2 and 3 (needs onboarding + approval to exist)
- Phase 5 can run parallel to any phase

---

## Anti-Patterns to Avoid

### 1. Creating Separate Vendor vs Provider Tables
**What:** Treating vendors as different entities from service providers with separate tables
**Why bad:** Data duplication, inconsistent query patterns, migration complexity
**Instead:** Extend `serviceProviderProfiles` with approval status field

### 2. Client-Side Approval Status Filtering
**What:** Querying all vendors in `/providers` and filtering approved ones client-side
**Why bad:** Leaks unapproved vendor data to client, poor performance, security risk
**Instead:** Filter at database level in Convex queries

### 3. Storing Profile Photos in users.imageUrl
**What:** Overwriting Clerk's `imageUrl` field with custom uploads
**Why bad:** Loses Clerk profile photo, can't revert to original, confused data source
**Instead:** Use separate `customImageStorageId` field and prefer it in queries

### 4. Single-Step Approval
**What:** Approving vendors without viewing profile details
**Why bad:** Risk of approving low-quality or fraudulent vendors
**Instead:** Require admin to view full profile in modal before approving

### 5. Hard-Coded Admin Email Checks
**What:** Checking `if (user.email === "admin@reos.com")` for admin access
**Why bad:** Not scalable, security risk, hard to maintain
**Instead:** Check `user.role === "admin"` (already in schema)

### 6. Synchronous Notification Sending
**What:** Blocking approval mutation while sending email notifications
**Why bad:** Slow mutation responses, poor UX, email delivery failures block workflow
**Instead:** Create notification records in database, send emails async via scheduled function

---

## Architecture Decision Records (ADRs)

### ADR-001: Reuse serviceProviderProfiles Table for Vendors

**Decision:** Extend existing `serviceProviderProfiles` table with approval workflow fields instead of creating separate vendor table.

**Context:** Vendors and service providers have identical data structure (both need company info, service areas, bio, etc.). Main difference is approval workflow.

**Alternatives:**
1. Create separate `vendors` table → rejected due to data duplication
2. Create `vendorApprovals` join table → rejected due to unnecessary complexity
3. Extend `serviceProviderProfiles` with approval status → **CHOSEN**

**Consequences:**
- ✅ No data duplication
- ✅ Reuse existing queries and mutations with minor modifications
- ✅ Simple migration (existing providers grandfathered as approved)
- ❌ Table name slightly misleading (contains vendors + approved providers)

---

### ADR-002: Use Convex Storage for Profile Photos

**Decision:** Store profile photos in Convex `_storage` with references in `users.customImageStorageId`.

**Context:** Users need ability to upload custom profile photos beyond Clerk's OAuth images.

**Alternatives:**
1. Cloudinary for image hosting → rejected due to external dependency
2. AWS S3 + CloudFront → rejected due to infrastructure complexity
3. Convex storage → **CHOSEN**

**Consequences:**
- ✅ No external dependencies
- ✅ Automatic CDN distribution via Convex
- ✅ Consistent with deal file upload pattern
- ❌ Slight vendor lock-in to Convex storage
- ❌ No built-in image transformation (must resize client-side)

---

### ADR-003: Approval Status as Enum Field, Not Separate Table

**Decision:** Store approval status as enum field (`approvalStatus`) directly on `serviceProviderProfiles`.

**Context:** Need to track vendor approval lifecycle without over-engineering.

**Alternatives:**
1. Separate `approvals` table with foreign key → rejected due to complexity
2. Boolean `approved` field → rejected due to lack of "pending" and "rejected" states
3. Enum `approvalStatus` field → **CHOSEN**

**Consequences:**
- ✅ Simple query filters (`WHERE approvalStatus = "approved"`)
- ✅ No joins needed for approval checks
- ✅ Easy to add audit fields (reviewedBy, reviewedAt) in same table
- ❌ No approval history tracking (requires separate audit table if needed later)

---

## Open Questions & Future Considerations

### Q1: Should approval history be tracked?
**Current approach:** Single approval status, no history
**Future need:** If vendors can be re-reviewed or suspended, add `vendorApprovalHistory` table
**Decision:** Defer until user feedback indicates need

### Q2: Should vendors be able to edit profiles after approval?
**Current approach:** Undefined
**Recommendation:** Allow edits, but require re-approval if critical fields change (company name, license)
**Implementation:** Add `hasUnapprovedChanges` boolean, show "pending re-approval" banner

### Q3: Should there be vendor tiers (basic, premium, enterprise)?
**Current approach:** Single vendor type
**Future need:** Premium vendors get priority placement, analytics, etc.
**Decision:** Defer to post-MVP, add `tier` field when business model clarifies

### Q4: How to handle vendor suspension/deactivation?
**Current approach:** Not addressed
**Recommendation:** Add `active: boolean` field, filter queries by `approved AND active`
**Implementation:** Admin can "Deactivate" vendor → sets active = false

### Q5: Should profile photos require approval?
**Current approach:** Photos uploaded without review
**Risk:** Inappropriate photos
**Recommendation:** Add `photoApprovalStatus` field if abuse detected, defer for now

---

## Integration Checklist

Backend changes:
- [ ] Add approval status fields to `serviceProviderProfiles` in `schema.ts`
- [ ] Add profile photo field to `users` in `schema.ts`
- [ ] Write vendor approval mutations in `serviceProviderProfiles.ts`
- [ ] Write vendor approval queries in `serviceProviderProfiles.ts`
- [ ] Write profile photo mutations in `users.ts`
- [ ] Modify `listByType` query to filter approved vendors
- [ ] Modify `getPublicProfile` query to hide unapproved vendors
- [ ] Modify `users.setUserRole` to set onboardingComplete = false for vendors

Frontend routes:
- [ ] Create `/onboarding/vendor-profile` route
- [ ] Create `/admin/vendors/pending` route
- [ ] Modify `/dashboard` to show approval banner
- [ ] Modify `/providers` to use filtered queries

Components:
- [ ] Create `VendorOnboardingWizard` component
- [ ] Create `VendorApprovalBanner` component
- [ ] Create `VendorApprovalModal` component
- [ ] Create `ProfilePhotoUpload` component
- [ ] Create `PendingVendorsTable` component

i18n:
- [ ] Add vendor onboarding translations (EN + HE)
- [ ] Add admin approval translations (EN + HE)
- [ ] Add approval status messages (EN + HE)

Testing:
- [ ] Test vendor registration flow end-to-end
- [ ] Test admin approval flow
- [ ] Test rejection and resubmission flow
- [ ] Test profile photo upload
- [ ] Test public directory filters (approved vendors only)
- [ ] Test dashboard access gating (pending vs approved)

---

## Sources

All findings based on direct codebase analysis:

- `/Users/Kohelet/Code/REOS/convex/schema.ts` - Database schema definition
- `/Users/Kohelet/Code/REOS/convex/users.ts` - User mutations and queries
- `/Users/Kohelet/Code/REOS/convex/serviceProviderProfiles.ts` - Provider profile logic
- `/Users/Kohelet/Code/REOS/convex/investorQuestionnaires.ts` - Onboarding pattern reference
- `/Users/Kohelet/Code/REOS/convex/dealFiles.ts` - File upload pattern reference
- `/Users/Kohelet/Code/REOS/src/app/[locale]/(app)/onboarding/page.tsx` - Onboarding UI pattern
- `/Users/Kohelet/Code/REOS/src/app/[locale]/(app)/providers/page.tsx` - Provider directory UI
- `/Users/Kohelet/Code/REOS/src/app/[locale]/(app)/providers/[id]/page.tsx` - Provider profile UI

**Confidence:** HIGH - All integration points verified against actual codebase implementation.
