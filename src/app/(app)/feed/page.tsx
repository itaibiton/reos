"use client";

import { useState } from "react";
import { usePaginatedQuery } from "convex/react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { PostCard, PostCardSkeleton, CreatePostDialog } from "@/components/feed";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, RssIcon } from "@hugeicons/core-free-icons";
import { Loader2 } from "lucide-react";

type PostTypeFilter = "all" | "property_listing" | "service_request" | "discussion";

export default function FeedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);

  // Read filter from URL params
  const typeParam = searchParams.get("type") as PostTypeFilter | null;
  const filterType: PostTypeFilter = typeParam ?? "all";

  // Map "all" to undefined for the query (no filter)
  const queryPostType = filterType === "all" ? undefined : filterType;

  // Infinite scroll with usePaginatedQuery
  const { results, status, loadMore } = usePaginatedQuery(
    api.posts.globalFeed,
    { postType: queryPostType },
    { initialNumItems: 10 }
  );

  // Handle filter tab change
  const handleFilterChange = (value: string) => {
    if (value === "all") {
      router.push("/feed");
    } else {
      router.push(`/feed?type=${value}`);
    }
  };

  // Get empty state message based on filter
  const getEmptyStateMessage = () => {
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

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Feed</h1>
        <Button onClick={() => setDialogOpen(true)} className="gap-2">
          <HugeiconsIcon icon={Add01Icon} size={16} />
          Create Post
        </Button>
      </div>

      {/* Filter Tabs */}
      <Tabs value={filterType} onValueChange={handleFilterChange}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="property_listing">Properties</TabsTrigger>
          <TabsTrigger value="service_request">Services</TabsTrigger>
          <TabsTrigger value="discussion">Discussions</TabsTrigger>
        </TabsList>
      </Tabs>

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
            <HugeiconsIcon icon={RssIcon} size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold mb-2">{getEmptyStateMessage()}</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Be the first to share something with the community.
          </p>
          <Button onClick={() => setDialogOpen(true)}>Create a Post</Button>
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

      {/* Create Post Dialog */}
      <CreatePostDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
