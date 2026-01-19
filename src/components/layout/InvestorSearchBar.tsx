"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useAction } from "convex/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterIcon, Search01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { ChevronDownIcon, Loader2Icon } from "lucide-react";
import { ISRAELI_LOCATIONS, PROPERTY_TYPES } from "@/lib/constants";
import { api } from "../../../convex/_generated/api";

// Sentinel value for "Any" selection
const ANY_VALUE = "__any__";

interface Filters {
  city?: string;
  propertyType?: string;
  bedroomsMin?: number;
  priceMin?: number;
  priceMax?: number;
  bathroomsMin?: number;
  squareMetersMin?: number;
  squareMetersMax?: number;
}

export function InvestorSearchBar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const parseSearchQuery = useAction(api.search.parseSearchQuery);

  // Smart search state
  const [searchQuery, setSearchQuery] = React.useState("");
  const [isSearching, setIsSearching] = React.useState(false);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Mobile sheet state
  const [isMobileSheetOpen, setIsMobileSheetOpen] = React.useState(false);

  // Initialize filters from URL
  const [filters, setFilters] = React.useState<Filters>(() => {
    const initial: Filters = {};
    const city = searchParams.get("city");
    const type = searchParams.get("type");
    const bedrooms = searchParams.get("bedrooms");
    const priceMin = searchParams.get("priceMin");
    const priceMax = searchParams.get("priceMax");
    const bathrooms = searchParams.get("bathrooms");
    const sizeMin = searchParams.get("sizeMin");
    const sizeMax = searchParams.get("sizeMax");

    if (city) initial.city = city;
    if (type) initial.propertyType = type;
    if (bedrooms) initial.bedroomsMin = parseInt(bedrooms, 10);
    if (priceMin) initial.priceMin = parseInt(priceMin, 10);
    if (priceMax) initial.priceMax = parseInt(priceMax, 10);
    if (bathrooms) initial.bathroomsMin = parseInt(bathrooms, 10);
    if (sizeMin) initial.squareMetersMin = parseInt(sizeMin, 10);
    if (sizeMax) initial.squareMetersMax = parseInt(sizeMax, 10);

    return initial;
  });

  // Draft state for advanced filters
  const [advancedDraft, setAdvancedDraft] = React.useState<Filters>({});
  const [isAdvancedOpen, setIsAdvancedOpen] = React.useState(false);

  // Sync advanced draft when popover opens
  React.useEffect(() => {
    if (isAdvancedOpen) {
      setAdvancedDraft({
        bathroomsMin: filters.bathroomsMin,
        squareMetersMin: filters.squareMetersMin,
        squareMetersMax: filters.squareMetersMax,
      });
    }
  }, [isAdvancedOpen, filters]);

  // Apply filters to URL
  const applyFilters = React.useCallback(
    (newFilters: Filters) => {
      const params = new URLSearchParams();

      if (newFilters.city) params.set("city", newFilters.city);
      if (newFilters.propertyType) params.set("type", newFilters.propertyType);
      if (newFilters.bedroomsMin) params.set("bedrooms", newFilters.bedroomsMin.toString());
      if (newFilters.priceMin) params.set("priceMin", newFilters.priceMin.toString());
      if (newFilters.priceMax) params.set("priceMax", newFilters.priceMax.toString());
      if (newFilters.bathroomsMin) params.set("bathrooms", newFilters.bathroomsMin.toString());
      if (newFilters.squareMetersMin) params.set("sizeMin", newFilters.squareMetersMin.toString());
      if (newFilters.squareMetersMax) params.set("sizeMax", newFilters.squareMetersMax.toString());

      const queryString = params.toString();
      const targetPath = pathname === "/properties" ? pathname : "/properties";
      router.push(queryString ? `${targetPath}?${queryString}` : targetPath);
    },
    [router, pathname]
  );

  // Handle immediate filter change (typical filters)
  const handleFilterChange = (key: keyof Filters, value: string | number | undefined) => {
    const newFilters = { ...filters };

    if (value === undefined || value === "" || value === ANY_VALUE) {
      delete newFilters[key];
    } else {
      (newFilters as Record<string, string | number>)[key] = value;
    }

    setFilters(newFilters);
    applyFilters(newFilters);
  };

  // Handle advanced filter draft change
  const updateAdvancedDraft = (key: keyof Filters, value: number | undefined) => {
    setAdvancedDraft((prev) => {
      const newDraft = { ...prev };
      if (value === undefined) {
        delete newDraft[key];
      } else {
        (newDraft as Record<string, number>)[key] = value;
      }
      return newDraft;
    });
  };

  // Apply advanced filters
  const handleApplyAdvanced = () => {
    const newFilters = {
      ...filters,
      bathroomsMin: advancedDraft.bathroomsMin,
      squareMetersMin: advancedDraft.squareMetersMin,
      squareMetersMax: advancedDraft.squareMetersMax,
    };

    // Clean undefined values
    Object.keys(newFilters).forEach((key) => {
      if (newFilters[key as keyof Filters] === undefined) {
        delete newFilters[key as keyof Filters];
      }
    });

    setFilters(newFilters);
    applyFilters(newFilters);
    setIsAdvancedOpen(false);
  };

  // Check if advanced has changes
  const hasAdvancedChanges =
    advancedDraft.bathroomsMin !== filters.bathroomsMin ||
    advancedDraft.squareMetersMin !== filters.squareMetersMin ||
    advancedDraft.squareMetersMax !== filters.squareMetersMax;

  // Handle smart search submission
  const handleSmartSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    try {
      const parsedFilters = await parseSearchQuery({ query: searchQuery.trim() });
      const newFilters: Filters = { ...parsedFilters };
      setFilters(newFilters);
      applyFilters(newFilters);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    searchInputRef.current?.focus();
  };

  // Count active filters
  const activeFilterCount = Object.keys(filters).length;

  // Count advanced filters applied
  const advancedFilterCount = [
    filters.bathroomsMin,
    filters.squareMetersMin,
    filters.squareMetersMax,
  ].filter(Boolean).length;

  // Filter controls (shared between desktop and mobile)
  const FilterControls = ({ inSheet = false }: { inSheet?: boolean }) => (
    <div className={cn("flex items-center gap-3", inSheet && "flex-col items-stretch")}>
      {/* City Filter */}
      <div className={cn(inSheet && "space-y-1.5")}>
        {inSheet && <Label className="text-xs font-medium">City</Label>}
        <Select
          value={filters.city || ANY_VALUE}
          onValueChange={(value) =>
            handleFilterChange("city", value === ANY_VALUE ? undefined : value)
          }
        >
          <SelectTrigger className={cn(inSheet ? "w-full" : "w-[140px]")}>
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_VALUE}>All Cities</SelectItem>
            {ISRAELI_LOCATIONS.map((location) => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Property Type Filter */}
      <div className={cn(inSheet && "space-y-1.5")}>
        {inSheet && <Label className="text-xs font-medium">Property Type</Label>}
        <Select
          value={filters.propertyType || ANY_VALUE}
          onValueChange={(value) =>
            handleFilterChange("propertyType", value === ANY_VALUE ? undefined : value)
          }
        >
          <SelectTrigger className={cn(inSheet ? "w-full" : "w-[130px]")}>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_VALUE}>All Types</SelectItem>
            {PROPERTY_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bedrooms Filter */}
      <div className={cn(inSheet && "space-y-1.5")}>
        {inSheet && <Label className="text-xs font-medium">Bedrooms</Label>}
        <Select
          value={filters.bedroomsMin?.toString() || ANY_VALUE}
          onValueChange={(value) =>
            handleFilterChange(
              "bedroomsMin",
              value === ANY_VALUE ? undefined : parseInt(value, 10)
            )
          }
        >
          <SelectTrigger className={cn(inSheet ? "w-full" : "w-[100px]")}>
            <SelectValue placeholder="Beds" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_VALUE}>Beds</SelectItem>
            <SelectItem value="1">1+</SelectItem>
            <SelectItem value="2">2+</SelectItem>
            <SelectItem value="3">3+</SelectItem>
            <SelectItem value="4">4+</SelectItem>
            <SelectItem value="5">5+</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className={cn(inSheet && "space-y-1.5")}>
        {inSheet && <Label className="text-xs font-medium">Price Range</Label>}
        <div className="grid grid-cols-2 gap-2">
          <div className="relative">
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              type="number"
              placeholder="Min"
              value={filters.priceMin ?? ""}
              onChange={(e) =>
                handleFilterChange(
                  "priceMin",
                  e.target.value ? parseInt(e.target.value, 10) : undefined
                )
              }
              className={cn("ps-6 h-9", inSheet ? "w-full" : "w-[100px]")}
            />
          </div>
          <div className="relative">
            <span className="absolute start-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              $
            </span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.priceMax ?? ""}
              onChange={(e) =>
                handleFilterChange(
                  "priceMax",
                  e.target.value ? parseInt(e.target.value, 10) : undefined
                )
              }
              className={cn("ps-6 h-9", inSheet ? "w-full" : "w-[100px]")}
            />
          </div>
        </div>
      </div>

      {/* Advanced filters in sheet */}
      {inSheet && (
        <>
          {/* Bathrooms */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Bathrooms</Label>
            <Select
              value={filters.bathroomsMin?.toString() || ANY_VALUE}
              onValueChange={(value) =>
                handleFilterChange(
                  "bathroomsMin",
                  value === ANY_VALUE ? undefined : parseInt(value, 10)
                )
              }
            >
              <SelectTrigger className="w-full">
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

          {/* Size Range */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Size (m²)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.squareMetersMin ?? ""}
                onChange={(e) =>
                  handleFilterChange(
                    "squareMetersMin",
                    e.target.value ? parseInt(e.target.value, 10) : undefined
                  )
                }
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.squareMetersMax ?? ""}
                onChange={(e) =>
                  handleFilterChange(
                    "squareMetersMax",
                    e.target.value ? parseInt(e.target.value, 10) : undefined
                  )
                }
              />
            </div>
          </div>
        </>
      )}

      {/* Advanced Filters Popover - desktop only */}
      {!inSheet && (
        <Popover open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5 h-9">
              <HugeiconsIcon icon={FilterIcon} size={16} strokeWidth={1.5} />
              <span>More</span>
              {advancedFilterCount > 0 && (
                <span className="rounded-full bg-primary text-primary-foreground text-xs px-1.5 py-0.5 min-w-5 text-center">
                  {advancedFilterCount}
                </span>
              )}
              <ChevronDownIcon
                className={cn("size-4 transition-transform", isAdvancedOpen && "rotate-180")}
              />
            </Button>
          </PopoverTrigger>

          <PopoverContent align="start" className="w-[320px] p-4">
            <div className="space-y-4">
              {/* Bathrooms */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium">Bathrooms</Label>
                <Select
                  value={advancedDraft.bathroomsMin?.toString() || ANY_VALUE}
                  onValueChange={(value) =>
                    updateAdvancedDraft(
                      "bathroomsMin",
                      value === ANY_VALUE ? undefined : parseInt(value, 10)
                    )
                  }
                >
                  <SelectTrigger className="w-full">
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

              {/* Size Range */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Min Size (m²)</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={advancedDraft.squareMetersMin ?? ""}
                    onChange={(e) =>
                      updateAdvancedDraft(
                        "squareMetersMin",
                        e.target.value ? parseInt(e.target.value, 10) : undefined
                      )
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Max Size (m²)</Label>
                  <Input
                    type="number"
                    placeholder="Any"
                    value={advancedDraft.squareMetersMax ?? ""}
                    onChange={(e) =>
                      updateAdvancedDraft(
                        "squareMetersMax",
                        e.target.value ? parseInt(e.target.value, 10) : undefined
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex justify-end mt-4 pt-4 border-t">
              <Button size="sm" onClick={handleApplyAdvanced} disabled={!hasAdvancedChanges}>
                Apply
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );

  return (
    <div className="border-b bg-background flex-shrink-0">
      <div className="px-4 py-4">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center gap-3">
          {/* Smart Search - Full width */}
          <form
            onSubmit={handleSmartSearch}
            className="flex items-center gap-2 flex-1"
          >
            <div className="relative flex-1">
              <div className="absolute start-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                {isSearching ? (
                  <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                ) : (
                  <HugeiconsIcon
                    icon={Search01Icon}
                    size={16}
                    strokeWidth={1.5}
                    className="text-muted-foreground"
                  />
                )}
              </div>
              <Input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Try 'apartments in Tel Aviv under $500k'"
                disabled={isSearching}
                className={cn(
                  "ps-10 h-9 w-full",
                  searchQuery && "pe-8"
                )}
              />
              {searchQuery && !isSearching && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleClearSearch}
                  className="absolute end-1 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-transparent"
                >
                  <HugeiconsIcon
                    icon={Cancel01Icon}
                    size={14}
                    strokeWidth={1.5}
                    className="text-muted-foreground hover:text-foreground"
                  />
                </Button>
              )}
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={!searchQuery.trim() || isSearching}
              className="h-9"
            >
              Search
            </Button>
          </form>

          <div className="h-6 w-px bg-border flex-shrink-0" />

          {/* Filters */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <FilterControls />
          </div>
        </div>

        {/* Mobile Layout - Sheet trigger */}
        <div className="md:hidden">
          <Sheet open={isMobileSheetOpen} onOpenChange={setIsMobileSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full justify-between h-10">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Search01Icon} size={18} strokeWidth={1.5} />
                  <span className="text-muted-foreground">Search & Filter</span>
                </div>
                {activeFilterCount > 0 && (
                  <span className="rounded-full bg-primary text-primary-foreground text-xs px-2 py-0.5">
                    {activeFilterCount} active
                  </span>
                )}
              </Button>
            </SheetTrigger>

            <SheetContent side="bottom" className="h-[85vh] rounded-t-xl px-6">
              <SheetHeader className="pb-4">
                <SheetTitle>Search & Filters</SheetTitle>
              </SheetHeader>

              <div className="space-y-6 overflow-auto pb-20 px-1">
                {/* Smart Search in sheet */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">AI-Powered Search</Label>
                  <form onSubmit={handleSmartSearch} className="flex gap-2">
                    <div className="relative flex-1">
                      <div className="absolute start-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                        {isSearching ? (
                          <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                        ) : (
                          <HugeiconsIcon
                            icon={Search01Icon}
                            size={16}
                            strokeWidth={1.5}
                            className="text-muted-foreground"
                          />
                        )}
                      </div>
                      <Input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Try 'apartments in Tel Aviv under $500k'"
                        disabled={isSearching}
                        className="ps-10"
                      />
                    </div>
                    <Button type="submit" disabled={!searchQuery.trim() || isSearching}>
                      Search
                    </Button>
                  </form>
                </div>

                <div className="h-px bg-border" />

                {/* Filter controls */}
                <FilterControls inSheet />

                {/* Clear all filters */}
                {activeFilterCount > 0 && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      setFilters({});
                      applyFilters({});
                      setIsMobileSheetOpen(false);
                    }}
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}
