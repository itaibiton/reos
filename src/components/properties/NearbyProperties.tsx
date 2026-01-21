"use client";

import { useQuery } from "convex/react";
import { useTranslations, useFormatter } from "next-intl";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "@/i18n/navigation";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Bathtub01Icon,
  Square01Icon,
  Location01Icon,
  Building02Icon,
} from "@hugeicons/core-free-icons";

interface NearbyPropertiesProps {
  city: string;
  currentPropertyId: Id<"properties">;
  propertyType?: string;
  className?: string;
}

function PropertyCardSkeleton() {
  return (
    <div className="rounded-lg border overflow-hidden">
      <Skeleton className="h-32 w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export function NearbyProperties({
  city,
  currentPropertyId,
  propertyType,
  className,
}: NearbyPropertiesProps) {
  const t = useTranslations("properties.nearby");
  const tCommon = useTranslations("common");
  const format = useFormatter();

  // Fetch properties in the same city
  const properties = useQuery(api.properties.list, {
    city,
    status: "available",
    limit: 10,
  });

  // Filter out the current property and take up to 4
  const nearbyProperties = properties
    ?.filter((p) => p._id !== currentPropertyId)
    .slice(0, 4);

  // Loading state
  if (properties === undefined) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-lg">
            <HugeiconsIcon icon={Building02Icon} size={20} />
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (!nearbyProperties || nearbyProperties.length === 0) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="flex items-center gap-2 text-lg">
            <HugeiconsIcon icon={Building02Icon} size={20} />
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground py-8">
            <HugeiconsIcon
              icon={Building02Icon}
              size={48}
              className="mx-auto mb-4 opacity-30"
            />
            <p>{t("noNearby")}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="border-b bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-lg">
          <HugeiconsIcon icon={Building02Icon} size={20} />
          {t("title")}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {t("subtitle", { city })}
        </p>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {nearbyProperties.map((property) => (
            <Link
              key={property._id}
              href={`/properties/${property._id}`}
              className="group"
            >
              <div className="rounded-lg border overflow-hidden transition-all hover:shadow-md hover:border-primary/20">
                {/* Image */}
                <div className="relative h-32 bg-muted">
                  {property.featuredImage || property.images[0] ? (
                    <Image
                      src={property.featuredImage || property.images[0]}
                      alt={property.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <HugeiconsIcon
                        icon={Building02Icon}
                        size={32}
                        className="text-muted-foreground/30"
                      />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-3 space-y-2">
                  {/* Price */}
                  <p className="font-bold text-primary">
                    {format.number(property.priceUsd, {
                      style: "currency",
                      currency: "USD",
                      maximumFractionDigits: 0,
                    })}
                  </p>

                  {/* Details */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {property.bedrooms && (
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={Home01Icon} size={12} />
                        {property.bedrooms}
                      </span>
                    )}
                    {property.bathrooms && (
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={Bathtub01Icon} size={12} />
                        {property.bathrooms}
                      </span>
                    )}
                    {property.squareMeters && (
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={Square01Icon} size={12} />
                        {property.squareMeters}m²
                      </span>
                    )}
                  </div>

                  {/* Address */}
                  <p className="text-xs text-muted-foreground truncate">
                    {property.address}
                  </p>

                  {/* Type Badge */}
                  <Badge variant="outline" className="text-[10px] h-5">
                    {tCommon(
                      `propertyTypes.${property.propertyType === "mixed_use" ? "mixedUse" : property.propertyType}`
                    )}
                  </Badge>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View More Link */}
        <div className="mt-4 text-center">
          <Link
            href={`/properties?city=${city}`}
            className="text-sm text-primary hover:underline"
          >
            {t("viewMore", { city })}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
