"use client";

import * as React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

// Sentinel value for "Any" selection (Radix Select doesn't allow empty strings)
const ANY_VALUE = "__any__";

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
 * - Draft state with Apply button (filters only applied on submit)
 * - Clear All button to reset all filters
 * - Works alongside smart search with shared state
 */
export function PropertyFiltersPanel({
  filters,
  onFiltersChange,
  className,
}: PropertyFiltersPanelProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Draft state for filters (not applied until user clicks Apply)
  const [draftFilters, setDraftFilters] = React.useState<PropertyFilters>(filters);

  // Sync draft with external filters when they change (e.g., from smart search)
  React.useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  // Update a single draft filter field
  const updateDraftFilter = <K extends keyof PropertyFilters>(
    key: K,
    value: PropertyFilters[K] | undefined
  ) => {
    setDraftFilters((prev) => {
      const newFilters = { ...prev };

      // Remove the key if value is undefined/empty
      if (value === undefined || value === "" || value === null) {
        delete newFilters[key];
      } else {
        newFilters[key] = value;
      }

      return newFilters;
    });
  };

  // Apply draft filters
  const handleApply = () => {
    onFiltersChange(draftFilters);
    setIsOpen(false);
  };

  // Clear all draft filters
  const handleClearAll = () => {
    setDraftFilters({});
  };

  // Check if draft has changes from applied filters
  const hasChanges = JSON.stringify(draftFilters) !== JSON.stringify(filters);

  // Check if any draft filters are set
  const hasDraftFilters = Object.keys(draftFilters).length > 0;

  // Check if any applied filters are active
  const hasActiveFilters = Object.keys(filters).length > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("gap-2", className)}
        >
          <SlidersHorizontalIcon className="size-4" />
          <span>Filters</span>
          {hasActiveFilters && (
            <span className="rounded-full bg-primary text-primary-foreground text-xs px-1.5 py-0.5 min-w-5 text-center">
              {Object.keys(filters).length}
            </span>
          )}
          <ChevronDownIcon
            className={cn(
              "size-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[380px] p-4">
        <div className="grid grid-cols-2 gap-3">
          {/* City Filter */}
          <div className="space-y-1.5">
            <Label htmlFor="city-filter" className="text-xs font-medium">
              City
            </Label>
            <Select
              value={draftFilters.city || ANY_VALUE}
              onValueChange={(value) =>
                updateDraftFilter("city", value === ANY_VALUE ? undefined : value)
              }
            >
              <SelectTrigger id="city-filter" className="w-full">
                <SelectValue placeholder="Any city" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_VALUE}>Any city</SelectItem>
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
              value={draftFilters.propertyType || ANY_VALUE}
              onValueChange={(value) =>
                updateDraftFilter(
                  "propertyType",
                  value === ANY_VALUE
                    ? undefined
                    : (value as PropertyFilters["propertyType"])
                )
              }
            >
              <SelectTrigger id="type-filter" className="w-full">
                <SelectValue placeholder="Any type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_VALUE}>Any type</SelectItem>
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
              value={draftFilters.bedroomsMin?.toString() || ANY_VALUE}
              onValueChange={(value) =>
                updateDraftFilter(
                  "bedroomsMin",
                  value === ANY_VALUE ? undefined : parseInt(value, 10)
                )
              }
            >
              <SelectTrigger id="bedrooms-filter" className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_VALUE}>Any</SelectItem>
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
              value={draftFilters.bathroomsMin?.toString() || ANY_VALUE}
              onValueChange={(value) =>
                updateDraftFilter(
                  "bathroomsMin",
                  value === ANY_VALUE ? undefined : parseInt(value, 10)
                )
              }
            >
              <SelectTrigger id="bathrooms-filter" className="w-full">
                <SelectValue placeholder="Any" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_VALUE}>Any</SelectItem>
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
              <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                id="price-min-filter"
                type="number"
                placeholder="0"
                value={draftFilters.priceMin ?? ""}
                onChange={(e) =>
                  updateDraftFilter(
                    "priceMin",
                    e.target.value ? parseInt(e.target.value, 10) : undefined
                  )
                }
                className="ps-6"
              />
            </div>
          </div>

          {/* Price Range - Max */}
          <div className="space-y-1.5">
            <Label htmlFor="price-max-filter" className="text-xs font-medium">
              Max Price (USD)
            </Label>
            <div className="relative">
              <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                $
              </span>
              <Input
                id="price-max-filter"
                type="number"
                placeholder="Any"
                value={draftFilters.priceMax ?? ""}
                onChange={(e) =>
                  updateDraftFilter(
                    "priceMax",
                    e.target.value ? parseInt(e.target.value, 10) : undefined
                  )
                }
                className="ps-6"
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
              value={draftFilters.squareMetersMin ?? ""}
              onChange={(e) =>
                updateDraftFilter(
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
              value={draftFilters.squareMetersMax ?? ""}
              onChange={(e) =>
                updateDraftFilter(
                  "squareMetersMax",
                  e.target.value ? parseInt(e.target.value, 10) : undefined
                )
              }
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t">
          {hasDraftFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
            >
              Clear All
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={handleApply}
            disabled={!hasChanges}
          >
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
