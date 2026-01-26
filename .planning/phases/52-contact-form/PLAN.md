# Phase 52: Contact Form & Polish

## Goal
Users can submit their information and page works flawlessly on all devices

## Success Criteria
1. Contact form captures name, email, and investor type
2. Form shows validation errors for invalid/missing fields
3. Success state confirms submission with clear feedback
4. Form submission persists lead data to Convex backend
5. All sections display correctly on mobile (320px+), tablet, and desktop
6. Scroll-triggered animations work smoothly across all sections
7. Section transitions are smooth without jank or layout shift

## Tasks

### Task 1: Create ContactForm Component
- [ ] Create `src/components/landing/ContactForm/` directory structure
- [ ] Create `ContactFormSection.tsx` with form layout and validation
- [ ] Create `index.ts` barrel export
- [ ] Use react-hook-form + zod for validation
- [ ] Fields: name, email, investor type (select), optional phone, message
- [ ] Success/error states with animations

### Task 2: Add Convex Leads Schema & Mutation
- [ ] Add `leads` table to `convex/schema.ts`
- [ ] Create `convex/leads.ts` with `submitLead` mutation
- [ ] Fields: name, email, investorType, phone?, message?, createdAt

### Task 3: Add Translations
- [ ] Add `contactForm` section to `messages/en.json`
- [ ] Add `contactForm` section to `messages/he.json`
- [ ] Include field labels, placeholders, validation errors, success message

### Task 4: Integrate into Landing Page
- [ ] Import and add `ContactFormSection` to landing page
- [ ] Position before FAQ section
- [ ] Add `id="contact"` for navbar CTA anchor

## Files to Create/Modify
- `src/components/landing/ContactForm/ContactFormSection.tsx` (new)
- `src/components/landing/ContactForm/index.ts` (new)
- `convex/schema.ts` (modify - add leads table)
- `convex/leads.ts` (new)
- `messages/en.json` (modify - add contactForm)
- `messages/he.json` (modify - add contactForm)
- `src/app/[locale]/(main)/page.tsx` (modify - add section)

## Dependencies
- react-hook-form (likely installed)
- @hookform/resolvers (for zod)
- zod (likely installed)
