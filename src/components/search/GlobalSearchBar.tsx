"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import debounce from "lodash.debounce";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";
import { SearchAutocomplete } from "./SearchAutocomplete";

export function GlobalSearchBar() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
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
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setInputValue(value);

      if (value.length >= 1) {
        debouncedSearch(value);
      } else {
        setSearchQuery("");
      }
    },
    [debouncedSearch]
  );

  // Handle form submit (Enter key)
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmed = inputValue.trim();
      if (trimmed) {
        // Save search to history
        const totalResults =
          (results?.posts?.length ?? 0) +
          (results?.users?.length ?? 0) +
          (results?.properties?.length ?? 0);
        await saveSearch({ query: trimmed, resultCount: totalResults });

        // Navigate to search results page
        router.push(`/search?q=${encodeURIComponent(trimmed)}`);
        setIsOpen(false);
        inputRef.current?.blur();
      }
    },
    [inputValue, results, saveSearch, router]
  );

  // Handle focus
  const handleFocus = useCallback(() => {
    setIsOpen(true);
  }, []);

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

  // Handle result click - navigate based on type
  const handleResultClick = useCallback(
    async (
      type: "post" | "user" | "property" | "search",
      id: string,
      query?: string
    ) => {
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
          if (query) {
            // Save and navigate
            await saveSearch({ query, resultCount: 0 });
            router.push(`/search?q=${encodeURIComponent(query)}`);
          }
          break;
      }
    },
    [router, saveSearch]
  );

  // Handle clearing a recent search
  const handleClearRecent = useCallback(
    async (id: string) => {
      await deleteSearch({ searchId: id as Id<"searchHistory"> });
    },
    [deleteSearch]
  );

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    },
    []
  );

  // Calculate loading state
  const isLoading = searchQuery.length >= 1 && results === undefined;

  return (
    <div ref={containerRef} className="relative w-64 md:w-80">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          {/* Search Icon */}
          <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
          </div>

          {/* Input */}
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder="Search users, posts, properties..."
            className="h-9 pl-10 pr-4"
          />
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <SearchAutocomplete
          results={results}
          recentSearches={recentSearches}
          searchQuery={searchQuery}
          onResultClick={handleResultClick}
          onClearRecent={handleClearRecent}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
