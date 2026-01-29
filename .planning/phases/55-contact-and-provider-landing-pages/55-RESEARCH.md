# Phase 55: Contact & Provider Landing Pages - Research

**Researched:** 2026-01-29
**Domain:** Next.js forms with Convex backend, i18n static pages, JSON-LD structured data
**Confidence:** HIGH

## Summary

Phase 55 implements contact form submission to Convex and service provider landing pages with static generation. The phase is **partially complete** — UI exists but missing critical functionality: Convex mutations for contact form, react-hook-form + Zod validation, honeypot anti-spam, URL parameter pre-selection, thank-you page redirect, and JSON-LD structured data for provider pages.

The codebase already has established patterns for this exact stack: `ContactFormSection.tsx` (landing page) demonstrates react-hook-form + Zod + Convex mutation pattern. Contact and provider pages exist with i18n, metadata, and styling, but use basic HTML validation instead of the required validation stack.

**Primary recommendation:** Follow the existing `ContactFormSection.tsx` pattern exactly — use react-hook-form with zodResolver, Zod v4 schema, Convex useMutation, and add honeypot field with CSS-based hiding. Create Convex contactSubmissions table modeled after leads table. Use Next.js Script component for JSON-LD (already used in pricing page). Use useSearchParams with Suspense boundary for URL parameter handling (Next.js 15 requirement).

## Standard Stack

The project uses an established stack — all dependencies already installed.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | ^7.71.0 | Form state management | Already used in landing ContactFormSection, industry standard for complex forms |
| zod | ^4.3.5 | Schema validation | v4 already in use, TypeScript-first validation, integrates with RHF |
| @hookform/resolvers | ^5.2.2 | RHF + Zod integration | Connects Zod schemas to react-hook-form validation |
| Convex | ^1.31.3 | Backend mutations | Project's backend, `api.leads.submitLead` pattern exists |
| next-intl | ^4.7.0 | Internationalization | EN/HE already configured, i18n messages exist |
| framer-motion | ^12.26.2 | Animations | Used in existing contact/provider pages |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Shadcn/ui Form | Built-in | Form components | FormField, FormItem, FormLabel, FormControl, FormMessage wrappers |
| Next.js Script | Built-in (Next 16.1.1) | JSON-LD injection | Already used in pricing page for structured data |
| useSearchParams | Built-in | URL parameters | Reading ?subject= parameter (requires Suspense boundary in Next.js 15) |
| useRouter | Built-in | Client navigation | Redirect to /contact/thank-you after submission |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| react-hook-form | Formik, React Final Form | RHF already project standard, better TypeScript, smaller bundle |
| Zod | Yup, Joi | Zod v4 already in use, TypeScript-native inference |
| Convex mutation | Next.js Server Actions | Convex is project backend, Server Actions would require rearchitecture |
| next-intl | next-translate, react-i18next | next-intl already configured for EN/HE |

**Installation:**
```bash
# All dependencies already installed
# Verify with: npm list react-hook-form zod @hookform/resolvers
```

## Architecture Patterns

### Recommended Project Structure
```
src/app/[locale]/(main)/contact/
├── page.tsx                    # Server component with generateMetadata
├── ContactPageContent.tsx      # Client component with form (needs update)
└── thank-you/
    └── page.tsx                # New: thank-you page

src/app/[locale]/(main)/services/[type]/
├── page.tsx                    # Server component with generateMetadata + JSON-LD
└── ProviderPageContent.tsx     # Client component (already exists)

convex/
├── contactSubmissions.ts       # New: contact form mutations/queries
└── schema.ts                   # Add contactSubmissions table

messages/
├── en.json                     # Update contact.form.subjects, add thank-you
└── he.json                     # Hebrew translations
```

### Pattern 1: Contact Form with Convex Mutation
**What:** Client component using react-hook-form + Zod + Convex mutation, following landing ContactFormSection pattern
**When to use:** Any form that submits to Convex backend
**Example:**
```typescript
// Source: Codebase src/components/landing/ContactForm/ContactFormSection.tsx
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.enum(["general", "pricing", "support", "partnerships", "provider"]),
  message: z.string().min(1, "Message is required"),
  honeypot: z.string().max(0, "Invalid submission"), // Anti-spam
});

type FormValues = z.infer<typeof formSchema>;

export function ContactForm() {
  const submitContact = useMutation(api.contactSubmissions.submit);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: undefined,
      message: "",
      honeypot: "", // Hidden field
    },
  });

  async function onSubmit(values: FormValues) {
    try {
      await submitContact({
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        subject: values.subject,
        message: values.message,
      });
      router.push("/contact/thank-you");
    } catch (error) {
      form.setError("root", { message: "Failed to submit" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField control={form.control} name="name" render={...} />
        {/* Honeypot field - hidden with CSS */}
        <input
          type="text"
          name="honeypot"
          {...form.register("honeypot")}
          style={{ position: "absolute", left: "-9999px" }}
          tabIndex={-1}
          autoComplete="off"
        />
      </form>
    </Form>
  );
}
```

### Pattern 2: URL Parameter Pre-selection with Suspense
**What:** Read URL search params in client component with mandatory Suspense boundary (Next.js 15 requirement)
**When to use:** Reading ?subject=pricing or similar URL parameters
**Example:**
```typescript
// Source: Next.js 15 official docs - https://nextjs.org/docs/app/api-reference/functions/use-search-params
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function ContactFormInner() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get("subject");

  const form = useForm({
    defaultValues: {
      subject: subjectParam || "",
    },
  });

  // Update if param changes
  useEffect(() => {
    if (subjectParam) {
      form.setValue("subject", subjectParam);
    }
  }, [subjectParam]);
}

// Parent must wrap in Suspense (Next.js 15 build requirement)
export function ContactPageContent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ContactFormInner />
    </Suspense>
  );
}
```

### Pattern 3: Convex Mutation Definition
**What:** Define mutation in convex/ directory with Zod-like validators
**When to use:** Every form submission to Convex
**Example:**
```typescript
// Source: Codebase convex/leads.ts
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    subject: v.union(
      v.literal("general"),
      v.literal("pricing"),
      v.literal("support"),
      v.literal("partnerships"),
      v.literal("provider")
    ),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const submissionId = await ctx.db.insert("contactSubmissions", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      subject: args.subject,
      message: args.message,
      createdAt: Date.now(),
    });
    return { submissionId };
  },
});
```

### Pattern 4: JSON-LD Structured Data with Next.js Script
**What:** Inject JSON-LD structured data using Next.js Script component in page.tsx
**When to use:** SEO structured data for service pages
**Example:**
```typescript
// Source: Codebase src/app/[locale]/(main)/pricing/page.tsx + schema.org
import Script from "next/script";

export default function ProviderPage({ params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": "Real Estate Broker Services",
    "provider": {
      "@type": "Organization",
      "name": "REOS",
    },
    "areaServed": {
      "@type": "Country",
      "name": "Israel",
    },
    "description": "Connect with qualified US investors seeking Israeli property",
  };

  return (
    <>
      <Script
        id={`service-schema-${type}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <ProviderPageContent type={type} />
    </>
  );
}
```

### Pattern 5: Server Metadata with next-intl
**What:** Generate metadata in server page.tsx using next-intl translations
**When to use:** Every page with i18n metadata
**Example:**
```typescript
// Source: Codebase src/app/[locale]/(main)/contact/page.tsx
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact.meta" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale: locale === "he" ? "he_IL" : "en_US",
      type: "website",
    },
    alternates: {
      languages: {
        en: "/en/contact",
        he: "/he/contact",
      },
    },
  };
}
```

### Pattern 6: Honeypot Anti-Spam Field
**What:** Hidden form field that bots fill but humans don't see, validated in schema
**When to use:** Any public-facing form to reduce spam
**Example:**
```typescript
// Source: https://dev.to/felipperegazio/how-to-create-a-simple-honeypot-to-protect-your-web-forms-from-spammers--25n8
// Zod schema
const formSchema = z.object({
  // ... other fields
  honeypot: z.string().max(0, "Invalid submission"), // Must be empty
});

// Form JSX
<input
  type="text"
  name="honeypot"
  {...form.register("honeypot")}
  style={{ position: "absolute", left: "-9999px" }}
  tabIndex={-1}
  autoComplete="off"
  aria-hidden="true"
/>

// Alternative CSS-based hiding
.honeypot {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
```

### Anti-Patterns to Avoid
- **Missing Suspense boundary with useSearchParams:** Next.js 15 build will fail if useSearchParams is called in a Client Component without Suspense wrapper
- **Permanent redirect to thank-you page:** Use router.push() not router.replace() so users can navigate back to form
- **Honeypot field with obvious name:** Don't name it "honeypot" — use "email_confirm" or "favorite_color" to trick bots
- **Client-side only validation:** Always validate on server (Convex mutation args) even with Zod on client
- **Using deprecated ProfessionalService schema:** Schema.org deprecated ProfessionalService type, use Service type instead
- **Hardcoded text in components:** All user-facing text must use next-intl translations for EN/HE support

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form validation | Custom validation logic | react-hook-form + Zod | Type safety, error handling, touched/dirty state, already project standard |
| Form UI components | Custom input wrappers | Shadcn/ui Form components | Accessibility, error display, consistent styling, already in codebase |
| Spam prevention | Custom CAPTCHA or rate limiting | Honeypot field | Invisible to users, zero friction, effective against basic bots |
| i18n translations | Template literals with conditionals | next-intl with namespaced JSON | Type-safe, server/client support, already configured for EN/HE |
| Client-side routing | window.location or manual navigation | Next.js useRouter | Preserves client state, prefetching, proper back button behavior |
| JSON-LD injection | Manual script tag manipulation | Next.js Script component | Proper SSR, deduplication, priority control |
| URL parameter reading | window.location.search parsing | Next.js useSearchParams | Type-safe, SSR-compatible, requires Suspense boundary in Next.js 15 |

**Key insight:** The codebase already has working reference implementations (`ContactFormSection.tsx`, `pricing/page.tsx`, `services/[type]/page.tsx`). Don't reinvent — copy and modify existing patterns.

## Common Pitfalls

### Pitfall 1: Next.js 15 Suspense Requirement with useSearchParams
**What goes wrong:** Build fails with "Missing Suspense boundary with useSearchParams" error in production
**Why it happens:** Next.js 15 requires Client Components that use useSearchParams to be wrapped in Suspense boundary during static generation
**How to avoid:** Always wrap the component calling useSearchParams in a parent Suspense component
**Warning signs:** Local dev works but production build fails, error mentions useSearchParams and Suspense
**Source:** https://nextjs.org/docs/app/api-reference/functions/use-search-params

### Pitfall 2: Honeypot Field Visible to Users
**What goes wrong:** Hidden honeypot field becomes visible due to CSS frameworks or accessibility tools
**Why it happens:** Using display:none or visibility:hidden can be detected by bots, but position:absolute with negative coordinates works better
**How to avoid:** Use `position: absolute; left: -9999px` and add `tabIndex={-1}` and `autoComplete="off"` to prevent tab navigation
**Warning signs:** Users report seeing extra fields, accessibility audits flag hidden inputs
**Source:** https://dev.to/felipperegazio/how-to-create-a-simple-honeypot-to-protect-your-web-forms-from-spammers--25n8

### Pitfall 3: Schema.org ProfessionalService Deprecation
**What goes wrong:** Using @type: "ProfessionalService" in JSON-LD may not be recognized by search engines
**Why it happens:** Schema.org deprecated ProfessionalService in favor of the general Service type with serviceType property
**How to avoid:** Use `"@type": "Service"` with `"serviceType": "Real Estate Broker Services"` property
**Warning signs:** Google Search Console warnings about unrecognized types, rich results not appearing
**Source:** https://schema.org/ProfessionalService (shows deprecation notice)

### Pitfall 4: Router Navigation Before Mutation Completes
**What goes wrong:** Redirect to thank-you page happens before Convex mutation finishes, data not saved
**Why it happens:** Not awaiting the mutation promise before calling router.push()
**How to avoid:** Always `await submitContact(...)` before `router.push("/thank-you")`
**Warning signs:** Thank-you page shows but submissions don't appear in Convex dashboard, intermittent save failures

### Pitfall 5: Hardcoded Subject Values Not Matching URL Parameters
**What goes wrong:** URL parameter ?subject=pricing doesn't match form dropdown options, pre-selection fails
**Why it happens:** URL parameter values don't match Zod enum values exactly (case sensitivity, hyphens vs underscores)
**How to avoid:** Define subject values as constants, use same values in Zod schema, i18n keys, and URL parameters
**Warning signs:** Pre-selection from URL doesn't work, form validation errors on submit

### Pitfall 6: Convex Mutation Args Mismatch with Client Schema
**What goes wrong:** Client form submits successfully but Convex mutation rejects with validation error
**Why it happens:** Zod schema on client doesn't match Convex `v.` validators exactly (e.g., optional fields, enum values)
**How to avoid:** Keep Zod schema and Convex mutation args in sync, test both client and server validation
**Warning signs:** Console errors about Convex validation, successful submit animation but no data saved

## Code Examples

Verified patterns from official sources and codebase:

### Contact Form Submission Flow
```typescript
// Complete flow: form setup → validation → submission → redirect
// Source: Codebase ContactFormSection.tsx + Next.js docs

"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.enum(["general", "pricing", "support", "partnerships", "provider"]),
  message: z.string().min(1, "Message is required"),
  honeypot: z.string().max(0, "Invalid submission"),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export function ContactForm() {
  const router = useRouter();
  const submitContact = useMutation(api.contactSubmissions.submit);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "general",
      message: "",
      honeypot: "",
    },
  });

  const { isSubmitting } = form.formState;

  async function onSubmit(values: ContactFormValues) {
    try {
      await submitContact({
        name: values.name,
        email: values.email,
        phone: values.phone || undefined,
        subject: values.subject,
        message: values.message,
      });
      router.push("/contact/thank-you");
    } catch (error) {
      console.error("Failed to submit contact:", error);
      form.setError("root", {
        message: "Failed to submit. Please try again.",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a subject" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="general">General inquiry</SelectItem>
                  <SelectItem value="pricing">Sales & pricing</SelectItem>
                  <SelectItem value="support">Technical support</SelectItem>
                  <SelectItem value="partnerships">Partnerships</SelectItem>
                  <SelectItem value="provider">Become a provider</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea placeholder="Tell us how we can help..." rows={4} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Honeypot anti-spam field */}
        <input
          type="text"
          {...form.register("honeypot")}
          style={{ position: "absolute", left: "-9999px" }}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        {form.formState.errors.root && (
          <p className="text-sm text-destructive">{form.formState.errors.root.message}</p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            "Send message"
          )}
        </Button>
      </form>
    </Form>
  );
}
```

### URL Parameter Pre-selection with Suspense
```typescript
// Read ?subject=pricing from URL and pre-select dropdown
// Source: Next.js 15 docs - https://nextjs.org/docs/app/api-reference/functions/use-search-params

"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { useForm } from "react-hook-form";

function ContactFormWithParams() {
  const searchParams = useSearchParams();
  const subjectParam = searchParams.get("subject");

  const form = useForm({
    defaultValues: {
      subject: subjectParam || "general",
    },
  });

  // Update if URL param changes
  useEffect(() => {
    if (subjectParam && ["general", "pricing", "support", "partnerships", "provider"].includes(subjectParam)) {
      form.setValue("subject", subjectParam);
    }
  }, [subjectParam, form]);

  return <ContactForm form={form} />;
}

// Parent component MUST wrap in Suspense (Next.js 15 requirement)
export function ContactPageContent() {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <ContactFormWithParams />
    </Suspense>
  );
}
```

### Convex ContactSubmissions Backend
```typescript
// convex/contactSubmissions.ts
// Source: Codebase convex/leads.ts pattern

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    subject: v.union(
      v.literal("general"),
      v.literal("pricing"),
      v.literal("support"),
      v.literal("partnerships"),
      v.literal("provider")
    ),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const submissionId = await ctx.db.insert("contactSubmissions", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      subject: args.subject,
      message: args.message,
      createdAt: Date.now(),
    });
    return { submissionId };
  },
});

export const listSubmissions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const submissions = await ctx.db
      .query("contactSubmissions")
      .withIndex("by_created")
      .order("desc")
      .take(limit);

    return submissions;
  },
});
```

### Convex Schema Table Definition
```typescript
// convex/schema.ts - add to existing schema
// Source: Codebase convex/schema.ts leads table pattern

contactSubmissions: defineTable({
  name: v.string(),
  email: v.string(),
  phone: v.optional(v.string()),
  subject: v.union(
    v.literal("general"),
    v.literal("pricing"),
    v.literal("support"),
    v.literal("partnerships"),
    v.literal("provider")
  ),
  message: v.string(),
  createdAt: v.number(),
})
  .index("by_email", ["email"])
  .index("by_created", ["createdAt"])
  .index("by_subject", ["subject"]),
```

### Provider Page JSON-LD Structured Data
```typescript
// src/app/[locale]/(main)/services/[type]/page.tsx
// Source: Schema.org Service type + codebase pricing page pattern

import Script from "next/script";
import { getTranslations } from "next-intl/server";

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale, type } = await params;
  const t = await getTranslations({ locale, namespace: `services.providers.${type}` });

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": t("name"), // e.g., "Real Estate Broker"
    "provider": {
      "@type": "Organization",
      "name": "REOS",
      "url": "https://reos.co",
    },
    "areaServed": {
      "@type": "Country",
      "name": "Israel",
    },
    "description": t("meta.description"),
    "audience": {
      "@type": "Audience",
      "audienceType": "US Real Estate Investors",
    },
  };

  return (
    <>
      <Script
        id={`service-schema-${type}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <ProviderPageContent type={type} />
    </>
  );
}
```

### Provider CTA with Pre-selected Role
```typescript
// Link to sign-up with role parameter
// Source: Codebase pattern + Next.js Link component

import Link from "next/link";
import { useLocale } from "next-intl";

function ProviderCTA({ type }: { type: string }) {
  const locale = useLocale();

  // Map provider type to role parameter
  const roleMap: Record<string, string> = {
    "broker": "broker",
    "mortgage-advisor": "mortgage_advisor",
    "lawyer": "lawyer",
    // ... other types
  };

  const role = roleMap[type] || "broker";

  return (
    <Link
      href={`/${locale}/sign-up?role=${role}`}
      className="inline-flex items-center justify-center px-8 py-3 bg-white text-[#050A12] rounded-full"
    >
      Get started free
    </Link>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ProfessionalService schema.org type | Service type with serviceType property | Deprecated in 2024 | Use Service type to avoid schema warnings |
| display:none for honeypot | position:absolute with negative left | Ongoing best practice | Harder for bots to detect, better accessibility |
| Formik | react-hook-form | Industry shift ~2020-2022 | Better TypeScript support, smaller bundle, faster re-renders |
| Yup validation | Zod validation | Gained popularity 2022-2024 | TypeScript-native, better inference, v4 adds new features |
| Manual searchParams parsing | useSearchParams hook | Next.js 13+ App Router | Type-safe, requires Suspense in Next.js 15 |
| redirect() in Server Actions | router.push() in client | Depends on use case | Client-side redirect preserves form state for back navigation |

**Deprecated/outdated:**
- **@type: "ProfessionalService"**: Schema.org deprecated this type, use "Service" instead
- **Pages Router getServerSideProps**: App Router uses async params and generateMetadata
- **window.location.search**: Use Next.js useSearchParams for type safety and SSR compatibility

## Open Questions

Things that couldn't be fully resolved:

1. **Thank-you page design requirements**
   - What we know: CONTEXT.md says "redirect to /contact/thank-you" but doesn't specify design
   - What's unclear: Should it be minimal text or match contact page styling? Include back-to-home link?
   - Recommendation: Follow pricing page pattern — simple centered message with back link, use same dark hero styling as contact page for consistency

2. **Social media link icon selection**
   - What we know: CONTEXT.md says "social media links shown as icons" but doesn't specify which platforms
   - What's unclear: LinkedIn, Twitter/X confirmed — but Facebook, Instagram, GitHub?
   - Recommendation: Check if social links exist elsewhere in codebase, otherwise use LinkedIn + Twitter/X (B2B focus)

3. **Response time estimate text**
   - What we know: CONTEXT.md says "We typically respond within 24 hours" in requirements
   - What's unclear: Is this 24 hours or "one business day"? Needs i18n translation
   - Recommendation: Use "one business day" for clarity, add to contact.info i18n namespace

4. **Provider page stats/testimonials data source**
   - What we know: Provider pages should show "stats counters" and "testimonial quotes"
   - What's unclear: Are these real data from Convex or placeholder i18n content?
   - Recommendation: Use i18n placeholder content initially (like current implementation), can be upgraded to Convex data later

5. **Alternative contact methods phone/email**
   - What we know: Display email + phone alongside form
   - What's unclear: Are these real contact details or placeholders? Current code shows hello@reos.co and +972-3-000-0000
   - Recommendation: Verify with team if these are production contact details or need updating

## Sources

### Primary (HIGH confidence)
- Codebase: `/src/components/landing/ContactForm/ContactFormSection.tsx` - react-hook-form + Zod + Convex pattern
- Codebase: `/convex/leads.ts` - Convex mutation pattern
- Codebase: `/src/app/[locale]/(main)/pricing/page.tsx` - JSON-LD with Script component
- Codebase: `/src/app/[locale]/(main)/services/[type]/page.tsx` - generateStaticParams pattern
- Codebase: `/src/components/ui/form.tsx` - Shadcn/ui Form components
- [Next.js useSearchParams Docs](https://nextjs.org/docs/app/api-reference/functions/use-search-params) - Official Next.js 15 documentation
- [Schema.org Service Type](https://schema.org/Service) - Official schema.org documentation
- [Shadcn/ui React Hook Form Docs](https://ui.shadcn.com/docs/forms/react-hook-form) - Official Shadcn integration guide

### Secondary (MEDIUM confidence)
- [Next.js 15 Form Handling with RHF + Zod](https://www.abstractapi.com/guides/email-validation/type-safe-form-validation-in-next-js-15-with-zod-and-react-hook-form) - Type-safe form validation guide (2025)
- [Next.js Redirect Guide](https://www.turing.com/kb/nextjs-redirect) - Client vs server redirect patterns
- [Honeypot Anti-Spam Tutorial](https://dev.to/felipperegazio/how-to-create-a-simple-honeypot-to-protect-your-web-forms-from-spammers--25n8) - Implementation best practices
- [Next.js JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld) - Official structured data guide

### Tertiary (LOW confidence)
- [Honeypot in Next.js Medium Article](https://medium.com/@zainshahza/honey-potting-in-next-js-acfd80eb8010) - Implementation example (not verified with production code)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies verified in package.json, patterns exist in codebase
- Architecture: HIGH - Existing implementations found for all patterns (ContactFormSection, pricing page, services pages)
- Pitfalls: HIGH - Verified with official Next.js 15 docs (Suspense requirement), schema.org (Service type), codebase patterns

**Research date:** 2026-01-29
**Valid until:** 2026-02-28 (30 days - stable stack, Next.js 15 patterns unlikely to change)

**Phase status:** Partially implemented
- ✅ Contact page UI with i18n and metadata
- ✅ Provider pages UI with generateStaticParams
- ✅ Services index page
- ❌ Contact form Convex mutation (no backend submission)
- ❌ react-hook-form + Zod validation (uses HTML validation only)
- ❌ Honeypot anti-spam field
- ❌ URL parameter pre-selection
- ❌ Thank-you page at /contact/thank-you
- ❌ JSON-LD structured data on provider pages
- ❌ Provider CTA role pre-selection in sign-up link
