"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import type { PropertyFilters } from "../../../convex/search";

// Keys that can be removed from filters
export type PropertyFilterKey =
  | "status"
  | "city"
  | "propertyType"
  | "priceMin"
  | "priceMax"
  | "bedroomsMin"
  | "bathroomsMin"
  | "squareMetersMin"
  | "squareMetersMax"
  | "limit";

export interface FilterChipsProps {
  filters: PropertyFilters;
  onRemove: (filterKey: PropertyFilterKey) => void;
  onClearAll: () => void;
  className?: string;
}

/**
 * FilterChips - Display active search filters as removable badges
 *
 * Shows parsed filters from natural language search as individual chips.
 * Each chip can be removed individually, or all cleared at once.
 */
export function FilterChips({
  filters,
  onRemove,
  onClearAll,
  className,
}: FilterChipsProps) {
  // Format price with USD currency
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Format property type for display
  const formatPropertyType = (type: string): string => {
    const typeMap: Record<string, string> = {
      residential: "Residential",
      commercial: "Commercial",
      mixed_use: "Mixed Use",
      land: "Land",
    };
    return typeMap[type] || type;
  };

  // Build array of filter chips
  const filterChips: Array<{
    key: PropertyFilterKey;
    label: string;
    value: string;
  }> = [];

  if (filters.city) {
    filterChips.push({
      key: "city",
      label: "City",
      value: filters.city,
    });
  }

  if (filters.propertyType) {
    filterChips.push({
      key: "propertyType",
      label: "Type",
      value: formatPropertyType(filters.propertyType),
    });
  }

  if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
    let priceValue = "";
    if (filters.priceMin && filters.priceMax) {
      priceValue = `${formatPrice(filters.priceMin)} - ${formatPrice(filters.priceMax)}`;
    } else if (filters.priceMin) {
      priceValue = `From ${formatPrice(filters.priceMin)}`;
    } else if (filters.priceMax) {
      priceValue = `Up to ${formatPrice(filters.priceMax)}`;
    }

    if (priceValue) {
      filterChips.push({
        key: filters.priceMin ? "priceMin" : "priceMax",
        label: "Price",
        value: priceValue,
      });
    }
  }

  if (filters.bedroomsMin) {
    filterChips.push({
      key: "bedroomsMin",
      label: "Bedrooms",
      value: `${filters.bedroomsMin}+ beds`,
    });
  }

  if (filters.bathroomsMin) {
    filterChips.push({
      key: "bathroomsMin",
      label: "Bathrooms",
      value: `${filters.bathroomsMin}+ baths`,
    });
  }

  if (
    filters.squareMetersMin !== undefined ||
    filters.squareMetersMax !== undefined
  ) {
    let sizeValue = "";
    if (filters.squareMetersMin && filters.squareMetersMax) {
      sizeValue = `${filters.squareMetersMin}-${filters.squareMetersMax} m²`;
    } else if (filters.squareMetersMin) {
      sizeValue = `${filters.squareMetersMin}+ m²`;
    } else if (filters.squareMetersMax) {
      sizeValue = `Up to ${filters.squareMetersMax} m²`;
    }

    if (sizeValue) {
      filterChips.push({
        key: filters.squareMetersMin ? "squareMetersMin" : "squareMetersMax",
        label: "Size",
        value: sizeValue,
      });
    }
  }

  // Don't render if no active filters
  if (filterChips.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex items-center gap-2 flex-wrap", className)}>
      {/* Filter Chips */}
      {filterChips.map((chip) => (
        <Badge
          key={chip.key}
          variant="secondary"
          className="gap-1.5 ps-3 pe-2 py-1.5 h-auto"
        >
          <span className="text-xs">
            <span className="font-semibold">{chip.label}:</span> {chip.value}
          </span>
          <button
            type="button"
            onClick={() => onRemove(chip.key)}
            className="ms-0.5 rounded-full hover:bg-secondary-foreground/10 p-0.5 transition-colors"
            aria-label={`Remove ${chip.label} filter`}
          >
            <HugeiconsIcon
              icon={Cancel01Icon}
              size={12}
              strokeWidth={2}
              className="text-secondary-foreground/70 hover:text-secondary-foreground"
            />
          </button>
        </Badge>
      ))}

      {/* Clear All Button (show when 2+ filters) */}
      {filterChips.length > 1 && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="h-7 px-2 text-xs"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
