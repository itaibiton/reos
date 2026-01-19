"use client";

import { useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { PostCard, PostCardSkeleton, CreatePostDialog } from "@/components/feed";
import { TrendingSection, PeopleToFollow } from "@/components/discovery";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, RssIcon, UserMultiple02Icon } from "@hugeicons/core-free-icons";
import { Loader2 } from "lucide-react";

type FeedSource = "global" | "following";
type PostTypeFilter = "all" | "property_listing" | "service_request" | "discussion";

export default function FeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Read source and type from URL params
  const sourceParam = searchParams.get("source") as FeedSource | null;
  const feedSource: FeedSource = sourceParam ?? "global";
  const typeParam = searchParams.get("type") as PostTypeFilter | null;
  const filterType: PostTypeFilter = typeParam ?? "all";

  // Map "all" to undefined for the query (no filter)
  const queryPostType = filterType === "all" ? undefined : filterType;

  // Conditionally use different query based on source
  const globalFeedResults = usePaginatedQuery(
    api.posts.globalFeed,
    feedSource === "global" ? { postType: queryPostType } : "skip",
    { initialNumItems: 10 }
  );

  const followingFeedResults = usePaginatedQuery(
    api.posts.followingFeed,
    feedSource === "following" ? {} : "skip",
    { initialNumItems: 10 }
  );

  // Active results based on source
  const { results, status, loadMore } = feedSource === "global"
    ? globalFeedResults
    : followingFeedResults;

  // Handle source tab change (Global/Following)
  const handleSourceChange = (value: string) => {
    if (value === "global") {
      // Preserve type filter when switching to global
      if (filterType !== "all") {
        router.push(`/feed?type=${filterType}`);
      } else {
        router.push("/feed");
      }
    } else {
      // Following feed doesn't support type filter
      router.push("/feed?source=following");
    }
  };

  // Handle filter tab change (type filters - only for global)
  const handleFilterChange = (value: string) => {
    if (value === "all") {
      router.push("/feed");
    } else {
      router.push(`/feed?type=${value}`);
    }
  };

  // Get empty state message based on source and filter
  const getEmptyStateMessage = () => {
    if (feedSource === "following") {
      return "No posts from people you follow yet";
    }
    switch (filterType) {
      case "property_listing":
        return "No property posts yet";
      case "service_request":
        return "No service request posts yet";
      case "discussion":
        return "No discussion posts yet";
      default:
        return "No posts yet";
    }
  };

  // Get empty state description based on source
  const getEmptyStateDescription = () => {
    if (feedSource === "following") {
      return "Follow users to see their posts here.";
    }
    return "Be the first to share something with the community.";
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="lg:flex lg:gap-6">
        {/* Main feed column */}
        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Feed</h1>
            <Button onClick={() => setDialogOpen(true)} className="gap-2">
              <HugeiconsIcon icon={Add01Icon} size={16} />
              Create Post
            </Button>
          </div>

          {/* Feed Source Tabs (Global/Following) */}
          <Tabs value={feedSource} onValueChange={handleSourceChange}>
            <TabsList>
              <TabsTrigger value="global">Global</TabsTrigger>
              <TabsTrigger value="following">Following</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Post Type Filter Tabs (only for global feed) */}
          {feedSource === "global" && (
            <Tabs value={filterType} onValueChange={handleFilterChange}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="property_listing">Properties</TabsTrigger>
                <TabsTrigger value="service_request">Services</TabsTrigger>
                <TabsTrigger value="discussion">Discussions</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          {/* Loading state (first page) */}
          {status === "LoadingFirstPage" && (
            <div className="flex flex-col gap-4">
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          )}

          {/* Empty state */}
          {status !== "LoadingFirstPage" && results.length === 0 && (
            <div className="flex flex-col items-center text-center py-12">
              <div className="rounded-full bg-muted p-4 mb-4 text-muted-foreground">
                <HugeiconsIcon
                  icon={feedSource === "following" ? UserMultiple02Icon : RssIcon}
                  size={48}
                  strokeWidth={1.5}
                />
              </div>
              <h2 className="text-xl font-semibold mb-2">{getEmptyStateMessage()}</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                {getEmptyStateDescription()}
              </p>
              {feedSource === "global" && (
                <Button onClick={() => setDialogOpen(true)}>Create a Post</Button>
              )}
            </div>
          )}

          {/* Posts list */}
          {results.length > 0 && (
            <div className="flex flex-col gap-4">
              {results.map((post) => (
                <PostCard key={post._id} post={post} />
              ))}
            </div>
          )}

          {/* Load more button */}
          {status === "CanLoadMore" && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => loadMore(10)}
            >
              Load more
            </Button>
          )}

          {/* Loading more indicator */}
          {status === "LoadingMore" && (
            <Button variant="outline" className="w-full" disabled>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading...
            </Button>
          )}
        </div>

        {/* Discovery sidebar - hidden on mobile */}
        <aside className="hidden lg:block w-80 space-y-6 sticky top-6 self-start">
          <PeopleToFollow />
          <TrendingSection />
        </aside>
      </div>

      {/* Create Post Dialog */}
      <CreatePostDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
