# Domain Pitfalls: Vendor Registration & Admin Approval Workflows

**Domain:** B2B Marketplace - Vendor Onboarding & Approval Management
**Context:** Adding vendor registration, admin approval workflows, and provider dashboards to existing REOS platform
**Tech Stack:** Clerk (auth), Convex (real-time backend), Next.js 15
**Researched:** 2026-01-29
**Overall Confidence:** HIGH (verified with official docs + 2026 sources)

---

## Critical Pitfalls

Mistakes that cause rewrites, data loss, or major security issues.

### Pitfall 1: Client-Side Role Tampering via publicMetadata

**What goes wrong:**
Storing approval status or roles in Clerk's `publicMetadata` without understanding the security model. Developers assume "public" means "client-writable" and implement approval state changes from the frontend, allowing users to self-approve by modifying their own metadata.

**Why it happens:**
The name "publicMetadata" is misleading. It means "readable on client" not "writable from client." Per Clerk's official docs: *"publicMetadata can only be read but not modified in the browser, making it the safest and most appropriate choice for storing role information."*

**Consequences:**
- Vendors bypass admin approval by setting their own role to "approved"
- Privilege escalation attacks
- Complete breakdown of approval gate security
- Regulatory compliance violations (no audit trail of who approved)

**Prevention:**
1. **Server-side only mutations**: All role/approval status changes MUST happen in Clerk's Backend API or via server actions
2. **Use publicMetadata for roles**: Store `approvalStatus: "pending" | "approved" | "rejected"` in publicMetadata, but only allow mutations from server-side Convex mutations
3. **Authorization checks**: Before changing metadata, verify the requesting user has `role: "admin"` as shown in Clerk's RBAC guide:
   ```typescript
   // In Convex mutation
   const user = await ctx.auth.getUserIdentity();
   if (user?.role !== "admin") {
     throw new Error("Unauthorized");
   }
   ```
4. **Never use privateMetadata for roles**: Private metadata is for sensitive data (Stripe IDs), not authorization. Use publicMetadata so the frontend can read roles for UI rendering.

**Detection:**
- Review all `user.update()` calls - are they client-side?
- Search codebase for `publicMetadata` writes - do they happen in client components?
- Test: Can a vendor user open browser DevTools and change their approval status?

**Phase assignment:** Phase 1 (Approval Flow Foundation) - This must be architected correctly from the start.

**Sources:**
- [Clerk RBAC with metadata](https://clerk.com/docs/guides/secure/basic-rbac)
- [Clerk metadata security](https://clerk.com/docs/users/metadata)

---

### Pitfall 2: Race Conditions in Real-Time Approval Notifications

**What goes wrong:**
Multiple admins viewing the same vendor approval request simultaneously. Admin A approves while Admin B rejects. Without transactional coordination, both mutations execute, leaving the vendor in an inconsistent state (e.g., database shows "approved" but approval history shows rejection email was sent).

**Why it happens:**
Real-time systems like Convex make concurrent updates easy but developers forget to implement optimistic locking or version checks. Per Convex's workflow docs: *"Inconsistent data states when multiple agents are independently working, succeeding and failing"* are the primary race condition risk.

**Consequences:**
- Vendors receive contradictory emails ("You've been approved" and "You've been rejected")
- Approval audit trail shows conflicting actions
- Legal exposure if vendor claims they were approved but can't access platform
- Lost trust with vendors

**Prevention:**
1. **Use Convex transactions**: Every approval mutation should be a single atomic transaction that reads current status, validates state transition, writes new status, and triggers notification
2. **Implement state machine**: Define valid state transitions (pending → approved, pending → rejected) and reject invalid transitions (approved → rejected without going through pending)
3. **Optimistic locking**: Add `version` field to vendor record, increment on each status change:
   ```typescript
   // In Convex mutation
   const vendor = await ctx.db.get(vendorId);
   if (vendor.version !== expectedVersion) {
     throw new Error("Vendor status changed, please refresh");
   }
   await ctx.db.patch(vendorId, {
     status: "approved",
     version: vendor.version + 1
   });
   ```
4. **Use Convex Workflow component**: For complex multi-step approvals, leverage the [Workflow component](https://www.convex.dev/components/workflow) which provides exactly-once execution guarantees and journaling.
5. **UI locking**: When an admin opens an approval modal, show if another admin is currently reviewing (use Convex presence).

**Detection:**
- Create two admin sessions, simultaneously approve/reject same vendor
- Check database - is status consistent with notification history?
- Review Convex mutations - do they read-then-write without checking for intermediate changes?

**Phase assignment:** Phase 1 (Approval Flow Foundation) - Build the state machine correctly from day one.

**Sources:**
- [Convex durable workflows](https://stack.convex.dev/durable-workflows-and-strong-guarantees)
- [Convex workflow component](https://www.convex.dev/components/workflow)

---

### Pitfall 3: Orphaned Files from Multi-Step Form Abandonment

**What goes wrong:**
Vendor uploads documents in step 2 of 5-step onboarding form, then abandons the form. Files are uploaded to Convex storage (consuming quota) but never linked to a vendor record. After weeks, storage fills with orphaned files from incomplete registrations.

**Why it happens:**
Per Convex file upload docs: *"Developers sometimes forget the critical third step—Save the storage ID into your data model via another mutation. Without this, uploaded files become orphaned and inaccessible."* Multi-step forms exacerbate this because files are uploaded early but the vendor record isn't created until final submission.

**Consequences:**
- Storage quota exhaustion
- Increased storage costs
- Privacy/GDPR violations (holding user data without consent)
- No way to identify which files belong to which incomplete registration

**Prevention:**
1. **Lazy upload pattern**: Don't upload files until the form is submitted. Use client-side state (Zustand + localStorage) to store file metadata during form progress, only trigger upload on final submit.
2. **Draft vendor records**: Create a draft vendor record in step 1, then attach files to it in subsequent steps. Mark as `status: "draft"` until final submission. Clean up draft records older than 7 days.
3. **File upload with context**: When generating upload URL, require `draftVendorId`:
   ```typescript
   // Convex mutation
   export const generateUploadUrl = mutation({
     args: { draftVendorId: v.id("vendors") },
     handler: async (ctx, args) => {
       const draft = await ctx.db.get(args.draftVendorId);
       if (!draft || draft.status !== "draft") {
         throw new Error("Invalid draft");
       }
       return await ctx.storage.generateUploadUrl();
     },
   });
   ```
4. **Orphan cleanup job**: Scheduled Convex function that runs nightly, finds storage IDs not referenced in any vendor record, and deletes files older than 7 days.
5. **File expiry tracking**: Store upload timestamp with storage ID, set 7-day TTL for draft files.

**Detection:**
- Query `_storage` system table in Convex, count documents
- Query `vendors` table, extract all `fileIds`, compare counts
- Difference = orphaned files

**Phase assignment:**
- Phase 2 (Multi-Step Form) - Implement lazy upload or draft records from the start
- Phase 5 (Admin Tools) - Add orphan cleanup monitoring dashboard

**Sources:**
- [Convex file storage](https://docs.convex.dev/file-storage/upload-files)
- [Multi-step form state management](https://github.com/orgs/react-hook-form/discussions/6382)

---

### Pitfall 4: Breaking Existing Provider Dashboards During Migration

**What goes wrong:**
Revamping provider dashboards to add vendor-specific features. Old code expects `user.role === "provider"` but new code uses more granular roles (`vendor_pending`, `vendor_approved`, `service_provider`). Old dashboard routes break for existing users because role checks fail.

**Why it happens:**
Schema changes aren't backward compatible. Per database migration best practices: *"A change is backward compatible if it can be introduced to the environment without touching any other parts of the application – and the system keeps running as if nothing happened."* Role enum expansion breaks this rule.

**Consequences:**
- Existing providers locked out of dashboards
- Customer support flood with "I can't access my account" tickets
- Revenue impact if providers can't manage active deals
- Emergency rollback loses new vendor data

**Prevention:**
1. **Expand-Migrate-Contract pattern**:
   - **Expand**: Add new roles (`vendor_approved`) while keeping old role (`provider`) active. Both work simultaneously.
   - **Migrate**: Batch job that updates existing `provider` users to `vendor_approved` or `service_provider` based on criteria.
   - **Contract**: After 100% migration confirmed, remove `provider` role checks from codebase.

2. **Feature flags for dashboard rollout**: Use feature flags (LaunchDarkly, Vercel flags) to show new dashboard to `vendor_approved` users while old dashboard remains for legacy `provider` users:
   ```typescript
   // In dashboard route
   const showNewDashboard =
     user.role === "vendor_approved" ||
     featureFlags.newVendorDashboard;

   return showNewDashboard ?
     <NewVendorDashboard /> :
     <LegacyProviderDashboard />;
   ```

3. **Role compatibility helper**: Create `isProvider(user)` helper that checks both old and new roles:
   ```typescript
   function isProvider(user: User): boolean {
     return ["provider", "vendor_approved", "service_provider"]
       .includes(user.role);
   }
   ```

4. **Convex schema migration with union types**: Update Convex schema to accept both old and new roles during transition:
   ```typescript
   // schema.ts - transition period
   role: v.union(
     v.literal("provider"), // old
     v.literal("vendor_approved"), // new
     v.literal("service_provider") // new
   ),
   ```

5. **Gradual rollout**: Deploy new dashboard to 10% of providers first, monitor error rates, then ramp to 100%.

**Detection:**
- Monitor Next.js error logs for 403 errors on `/provider/*` routes
- Track analytics: dashboard page views before/after deployment
- Test with staging user having legacy `provider` role

**Phase assignment:**
- Phase 1: Design role migration strategy, document compatibility requirements
- Phase 3 (Dashboard Revamp): Implement expand phase, feature flags
- Phase 4: Migrate existing users, monitor
- Phase 5: Contract phase, remove legacy code

**Sources:**
- [Dashboard migration strategies](https://beyondkeysystems.medium.com/whats-new-in-databricks-in-2026-fb99635ee6d8)
- [Backward compatible database changes](https://planetscale.com/blog/backward-compatible-databases-changes)
- [Convex schema migrations](https://stack.convex.dev/lightweight-zero-downtime-migrations)
- [Feature flags for gradual rollouts](https://www.getunleash.io/feature-flag-use-cases-progressive-or-gradual-rollouts)

---

### Pitfall 5: Missing Audit Trail for Compliance

**What goes wrong:**
Admin approves/rejects vendors but system only stores current status, not history. Six months later, rejected vendor files complaint: "Who rejected me and why?" No record exists. Legal/compliance teams have no audit trail.

**Why it happens:**
Developers optimize for "current state" not "state history." Simple boolean `isApproved` field overwrites previous value. Per 2026 compliance requirements: *"Audit trails must include automated information created at the time of record creation, alteration or deletion, timestamps based on unmodifiable clocks, immutable storage security, record of specific users accessing or modifying data."*

**Consequences:**
- GDPR violations (can't prove data handling compliance)
- SOX violations for B2B financial platforms
- Legal liability in vendor disputes
- Failed security audits
- Can't answer "Why was vendor X rejected?"

**Prevention:**
1. **Separate approval history table**: Don't store just current status, store every approval action:
   ```typescript
   // Convex schema
   approvalHistory: defineTable({
     vendorId: v.id("vendors"),
     action: v.union(
       v.literal("submitted"),
       v.literal("approved"),
       v.literal("rejected"),
       v.literal("requested_changes")
     ),
     actorId: v.id("users"), // admin who took action
     actorEmail: v.string(), // immutable snapshot
     reason: v.optional(v.string()), // rejection reason
     timestamp: v.number(), // Date.now()
     ipAddress: v.optional(v.string()),
     metadata: v.optional(v.any()), // additional context
   }).index("by_vendor", ["vendorId", "timestamp"])
   ```

2. **Immutable audit records**: Never update or delete approval history. Only insert. Use Convex's insert-only pattern.

3. **Capture rejection reasons**: Require admin to provide reason when rejecting:
   ```typescript
   // Approval form validation
   if (action === "rejected" && !reason) {
     throw new Error("Rejection reason required");
   }
   ```

4. **Timestamp everything**: Use `Date.now()` for timestamps, not client-provided values (prevents tampering). Convex functions run on server with accurate clocks.

5. **Actor identification**: Store both `userId` (can be deleted) and `userEmail` (immutable snapshot) so you can identify who acted even if user account is deleted.

6. **Admin action UI**: Show approval history timeline in admin panel:
   - Who submitted (timestamp)
   - Who reviewed (timestamp)
   - What action taken
   - What reason given
   - Any file attachments reviewed

7. **Export capability**: Allow exporting audit trail to CSV for compliance audits.

**Detection:**
- Query vendor record - can you answer "Who approved this and when?"
- Delete admin user account - does approval history still show who approved?
- Search codebase for `.patch()` on approval status - is history being recorded?

**Phase assignment:**
- Phase 1 (Approval Flow): Design approval history schema from day one
- Phase 5 (Admin Tools): Build audit trail viewer UI

**Sources:**
- [Audit trail compliance requirements](https://www.inscopehq.com/post/audit-trail-requirements-guidelines-for-compliance-and-best-practices)
- [2026 GDPR/CCPA updates](https://influenceflow.io/resources/payments-with-audit-trails-complete-guide-for-2026/)

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or degraded UX.

### Pitfall 6: File Upload Size Limits and Timeout Confusion

**What goes wrong:**
Vendor tries to upload business license (25MB PDF). Upload fails silently or times out. Support tickets: "Upload keeps failing, your platform is broken."

**Why it happens:**
Convex has two upload patterns with different limits. Per official docs:
- *"HTTP action request size is currently limited to 20MB"*
- *"Upload POST request has a 2 minute timeout"*

Developers choose HTTP action pattern (simpler code) but hit 20MB limit. Or they use URL-based upload but don't handle 2-minute timeout for slow networks.

**Consequences:**
- Poor vendor onboarding experience
- Support overhead
- Lost vendor registrations (users give up)
- Reputation damage ("platform can't handle basic file uploads")

**Prevention:**
1. **Choose correct upload pattern**:
   - **Files < 20MB**: Use HTTP action with direct upload
   - **Files ≥ 20MB or user has slow network**: Use 3-step URL-based upload (no size limit)

2. **Client-side validation before upload**:
   ```typescript
   // In onboarding form
   const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

   if (file.size > MAX_FILE_SIZE) {
     toast.error(
       "File exceeds 20MB limit. Please compress or split document."
     );
     return;
   }
   ```

3. **Progressive upload UI**: Show upload progress, estimated time remaining. Prevents user from thinking upload is stuck:
   ```typescript
   // Use XMLHttpRequest for progress tracking
   const xhr = new XMLHttpRequest();
   xhr.upload.addEventListener("progress", (e) => {
     const percentComplete = (e.loaded / e.total) * 100;
     setUploadProgress(percentComplete);
   });
   ```

4. **Timeout handling**: For slow uploads, show "Still uploading..." message after 30 seconds, allow user to cancel and retry later.

5. **File size guidance in UI**: "Maximum file size: 20MB. Accepted formats: PDF, JPG, PNG. If your file is larger, please compress it using [tool link]."

6. **Retry logic**: If upload fails, allow retry without re-filling entire form:
   ```typescript
   // Store uploaded files in Zustand state
   // On retry, skip already-uploaded files
   ```

**Detection:**
- Test upload with 25MB file - does it fail gracefully?
- Test upload on throttled network (Chrome DevTools → Network → Slow 3G)
- Check error logs for timeout errors

**Phase assignment:**
- Phase 2 (Multi-Step Form): Implement file validation and progressive upload UI

**Sources:**
- [Convex file upload patterns](https://docs.convex.dev/file-storage/upload-files)

---

### Pitfall 7: Form State Loss on Page Refresh

**What goes wrong:**
Vendor fills out 4 steps of 5-step onboarding form (20 minutes of work), accidentally closes browser tab. Returns to form, all data lost. Vendor abandons registration in frustration.

**Why it happens:**
React Hook Form stores state in React component state (memory), not localStorage. Per RHF community discussions: *"Without Zustand, form data disappears when moving between steps or refreshing, as React Hook Form only manages the current step."*

**Consequences:**
- High form abandonment rate
- Poor vendor acquisition funnel metrics
- Frustrated users, negative reviews
- Support tickets: "I lost all my data"

**Prevention:**
1. **Zustand with persist middleware**: Store form data in Zustand with localStorage persistence:
   ```typescript
   // stores/vendorOnboarding.ts
   import { create } from 'zustand';
   import { persist } from 'zustand/middleware';

   export const useVendorOnboarding = create(
     persist(
       (set) => ({
         formData: {},
         currentStep: 0,
         updateFormData: (data) =>
           set((state) => ({
             formData: { ...state.formData, ...data }
           })),
         setStep: (step) => set({ currentStep: step }),
       }),
       { name: 'vendor-onboarding' } // localStorage key
     )
   );
   ```

2. **Auto-save pattern**: Debounce form changes and save to Zustand:
   ```typescript
   // In form component
   const { watch, setValue } = useForm();
   const updateFormData = useVendorOnboarding(s => s.updateFormData);

   useEffect(() => {
     const subscription = watch((data) => {
       updateFormData(data);
     });
     return () => subscription.unsubscribe();
   }, [watch, updateFormData]);
   ```

3. **Restore on mount**: Hydrate React Hook Form from Zustand on component mount:
   ```typescript
   const formData = useVendorOnboarding(s => s.formData);
   const { reset } = useForm();

   useEffect(() => {
     reset(formData); // restore saved data
   }, []);
   ```

4. **Draft expiry**: Clear localStorage after successful submission or after 7 days:
   ```typescript
   // Store timestamp with draft
   const DRAFT_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

   const draftAge = Date.now() - draft.timestamp;
   if (draftAge > DRAFT_TTL) {
     clearDraft();
   }
   ```

5. **Visual indicator**: Show "Draft auto-saved" indicator so users know their progress is safe.

**Detection:**
- Fill out form partially, refresh page - is data retained?
- Fill out form, close tab, reopen - is data retained?
- Check localStorage in DevTools - is form data being saved?

**Phase assignment:**
- Phase 2 (Multi-Step Form): Implement Zustand persistence from day one

**Sources:**
- [React Hook Form multi-step with Zustand](https://www.buildwithmatija.com/blog/master-multi-step-forms-build-a-dynamic-react-form-in-6-simple-steps)
- [Multi-step form state management](https://github.com/orgs/react-hook-form/discussions/6382)

---

### Pitfall 8: No File Type or Content Validation

**What goes wrong:**
Vendor uploads `malware.exe` renamed as `business-license.pdf`. File passes through to storage. Admin downloads it, antivirus triggers. Security incident.

Or: Vendor uploads meme image as "tax certificate," gets approved because admin doesn't carefully review files. Later discovered during audit.

**Why it happens:**
Convex file storage accepts any file type by default. Per docs, you control validation *"In the mutation that generates the upload URL"* but developers skip this step. No MIME type checking, no file content validation, no size limits.

**Consequences:**
- Malware distribution via platform
- Data breach if admin machine compromised
- Fraudulent vendors slip through with fake documents
- Compliance failures (accepting non-compliant documents)

**Prevention:**
1. **Client-side MIME type filtering**: First line of defense (easily bypassed, but catches honest mistakes):
   ```typescript
   // File input
   <input
     type="file"
     accept=".pdf,.jpg,.jpeg,.png"
     onChange={handleFileChange}
   />

   const ALLOWED_TYPES = [
     'application/pdf',
     'image/jpeg',
     'image/png'
   ];

   if (!ALLOWED_TYPES.includes(file.type)) {
     toast.error("Only PDF and image files allowed");
     return;
   }
   ```

2. **Server-side validation in Convex mutation**: Check file extension and MIME type when generating upload URL:
   ```typescript
   // Convex mutation
   export const generateUploadUrl = mutation({
     args: {
       fileName: v.string(),
       fileType: v.string(),
       documentType: v.union(
         v.literal("business_license"),
         v.literal("tax_certificate"),
         v.literal("insurance_policy")
       ),
     },
     handler: async (ctx, args) => {
       // Validate file type
       const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
       if (!allowedTypes.includes(args.fileType)) {
         throw new Error("Invalid file type");
       }

       // Validate extension matches MIME type
       const ext = args.fileName.split('.').pop()?.toLowerCase();
       if (args.fileType === "application/pdf" && ext !== "pdf") {
         throw new Error("File extension doesn't match type");
       }

       return await ctx.storage.generateUploadUrl();
     },
   });
   ```

3. **Post-upload content inspection**: After upload completes, inspect file header bytes to verify actual file type (prevents `.exe` renamed to `.pdf`):
   ```typescript
   // Convex action (can make HTTP calls)
   const fileBlob = await ctx.storage.get(storageId);
   const buffer = await fileBlob.arrayBuffer();
   const header = new Uint8Array(buffer.slice(0, 4));

   // PDF magic number: %PDF (0x25 0x50 0x44 0x46)
   if (header[0] !== 0x25 || header[1] !== 0x50) {
     await ctx.storage.delete(storageId);
     throw new Error("File is not a valid PDF");
   }
   ```

4. **File size limits per document type**:
   ```typescript
   const SIZE_LIMITS = {
     business_license: 10 * 1024 * 1024, // 10MB
     tax_certificate: 5 * 1024 * 1024,   // 5MB
     insurance_policy: 10 * 1024 * 1024, // 10MB
   };

   if (fileSize > SIZE_LIMITS[documentType]) {
     throw new Error(`File exceeds ${SIZE_LIMITS[documentType] / 1024 / 1024}MB limit`);
   }
   ```

5. **Virus scanning (advanced)**: Integrate with virus scanning API (ClamAV, VirusTotal) before making files available to admins.

6. **Admin review checklist**: In approval UI, show checklist: "[ ] Verified document is readable [ ] Verified document matches vendor name [ ] Verified document is not expired."

**Detection:**
- Try uploading `.txt` file renamed to `.pdf` - is it rejected?
- Try uploading 100MB file - is it rejected?
- Check upload mutation code - does it validate file type?

**Phase assignment:**
- Phase 2 (Multi-Step Form): Implement basic file type validation
- Phase 4 (Admin Review): Add content inspection and admin review checklist

**Sources:**
- [Convex file upload validation](https://docs.convex.dev/file-storage/upload-files)
- [B2B marketplace file security](https://compliancely.com/blog/vendor-onboarding-software-comparison/)

---

### Pitfall 9: Approval Notification Email Overload

**What goes wrong:**
System sends email to all admins every time a vendor submits application. With 50 vendor applications per day and 10 admins, that's 500 emails daily. Admins create inbox filter to auto-delete notifications. Critical approvals get missed.

**Why it happens:**
Per approval workflow research: *"On average, a person receives 100-150 emails on a daily basis, and skimming through these many emails just to find the approval email can be quite a task, with 9/10 times the approval email simply falling through the cracks."*

**Consequences:**
- Admins miss approval requests
- Vendors stuck in "pending" for weeks
- Reputation damage ("Your approval process is too slow")
- Admins disable notifications, then miss urgent items

**Prevention:**
1. **Digest emails instead of real-time**: Send daily digest at 9am with all pending approvals:
   ```typescript
   // Convex scheduled function
   export const sendDailyApprovalDigest = internalMutation({
     handler: async (ctx) => {
       const pending = await ctx.db
         .query("vendors")
         .filter(q => q.eq(q.field("status"), "pending"))
         .collect();

       if (pending.length === 0) return;

       const admins = await getAdminUsers(ctx);
       await sendEmail({
         to: admins.map(a => a.email),
         subject: `${pending.length} vendors awaiting approval`,
         body: renderDigestTemplate(pending),
       });
     },
   });
   ```

2. **Assignment system**: Assign each approval to specific admin (round-robin), only that admin gets email:
   ```typescript
   // When vendor submits
   const assignedAdmin = await getNextAvailableAdmin(ctx);
   await ctx.db.patch(vendorId, { assignedAdminId: assignedAdmin._id });
   await sendEmail({
     to: assignedAdmin.email,
     subject: "New vendor assigned to you",
   });
   ```

3. **In-app notification center**: Build notification inbox in admin dashboard, send emails only for high-priority items (e.g., vendor waiting > 3 days).

4. **Escalation logic**: If approval not actioned within 48 hours, escalate to next admin tier:
   ```typescript
   // Scheduled function runs hourly
   const staleApprovals = await ctx.db
     .query("vendors")
     .filter(q =>
       q.eq(q.field("status"), "pending") &&
       q.lt(q.field("submittedAt"), Date.now() - 48 * 60 * 60 * 1000)
     )
     .collect();

   for (const vendor of staleApprovals) {
     await escalateToSeniorAdmin(ctx, vendor._id);
   }
   ```

5. **Notification preferences**: Let admins configure preferences (real-time vs digest, email vs in-app only).

6. **Batch actions**: Allow admins to approve/reject multiple vendors at once to clear backlog quickly.

**Detection:**
- Create 10 test vendor applications in one day
- Count how many emails each admin receives
- Survey admins: "How many approval emails do you get daily? Do you read them all?"

**Phase assignment:**
- Phase 1 (Approval Flow): Implement assignment system
- Phase 4 (Admin Review): Add digest emails and notification preferences
- Phase 5 (Admin Tools): Build in-app notification center

**Sources:**
- [Approval workflow notification pitfalls](https://snohai.com/common-approval-workflow-mistakes-enterprises-make/)
- [Email approval problems](https://kissflow.com/workflow/approval-process/)

---

### Pitfall 10: Inadequate Role Transition Testing

**What goes wrong:**
Vendor is approved (status changes from `pending` to `approved`). Role changes from `vendor_pending` to `vendor_approved`. But dashboard routing still checks for old role, vendor sees 403 error. Or worse: vendor can still access `/onboarding` form and submit duplicate applications.

**Why it happens:**
Developers test happy path (submit → approve → access dashboard) but don't test state transitions (pending → rejected → resubmit, approved → suspended, etc.). Per approval workflow testing best practices: *"For basic and await all approvals, the final states can be Approved, Rejected, or Canceled, which are the key states to test."*

**Consequences:**
- Approved vendors can't access platform
- Rejected vendors can still access restricted areas
- Duplicate applications from same vendor
- Support overhead

**Prevention:**
1. **State machine diagram**: Document all valid state transitions before coding:
   ```
   pending → approved → active → suspended → reactivated
          ↘ rejected → pending (resubmit) → approved
          ↘ cancelled
   ```

2. **Test matrix for role-based access**:
   | Role | Can Access Onboarding | Can Access Dashboard | Can Create Deals |
   |------|----------------------|---------------------|------------------|
   | vendor_pending | Yes (to complete) | No | No |
   | vendor_approved | No | Yes | Yes |
   | vendor_rejected | No | No (show rejection reason) | No |
   | vendor_suspended | No | Yes (read-only) | No |

3. **Integration tests for each transition**:
   ```typescript
   // tests/approval-workflow.test.ts
   test("approved vendor cannot resubmit onboarding", async () => {
     const vendor = await createVendor({ status: "approved" });
     const response = await POST("/api/onboarding/submit", {
       headers: { userId: vendor.clerkId },
     });
     expect(response.status).toBe(403);
     expect(response.body.error).toContain("already approved");
   });

   test("rejected vendor can access resubmission form", async () => {
     const vendor = await createVendor({
       status: "rejected",
       rejectionReason: "Incomplete documents"
     });
     const response = await GET("/onboarding/resubmit", {
       headers: { userId: vendor.clerkId },
     });
     expect(response.status).toBe(200);
   });
   ```

4. **Middleware-level authorization**: Use Next.js middleware to enforce role-based access before requests reach pages:
   ```typescript
   // middleware.ts
   export function middleware(request: NextRequest) {
     const { userId } = getAuth(request);
     const user = await fetchUser(userId);

     if (request.nextUrl.pathname.startsWith("/vendor/dashboard")) {
       if (user.role !== "vendor_approved") {
         return NextResponse.redirect("/vendor/pending");
       }
     }

     if (request.nextUrl.pathname.startsWith("/onboarding")) {
       if (user.role === "vendor_approved") {
         return NextResponse.redirect("/vendor/dashboard");
       }
     }
   }
   ```

5. **Clerk session claims**: Sync approval status to Clerk session so it's available in middleware:
   ```typescript
   // When approving vendor
   await clerkClient.users.updateUserMetadata(userId, {
     publicMetadata: {
       role: "vendor_approved",
       approvedAt: Date.now(),
     },
   });
   ```

6. **Test with actual role changes**: Don't mock roles in tests, actually update Clerk metadata and verify routing works.

**Detection:**
- Create vendor account, get it approved, try to access `/onboarding` again
- Create vendor account, get it rejected, try to access `/dashboard`
- Check codebase for authorization checks - are all states handled?

**Phase assignment:**
- Phase 1 (Approval Flow): Document state machine, implement middleware checks
- Phase 3 (Dashboard Revamp): Test all role transitions against dashboard routes
- Phase 5 (Admin Tools): Add admin UI to manually transition vendor states for testing

**Sources:**
- [Testing approval workflows](https://learn.microsoft.com/en-us/power-automate/modern-approvals)
- [Approval workflow edge cases](https://www.servicenow.com/community/workflow-automation-articles/flow-designer-approvals-overview-workflow-automation-center-of/ta-p/2528202)

---

## Minor Pitfalls

Mistakes that cause annoyance but are relatively easy to fix.

### Pitfall 11: No "Reason for Rejection" Enforcement

**What goes wrong:**
Admin rejects vendor application but doesn't provide reason. Vendor receives "Your application was rejected" email with no context. Vendor emails support: "Why was I rejected? What do I need to fix?" Support has no record of reason.

**Prevention:**
- Make rejection reason a required field in admin UI (form validation)
- Provide dropdown of common rejection reasons + free text for details
- Store reason in approval history table for audit trail
- Include reason in rejection email template

**Phase assignment:** Phase 4 (Admin Review UI)

---

### Pitfall 12: Slow File Download in Admin Review

**What goes wrong:**
Admin reviewing vendor application clicks "Download business license." Convex storage generates URL, triggers download. 10MB PDF takes 30 seconds to download on slow network. Admin can't review multiple vendors efficiently.

**Prevention:**
- Generate Convex storage URLs eagerly when loading vendor list (URLs are valid for 1 hour)
- Implement file preview in browser (PDF.js) instead of forcing download
- Cache downloaded files in browser storage for re-review
- Show file size next to download link so admin knows what to expect

**Phase assignment:** Phase 4 (Admin Review UI)

---

### Pitfall 13: No Bulk Approval Actions

**What goes wrong:**
Admin needs to approve 20 vendors after weekend backlog. Current UI requires clicking each vendor, reviewing, approving, going back to list, repeat. Takes 40 minutes.

**Prevention:**
- Add checkbox selection to vendor list
- "Approve selected (X)" and "Reject selected (X)" buttons
- Confirmation modal showing which vendors will be affected
- Batch approval creates single approval history entry with list of all affected vendors

**Phase assignment:** Phase 5 (Admin Tools)

---

### Pitfall 14: Confusing Pending State for Users

**What goes wrong:**
Vendor submits application, sees "Application submitted" success message, then gets logged out (session expired). Logs back in, sees blank dashboard with no indication of pending status. Thinks application wasn't submitted, submits again (duplicate).

**Prevention:**
- Create dedicated "pending approval" page: "Your application is under review. We'll email you within 2 business days."
- Show submission timestamp and assigned admin name (if visible)
- Display application summary so vendor can verify what was submitted
- "Withdraw application" button if vendor wants to cancel
- Email confirmation immediately after submission

**Phase assignment:** Phase 2 (Multi-Step Form) - Build pending state page

---

### Pitfall 15: No Admin Assignment Tracking

**What goes wrong:**
Two admins open the same vendor approval at the same time. Both spend 10 minutes reviewing documents. Both approve. Wasted effort.

**Prevention:**
- Use Convex presence to show "Admin X is currently reviewing this" indicator
- Implement "Claim for review" button - only assigned admin can approve/reject
- Show in vendor list which vendors are currently being reviewed
- Auto-release claim after 30 minutes of inactivity

**Phase assignment:** Phase 4 (Admin Review UI)

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Phase 1: Approval Flow Foundation | Race conditions in concurrent approvals | Use Convex transactions + version checks |
| Phase 1: Approval Flow Foundation | Role security (client-side tampering) | Server-side only metadata updates |
| Phase 1: Approval Flow Foundation | Missing audit trail | Design approval history schema from start |
| Phase 2: Multi-Step Form | Orphaned file uploads | Implement lazy upload or draft records |
| Phase 2: Multi-Step Form | Form state loss on refresh | Zustand + localStorage persistence |
| Phase 2: Multi-Step Form | File upload size/timeout issues | Validate size, show progress, handle errors |
| Phase 3: Dashboard Revamp | Breaking existing provider access | Expand-Migrate-Contract pattern, feature flags |
| Phase 3: Dashboard Revamp | Inadequate role transition testing | Test all state transitions, use middleware |
| Phase 4: Admin Review UI | File validation gaps | Server-side MIME type + content checks |
| Phase 4: Admin Review UI | Email notification overload | Digest emails, assignment system |
| Phase 5: Admin Tools | No bulk operations | Design with batch actions from start |
| All Phases | Backward compatibility breaks | Test with existing data before deployment |

---

## Cross-Cutting Concerns

### Data Isolation Between Vendors
**Risk:** Vendor A accessing Vendor B's uploaded documents or deal data.

**Prevention:**
- Every Convex query must filter by current user's vendor ID
- Use Convex query helpers to enforce tenant isolation:
  ```typescript
  // convex/lib/helpers.ts
  export async function getVendorForUser(ctx: QueryCtx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const vendor = await ctx.db
      .query("vendors")
      .filter(q => q.eq(q.field("clerkUserId"), identity.subject))
      .unique();

    if (!vendor) throw new Error("Vendor not found");
    return vendor;
  }

  // In every vendor-scoped query
  export const getMyDeals = query({
    handler: async (ctx) => {
      const vendor = await getVendorForUser(ctx);
      return await ctx.db
        .query("deals")
        .filter(q => q.eq(q.field("vendorId"), vendor._id))
        .collect();
    },
  });
  ```

**Testing:** Create two vendor accounts, try to access each other's data via API calls.

**Sources:**
- [Multi-tenant data isolation](https://medium.com/@niteshthakur498/designing-a-multi-tenant-saas-application-data-isolation-strategies-dea298a1309b)
- [Clerk multi-tenant architecture](https://clerk.com/docs/guides/how-clerk-works/multi-tenant-architecture)

### Authorization Check Locations
**Common mistake:** Checking authorization in React components only (can be bypassed).

**Rule:** Authorization MUST be checked in three places:
1. **Middleware** (Next.js): Route-level access control
2. **Server Actions/API Routes**: Before executing privileged operations
3. **Convex mutations/queries**: Before database access

**Never:** Check authorization only in UI (e.g., hiding buttons). Per Clerk docs: *"The Protect component only visually hides its children... Do not use this component to hide sensitive information."*

### Session Management During Onboarding
**Risk:** Vendor starts onboarding, session expires mid-form, loses all progress.

**Prevention:**
- Clerk session duration: Set to 7 days for vendor onboarding
- Refresh token before final submission
- Handle session expiry gracefully: Save draft, redirect to login, restore draft after re-auth

---

## Quick Reference Checklist

Before deploying vendor registration & approval system:

**Security:**
- [ ] All role changes happen server-side only (Convex mutations)
- [ ] Authorization checked in middleware, server actions, and Convex
- [ ] File uploads validated (type, size, content)
- [ ] Audit trail captures who/what/when/why for every approval action
- [ ] Data isolation prevents cross-vendor access

**State Management:**
- [ ] Multi-step form state persisted to localStorage (Zustand)
- [ ] Approval workflow uses transactions to prevent race conditions
- [ ] State machine documented with all valid transitions
- [ ] Invalid state transitions throw errors (not silently fail)

**File Handling:**
- [ ] Orphaned file cleanup job scheduled
- [ ] File size limits enforced (client + server)
- [ ] Upload progress shown for slow networks
- [ ] Files linked to vendor records (draft or final)

**Migration Safety:**
- [ ] Role changes use Expand-Migrate-Contract pattern
- [ ] Feature flags enable gradual dashboard rollout
- [ ] Existing provider accounts tested with new code
- [ ] Backward compatibility maintained during transition

**UX:**
- [ ] Rejection reasons required and shown to vendor
- [ ] Pending state page shows submission status
- [ ] Email notifications don't overwhelm admins
- [ ] Approved vendors can't resubmit onboarding

**Testing:**
- [ ] All approval state transitions tested (pending → approved/rejected/cancelled)
- [ ] Role-based access tested for each route
- [ ] Concurrent approval attempts tested (race conditions)
- [ ] File upload tested with edge cases (large files, wrong types, slow network)
- [ ] Existing provider account tested with new dashboard code

---

## Research Confidence Assessment

| Topic | Confidence | Source |
|-------|------------|--------|
| Clerk role security | HIGH | Official Clerk docs |
| Convex transactions & race conditions | HIGH | Official Convex docs + Stack articles |
| File upload patterns | HIGH | Official Convex docs |
| Multi-step form state management | HIGH | React Hook Form community + recent tutorials |
| Approval workflow patterns | MEDIUM | Industry best practices, not REOS-specific |
| Audit trail requirements | MEDIUM | General compliance research, not legal advice |
| Next.js 15 server actions | MEDIUM | Recent articles, some edge cases still emerging |
| Dashboard migration strategies | MEDIUM | Cross-industry patterns applied to REOS context |

---

## Sources

### Official Documentation
- [Clerk RBAC with metadata](https://clerk.com/docs/guides/secure/basic-rbac)
- [Clerk User metadata](https://clerk.com/docs/users/metadata)
- [Convex file storage](https://docs.convex.dev/file-storage/upload-files)
- [Convex durable workflows](https://stack.convex.dev/durable-workflows-and-strong-guarantees)
- [Convex workflow component](https://www.convex.dev/components/workflow)
- [Convex migrations](https://stack.convex.dev/lightweight-zero-downtime-migrations)

### Best Practices & Patterns
- [Common approval workflow mistakes](https://snohai.com/common-approval-workflow-mistakes-enterprises-make/)
- [B2B marketplace features](https://www.rigbyjs.com/blog/b2b-marketplace-features)
- [Vendor onboarding workflow](https://www.moxo.com/blog/vendor-onboarding-workflow)
- [Multi-tenant data isolation](https://medium.com/@niteshthakur498/designing-a-multi-tenant-saas-application-data-isolation-strategies-dea298a1309b)
- [Feature flags gradual rollout](https://www.getunleash.io/feature-flag-use-cases-progressive-or-gradual-rollouts)
- [Backward compatible database changes](https://planetscale.com/blog/backward-compatible-databases-changes)

### Technical Tutorials
- [React Hook Form multi-step with Zustand](https://www.buildwithmatija.com/blog/master-multi-step-forms-build-a-dynamic-react-form-in-6-simple-steps)
- [Next.js 15 server actions best practices](https://medium.com/@lior_amsalem/nextjs-15-actions-best-practice-bf5cc023301e)
- [Testing approval workflows](https://learn.microsoft.com/en-us/power-automate/modern-approvals)

### Compliance & Security
- [Audit trail compliance requirements](https://www.inscopehq.com/post/audit-trail-requirements-guidelines-for-compliance-and-best-practices)
- [2026 GDPR/CCPA payment audit trails](https://influenceflow.io/resources/payments-with-audit-trails-complete-guide-for-2026/)
- [Clerk multi-tenant security](https://clerk.com/blog/what-are-the-risks-and-challenges-of-multi-tenancy)

---

**END OF DOCUMENT**
