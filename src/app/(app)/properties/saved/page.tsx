"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PropertyCard } from "@/components/properties/PropertyCard";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { FavouriteIcon } from "@hugeicons/core-free-icons";

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

export default function SavedPropertiesPage() {
  const router = useRouter();
  const savedProperties = useQuery(api.favorites.listMyFavorites, {});

  // Loading state with skeletons
  if (savedProperties === undefined) {
    return (
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-5 w-32 mt-1" />
        </div>

        {/* Skeleton grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Saved Properties</h1>
        <p className="text-muted-foreground">
          {savedProperties.length}{" "}
          {savedProperties.length === 1 ? "property" : "properties"} saved
        </p>
      </div>

      {/* Empty State */}
      {savedProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="rounded-full bg-muted p-4 mb-4 text-muted-foreground">
            <HugeiconsIcon icon={FavouriteIcon} size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold mb-2">No saved properties</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            Browse the marketplace and save properties you&apos;re interested
            in to view them here.
          </p>
          <Link href="/properties">
            <Button>Browse Marketplace</Button>
          </Link>
        </div>
      ) : (
        /* Property Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedProperties.map((property) => (
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
