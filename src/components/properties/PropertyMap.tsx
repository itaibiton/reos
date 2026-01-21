"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";

interface PropertyMapProps {
  latitude?: number;
  longitude?: number;
  title: string;
  address: string;
  featuredImage?: string;
  className?: string;
  variant?: "card" | "inline";
}

// Loading component while map loads
function MapSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("w-full rounded-lg bg-muted flex items-center justify-center", className)}>
      <Skeleton className="h-full w-full rounded-lg" />
    </div>
  );
}

// Placeholder when coordinates are not available
function MapPlaceholder({ className }: { className?: string }) {
  return (
    <div className={cn("w-full rounded-lg bg-muted flex flex-col items-center justify-center text-muted-foreground gap-2", className)}>
      <HugeiconsIcon icon={Location01Icon} size={32} strokeWidth={1.5} />
      <p className="text-sm">Location not available</p>
    </div>
  );
}

// Dynamically import the actual map component (no SSR)
const MapContainer = dynamic(
  () => import("./PropertyMapClient").then((mod) => mod.PropertyMapClient),
  {
    ssr: false,
    loading: () => <MapSkeleton className="h-64" />,
  }
);

export function PropertyMap({
  latitude,
  longitude,
  title,
  address,
  featuredImage,
  className,
  variant = "card",
}: PropertyMapProps) {
  // Check if coordinates are available
  const hasCoordinates =
    latitude !== undefined &&
    longitude !== undefined &&
    !isNaN(latitude) &&
    !isNaN(longitude);

  // Inline variant: no card wrapper, fills container height
  if (variant === "inline") {
    return (
      <div className={cn("h-full", className)}>
        {hasCoordinates ? (
          <MapContainer
            latitude={latitude}
            longitude={longitude}
            title={title}
            address={address}
            featuredImage={featuredImage}
            className="h-full w-full"
          />
        ) : (
          <MapPlaceholder className="h-full" />
        )}
      </div>
    );
  }

  // Card variant: wrapped in Card with title
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Location</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        {hasCoordinates ? (
          <MapContainer
            latitude={latitude}
            longitude={longitude}
            title={title}
            address={address}
            featuredImage={featuredImage}
            className="h-64 rounded-lg"
          />
        ) : (
          <MapPlaceholder className="h-64" />
        )}
      </CardContent>
    </Card>
  );
}
