"use client";

import { useQuery } from "convex/react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { api } from "../../../../../../convex/_generated/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { HugeiconsIcon } from "@hugeicons/react";
import { Building02Icon, Add01Icon } from "@hugeicons/core-free-icons";
import { Link } from "@/i18n/navigation";

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

export default function YourListingsPage() {
  const t = useTranslations("properties");
  const router = useRouter();
  const properties = useQuery(api.properties.listMyListings, {});

  // Loading state
  if (properties === undefined) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-5 w-24 mt-1" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>

        {/* Cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <PropertyCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (properties.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header with Add button */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("listingsTitle")}</h1>
            <p className="text-muted-foreground">{t("listingsCount", { count: 0 })}</p>
          </div>
          <Link href="/properties/new">
            <Button className="gap-2">
              <HugeiconsIcon icon={Add01Icon} size={16} />
              {t("empty.addListing")}
            </Button>
          </Link>
        </div>

        {/* Empty state message */}
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="rounded-full bg-muted p-4 mb-4 text-muted-foreground">
            <HugeiconsIcon icon={Building02Icon} size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold mb-2">{t("empty.noListings")}</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {t("empty.noListingsDescription")}
          </p>
          <Link href="/properties/new">
            <Button className="gap-2">
              <HugeiconsIcon icon={Add01Icon} size={16} />
              {t("empty.addFirstListing")}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("listingsTitle")}</h1>
          <p className="text-muted-foreground">
            {t("listingsCount", { count: properties.length })}
          </p>
        </div>
        <Link href="/properties/new">
          <Button className="gap-2">
            <HugeiconsIcon icon={Add01Icon} size={16} />
            {t("empty.addListing")}
          </Button>
        </Link>
      </div>

      {/* Property grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {properties.map((property) => (
          <PropertyCard
            key={property._id}
            property={property}
            onClick={() => router.push(`/properties/${property._id}`)}
          />
        ))}
      </div>
    </div>
  );
}
