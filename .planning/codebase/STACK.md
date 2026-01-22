# Technology Stack

**Analysis Date:** 2026-01-22

## Languages

**Primary:**
- TypeScript 5 - Full codebase including frontend components, backend functions, and configuration files
- JSX/TSX - React components throughout `src/components` and `src/app`

**Secondary:**
- JavaScript (ES2017 target) - Configuration files and build tooling

## Runtime

**Environment:**
- Node.js (compatible with npm, yarn, pnpm, and bun)

**Package Manager:**
- npm - Primary package manager
- Lockfile: `package-lock.json` present (464KB)

## Frameworks

**Core:**
- Next.js 16.1.1 - Full-stack React framework with App Router
  - Entry points: `src/app/[locale]/layout.tsx` (internationalization root), `src/app/[locale]/Providers.tsx`
  - Image optimization configured in `next.config.ts`
  - next-intl 4.7.0 - Internationalization plugin for Next.js (supports English and Hebrew)

**Frontend UI:**
- React 19.2.3 - UI library
- React DOM 19.2.3 - DOM rendering

**UI Components & Styling:**
- Radix UI - Comprehensive unstyled component library (@radix-ui/* packages)
  - Dialog, dropdown, tabs, accordion, select, popover, tooltip, slider, checkbox, switch, radio group, and more
- Tailwind CSS 4 - Utility-first CSS framework
- @tailwindcss/postcss - PostCSS integration for Tailwind
- shadcn/ui - Component library built on Radix UI and Tailwind (configured in `components.json`)
  - Icon library: hugeicons (via @hugeicons/react, @hugeicons/core-free-icons)
- class-variance-authority 0.7.1 - CSS class composition utility
- tailwind-merge 3.4.0 - Merge Tailwind CSS classes intelligently
- clsx 2.1.1 - Conditional className construction

**Animation & Interaction:**
- framer-motion 12.26.2 - Motion and animation library
- react-resizable-panels 4.4.0 - Resizable panel components
- embla-carousel-react 8.6.0 - Carousel/slider component
- react-simple-pull-to-refresh 1.3.4 - Pull-to-refresh gesture support
- react-day-picker 9.13.0 - Calendar component (used by date picker)
- input-otp 1.4.2 - OTP input component
- vaul 1.1.2 - Drawer/modal component
- cmdk 1.1.1 - Command menu component
- react-markdown 10.1.0 - Markdown rendering
- react-syntax-highlighter 16.1.0 - Code syntax highlighting
- react-leaflet 5.0.0 - Leaflet map integration
- leaflet 1.9.4 - JavaScript mapping library
- recharts 2.15.4 - Chart and graph library

**Form & Validation:**
- react-hook-form 7.71.0 - Lightweight form state management
- @hookform/resolvers 5.2.2 - Validation resolvers for react-hook-form
- zod 4.3.5 - TypeScript-first schema validation

**Utilities:**
- date-fns 4.1.0 - Date manipulation and formatting
- lodash.debounce 4.0.8 - Debouncing utility
- sonner 2.0.7 - Toast notification library
- next-themes 0.4.6 - Dark mode theme management

**Testing & Build:**
- tsx 4.21.0 - TypeScript execution for Node.js
- tw-animate-css 1.4.0 - Tailwind animation utilities
- ESLint 9 - Code linting
- eslint-config-next 16.1.1 - Next.js ESLint configuration

## Backend & Database

**Backend Runtime:**
- Convex 1.31.3 - Backend-as-a-service platform
  - Real-time database with TypeScript API
  - Authentication integration with Clerk
  - Storage for file uploads (deal files)
  - Deployment: dev:famous-hornet-556 team project

**AI & Agent Framework:**
- @convex-dev/agent 0.3.2 - Convex agent framework for AI agents
- @ai-sdk/anthropic 2.0.57 - Anthropic SDK for Vercel AI
- @anthropic-ai/sdk 0.71.2 - Anthropic Claude API client
  - Model used: claude-sonnet-4-20250514 (via investorAssistant agent)
- ai 5.0.123 - Vercel AI SDK (framework for LLM integration)

**Helper Libraries:**
- convex-helpers 0.1.111 - Utility helpers for Convex

## Authentication

**Auth Provider:**
- Clerk - User authentication and management
  - Integration: `@clerk/nextjs` 6.36.7 - Next.js middleware and client
  - JWT issuer domain configured in `CLERK_JWT_ISSUER_DOMAIN`
  - Convex auth configured in `convex/auth.config.ts` with Clerk domain

## Data Storage

**Primary Database:**
- Convex Backend Database - Real-time, TypeScript-first database
  - Tables defined in `convex/schema.ts`
  - Main tables: users, investorProfiles, serviceProviderProfiles, properties, deals, messages, conversations, notifications, directMessages, aiThreads, and more
  - Indexes and search indexes for optimized queries

**File Storage:**
- Convex Storage - File storage integration
  - Used for deal file uploads (`dealFiles` table with `storageId: v.id("_storage")`)

**Search:**
- Convex Search Indexes - Full-text search on select tables
  - Implemented on users table for name search with role/onboarding filters

## Configuration

**Environment:**
- `.env.local` file (not committed) for local development
- Key configurations:
  - `CONVEX_DEPLOYMENT` - Convex project deployment ID
  - `NEXT_PUBLIC_CONVEX_URL` - Convex backend URL
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk public key
  - `CLERK_SECRET_KEY` - Clerk private key
  - `CLERK_JWT_ISSUER_DOMAIN` - Clerk JWT issuer domain

**Build Configuration:**
- `tsconfig.json` - TypeScript configuration with path alias `@/*: ./src/*`
- `next.config.ts` - Next.js configuration
  - Image optimization for `images.unsplash.com`
  - next-intl plugin for internationalization
- `eslint.config.mjs` - ESLint configuration with Next.js presets (core-web-vitals, typescript)
- `postcss.config.mjs` - PostCSS configuration with Tailwind CSS
- `components.json` - shadcn/ui component configuration (Tailwind aliases, hugeicons)

## Platform Requirements

**Development:**
- Node.js runtime
- npm, yarn, pnpm, or bun package manager
- TypeScript knowledge
- Convex CLI for local backend development (`npx convex dev`)

**Production:**
- Deployment target: Vercel (implied by Next.js stack and next-themes)
- Convex backend hosting (cloud-based)
- Clerk authentication (cloud-based)

**Development Commands:**
- `npm run dev` - Start Next.js development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

---

*Stack analysis: 2026-01-22*
