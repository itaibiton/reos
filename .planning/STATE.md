# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-17)

**Core value:** Deal flow tracking from interest to close.
**Current focus:** v1.3 Social Feed & Global Community — feed, social interactions, user profiles

## Current Position

Milestone: v1.3 Social Feed & Global Community
Phase: 27 of 27 (Global Discovery)
Plan: 5 of 5 complete
Status: Phase complete
Last activity: 2026-01-19 — Completed 27-05-PLAN.md (Discover Page UI)

Progress: ██████████ 100% (18/18 plans)

## Performance Metrics

**Velocity:**
- Total plans completed: 69
- Average duration: 6.2 min
- Total execution time: 7.2 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 1 | 2/2 | 10 min | 5 min |
| 1.1 | 1/1 | 8 min | 8 min |
| 1.2 | 1/1 | 12 min | 12 min |
| 1.3 | 1/1 | 15 min | 15 min |
| 2 | 3/3 | 25 min | 8 min |
| 3 | 4/4 | 30 min | 7.5 min |
| 4 | 4/4 | 20 min | 5 min |
| 4.1 | 1/1 | 3 min | 3 min |
| 5 | 3/3 | 21 min | 7 min |
| 5.1 | 1/1 | 12 min | 12 min |
| 5.2 | 1/1 | 18 min | 18 min |
| 5.3 | 2/2 | 48 min | 24 min |
| 5.4 | 3/3 | 26 min | 8.7 min |
| 6 | 5/5 | 27 min | 5.4 min |
| 6.1 | 3/3 | 15 min | 5 min |
| 7 | 3/3 | 13 min | 4.3 min |
| 8 | 2/2 | 14 min | 7 min |
| 9 | 1/1 | 5 min | 5 min |
| 10 | 1/1 | 5 min | 5 min |
| 11 | 1/1 | 3 min | 3 min |
| 12 | 1/1 | 4 min | 4 min |
| 13 | 1/1 | 3 min | 3 min |
| 14 | 1/1 | 4 min | 4 min |
| 15 | 2/2 | 8 min | 4 min |
| 16 | 1/1 | 12 min | 12 min |
| 16.3 | 2/2 | 7 min | 3.5 min |
| 17 | 2/2 | 10 min | 5 min |
| 18 | 2/2 | 10 min | 5 min |
| 19 | 1/1 | 12 min | 12 min |
| 20 | 2/2 | 18 min | 9 min |

| 21 | 2/2 | 7 min | 3.5 min |
| 22 | 2/2 | 4 min | 2 min |
| 23 | 2/2 | 3.5 min | 1.75 min |
| 24 | 3/3 | 7 min | 2.3 min |
| 25 | 2/2 | 6 min | 3 min |
| 26 | 2/2 | 4 min | 2 min |
| 27 | 5/5 | 12 min | 2.4 min |

**Recent Trend:**
- Last 5 plans: 2 min, 2 min, 3 min, 3 min, 2 min
- Trend: Phase 27 complete - 72 plans total, Milestone v1.3 complete

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Phase 1: Used Tailwind v4 (Shadcn auto-detected)
- Phase 1: Convex project created as "reos"
- Phase 1: Sidebar overlay pattern for mobile
- Phase 1.1: Hugeicons for custom components, lucide-react for Shadcn internals
- Phase 1.1: Inter font, small radius (0.25rem) for compact design
- Phase 1.2: Installed all 53 Shadcn components upfront
- Phase 1.3: CSS override for Radix scroll-lock (body[data-scroll-locked] with overflow: visible)
- Phase 2: ConvexProviderWithClerk for auth integration
- Phase 2: Route groups: (main) public, (auth) auth pages, (app) protected
- Phase 2: User roles: investor, broker, mortgage_advisor, lawyer
- Phase 3: Two-column layout for profile forms (lg:grid-cols-2)
- Phase 3: Shared constants in src/lib/constants.ts for profile options
- Phase 3: MultiSelectPopover uses native CSS scrolling
- Phase 4: USD/ILS rate as constant (3.7) for MVP, not live API
- Phase 4: All authenticated users can create properties (no admin restriction for MVP)
- Phase 4: Page layout uses `<div className="p-6">` — content starts at top, no centering/max-width
- Phase 4.1: PropertyForm uses props (mode, propertyId, initialData) for create/edit behavior
- Phase 4.1: Edit pages at /resource/[id]/edit route pattern
- Phase 4: PropertyCard component pattern with investment metrics display
- Phase 4: Currency formatting with Intl.NumberFormat for USD/ILS
- Phase 4: Skeleton loaders matching card structure for smooth loading
- Phase 4: SaveButton variants: "default" (full-width) and "overlay" (compact circle)
- Phase 4: Compound index by_user_and_property for fast favorite lookups
- Phase 4: Detail page two-column layout with sticky right sidebar
- Phase 5: Claude 3 Haiku for search parsing (speed/cost efficiency)
- Phase 5: Convex action for external API calls (not query/mutation)
- Phase 5: Graceful error handling returns empty filters (fallback to all properties)
- Phase 5: In-memory filtering after by_status index (Convex single-index constraint)
- Phase 5: Properties with undefined values excluded when filters active
- Phase 5.1: Popover for filter panel (not Collapsible)
- Phase 5.1: Filters require Apply button (draft state pattern)
- Phase 5.1: Sentinel value `__any__` for Radix Select empty state
- Phase 5.2: viewingAsRole field separate from role for admin impersonation
- Phase 5.2: effectiveRole = viewingAsRole ?? role pattern for role-aware UI
- Phase 5.2: Role-based Sidebar navigation (different items per role)
- Phase 5.2: Property card image height h-48 (192px)
- Phase 5.3: OpenStreetMap tiles (free, no API key required)
- Phase 5.3: Dynamic import with ssr:false for Leaflet SSR compatibility
- Phase 5.3: Marker icons from unpkg CDN (avoids bundler issues)
- Phase 5.3: Thumbnail row for carousel navigation (better UX than dots)
- Phase 5.3: Map at 320px width on marketplace, at top on detail page
- Phase 5.4: Tabbed interface for property detail (Overview, Amenities, Investment, Area)
- Phase 5.4: InvestorSearchBar uses full-width search input (no expand/collapse)
- Phase 5.4: Mobile filters use Sheet component as bottom drawer
- Phase 5.4: AppShell investor layout uses h-screen flex flex-col for proper stacking
- Phase 6: Request status uses 4-state union (pending, accepted, declined, cancelled)
- Phase 6: Provider acceptance auto-assigns to deal field (brokerId/mortgageAdvisorId/lawyerId)
- Phase 6: Broker acceptance advances deal stage from "interest" to "broker_assigned"
- Phase 6: Provider recommendations match property city to provider serviceAreas
- Phase 6: File categories: contract, id_document, financial, legal, other
- Phase 6: File visibility: "all" (all participants) or "providers_only" (service providers only)
- Phase 6: Convex storage pattern: generateUploadUrl → POST file → saveFile with storageId
- Phase 6: Activity log captures all deal events (stage_change, file_uploaded, handoffs)
- Phase 6: Handoffs use existing serviceRequests for consistency
- Phase 6: Stage-to-provider mapping: broker_assigned→broker, mortgage→mortgage_advisor, legal→lawyer
- Phase 6: Stage progress as horizontal step indicator with completed/current/upcoming states
- Phase 6: Deal cards show property image, title, city, price, stage badge, provider count
- Phase 6: Four tabs on deal detail page: Overview, Providers, Files, Activity
- Phase 6: "Start Deal" button on property pages for investors (creates deal + redirects)
- Phase 6.1: ChatMessage component with own/other bubble styling (right/left aligned)
- Phase 6.1: ChatInput with Enter sends, Shift+Enter newline, auto-resize up to 4 lines
- Phase 6.1: ChatThread auto-scrolls to bottom, marks as read on mount
- Phase 6.1: ChatParticipantList with client-side unread count calculation
- Phase 6.1: Chat page uses deal selector dropdown + participant list sidebar (w-80)
- Phase 6.1: dnd-kit for drag-and-drop (not react-dnd), cleaner API
- Phase 6.1: Three layout modes: single (1 pane), split (2 cols), quad (2x2 grid)
- Phase 6.1: Panes state array of 4 slots, null for empty
- Phase 6.1: ChatPane component handles empty/filled states with droppable zones
- Phase 9: Role-aware onboarding: investors get onboardingStep=1, service providers complete immediately
- Phase 9: investorQuestionnaires table stores draft answers with status field (draft/complete)
- Phase 9: Gate logic in layout.tsx checks role + onboardingComplete for redirect decisions
- Phase 9: "Skip for now" button on questionnaire page for dev bypass
- Phase 10: QuestionnaireWizard with 1-based step indexing to match Convex currentStep field
- Phase 10: Conversational UI with QuestionBubble (assistant bubble) and AnswerArea (user input)
- Phase 10: Tailwind animate-in utilities for animations (no framer-motion)
- Phase 10: Keyboard navigation: Enter to continue, Escape to skip
- Phase 10: Barrel exports via @/components/questionnaire
- Phase 11: Step components follow value/onChange props pattern
- Phase 11: Local useState for UI, Convex sync on step change
- Phase 11: Draft restoration via useEffect on questionnaire load
- Phase 12: BudgetStep uses separate min/max props with individual onChange handlers
- Phase 12: GoalsStep uses checkbox multi-select with array state
- Phase 12: Currency formatting uses toLocaleString for display
- Phase 13: PropertySizeStep uses 4 individual onChange handlers (bedrooms min/max, area min/max)
- Phase 13: LocationStep uses 2-column grid for 15 Israeli cities
- Phase 13: AmenitiesStep uses 3-column grid for compact display of 15 amenities
- Phase 14: TimelineStep uses radio single-select with 4 purchase timeline options
- Phase 14: AdditionalPreferencesStep uses Textarea with 2000 char limit and character count
- Phase 14: ServicesStep uses checkbox multi-select for broker/mortgage_advisor/lawyer
- Phase 15: getByInvestorId access control: self-access OR provider assigned to shared deal
- Phase 15: InvestorQuestionnaireCard shows to providers only (not to investor viewing own deal)
- Phase 15: Label mappings kept inline in component for simplicity
- Phase 15: QuestionnaireWizard extended with editMode prop (hides skip, shows "Save Changes")
- Phase 15: Completeness calculation uses 15 required fields, excludes optional (bedrooms/area/amenities)
- Phase 16: Dashboard without map - full-width single-column layout
- Phase 16: Investors redirect to /properties (no investor dashboard)
- Phase 16: Active deals section shows 5 most recent with property/investor info
- Phase 16.1: Dashboard removed from investor sidebar navigation
- Phase 16.1: Favorites toggle in filter bar replaces /properties/saved page
- Phase 16.1: Provider sidebar spans full height with logo, header inline in main content
- Phase 16.1: Favorites use ?favorites=true URL param with conditional query
- Phase 16.3: Shadcn Sidebar with collapsible="icon" mode, SidebarRail for toggle
- Phase 16.3: Navigation config in src/lib/navigation.ts with getNavigationForRole()
- Phase 16.3: Extended UserRole type with 8 roles (including accountant, notary, tax_consultant, appraiser)
- Phase 16.3: SidebarProvider wraps provider layout, cookie persistence automatic
- Phase 16.3: ComingSoon component pattern for placeholder pages with Construction icon
- Phase 18: One review per deal per provider enforced in mutation (not database constraint)
- Phase 18: getPublicProfile returns all data in single query to minimize client roundtrips
- Phase 18: Portfolio shows last 5 completed deals sorted by most recent
- Phase 18: Provider listing uses tabs for type filtering (Broker/Mortgage/Lawyer)
- Phase 18: Provider cards show truncated lists with "+N more" overflow indicators
- Phase 18: Profile page two-column layout: About+Reviews (2/3) | Stats+Portfolio (1/3)
- Phase 18: Star rating component uses lucide-react Star icon with fill states
- Phase 19: Dashboard uses full-width layout matching other provider pages
- Phase 19: Recharts for bar chart visualization (already in dependencies)
- Phase 19: Monthly trends show last 6 months of data
- Phase 19: Deal value shown as total, with note about commission agreements
- Phase 19: Response time auto-formats (minutes if <1hr, hours otherwise)
- Phase 20: Availability uses simple boolean (acceptingNewClients) + blocked dates (no time slots for MVP)
- Phase 20: Notification preferences stored as object field on serviceProviderProfiles (not separate table)
- Phase 20: All notification preferences default to enabled
- Phase 20: Dates stored as start-of-day timestamps (midnight UTC)
- Phase 20: Duplicate blocked dates handled gracefully (returns existing record)
- Phase 20: Settings tabs only shown for providers (investors see direct profile form)
- Phase 20: Calendar disables past dates (only future dates can be blocked)
- Phase 20: Notification toggles grouped by category with visual border-left indicator
- Phase 20: ToggleRow helper component for consistent toggle UI pattern
- Phase 21: Single posts table with postType discriminator (property_listing, service_request, discussion)
- Phase 21: Post visibility: public, followers_only, deal_participants
- Phase 21: Denormalized counters (likeCount, commentCount, shareCount, saveCount) on post documents
- Phase 21: In-memory filtering after pagination (Convex single-index constraint)
- Phase 21: canViewPost helper for visibility enforcement with switch pattern
- Phase 21: Idempotent mutations return early if already in target state
- Phase 21: Math.max(0, count - 1) prevents negative counters on unlike/unsave
- Phase 21: All status checks (isLikedByUser, isSavedByUser, isFollowing) return boolean
- Phase 22: CreatePostDialog uses useState for form state (not React Hook Form for simple forms)
- Phase 22: Tabbed interface with 3 post types (Property/Service Request/Discussion)
- Phase 22: Card-style RadioGroup with sr-only inputs for service type and visibility selection
- Phase 22: Feed components barrel export from @/components/feed
- Phase 22: PropertySelector follows DealSelector pattern (search, thumbnails, selection state)
- Phase 22: Visibility selector shown for all post types (including property listings)
- Phase 23: PostCard acts as dispatcher routing to type-specific cards via switch on postType
- Phase 23: Author header pattern: Avatar(32x32) + name + role badge + relative timestamp
- Phase 23: Engagement footer pattern: like/comment/save counts with icons in border-t section
- Phase 23: PropertyPostCard uses gradient overlay on image for title/city/price display
- Phase 23: Compact price formatting: $1.5M, $500K pattern for readability
- Phase 23: Feed page uses usePaginatedQuery for infinite scroll (results, status, loadMore)
- Phase 23: Filter tabs use URL params for shareable filter state
- Phase 23: Feed navigation link added for all 9 user roles in bottom section
- Phase 24: EngagementFooter uses optimistic UI with local state synced via useEffect
- Phase 24: Mutation pending state disables buttons to prevent double-clicks
- Phase 24: Comment max length 1000 chars (consistent with other text fields)
- Phase 24: Comments paginated newest-first for typical social feed UX
- Phase 24: addComment follows likePost/savePost auth and validation pattern
- Phase 24: ShareButton uses client-side only tracking (no server mutation for MVP)
- Phase 24: Share count increments once per session to avoid spam inflation
- Phase 24: Share URL format: /feed/post/${postId}
- Phase 24: CommentSection uses expandable toggle pattern (showComments state)
- Phase 24: Comments load 5 initially with "Load more" pagination
- Phase 25: FollowButton follows EngagementFooter optimistic UI pattern (local state + useEffect sync)
- Phase 25: Feed page has two-level tab navigation (source: Global/Following + type filter for global only)
- Phase 25: Conditional usePaginatedQuery with skip parameter for inactive feeds
- Phase 25: FollowStats manages dialog state internally for self-contained usage
- Phase 25: FollowListDialog uses conditional query skip to avoid unnecessary queries when dialog closed
- Phase 25: FollowButton included in list items for direct follow/unfollow from list
- Phase 26: getUserProfile returns provider-specific data (stats, portfolio) only for service providers
- Phase 26: Profile page uses max-w-4xl mx-auto for consistent layout
- Phase 26: Profile components barrel export via @/components/profile
- Phase 26: Profile type detection via stats !== null (service providers have stats)
- Phase 26: Author profile link pattern: wrap Avatar and name with Link to /profile/[authorId]
- Phase 26: Hover feedback: opacity-80 on avatar, underline on name
- Phase 27: Search indexes use single searchField per Convex constraint (title, content, name)
- Phase 27: Autocomplete returns 5 results per category, full search returns 20
- Phase 27: Search history limited to 20 entries per user with auto-pruning
- Phase 27: Hacker News time-decay formula: (P-1) / (T+2)^G with gravity 1.8
- Phase 27: Trending windows: today (24h) and week (7d)
- Phase 27: Properties scored by favorites + (deals * 2)
- Phase 27: User recommendations: friends-of-friends (+2) and same-role (+1)
- Phase 27: Post recommendations filtered to same-role users for relevance
- Phase 27: GlobalSearchBar positioned center in header with hidden md:flex for responsive layout
- Phase 27: 300ms lodash.debounce for search input (not custom implementation)
- Phase 27: SearchAutocomplete uses grouped sections with recent searches shown when empty
- Phase 27: SearchResultCard uses switch pattern for polymorphic user/post/property rendering
- Phase 27: Search results tab state synced to URL via ?type param
- Phase 27: Empty search results show trending content as discovery fallback
- Phase 27: AnalyticsUpIcon for trending indicator (TrendUp01Icon not available in hugeicons)
- Phase 27: Discovery widgets (TrendingSection, PeopleToFollow) in feed page sidebar
- Phase 27: Two-column feed layout on lg+ screens (flex-1 main + w-80 sidebar)
- Phase 27: Sticky sidebar with top-6 offset (sticky top-6 self-start)

### Deferred Issues

None yet.

### Blockers/Concerns

None yet.

### Roadmap Evolution

- Phase 1.1 inserted after Phase 1: Integrate Shadcn (COMPLETE)
- Phase 1.2 inserted after Phase 1.1: Add All Shadcn Components (COMPLETE)
- Phase 1.3 inserted after Phase 1.2: Create Design System Page (COMPLETE)
- Phase 4.1 inserted after Phase 4: Edit Property (COMPLETE)
- Phase 5.1 inserted after Phase 5: Add Also Regular Filter (URGENT)
- Phase 5.2 inserted after Phase 5.1: Mock Data & Super User (COMPLETE)
- Phase 5.3 inserted after Phase 5.2: Property Page Carousel and Interactive Map (COMPLETE)
- Phase 5.4 inserted after Phase 5.3: Yad2-Style Property Page (URGENT)
- Phase 6.1 inserted after Phase 6: Multi-layout Chat Page (URGENT)
- Milestone v1.1 created: Investor Onboarding, 7 phases (Phase 9-15)
- Phase 16.1 inserted after Phase 16: Layout & Navigation Improvements (COMPLETE)
- Phase 16.3 inserted after Phase 16.1: Shadcn Sidebar Layout (COMPLETE)
- Milestone v1.3 created: Social Feed & Global Community, 7 phases (Phase 21-27)

## Session Continuity

Last session: 2026-01-19
Stopped at: Completed 27-05-PLAN.md (Discover Page UI)
Resume file: None
Next: Milestone v1.3 complete - ready for next milestone or phase
