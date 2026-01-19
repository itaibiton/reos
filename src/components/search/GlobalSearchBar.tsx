"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import debounce from "lodash.debounce";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  Cancel01Icon,
  UserIcon,
  File01Icon,
  Home01Icon,
  Search01Icon,
} from "@hugeicons/core-free-icons";
import { USER_ROLES } from "@/lib/constants";

// Format price compactly: $1.5M, $500K
function formatCompactPrice(price: number): string {
  if (price >= 1_000_000) {
    const millions = price / 1_000_000;
    return `$${millions.toFixed(millions % 1 === 0 ? 0 : 1)}M`;
  }
  if (price >= 1_000) {
    const thousands = price / 1_000;
    return `$${thousands.toFixed(0)}K`;
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

export function GlobalSearchBar() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  // State
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Queries
  const results = useQuery(
    api.globalSearch.search,
    searchQuery.length >= 1 ? { query: searchQuery } : "skip"
  );

  const recentSearches = useQuery(api.searchHistory.getRecentSearches, {});

  // Mutations
  const deleteSearch = useMutation(api.searchHistory.deleteSearch);
  const saveSearch = useMutation(api.searchHistory.saveSearch);

  // Debounced search - 300ms delay
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, 300),
    []
  );

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle input change
  const handleValueChange = useCallback(
    (value: string) => {
      setInputValue(value);

      if (value.length >= 1) {
        debouncedSearch(value);
      } else {
        setSearchQuery("");
      }
    },
    [debouncedSearch]
  );

  // Handle selecting a result
  const handleSelect = useCallback(
    async (value: string) => {
      const [type, id] = value.split(":");

      setIsOpen(false);
      setInputValue("");
      setSearchQuery("");

      switch (type) {
        case "user":
          router.push(`/profile/${id}`);
          break;
        case "post":
          router.push(`/feed/post/${id}`);
          break;
        case "property":
          router.push(`/properties/${id}`);
          break;
        case "search":
          // Navigate to search results page
          const query = id; // id is the query for search type
          if (query) {
            const totalResults =
              (results?.posts?.length ?? 0) +
              (results?.users?.length ?? 0) +
              (results?.properties?.length ?? 0);
            await saveSearch({ query, resultCount: totalResults });
            router.push(`/search?q=${encodeURIComponent(query)}`);
          }
          break;
        case "recent":
          // Re-run a recent search
          const recentQuery = id;
          if (recentQuery) {
            await saveSearch({ query: recentQuery, resultCount: 0 });
            router.push(`/search?q=${encodeURIComponent(recentQuery)}`);
          }
          break;
      }
    },
    [router, results, saveSearch]
  );

  // Handle clearing a recent search
  const handleClearRecent = useCallback(
    async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      await deleteSearch({ searchId: id as Id<"searchHistory"> });
    },
    [deleteSearch]
  );

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && inputValue.trim()) {
        // Navigate to full search results
        handleSelect(`search:${inputValue.trim()}`);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    },
    [inputValue, handleSelect]
  );

  // Calculate states
  const isLoading = searchQuery.length >= 1 && results === undefined;
  const hasQuery = searchQuery.length >= 1;
  const hasResults =
    results &&
    (results.posts.length > 0 ||
      results.users.length > 0 ||
      results.properties.length > 0);
  const hasRecentSearches = recentSearches && recentSearches.length > 0;

  return (
    <div ref={containerRef} className="relative w-64 md:w-80">
      <Command
        shouldFilter={false}
        className="rounded-lg border shadow-md"
        onKeyDown={handleKeyDown}
      >
        <CommandInput
          placeholder="Search users, posts, properties..."
          value={inputValue}
          onValueChange={handleValueChange}
          onFocus={() => setIsOpen(true)}
        />

        {isOpen && (
          <CommandList className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg max-h-[400px] z-50">
            {/* Loading State */}
            {isLoading && (
              <div className="p-3 space-y-3">
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
            )}

            {/* No query - show recent searches */}
            {!isLoading && !hasQuery && (
              <>
                {hasRecentSearches ? (
                  <CommandGroup heading="Recent Searches">
                    {recentSearches?.map((search) => (
                      <CommandItem
                        key={search._id}
                        value={`recent:${search.query}`}
                        onSelect={handleSelect}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <HugeiconsIcon
                            icon={Clock01Icon}
                            size={16}
                            strokeWidth={1.5}
                            className="text-muted-foreground"
                          />
                          <span>{search.query}</span>
                        </div>
                        <button
                          className="opacity-0 group-hover:opacity-100 hover:bg-transparent p-1 rounded"
                          onClick={(e) => handleClearRecent(e, search._id)}
                        >
                          <HugeiconsIcon
                            icon={Cancel01Icon}
                            size={14}
                            strokeWidth={1.5}
                            className="text-muted-foreground hover:text-foreground"
                          />
                        </button>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ) : (
                  <CommandEmpty>Start typing to search</CommandEmpty>
                )}
              </>
            )}

            {/* Has query but no results */}
            {!isLoading && hasQuery && !hasResults && (
              <CommandEmpty>
                <p>No results found for &ldquo;{searchQuery}&rdquo;</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Press Enter to see more options
                </p>
              </CommandEmpty>
            )}

            {/* Show grouped results */}
            {!isLoading && hasQuery && hasResults && (
              <>
                {/* Users Section */}
                {results.users.length > 0 && (
                  <CommandGroup heading="Users">
                    {results.users.map((user) => {
                      const displayName = user.name || "Unknown User";
                      return (
                        <CommandItem
                          key={user._id}
                          value={`user:${user._id}`}
                          onSelect={handleSelect}
                        >
                          <Avatar className="h-8 w-8">
                            {user.imageUrl ? (
                              <AvatarImage
                                src={user.imageUrl}
                                alt={displayName}
                              />
                            ) : null}
                            <AvatarFallback className="text-xs">
                              {getInitials(displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {displayName}
                            </p>
                            {user.role && (
                              <Badge
                                variant="secondary"
                                className="text-xs mt-0.5"
                              >
                                {getRoleLabel(user.role)}
                              </Badge>
                            )}
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                )}

                {/* Posts Section */}
                {results.posts.length > 0 && (
                  <>
                    {results.users.length > 0 && <CommandSeparator />}
                    <CommandGroup heading="Posts">
                      {results.posts.map((post) => {
                        const PostIcon = getPostTypeIcon(post.postType);
                        return (
                          <CommandItem
                            key={post._id}
                            value={`post:${post._id}`}
                            onSelect={handleSelect}
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
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </>
                )}

                {/* Properties Section */}
                {results.properties.length > 0 && (
                  <>
                    {(results.users.length > 0 || results.posts.length > 0) && (
                      <CommandSeparator />
                    )}
                    <CommandGroup heading="Properties">
                      {results.properties.map((property) => (
                        <CommandItem
                          key={property._id}
                          value={`property:${property._id}`}
                          onSelect={handleSelect}
                        >
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
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </>
                )}

                {/* Footer hint */}
                <CommandSeparator />
                <div className="px-3 py-2 text-center">
                  <p className="text-xs text-muted-foreground">
                    Press{" "}
                    <kbd className="px-1.5 py-0.5 text-xs rounded bg-muted border">
                      Enter
                    </kbd>{" "}
                    to see all results
                  </p>
                </div>
              </>
            )}
          </CommandList>
        )}
      </Command>
    </div>
  );
}
