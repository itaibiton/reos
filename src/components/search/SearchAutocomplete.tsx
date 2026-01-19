"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  Cancel01Icon,
  UserIcon,
  File01Icon,
  Home01Icon,
} from "@hugeicons/core-free-icons";
import { USER_ROLES } from "@/lib/constants";

interface SearchAutocompleteProps {
  results:
    | {
        posts: Array<{ _id: string; content: string; postType: string }>;
        users: Array<{
          _id: string;
          name?: string;
          imageUrl?: string;
          role?: string;
        }>;
        properties: Array<{
          _id: string;
          title: string;
          city: string;
          priceUsd: number;
          featuredImage?: string;
        }>;
      }
    | undefined;
  recentSearches: Array<{ _id: string; query: string }> | undefined;
  searchQuery: string;
  onResultClick: (
    type: "post" | "user" | "property" | "search",
    id: string,
    query?: string
  ) => void;
  onClearRecent: (id: string) => void;
  isLoading: boolean;
}

// Format price compactly: $1.5M, $500K
function formatCompactPrice(price: number): string {
  if (price >= 1_000_000) {
    const millions = price / 1_000_000;
    return `$${millions.toFixed(millions % 1 === 0 ? 0 : 1)}M`;
  }
  if (price >= 1_000) {
    const thousands = price / 1_000;
    return `$${thousands.toFixed(thousands % 1 === 0 ? 0 : 0)}K`;
  }
  return `$${price.toLocaleString()}`;
}

// Get role label from value
function getRoleLabel(role: string | undefined): string {
  if (!role) return "";
  const found = USER_ROLES.find((r) => r.value === role);
  return found?.label || role;
}

// Truncate text with ellipsis
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + "...";
}

// Get initials from name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Post type icon
function getPostTypeIcon(postType: string) {
  switch (postType) {
    case "property_listing":
      return Home01Icon;
    case "service_request":
      return UserIcon;
    default:
      return File01Icon;
  }
}

export function SearchAutocomplete({
  results,
  recentSearches,
  searchQuery,
  onResultClick,
  onClearRecent,
  isLoading,
}: SearchAutocompleteProps) {
  const hasQuery = searchQuery.length >= 1;
  const hasResults =
    results &&
    (results.posts.length > 0 ||
      results.users.length > 0 ||
      results.properties.length > 0);
  const hasRecentSearches = recentSearches && recentSearches.length > 0;

  // Loading state
  if (isLoading) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg p-3 z-50">
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show recent searches when empty
  if (!hasQuery) {
    if (!hasRecentSearches) {
      return (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg p-4 z-50">
          <p className="text-sm text-muted-foreground text-center">
            Start typing to search
          </p>
        </div>
      );
    }

    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg max-h-[400px] overflow-y-auto z-50">
        {/* Recent Searches Header */}
        <div className="px-3 py-2 border-b">
          <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Recent Searches
          </span>
        </div>

        {/* Recent Search Items */}
        <div className="py-1">
          {recentSearches?.map((search) => (
            <div
              key={search._id}
              className="flex items-center justify-between px-3 py-2 hover:bg-accent cursor-pointer group"
              onClick={() => onResultClick("search", search._id, search.query)}
            >
              <div className="flex items-center gap-3">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  size={16}
                  strokeWidth={1.5}
                  className="text-muted-foreground"
                />
                <span className="text-sm">{search.query}</span>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 hover:bg-transparent"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearRecent(search._id);
                }}
              >
                <HugeiconsIcon
                  icon={Cancel01Icon}
                  size={14}
                  strokeWidth={1.5}
                  className="text-muted-foreground hover:text-foreground"
                />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No results found
  if (!hasResults) {
    return (
      <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg p-4 z-50">
        <p className="text-sm text-muted-foreground text-center">
          No results found for &ldquo;{searchQuery}&rdquo;
        </p>
        <p className="text-xs text-muted-foreground text-center mt-1">
          Press Enter to see more search options
        </p>
      </div>
    );
  }

  // Show grouped results
  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg max-h-[400px] overflow-y-auto z-50">
      {/* Users Section */}
      {results.users.length > 0 && (
        <>
          <div className="px-3 py-2 border-b bg-muted/30">
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Users
            </span>
          </div>
          <div className="py-1">
            {results.users.map((user) => {
              const displayName = user.name || "Unknown User";
              return (
                <div
                  key={user._id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer"
                  onClick={() => onResultClick("user", user._id)}
                >
                  <Avatar className="h-8 w-8">
                    {user.imageUrl ? (
                      <AvatarImage src={user.imageUrl} alt={displayName} />
                    ) : null}
                    <AvatarFallback className="text-xs">
                      {getInitials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{displayName}</p>
                    {user.role && (
                      <Badge variant="secondary" className="text-xs mt-0.5">
                        {getRoleLabel(user.role)}
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Posts Section */}
      {results.posts.length > 0 && (
        <>
          <div className="px-3 py-2 border-b bg-muted/30">
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Posts
            </span>
          </div>
          <div className="py-1">
            {results.posts.map((post) => {
              const PostIcon = getPostTypeIcon(post.postType);
              return (
                <div
                  key={post._id}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer"
                  onClick={() => onResultClick("post", post._id)}
                >
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-muted">
                    <HugeiconsIcon
                      icon={PostIcon}
                      size={16}
                      strokeWidth={1.5}
                      className="text-muted-foreground"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      {truncate(post.content, 60)}
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {post.postType.replace("_", " ")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Properties Section */}
      {results.properties.length > 0 && (
        <>
          <div className="px-3 py-2 border-b bg-muted/30">
            <span className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
              Properties
            </span>
          </div>
          <div className="py-1">
            {results.properties.map((property) => (
              <div
                key={property._id}
                className="flex items-center gap-3 px-3 py-2 hover:bg-accent cursor-pointer"
                onClick={() => onResultClick("property", property._id)}
              >
                {/* Property Thumbnail */}
                <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                  {property.featuredImage ? (
                    <img
                      src={property.featuredImage}
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <HugeiconsIcon
                      icon={Home01Icon}
                      size={16}
                      strokeWidth={1.5}
                      className="text-muted-foreground"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {property.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {property.city}
                    </span>
                    <span className="text-xs font-medium text-primary">
                      {formatCompactPrice(property.priceUsd)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* View All Results Footer */}
      <div className="px-3 py-2 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Press <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted border">Enter</kbd> to see all results
        </p>
      </div>
    </div>
  );
}
