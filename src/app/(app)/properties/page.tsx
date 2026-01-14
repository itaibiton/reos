"use client";

import { useQuery } from "convex/react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { DashboardMap } from "@/components/dashboard/DashboardMap";
import { HugeiconsIcon } from "@hugeicons/react";
import { Building02Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { PropertyFilters } from "../../../../convex/search";

// Skeleton loader for property cards
function PropertyCardSkeleton() {
  return (
    <div className="rounded-xl border overflow-hidden">
      <Skeleton className="h-48 w-full" />
      <div className="p-4 space-y-3">
        <div className="space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-20" />
        </div>
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
  const searchParams = useSearchParams();

  // Build filters from URL params
  const filters: PropertyFilters = {};
  const city = searchParams.get("city");
  const type = searchParams.get("type");
  const bedrooms = searchParams.get("bedrooms");
  const priceMin = searchParams.get("priceMin");
  const priceMax = searchParams.get("priceMax");
  const bathrooms = searchParams.get("bathrooms");
  const sizeMin = searchParams.get("sizeMin");
  const sizeMax = searchParams.get("sizeMax");

  if (city) filters.city = city;
  if (type) filters.propertyType = type as PropertyFilters["propertyType"];
  if (bedrooms) filters.bedroomsMin = parseInt(bedrooms, 10);
  if (priceMin) filters.priceMin = parseInt(priceMin, 10);
  if (priceMax) filters.priceMax = parseInt(priceMax, 10);
  if (bathrooms) filters.bathroomsMin = parseInt(bathrooms, 10);
  if (sizeMin) filters.squareMetersMin = parseInt(sizeMin, 10);
  if (sizeMax) filters.squareMetersMax = parseInt(sizeMax, 10);

  const properties = useQuery(api.properties.list, filters);

  // Transform properties for map
  const mapProperties = properties
    ? properties
        .filter((p) => p.latitude && p.longitude)
        .map((p) => ({
          id: p._id,
          title: p.title,
          address: p.address,
          city: p.city,
          latitude: p.latitude!,
          longitude: p.longitude!,
          priceUsd: p.priceUsd,
          propertyType: p.propertyType,
          featuredImage: p.featuredImage,
        }))
    : [];

  // Loading state
  if (properties === undefined) {
    return (
      <div className="h-full flex">
        {/* Left side - Cards */}
        <div className="flex-1 p-6 overflow-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        </div>
        {/* Right side - Map skeleton */}
        <div className="w-1/2 hidden lg:block flex-shrink-0">
          <Skeleton className="h-full w-full rounded-none" />
        </div>
      </div>
    );
  }

  // Empty State
  if (properties.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center text-center px-4">
          <div className="rounded-full bg-muted p-4 mb-4 text-muted-foreground">
            <HugeiconsIcon icon={Building02Icon} size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold mb-2">No properties found</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {Object.keys(filters).length > 0
              ? "Try adjusting your filters."
              : "Start building your marketplace by adding your first property listing."}
          </p>
          {Object.keys(filters).length > 0 ? (
            <Button onClick={() => router.push("/properties")} variant="outline">
              Clear Filters
            </Button>
          ) : (
            <Link href="/properties/new">
              <Button>Add Your First Property</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      {/* Left side - Property Cards */}
      <div className="flex-1 p-6 overflow-auto">
        <p className="text-sm text-muted-foreground mb-4">
          {properties.length} {properties.length === 1 ? "property" : "properties"} found
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {properties.map((property) => (
            <PropertyCard
              key={property._id}
              property={property}
              onClick={() => router.push(`/properties/${property._id}`)}
            />
          ))}
        </div>
      </div>

      {/* Right side - Map (half width, flush to edges) */}
      <div className="w-1/2 hidden lg:block flex-shrink-0">
        <DashboardMap properties={mapProperties} className="h-full w-full" />
      </div>
    </div>
  );
}
