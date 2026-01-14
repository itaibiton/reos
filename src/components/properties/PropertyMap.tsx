"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon } from "@hugeicons/core-free-icons";

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
function MapSkeleton() {
  return (
    <div className="h-64 w-full rounded-lg bg-muted flex items-center justify-center">
      <Skeleton className="h-full w-full rounded-lg" />
    </div>
  );
}

// Placeholder when coordinates are not available
function MapPlaceholder() {
  return (
    <div className="h-64 w-full rounded-lg bg-muted flex flex-col items-center justify-center text-muted-foreground gap-2">
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
    loading: () => <MapSkeleton />,
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

  const mapContent = hasCoordinates ? (
    <MapContainer
      latitude={latitude}
      longitude={longitude}
      title={title}
      address={address}
      featuredImage={featuredImage}
    />
  ) : (
    <MapPlaceholder />
  );

  // Inline variant: no card wrapper, just the map
  if (variant === "inline") {
    return <div className={className}>{mapContent}</div>;
  }

  // Card variant: wrapped in Card with title
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Location</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">{mapContent}</CardContent>
    </Card>
  );
}
