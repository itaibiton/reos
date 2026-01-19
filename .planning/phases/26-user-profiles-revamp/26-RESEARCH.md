# Phase 26: User Profiles Revamp - Research

**Researched:** 2026-01-19
**Domain:** User profile pages, aggregated data display, internal REOS patterns
**Confidence:** HIGH

## Summary

Phase 26 creates public user profile pages that aggregate a user's activity across the platform - their posts, follower/following relationships, and portfolio (for service providers). The research confirms this can be implemented entirely using existing internal patterns from REOS, requiring no new external libraries.

The key insight is that REOS already has the building blocks:
1. **Provider profile page** (`/providers/[id]`) with two-column layout, stats cards, and portfolio display
2. **Feed queries** (`userFeed`, `globalFeed`) with pagination and visibility controls
3. **Follow components** (`FollowStats`, `FollowButton`) ready for integration
4. **PostCard dispatcher** that handles all post type rendering

The implementation creates a new `/profile/[id]` route that aggregates these existing patterns into a unified user profile experience.

**Primary recommendation:** Model the user profile page after the existing provider profile page pattern, reusing components and queries where possible, adding a new `getUserProfile` query that aggregates user data in a single call.

## Standard Stack

### Core (Already in REOS)
| Component | Location | Purpose | Reuse Strategy |
|-----------|----------|---------|----------------|
| Provider profile layout | `src/app/(app)/providers/[id]/page.tsx` | Two-column layout, stats cards | Copy structure, adapt for all users |
| PostCard | `src/components/feed/PostCard.tsx` | Post rendering dispatcher | Use directly in profile feed |
| FollowStats | `src/components/feed/FollowStats.tsx` | Follower/following display | Use directly in profile header |
| FollowButton | `src/components/feed/FollowButton.tsx` | Follow/unfollow action | Use directly in profile header |
| usePaginatedQuery | `convex/react` | Infinite scroll feed | Use for user's posts |
| userFeed query | `convex/posts.ts` | User's posts with visibility | Use directly |

### Supporting (Already in REOS)
| Component | Location | Purpose |
|-----------|----------|---------|
| Avatar, AvatarFallback, AvatarImage | `@/components/ui/avatar` | User profile images |
| Badge | `@/components/ui/badge` | Role display |
| Card, CardContent, CardHeader, CardTitle | `@/components/ui/card` | Profile sections |
| Tabs, TabsList, TabsTrigger | `@/components/ui/tabs` | Profile section navigation |
| Skeleton | `@/components/ui/skeleton` | Loading states |
| Button | `@/components/ui/button` | Actions |

### New Components Needed
| Component | Purpose | Based On |
|-----------|---------|----------|
| UserProfilePage | `/profile/[id]` route | Provider profile page structure |
| ProfileHeader | User info + follow button + stats | Provider profile header |
| ProfilePostsTab | User's posts with pagination | Feed page pattern |
| ProfileActivityTab | Activity stream (future enhancement) | N/A - optional for MVP |

**No external libraries needed.** All functionality comes from existing REOS patterns.

## Architecture Patterns

### Recommended Page Structure

```
src/app/(app)/profile/[id]/page.tsx   # User profile page
```

The page follows the provider profile pattern:
```
UserProfilePage
  |-- ProfileHeader (avatar, name, role, bio, follow button, follow stats)
  |-- StatsRow (post count, completed deals for providers)
  |-- TabContent (Posts / About / Portfolio)
       |-- Posts tab: UserPostsFeed (paginated with PostCard)
       |-- About tab: Bio, contact info, specializations (for providers)
       |-- Portfolio tab: Completed deals (for service providers only)
```

### Data Flow Pattern

```typescript
// Single query aggregates all profile data (like getPublicProfile for providers)
export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Get user + enrich based on role
    // For providers: Include profile from serviceProviderProfiles
    // Calculate stats (post count, etc.)
    // Return unified profile object
  },
});

// Separate paginated query for posts (already exists)
// api.posts.userFeed - handles visibility correctly
```

### Component Composition Pattern

```tsx
// Profile page uses composition to handle different user types
function UserProfilePage() {
  const profile = useQuery(api.users.getUserProfile, { userId });
  const { results, status, loadMore } = usePaginatedQuery(
    api.posts.userFeed,
    { userId },
    { initialNumItems: 10 }
  );

  return (
    <div className="p-6 space-y-6">
      <ProfileHeader profile={profile} />
      <StatsRow profile={profile} postCount={results.length} />
      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          {profile.role !== "investor" && (
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          )}
        </TabsList>
        <TabsContent value="posts">
          {/* Paginated post feed using PostCard */}
        </TabsContent>
        <TabsContent value="portfolio">
          {/* Portfolio from profile.portfolio - same as provider page */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

### URL Routing Pattern

Consistent with REOS navigation patterns:
- `/profile/[id]` - View any user's profile
- `/profile/me` - View own profile (redirect to `/profile/{currentUserId}`)

### Anti-Patterns to Avoid

- **Separate queries for each section:** Use single aggregated query like `getPublicProfile` pattern
- **Different page for investors vs providers:** Use conditional rendering within single page component
- **Custom pagination:** Use existing `usePaginatedQuery` + `userFeed` query
- **Rebuilding follow components:** Reuse existing `FollowStats` and `FollowButton`

## Don't Hand-Roll

Problems that already have solutions in REOS:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| User's post feed | Custom feed query | `api.posts.userFeed` | Already handles visibility, pagination |
| Follower/following display | Custom stats component | `FollowStats` component | Already manages dialog state |
| Follow/unfollow | Custom button | `FollowButton` component | Already has optimistic UI |
| Profile layout | New layout pattern | Provider profile page pattern | Proven two-column layout |
| Post rendering | Custom cards | `PostCard` dispatcher | Already handles all post types |
| Infinite scroll | Custom pagination | `usePaginatedQuery` hook | Convex's reactive pagination |

**Key insight:** This phase is mostly wiring existing components together, not building new functionality.

## Common Pitfalls

### Pitfall 1: N+1 Query Problem for Profile Data
**What goes wrong:** Making separate queries for user, profile, posts, stats
**Why it happens:** Treating each section as independent data fetch
**How to avoid:** Create single `getUserProfile` query that aggregates all non-paginated data
**Warning signs:** Multiple loading states, layout shifts as data arrives

### Pitfall 2: Visibility Confusion on User Feed
**What goes wrong:** Showing followers-only posts to non-followers
**Why it happens:** Not using the existing `userFeed` query which handles visibility
**How to avoid:** Use `api.posts.userFeed` directly - it already checks visibility
**Warning signs:** Users seeing posts they shouldn't; followers-only posts in global search

### Pitfall 3: Duplicating Provider Profile Logic
**What goes wrong:** Rebuilding portfolio, reviews, stats display from scratch
**Why it happens:** Not recognizing provider page as template
**How to avoid:** Extract reusable patterns from provider profile; for service provider users, show the same portfolio section
**Warning signs:** Code duplication between `/providers/[id]` and `/profile/[id]`

### Pitfall 4: Missing Role-Based Sections
**What goes wrong:** Showing portfolio tab to investors, or hiding it from providers
**Why it happens:** Not conditionally rendering based on user role
**How to avoid:** Check `profile.role` and conditionally render tabs/sections
**Warning signs:** Empty sections, confusing UI for different user types

### Pitfall 5: Inconsistent Empty States
**What goes wrong:** Different empty state messaging/styling across tabs
**Why it happens:** Not using consistent patterns
**How to avoid:** Use same empty state pattern as feed page
**Warning signs:** Visual inconsistency, missing call-to-actions

## Code Examples

### Query: getUserProfile (New)

```typescript
// convex/users.ts - Add this query
export const getUserProfile = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get target user
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    // Get current user for isFollowing check
    const currentUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    // Check if current user follows this user
    let isFollowing = false;
    if (currentUser && currentUser._id !== args.userId) {
      const follow = await ctx.db
        .query("userFollows")
        .withIndex("by_follower_and_following", (q) =>
          q.eq("followerId", currentUser._id).eq("followingId", args.userId)
        )
        .unique();
      isFollowing = follow !== null;
    }

    const isOwnProfile = currentUser?._id === args.userId;

    // Base profile data
    const baseProfile = {
      _id: user._id,
      name: user.name || user.email || "Unknown",
      email: user.email,
      imageUrl: user.imageUrl,
      role: user.role,
      isFollowing,
      isOwnProfile,
    };

    // For service providers, get additional profile data
    const isServiceProvider =
      user.role === "broker" ||
      user.role === "mortgage_advisor" ||
      user.role === "lawyer";

    if (isServiceProvider) {
      // Get service provider profile
      const providerProfile = await ctx.db
        .query("serviceProviderProfiles")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .unique();

      // Get completed deals for portfolio (same logic as getPublicProfile)
      const allCompletedDeals = await ctx.db
        .query("deals")
        .withIndex("by_stage", (q) => q.eq("stage", "completed"))
        .collect();

      const providerCompletedDeals = allCompletedDeals.filter(
        (deal) =>
          deal.brokerId === args.userId ||
          deal.mortgageAdvisorId === args.userId ||
          deal.lawyerId === args.userId
      );

      // Get last 5 for portfolio
      const portfolioDeals = providerCompletedDeals
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 5);

      const portfolio = await Promise.all(
        portfolioDeals.map(async (deal) => {
          const property = await ctx.db.get(deal.propertyId);
          return {
            dealId: deal._id,
            propertyId: deal.propertyId,
            propertyTitle: property?.title,
            propertyCity: property?.city,
            propertyImage: property?.featuredImage ?? property?.images[0],
            soldPrice: property?.soldPrice ?? deal.offerPrice ?? property?.priceUsd,
            completedAt: deal.updatedAt,
          };
        })
      );

      // Get reviews
      const reviews = await ctx.db
        .query("providerReviews")
        .withIndex("by_provider", (q) => q.eq("providerId", args.userId))
        .collect();

      const totalReviews = reviews.length;
      const averageRating =
        totalReviews > 0
          ? Math.round(
              (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10
            ) / 10
          : 0;

      return {
        ...baseProfile,
        providerProfile: providerProfile
          ? {
              companyName: providerProfile.companyName,
              bio: providerProfile.bio,
              yearsExperience: providerProfile.yearsExperience,
              specializations: providerProfile.specializations,
              serviceAreas: providerProfile.serviceAreas,
              languages: providerProfile.languages,
            }
          : null,
        stats: {
          completedDeals: providerCompletedDeals.length,
          averageRating,
          totalReviews,
          yearsExperience: providerProfile?.yearsExperience ?? 0,
        },
        portfolio,
      };
    }

    // For investors/admins - simpler profile
    return {
      ...baseProfile,
      providerProfile: null,
      stats: null,
      portfolio: null,
    };
  },
});
```

### Component: ProfileHeader

```tsx
// src/components/profile/ProfileHeader.tsx
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FollowButton, FollowStats } from "@/components/feed";
import { Id } from "../../../convex/_generated/dataModel";

const ROLE_LABELS: Record<string, string> = {
  investor: "Investor",
  broker: "Broker",
  mortgage_advisor: "Mortgage Advisor",
  lawyer: "Lawyer",
  admin: "Admin",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface ProfileHeaderProps {
  profile: {
    _id: Id<"users">;
    name: string;
    imageUrl?: string;
    role?: string;
    isOwnProfile: boolean;
    providerProfile?: {
      companyName?: string;
      bio?: string;
    } | null;
  };
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-start gap-4">
      <Avatar className="h-20 w-20 flex-shrink-0">
        <AvatarImage src={profile.imageUrl} alt={profile.name} />
        <AvatarFallback className="text-2xl">
          {getInitials(profile.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-bold">{profile.name}</h1>
          {profile.role && (
            <Badge variant="secondary">
              {ROLE_LABELS[profile.role] || profile.role}
            </Badge>
          )}
        </div>

        {profile.providerProfile?.companyName && (
          <p className="text-muted-foreground mt-1">
            {profile.providerProfile.companyName}
          </p>
        )}

        {profile.providerProfile?.bio && (
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {profile.providerProfile.bio}
          </p>
        )}

        {/* Follow stats */}
        <div className="mt-3">
          <FollowStats userId={profile._id} />
        </div>
      </div>

      {/* Follow button (hidden on own profile) */}
      <FollowButton userId={profile._id} isOwnPost={profile.isOwnProfile} />
    </div>
  );
}
```

### Component: UserPostsFeed (Profile Tab)

```tsx
// src/components/profile/UserPostsFeed.tsx
"use client";

import { usePaginatedQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { PostCard, PostCardSkeleton } from "@/components/feed";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface UserPostsFeedProps {
  userId: Id<"users">;
}

export function UserPostsFeed({ userId }: UserPostsFeedProps) {
  const { results, status, loadMore } = usePaginatedQuery(
    api.posts.userFeed,
    { userId },
    { initialNumItems: 10 }
  );

  if (status === "LoadingFirstPage") {
    return (
      <div className="space-y-4">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No posts yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {results.map((post) => (
        <PostCard key={post._id} post={post} />
      ))}

      {status === "CanLoadMore" && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => loadMore(10)}
        >
          Load more
        </Button>
      )}

      {status === "LoadingMore" && (
        <Button variant="outline" className="w-full" disabled>
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          Loading...
        </Button>
      )}
    </div>
  );
}
```

### Page: Profile Page Structure

```tsx
// src/app/(app)/profile/[id]/page.tsx
"use client";

import { useQuery } from "convex/react";
import { useRouter, useParams } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { UserPostsFeed } from "@/components/profile/UserPostsFeed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
// ... additional imports

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as Id<"users">;

  const profile = useQuery(api.users.getUserProfile, { userId });

  if (profile === undefined) {
    return <ProfilePageSkeleton />;
  }

  if (profile === null) {
    return <NotFoundState onBack={() => router.back()} />;
  }

  const isServiceProvider = profile.stats !== null;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => router.back()}>
        Back
      </Button>

      {/* Profile Header */}
      <ProfileHeader profile={profile} />

      {/* Stats row for service providers */}
      {isServiceProvider && profile.stats && (
        <StatsRow stats={profile.stats} />
      )}

      {/* Tabbed content */}
      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          {isServiceProvider && (
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="posts" className="mt-4">
          <UserPostsFeed userId={userId} />
        </TabsContent>

        {isServiceProvider && (
          <TabsContent value="portfolio" className="mt-4">
            <PortfolioSection portfolio={profile.portfolio} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current REOS Approach | Why Better |
|--------------|----------------------|------------|
| Separate profile types per role | Single profile page with conditional sections | Less code, consistent UX |
| Multiple queries per section | Single aggregated query | Fewer round trips, atomic loading |
| Custom follow UI | Reusable FollowButton/FollowStats | Consistent behavior, optimistic UI |
| Manual pagination | usePaginatedQuery hook | Reactive, handles edge cases |

## Open Questions

1. **Activity tab content**
   - What we know: Facebook/Instagram profiles show activity stream
   - What's unclear: What activities to show (likes, comments, follows?)
   - Recommendation: Defer to future enhancement; MVP has Posts and Portfolio tabs only

2. **Profile editing**
   - What we know: Users need to edit their profile
   - What's unclear: Inline editing vs separate page
   - Recommendation: For MVP, link to existing `/profile` or `/settings` pages where edit forms already exist

3. **Link from posts to profile**
   - What we know: Clicking author avatar/name should navigate to profile
   - What's unclear: Should this be implemented in this phase?
   - Recommendation: Yes, update PostCard author area to link to `/profile/[authorId]`

## Sources

### Primary (HIGH confidence)
- Existing REOS codebase files:
  - `src/app/(app)/providers/[id]/page.tsx` - Provider profile page pattern
  - `convex/posts.ts` - `userFeed` query with visibility handling
  - `src/components/feed/FollowStats.tsx` - Follow stats component
  - `src/components/feed/FollowButton.tsx` - Follow button component
  - `convex/serviceProviderProfiles.ts` - `getPublicProfile` aggregation pattern

### Secondary (MEDIUM confidence)
- Phase 18 decisions documented in project context
- Phase 25 plan files showing FollowStats/FollowButton implementation

### Tertiary (LOW confidence)
- General social platform UI patterns (Facebook, Instagram) - for activity feed ideas (deferred)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All from existing REOS codebase
- Architecture: HIGH - Based on proven provider profile pattern
- Pitfalls: HIGH - Derived from existing implementation patterns

**Research date:** 2026-01-19
**Valid until:** 60 days (internal patterns, stable)
