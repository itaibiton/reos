# Technology Stack — Vendor Registration & Management

**Project:** REOS (Real Estate Investment Platform)
**Milestone:** Vendor Registration, Admin Approval, Vendor Dashboard
**Researched:** 2026-01-29
**Overall Confidence:** HIGH

## Executive Summary

The vendor registration features require minimal new dependencies. The existing stack (Next.js 15, Convex, Clerk, react-hook-form, Zod, Shadcn/ui) already provides 90% of needed capabilities. Only 3 targeted additions are recommended: react-dropzone for file uploads, recharts upgrade for statistics, and react-chrono for timeline visualization.

## What You Already Have (DO NOT ADD)

| Technology | Version | Ready For | Notes |
|------------|---------|-----------|-------|
| **Next.js** | 16.1.1 | Framework, Server Actions | Form submission pattern proven in contact form |
| **Convex** | 1.31.3 | Database + File Storage | Already handles deal files (dealFiles.ts), extend for vendor docs |
| **Clerk** | 6.36.7 | Auth + Roles + Webhooks | 8 roles including admin, broker, lawyer, mortgage_advisor |
| **react-hook-form** | 7.71.0 | Form Management | Already used in ContactPageContent.tsx |
| **Zod** | 4.3.5 | Validation | Schema-based validation with i18n error keys |
| **@hookform/resolvers** | 5.2.2 | RHF + Zod integration | zodResolver already in use |
| **Shadcn/ui** | — | UI Components | Radix primitives + Tailwind, multi-step form blocks available |
| **next-intl** | 4.7.0 | Internationalization | EN/HE support with Zod error localization proven |
| **Framer Motion** | 12.26.2 | Animations | Smooth transitions for multi-step form wizard |
| **Sonner** | 2.0.7 | Toast Notifications | Success/error feedback |
| **recharts** | 2.15.4 | Charts (needs upgrade) | Already installed, upgrade to 3.6.0 for Next.js 15 compat |

## Stack Changes Required

### 1. Add react-dropzone for File Upload UX

**Current state:** Convex file storage exists (dealFiles.ts), but no drag-drop UI component.

**Required addition:**

```bash
npm install react-dropzone@^14.3.8
```

**Why:**
- Industry standard (4400+ projects use it)
- Integrates cleanly with react-hook-form
- Shadcn/ui dropzone components are built on this foundation
- Convex storage already proven (generateUploadUrl → POST → storage.getUrl pattern)

**Integration pattern:**

```typescript
// Component: VendorPhotoUpload.tsx - NEW FILE
"use client";

import { useDropzone } from "react-dropzone";
import { useFormContext } from "react-hook-form";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function VendorPhotoUpload() {
  const form = useFormContext();
  const generateUploadUrl = useMutation(api.vendorFiles.generateUploadUrl);

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'] },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      const file = acceptedFiles[0];

      // Generate upload URL
      const uploadUrl = await generateUploadUrl();

      // Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        body: file,
      });
      const { storageId } = await result.json();

      // Set form field
      form.setValue("profilePhotoStorageId", storageId);
    },
    onDropRejected: (rejections) => {
      const error = rejections[0].errors[0];
      if (error.code === 'file-too-large') {
        form.setError('profilePhoto', { message: 'photoTooLarge' });
      }
    }
  });

  return (
    <div {...getRootProps()} className="border-2 border-dashed rounded-lg p-8">
      <input {...getInputProps()} />
      {/* Upload UI */}
    </div>
  );
}
```

**Convex extension:**

```typescript
// convex/vendorFiles.ts - NEW FILE
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

export const saveVendorFile = mutation({
  args: {
    storageId: v.id("_storage"),
    category: v.union(
      v.literal("profile_photo"),
      v.literal("license_document"),
      v.literal("certification")
    ),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(args.fileType)) {
      throw new Error("Invalid file type");
    }

    // Validate file size (5MB for images, 10MB for PDFs)
    const maxSize = args.fileType.startsWith('image/') ? 5 : 10;
    if (args.fileSize > maxSize * 1024 * 1024) {
      throw new Error("File too large");
    }

    // Save metadata (same pattern as dealFiles.ts)
    // ...
  }
});
```

### 2. Upgrade recharts for Statistics

**Current state:** recharts@2.15.4 installed, but outdated for Next.js 15.

**Required change:**

```bash
npm install recharts@^3.6.0
```

**Why:**
- Recharts 3.x adds better TypeScript support and Next.js 15 compatibility
- Lightweight (built on D3, ~50KB gzipped)
- Already familiar to team (used in v1.2 provider analytics)
- Simple bar/line charts sufficient for vendor dashboard stats

**Usage:**

```typescript
// Component: VendorStatistics.tsx - NEW FILE
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';

export function VendorStatistics({ data }: { data: DealStats[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Bar dataKey="deals" fill="hsl(var(--primary))" />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

### 3. Add react-chrono for Timeline Visualization

**Current state:** No timeline component. Vendor dashboard needs process timeline.

**Required addition:**

```bash
npm install react-chrono@^3.3.3
```

**Why:**
- Modern timeline component with vertical/horizontal modes
- Supports nested timelines (good for 7-stage deal flow)
- React 19+ compatible, TypeScript native
- Out-of-box timeline with zero custom CSS

**Usage:**

```typescript
// Component: VendorDealTimeline.tsx - NEW FILE
import { Chrono } from "react-chrono";

export function VendorDealTimeline({ deal }: { deal: Deal }) {
  const items = [
    {
      title: "Initial Contact",
      cardTitle: deal.stage === "initial_contact" ? "Current" : "Completed",
      cardDetailedText: "Deal initiated with client",
    },
    // ... 7 stages total
  ];

  return (
    <Chrono
      items={items}
      mode="VERTICAL"
      theme={{
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
      }}
    />
  );
}
```

**Alternative considered:** Building custom timeline with Shadcn/ui primitives.
**Why rejected:** 2-3 days of work for marginal benefit. react-chrono provides polish out-of-box.

## What NOT to Add (Explicitly)

### Multi-Step Form Library

**Decision:** Use custom implementation with react-hook-form + Framer Motion.

**Why NOT adding rhf-wizard or similar:**
- Contact form already demonstrates react-hook-form mastery (ContactPageContent.tsx)
- Multi-step just needs state management for current step + conditional rendering
- Shadcn/ui Studio has multi-step form blocks available (`npx shadcn add multi-step-form-01`)
- Investor onboarding already uses conversational questionnaire pattern (v1.1)

**Implementation pattern:**

```typescript
// Component: VendorRegistrationWizard.tsx - NEW FILE
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  { id: 1, name: "Basic Info", schema: step1Schema },
  { id: 2, name: "License & Experience", schema: step2Schema },
  { id: 3, name: "Documents", schema: step3Schema },
];

export function VendorRegistrationWizard() {
  const [currentStep, setCurrentStep] = useState(0);

  const form = useForm({
    resolver: zodResolver(steps[currentStep].schema),
    defaultValues: {},
  });

  const nextStep = async () => {
    // Validate current step fields
    const isValid = await form.trigger();
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  return (
    <div>
      {/* Step indicator */}
      <StepIndicator steps={steps} currentStep={currentStep} />

      {/* Animated step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          {currentStep === 0 && <Step1BasicInfo form={form} />}
          {currentStep === 1 && <Step2License form={form} />}
          {currentStep === 2 && <Step3Documents form={form} />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex gap-4 mt-6">
        {currentStep > 0 && (
          <Button onClick={() => setCurrentStep(prev => prev - 1)}>
            Previous
          </Button>
        )}
        {currentStep < steps.length - 1 && (
          <Button onClick={nextStep}>Next</Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button onClick={form.handleSubmit(onSubmit)}>
            Submit for Approval
          </Button>
        )}
      </div>
    </div>
  );
}
```

**Rationale:**
- Full control over step transitions
- Integrates seamlessly with existing form validation patterns
- Framer Motion already in stack for animations
- No additional bundle size

### Admin Notification Service

**Decision:** Use Convex + Clerk webhooks (already in stack).

**Why NOT adding external notification service:**
- Convex already has real-time capabilities (proven in v1.0 chat/notifications)
- Clerk webhooks support role events (`onRoleCreated`, `onRoleUpdated`)
- Pattern: Admin approval triggers Convex mutation → Updates vendor status → Notifies vendor

**Implementation pattern:**

```typescript
// convex/vendors.ts - NEW FILE
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { createNotification } from "./notifications";

export const listPending = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    // Only admins can see pending vendors
    if (user?.role !== "admin") return [];

    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("vendorStatus"), "pending"))
      .collect();
  },
});

export const approveVendor = mutation({
  args: {
    vendorId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Verify admin role
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const admin = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (admin?.role !== "admin") {
      throw new Error("Only admins can approve vendors");
    }

    // Update vendor status
    await ctx.db.patch(args.vendorId, {
      vendorStatus: "approved",
      vendorMetadata: {
        // ... existing metadata
        reviewedAt: Date.now(),
        reviewedBy: admin._id,
      },
    });

    // Notify vendor (extend existing notifications system)
    await createNotification(ctx, {
      userId: args.vendorId,
      type: "vendor_approved",
      title: "Registration Approved",
      message: "Your vendor registration has been approved!",
      link: "/vendor/dashboard",
    });

    return { success: true };
  },
});
```

**Convex schema extension:**

```typescript
// convex/schema.ts - UPDATE users table
users: defineTable({
  // ... existing fields
  vendorStatus: v.optional(v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected")
  )),
  vendorMetadata: v.optional(v.object({
    licenseNumber: v.string(),
    yearsExperience: v.number(),
    specializations: v.array(v.string()),
    profilePhotoStorageId: v.optional(v.id("_storage")),
    submittedAt: v.number(),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("users")),
    rejectionReason: v.optional(v.string()),
  })),
})
  .index("by_vendor_status", ["vendorStatus"])
  .index("by_clerk_id", ["clerkId"]),
```

### Image Optimization Service

**Decision:** Use Next.js Image component (already in framework).

**Why NOT adding sharp or external image processing:**
- Next.js 15 Image component handles optimization automatically
- Profile photos are display-only (not edited in-browser)
- Convex storage serves files via CDN-cached URLs (storage.getUrl)

**Usage:**

```typescript
import Image from "next/image";

export function VendorProfilePhoto({ storageId }: { storageId: string }) {
  const photoUrl = useQuery(api.vendorFiles.getPhotoUrl, { storageId });

  if (!photoUrl) return <Skeleton />;

  return (
    <Image
      src={photoUrl}
      alt="Profile photo"
      width={200}
      height={200}
      className="rounded-full"
    />
  );
}
```

## Integration Points

### 1. Form Validation with next-intl + Zod

**Existing pattern (from ContactPageContent.tsx):**

```typescript
// Zod schema uses error keys (not messages)
const schema = z.object({
  email: z.string().email("emailInvalid"),
  name: z.string().min(2, "nameMin"),
});

// Translation files (messages/en.json, messages/he.json)
{
  "form": {
    "errors": {
      "emailInvalid": "Please enter a valid email address",
      "nameMin": "Name must be at least 2 characters"
    }
  }
}

// FormMessage component translates error keys
<FormMessage>
  {errors.email?.message && t(`form.errors.${errors.email.message}`)}
</FormMessage>
```

**Extension for vendor registration:**

```json
// messages/en.json
{
  "vendorRegistration": {
    "step1": {
      "title": "Basic Information",
      "fields": {
        "name": "Full Name",
        "email": "Email Address",
        "phone": "Phone Number"
      }
    },
    "step2": {
      "title": "License & Experience",
      "fields": {
        "licenseNumber": "License Number",
        "yearsExperience": "Years of Experience"
      }
    },
    "errors": {
      "licenseRequired": "License number is required",
      "photoRequired": "Profile photo is required",
      "photoTooLarge": "Photo must be under 5MB",
      "invalidFileType": "Only JPG, PNG files are allowed"
    }
  }
}
```

### 2. Admin Dashboard with Real-Time Updates

**Convex subscription pattern:**

```typescript
// Component: AdminPendingVendors.tsx
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function AdminPendingVendors() {
  const pendingVendors = useQuery(api.vendors.listPending);
  const pendingCount = pendingVendors?.length ?? 0;

  return (
    <div>
      <div className="flex items-center gap-2">
        <h2>Pending Vendor Approvals</h2>
        {pendingCount > 0 && (
          <Badge variant="destructive">{pendingCount}</Badge>
        )}
      </div>

      {pendingVendors?.map(vendor => (
        <VendorApprovalCard key={vendor._id} vendor={vendor} />
      ))}
    </div>
  );
}
```

**Real-time updates:** Convex subscriptions automatically re-render when data changes. No polling needed.

### 3. File Upload Security

**Client-side validation:**

```typescript
const { getRootProps, getInputProps } = useDropzone({
  accept: {
    'image/*': ['.png', '.jpg', '.jpeg'],
    'application/pdf': ['.pdf']
  },
  maxSize: 5 * 1024 * 1024, // 5MB for images
  maxFiles: 1,
  onDrop: (acceptedFiles, rejectedFiles) => {
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0].code === 'file-too-large') {
        form.setError('photo', { message: 'photoTooLarge' });
      } else if (rejection.errors[0].code === 'file-invalid-type') {
        form.setError('photo', { message: 'invalidFileType' });
      }
    }
  }
});
```

**Server-side validation (Convex mutation):**

```typescript
export const saveVendorFile = mutation({
  args: {
    storageId: v.id("_storage"),
    fileType: v.string(),
    fileSize: v.number(),
    category: v.union(v.literal("profile_photo"), v.literal("license_document"))
  },
  handler: async (ctx, args) => {
    // Validate file type
    const allowedTypes = args.category === "profile_photo"
      ? ['image/jpeg', 'image/png']
      : ['application/pdf'];

    if (!allowedTypes.includes(args.fileType)) {
      throw new Error("Invalid file type");
    }

    // Validate file size
    const maxSize = args.category === "profile_photo" ? 5 : 10; // MB
    if (args.fileSize > maxSize * 1024 * 1024) {
      throw new Error("File too large");
    }

    // Authorization check
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // Save metadata
    // ...
  }
});
```

## Performance Considerations

### Bundle Size Impact

| Library | Size (gzipped) | Impact | Mitigation |
|---------|---------------|--------|------------|
| react-dropzone | ~15KB | Minimal | Only on registration page |
| react-chrono | ~45KB | Moderate | Lazy load on vendor dashboard |
| recharts | ~50KB | Moderate | Lazy load on dashboard, shared chunk |

**Code splitting strategy:**

```typescript
// Lazy load dashboard components
const VendorDashboard = dynamic(() => import('./VendorDashboard'), {
  loading: () => <DashboardSkeleton />,
  ssr: false // Auth-gated pages don't need SSR
});

const VendorTimeline = dynamic(() => import('./VendorTimeline'), {
  loading: () => <div>Loading timeline...</div>,
});
```

### File Upload Performance

**Best practices (from Next.js 15 research):**
- Use Convex upload URL method (no 20MB HTTP action limit)
- 2-minute timeout sufficient for profile photos (<5MB)
- No chunking needed (not large files like video)
- HTTPS by default (Convex handles SSL)

**From dealFiles.ts proven pattern:**
- `generateUploadUrl` creates short-lived URL
- Client POSTs file directly to Convex storage
- Mutation saves metadata after upload
- No intermediate server processing

## Configuration Checklist

| Item | Status | Action |
|------|--------|--------|
| react-dropzone | TODO | `npm install react-dropzone@^14.3.8` |
| react-chrono | TODO | `npm install react-chrono@^3.3.3` |
| recharts upgrade | TODO | `npm install recharts@^3.6.0` |
| Convex schema extension | TODO | Add vendorStatus, vendorMetadata to users table |
| Convex vendorFiles.ts | TODO | Create mutations for file upload |
| Convex vendors.ts | TODO | Create queries/mutations for approval workflow |
| i18n messages | TODO | Add vendorRegistration keys to EN/HE |
| Multi-step form component | TODO | Build VendorRegistrationWizard.tsx |
| Admin dashboard | TODO | Build AdminPendingVendors.tsx |
| Vendor dashboard | TODO | Build VendorDashboard.tsx with timeline |

## Effort Estimation

| Task | Complexity | Lines of Code | Notes |
|------|------------|---------------|-------|
| Install dependencies | Low | N/A | 3 npm install commands |
| Convex schema extension | Low | ~30 lines | Add fields to users table |
| convex/vendorFiles.ts | Medium | ~150 lines | Similar to dealFiles.ts |
| convex/vendors.ts | Medium | ~200 lines | Queries + mutations for approval |
| VendorRegistrationWizard | High | ~400 lines | Multi-step form, validation, file upload |
| AdminPendingVendors | Medium | ~150 lines | List view, approve/reject actions |
| VendorDashboard | High | ~300 lines | Timeline, statistics, client list |
| i18n translations | Low | ~50 keys | EN + HE messages |

## Sources

### Official Documentation (HIGH confidence)
- [Convex File Storage](https://docs.convex.dev/file-storage) - Upload pattern, storage.getUrl
- [Convex Uploading Files](https://docs.convex.dev/file-storage/upload-files) - generateUploadUrl mutation
- [react-dropzone npm](https://www.npmjs.com/package/react-dropzone) - v14.3.8 confirmed
- [react-chrono npm](https://www.npmjs.com/package/react-chrono) - v3.3.3 confirmed
- [recharts npm](https://www.npmjs.com/package/recharts) - v3.6.0 confirmed
- [next-intl Form Validation](https://next-intl.dev/docs/workflows/messages) - Zod integration
- [Clerk Webhooks](https://clerk.com/docs/guides/development/webhooks/overview) - Role events

### Community Sources (MEDIUM confidence)
- [Shadcn Dropzone Component](https://www.shadcn.io/components/forms/dropzone) - Built on react-dropzone
- [Shadcn Multi-Step Form](https://shadcnstudio.com/blocks/dashboard-and-application/multi-step-form) - Pattern reference
- [Multi-Step Form with RHF — ClarityDev](https://claritydev.net/blog/build-a-multistep-form-with-react-hook-form)
- [Multi-Step Form with Zod — LogRocket](https://blog.logrocket.com/building-reusable-multi-step-form-react-hook-form-zod/)
- [Next.js 15 File Upload — Strapi](https://strapi.io/blog/epic-next-js-15-tutorial-part-5-file-upload-using-server-actions)

## Summary

**Total new dependencies:** 3
1. react-dropzone@^14.3.8 (file upload UX)
2. react-chrono@^3.3.3 (timeline visualization)
3. recharts@^3.6.0 (upgrade for statistics)

**Not adding:**
- Multi-step form library (use react-hook-form directly)
- External file upload service (Convex storage sufficient)
- Dashboard UI library (Shadcn/ui + targeted charts sufficient)
- Notification service (Convex + Clerk webhooks sufficient)

**Confidence:** HIGH - All recommended libraries are well-maintained, widely adopted, and integrate cleanly with existing stack. File upload pattern is proven in dealFiles.ts. Form pattern is proven in ContactPageContent.tsx. i18n + Zod pattern is proven. Admin role checks follow existing authorization patterns.

**Rationale:** Maximize leverage of existing stack while adding minimal, targeted libraries for specific capabilities (drag-drop, timeline, charts) that would be time-intensive to build custom.
