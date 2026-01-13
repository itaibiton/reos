"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { SearchMagnifyGlass01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Loader2Icon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * SearchInput - Natural language search input with AI parsing
 *
 * Features:
 * - Text input with search icon prefix
 * - Loading state with spinner during AI parsing
 * - Clear button when input has value
 * - Submit on Enter key or search button click
 */
export function SearchInput({
  onSearch,
  isLoading = false,
  placeholder = "Search properties... try 'apartments in Tel Aviv under $500k'",
  className,
}: SearchInputProps) {
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !isLoading) {
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <div className="relative flex items-center">
        {/* Search Icon or Loading Spinner */}
        <div className="absolute left-3 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
          ) : (
            <HugeiconsIcon
              icon={SearchMagnifyGlass01Icon}
              size={16}
              strokeWidth={1.5}
              className="text-muted-foreground"
            />
          )}
        </div>

        {/* Input Field */}
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading}
          className="pl-10 pr-20"
        />

        {/* Clear Button */}
        {query && !isLoading && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={handleClear}
            className="absolute right-12 hover:bg-transparent"
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={16}
              strokeWidth={1.5}
              className="text-muted-foreground hover:text-foreground"
            />
            <span className="sr-only">Clear search</span>
          </Button>
        )}

        {/* Search Button */}
        <Button
          type="submit"
          size="sm"
          disabled={!query.trim() || isLoading}
          className="absolute right-1"
        >
          Search
        </Button>
      </div>
    </form>
  );
}
