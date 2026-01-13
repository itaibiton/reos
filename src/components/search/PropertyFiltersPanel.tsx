"use client";

import * as React from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ChevronDownIcon, SlidersHorizontalIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ISRAELI_LOCATIONS, PROPERTY_TYPES } from "@/lib/constants";
import type { PropertyFilters } from "../../../convex/search";

export interface PropertyFiltersPanelProps {
  filters: PropertyFilters;
  onFiltersChange: (filters: PropertyFilters) => void;
  className?: string;
}

/**
 * PropertyFiltersPanel - Traditional filter controls for property search
 *
 * Features:
 * - Collapsible panel with filter dropdowns and inputs
 * - Immediate filtering on change (no submit button)
 * - Clear All button to reset all filters
 * - Works alongside smart search with shared state
 */
export function PropertyFiltersPanel({
  filters,
  onFiltersChange,
  className,
}: PropertyFiltersPanelProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Update a single filter field
  const updateFilter = <K extends keyof PropertyFilters>(
    key: K,
    value: PropertyFilters[K] | undefined
  ) => {
    const newFilters = { ...filters };

    // Remove the key if value is undefined/empty
    if (value === undefined || value === "" || value === null) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }

    onFiltersChange(newFilters);
  };

  // Clear all filters
  const handleClearAll = () => {
    onFiltersChange({});
  };

  // Check if any filters are active
  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={cn("border rounded-lg", className)}
    >
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-4 py-3 h-auto hover:bg-muted/50"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontalIcon className="size-4 text-muted-foreground" />
            <span className="text-sm font-medium">
              Filters
              {hasActiveFilters && (
                <span className="ml-2 text-xs text-muted-foreground">
                  ({Object.keys(filters).length} active)
                </span>
              )}
            </span>
          </div>
          <ChevronDownIcon
            className={cn(
              "size-4 text-muted-foreground transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="px-4 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-3">
          {/* City Filter */}
          <div className="space-y-1.5">
            <Label htmlFor="city-filter" className="text-xs font-medium">
              City
            </Label>
            <Select
              value={filters.city || ""}
              onValueChange={(value) =>
                updateFilter("city", value || undefined)
              }
            >
              <SelectTrigger id="city-filter" className="w-full">
                <SelectValue placeholder="Any city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any city</SelectItem>
                {ISRAELI_LOCATIONS.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Property Type Filter */}
          <div className="space-y-1.5">
            <Label htmlFor="type-filter" className="text-xs font-medium">
              Property Type
            </Label>
            <Select
              value={filters.propertyType || ""}
              onValueChange={(value) =>
                updateFilter(
                  "propertyType",
                  value
                    ? (value as PropertyFilters["propertyType"])
                    : undefined
                )
              }
            >
              <SelectTrigger id="type-filter" className="w-full">
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any type</SelectItem>
                {PROPERTY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Bedrooms Filter */}
          <div className="space-y-1.5">
            <Label htmlFor="bedrooms-filter" className="text-xs font-medium">
              Bedrooms
            </Label>
            <Select
              value={filters.bedroomsMin?.toString() || ""}
              onValueChange={(value) =>
                updateFilter(
                  "bedroomsMin",
                  value ? parseInt(value, 10) : undefined
                )
              }
            >
              <SelectTrigger id="bedrooms-filter" className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
                <SelectItem value="5">5+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bathrooms Filter */}
          <div className="space-y-1.5">
            <Label htmlFor="bathrooms-filter" className="text-xs font-medium">
              Bathrooms
            </Label>
            <Select
              value={filters.bathroomsMin?.toString() || ""}
              onValueChange={(value) =>
                updateFilter(
                  "bathroomsMin",
                  value ? parseInt(value, 10) : undefined
                )
              }
            >
              <SelectTrigger id="bathrooms-filter" className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any</SelectItem>
                <SelectItem value="1">1+</SelectItem>
                <SelectItem value="2">2+</SelectItem>
                <SelectItem value="3">3+</SelectItem>
                <SelectItem value="4">4+</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price Range - Min */}
          <div className="space-y-1.5">
            <Label htmlFor="price-min-filter" className="text-xs font-medium">
              Min Price (USD)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                id="price-min-filter"
                type="number"
                placeholder="0"
                value={filters.priceMin ?? ""}
                onChange={(e) =>
                  updateFilter(
                    "priceMin",
                    e.target.value ? parseInt(e.target.value, 10) : undefined
                  )
                }
                className="pl-6"
              />
            </div>
          </div>

          {/* Price Range - Max */}
          <div className="space-y-1.5">
            <Label htmlFor="price-max-filter" className="text-xs font-medium">
              Max Price (USD)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                id="price-max-filter"
                type="number"
                placeholder="Any"
                value={filters.priceMax ?? ""}
                onChange={(e) =>
                  updateFilter(
                    "priceMax",
                    e.target.value ? parseInt(e.target.value, 10) : undefined
                  )
                }
                className="pl-6"
              />
            </div>
          </div>

          {/* Size Range - Min */}
          <div className="space-y-1.5">
            <Label htmlFor="size-min-filter" className="text-xs font-medium">
              Min Size (m²)
            </Label>
            <Input
              id="size-min-filter"
              type="number"
              placeholder="0"
              value={filters.squareMetersMin ?? ""}
              onChange={(e) =>
                updateFilter(
                  "squareMetersMin",
                  e.target.value ? parseInt(e.target.value, 10) : undefined
                )
              }
            />
          </div>

          {/* Size Range - Max */}
          <div className="space-y-1.5">
            <Label htmlFor="size-max-filter" className="text-xs font-medium">
              Max Size (m²)
            </Label>
            <Input
              id="size-max-filter"
              type="number"
              placeholder="Any"
              value={filters.squareMetersMax ?? ""}
              onChange={(e) =>
                updateFilter(
                  "squareMetersMax",
                  e.target.value ? parseInt(e.target.value, 10) : undefined
                )
              }
            />
          </div>

          {/* Clear All Button */}
          {hasActiveFilters && (
            <div className="flex items-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="w-full"
              >
                Clear All
              </Button>
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
