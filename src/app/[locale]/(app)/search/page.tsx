"use client";

import { useSearchParams } from "next/navigation";
import { useMutation } from "convex/react";
import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { api } from "../../../../../convex/_generated/api";
import { SearchResults } from "@/components/search/SearchResults";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon } from "@hugeicons/core-free-icons";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const type = searchParams.get("type") as "all" | "user" | "post" | "property" | null;
  const t = useTranslations("search");

  // Track if search has been saved for this query
  const savedQueryRef = useRef<string>("");

  // Save search to history when query changes
  const saveSearch = useMutation(api.searchHistory.saveSearch);

  useEffect(() => {
    // Only save if query is not empty and hasn't been saved yet
    if (query.length >= 1 && query !== savedQueryRef.current) {
      savedQueryRef.current = query;
      // Save with resultCount 0 initially (we could update after results load)
      saveSearch({ query, resultCount: 0 }).catch(() => {
        // Silently ignore errors (user might not be authenticated)
      });
    }
  }, [query, saveSearch]);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        {query && (
          <p className="text-muted-foreground mt-1">
            {t("results.showing", { query })}
          </p>
        )}
      </div>

      {/* Results or empty state */}
      {query ? (
        <SearchResults query={query} initialType={type ?? "all"} />
      ) : (
        <div className="flex flex-col items-center text-center py-12">
          <div className="rounded-full bg-muted p-4 mb-4 text-muted-foreground">
            <HugeiconsIcon icon={Search01Icon} size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold mb-2">{t("searchFor")}</h2>
          <p className="text-muted-foreground max-w-md">
            {t("enterTerm")}
          </p>
        </div>
      )}
    </div>
  );
}
