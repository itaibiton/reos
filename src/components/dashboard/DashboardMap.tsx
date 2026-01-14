"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon } from "@hugeicons/core-free-icons";

interface PropertyMarker {
  id: string;
  title: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  priceUsd: number;
  propertyType: string;
}

interface DashboardMapProps {
  properties: PropertyMarker[];
  className?: string;
}

// Loading component while map loads
function MapSkeleton() {
  return (
    <div className="h-full w-full rounded-lg bg-muted flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-2 text-muted-foreground">
        <HugeiconsIcon icon={Location01Icon} size={32} strokeWidth={1.5} />
        <p className="text-sm">Loading map...</p>
      </div>
    </div>
  );
}

// Placeholder when no properties
function MapPlaceholder() {
  return (
    <div className="h-full w-full rounded-lg bg-muted flex flex-col items-center justify-center text-muted-foreground gap-2 min-h-[400px]">
      <HugeiconsIcon icon={Location01Icon} size={32} strokeWidth={1.5} />
      <p className="text-sm">No properties to display</p>
    </div>
  );
}

// Dynamically import the actual map component (no SSR)
const MapContainer = dynamic(
  () => import("./DashboardMapClient").then((mod) => mod.DashboardMapClient),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  }
);

export function DashboardMap({ properties, className }: DashboardMapProps) {
  // Filter properties with valid coordinates
  const validProperties = properties.filter(
    (p) =>
      p.latitude !== undefined &&
      p.longitude !== undefined &&
      !isNaN(p.latitude) &&
      !isNaN(p.longitude)
  );

  if (validProperties.length === 0) {
    return <MapPlaceholder />;
  }

  return (
    <div className={className}>
      <MapContainer properties={validProperties} />
    </div>
  );
}
