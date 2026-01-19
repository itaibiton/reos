"use client";

import { useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../../convex/_generated/api";
import { SearchResultCard, SearchResult } from "./SearchResultCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, TrendUp01Icon } from "@hugeicons/core-free-icons";

// ============================================================================
// TYPES
// ============================================================================

type TabValue = "all" | "user" | "post" | "property";

interface SearchResultsProps {
  query: string;
  initialType?: TabValue;
}

// ============================================================================
// SKELETON COMPONENT
// ============================================================================

function SearchResultSkeleton() {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// TRENDING SECTION (FOR EMPTY STATE)
// ============================================================================

function TrendingSuggestions() {
  const trendingPosts = useQuery(api.trending.getTrendingPosts, {
    timeWindow: "week",
    limit: 3,
  });
  const trendingProperties = useQuery(api.trending.getTrendingProperties, {
    timeWindow: "week",
    limit: 3,
  });

  const isLoading = trendingPosts === undefined || trendingProperties === undefined;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SearchResultSkeleton />
        <SearchResultSkeleton />
        <SearchResultSkeleton />
      </div>
    );
  }

  // Convert trending posts to SearchResult format
  const postResults: SearchResult[] = trendingPosts.map((post) => ({
    resultType: "post" as const,
    _id: post._id,
    content: post.content,
    postType: post.postType,
    authorId: post.authorId,
    authorName: post.authorName,
    authorImageUrl: post.authorImageUrl,
    authorRole: post.authorRole,
    createdAt: post.createdAt,
    likeCount: post.likeCount,
    commentCount: post.commentCount,
  }));

  // Convert trending properties to SearchResult format
  const propertyResults: SearchResult[] = trendingProperties.map((prop) => ({
    resultType: "property" as const,
    _id: prop._id,
    title: prop.title,
    city: prop.city,
    priceUsd: prop.priceUsd,
    featuredImage: prop.featuredImage,
    status: prop.status,
    propertyType: prop.propertyType,
    bedrooms: prop.bedrooms,
    bathrooms: prop.bathrooms,
    squareMeters: prop.squareMeters,
  }));

  const hasContent = postResults.length > 0 || propertyResults.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center gap-2 text-muted-foreground">
        <HugeiconsIcon icon={TrendUp01Icon} size={16} strokeWidth={1.5} />
        <span className="text-sm font-medium">Discover what&apos;s trending</span>
      </div>

      {postResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Trending Posts</h4>
          {postResults.map((result) => (
            <SearchResultCard key={result._id} result={result} />
          ))}
        </div>
      )}

      {propertyResults.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Trending Properties</h4>
          {propertyResults.map((result) => (
            <SearchResultCard key={result._id} result={result} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function SearchResults({ query, initialType = "all" }: SearchResultsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = (searchParams.get("type") as TabValue) ?? initialType;

  // Query full search results
  const results = useQuery(
    api.globalSearch.searchFull,
    query ? { query, type: activeTab === "all" ? undefined : activeTab } : "skip"
  );

  const isLoading = results === undefined;

  // Handle tab change - update URL params
  const handleTabChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("type");
    } else {
      params.set("type", value);
    }
    router.push(`/search?${params.toString()}`);
  };

  // Get counts for tab badges
  const userCount = results?.users?.length ?? 0;
  const postCount = results?.posts?.length ?? 0;
  const propertyCount = results?.properties?.length ?? 0;
  const totalCount = userCount + postCount + propertyCount;

  // Convert API results to SearchResult format
  const userResults: SearchResult[] = (results?.users ?? []).map((u) => ({
    resultType: "user" as const,
    ...u,
  }));

  const postResults: SearchResult[] = (results?.posts ?? []).map((p) => ({
    resultType: "post" as const,
    ...p,
  }));

  const propertyResults: SearchResult[] = (results?.properties ?? []).map((p) => ({
    resultType: "property" as const,
    ...p,
  }));

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Tabs value={activeTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="user">Users</TabsTrigger>
            <TabsTrigger value="post">Posts</TabsTrigger>
            <TabsTrigger value="property">Properties</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="space-y-3">
          <SearchResultSkeleton />
          <SearchResultSkeleton />
          <SearchResultSkeleton />
        </div>
      </div>
    );
  }

  // Empty results state
  if (totalCount === 0) {
    return (
      <div className="space-y-4">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="user">Users</TabsTrigger>
            <TabsTrigger value="post">Posts</TabsTrigger>
            <TabsTrigger value="property">Properties</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex flex-col items-center text-center py-12">
          <div className="rounded-full bg-muted p-4 mb-4 text-muted-foreground">
            <HugeiconsIcon icon={Search01Icon} size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold mb-2">No results found for &quot;{query}&quot;</h2>
          <p className="text-muted-foreground max-w-md">
            Try checking your spelling or using different keywords.
          </p>
        </div>

        <TrendingSuggestions />
      </div>
    );
  }

  // Results with tabs
  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="all">
          All {totalCount > 0 && `(${totalCount})`}
        </TabsTrigger>
        <TabsTrigger value="user">
          Users {userCount > 0 && `(${userCount})`}
        </TabsTrigger>
        <TabsTrigger value="post">
          Posts {postCount > 0 && `(${postCount})`}
        </TabsTrigger>
        <TabsTrigger value="property">
          Properties {propertyCount > 0 && `(${propertyCount})`}
        </TabsTrigger>
      </TabsList>

      {/* All results - grouped by type */}
      <TabsContent value="all" className="space-y-6 mt-4">
        {userCount > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Users</h3>
            <div className="space-y-2">
              {userResults.map((result) => (
                <SearchResultCard key={result._id} result={result} />
              ))}
            </div>
          </div>
        )}
        {postCount > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Posts</h3>
            <div className="space-y-2">
              {postResults.map((result) => (
                <SearchResultCard key={result._id} result={result} />
              ))}
            </div>
          </div>
        )}
        {propertyCount > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground">Properties</h3>
            <div className="space-y-2">
              {propertyResults.map((result) => (
                <SearchResultCard key={result._id} result={result} />
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      {/* Users only */}
      <TabsContent value="user" className="space-y-2 mt-4">
        {userResults.map((result) => (
          <SearchResultCard key={result._id} result={result} />
        ))}
        {userCount === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No users found matching &quot;{query}&quot;
          </p>
        )}
      </TabsContent>

      {/* Posts only */}
      <TabsContent value="post" className="space-y-2 mt-4">
        {postResults.map((result) => (
          <SearchResultCard key={result._id} result={result} />
        ))}
        {postCount === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No posts found matching &quot;{query}&quot;
          </p>
        )}
      </TabsContent>

      {/* Properties only */}
      <TabsContent value="property" className="space-y-2 mt-4">
        {propertyResults.map((result) => (
          <SearchResultCard key={result._id} result={result} />
        ))}
        {propertyCount === 0 && (
          <p className="text-center text-muted-foreground py-8">
            No properties found matching &quot;{query}&quot;
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}
