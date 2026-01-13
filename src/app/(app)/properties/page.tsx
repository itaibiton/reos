"use client";

import { useState } from "react";
import { useQuery, useAction } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { SearchInput } from "@/components/search/SearchInput";
import { FilterChips, type PropertyFilterKey } from "@/components/search/FilterChips";
import { PropertyFiltersPanel } from "@/components/search/PropertyFiltersPanel";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Building02Icon } from "@hugeicons/core-free-icons";
import type { PropertyFilters } from "../../../../convex/search";

// Skeleton loader for property cards
function PropertyCardSkeleton() {
  return (
    <div className="rounded-xl border overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="aspect-video w-full" />

      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Title and location */}
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Price */}
        <div className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>

        {/* Metrics */}
        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>

        {/* Footer */}
        <div className="flex gap-4 border-t pt-3">
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-14" />
          <Skeleton className="h-4 w-14" />
        </div>
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  const router = useRouter();

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<PropertyFilters>({});
  const [isSearching, setIsSearching] = useState(false);

  // Actions and queries
  const parseSearchQuery = useAction(api.search.parseSearchQuery);
  const properties = useQuery(api.properties.list, filters);

  // Handle search submit
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setIsSearching(true);

    try {
      const parsedFilters = await parseSearchQuery({ query });
      setFilters(parsedFilters);
    } catch (error) {
      console.error("Error parsing search query:", error);
      // On error, clear filters to show all properties
      setFilters({});
    } finally {
      setIsSearching(false);
    }
  };

  // Handle removing individual filter
  const handleRemoveFilter = (filterKey: PropertyFilterKey) => {
    const newFilters = { ...filters };

    // Handle price range - remove both min and max if either is removed
    if (filterKey === "priceMin" || filterKey === "priceMax") {
      delete newFilters.priceMin;
      delete newFilters.priceMax;
    }
    // Handle size range - remove both min and max if either is removed
    else if (filterKey === "squareMetersMin" || filterKey === "squareMetersMax") {
      delete newFilters.squareMetersMin;
      delete newFilters.squareMetersMax;
    }
    // Remove single filter
    else {
      delete newFilters[filterKey];
    }

    setFilters(newFilters);

    // Clear search query if all filters removed
    if (Object.keys(newFilters).length === 0) {
      setSearchQuery("");
    }
  };

  // Handle clearing all filters
  const handleClearAllFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  // Handle manual filter changes from PropertyFiltersPanel
  const handleFiltersChange = (newFilters: PropertyFilters) => {
    setFilters(newFilters);
    // Clear search query when manual filters are applied to avoid confusion
    if (Object.keys(newFilters).length > 0) {
      setSearchQuery("");
    }
  };

  // Loading state with skeletons
  if (properties === undefined) {
    return (
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Skeleton grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Property Marketplace</h1>
          <p className="text-muted-foreground">
            {properties.length} {properties.length === 1 ? "property" : "properties"} available
          </p>
        </div>
        <Link href="/properties/new">
          <Button>Add Property</Button>
        </Link>
      </div>

      {/* Search Section */}
      <div className="mb-6 space-y-3">
        <SearchInput
          onSearch={handleSearch}
          isLoading={isSearching}
          placeholder="Search properties... try 'apartments in Tel Aviv under $500k'"
        />

        {/* Manual Filters Panel */}
        <PropertyFiltersPanel
          filters={filters}
          onFiltersChange={handleFiltersChange}
        />

        {/* Filter Chips - only show when filters exist */}
        {Object.keys(filters).length > 0 && (
          <FilterChips
            filters={filters}
            onRemove={handleRemoveFilter}
            onClearAll={handleClearAllFilters}
          />
        )}
      </div>

      {/* Empty State */}
      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="rounded-full bg-muted p-4 mb-4 text-muted-foreground">
            <HugeiconsIcon icon={Building02Icon} size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold mb-2">No properties yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Start building your marketplace by adding your first property listing.
          </p>
          <Link href="/properties/new">
            <Button>Add Your First Property</Button>
          </Link>
        </div>
      ) : (
        /* Property Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              onClick={() => router.push(`/properties/${property._id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
