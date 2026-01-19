"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Search01Icon,
  Home01Icon,
  CheckmarkCircle01Icon,
} from "@hugeicons/core-free-icons";

interface PropertySelectorProps {
  selectedPropertyId: Id<"properties"> | null;
  onSelect: (propertyId: Id<"properties">) => void;
}

// Format price for compact display
function formatPrice(amount: number) {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  return `$${(amount / 1000).toFixed(0)}K`;
}

// Status badge variants
const STATUS_STYLES: Record<string, string> = {
  available: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  sold: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
};

export function PropertySelector({
  selectedPropertyId,
  onSelect,
}: PropertySelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user's properties
  const properties = useQuery(api.properties.listMyListings, {});

  // Filter by search query
  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    if (!searchQuery.trim()) return properties;

    const query = searchQuery.toLowerCase();
    return properties.filter((property) => {
      return (
        property.title?.toLowerCase().includes(query) ||
        property.address?.toLowerCase().includes(query) ||
        property.city?.toLowerCase().includes(query)
      );
    });
  }, [properties, searchQuery]);

  // Loading state
  if (properties === undefined) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-full" />
        <div className="space-y-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-2.5 p-2">
              <Skeleton className="h-12 w-12 rounded-md" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state - user has no properties
  if (properties.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
        <HugeiconsIcon
          icon={Home01Icon}
          size={40}
          className="mx-auto text-muted-foreground mb-3"
        />
        <p className="text-muted-foreground text-sm">
          You haven&apos;t listed any properties yet
        </p>
        <p className="text-muted-foreground/75 text-xs mt-1">
          Add a property listing first to share it in your feed
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Search input */}
      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          size={16}
          className="absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="text"
          placeholder="Search properties..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ps-8 h-9"
        />
      </div>

      {/* Properties list */}
      <div className="max-h-64 overflow-y-auto space-y-1.5">
        {filteredProperties.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No properties match your search
          </p>
        ) : (
          filteredProperties.map((property) => {
            const isSelected = selectedPropertyId === property._id;

            return (
              <button
                key={property._id}
                type="button"
                onClick={() => onSelect(property._id)}
                className={cn(
                  "w-full flex items-start gap-2.5 p-2 rounded-lg text-start transition-colors",
                  isSelected
                    ? "border border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                )}
              >
                {/* Thumbnail */}
                <div className="h-12 w-12 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                  {property.featuredImage ? (
                    <img
                      src={property.featuredImage}
                      alt={property.title || "Property"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <HugeiconsIcon
                        icon={Home01Icon}
                        size={20}
                        className="text-muted-foreground"
                      />
                    </div>
                  )}
                </div>

                {/* Property info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm truncate flex-1">
                      {property.title || "Untitled Property"}
                    </p>
                    {isSelected && (
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        size={16}
                        className="text-primary flex-shrink-0"
                      />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {property.city || "Unknown"}
                    {property.priceUsd && (
                      <>
                        {" "}
                        &bull; {formatPrice(property.priceUsd)}
                      </>
                    )}
                  </p>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "mt-1 text-[10px] px-1.5 py-0",
                      STATUS_STYLES[property.status || "available"]
                    )}
                  >
                    {property.status || "available"}
                  </Badge>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
