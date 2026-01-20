"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useFormatter } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Agreement01Icon,
  CheckmarkCircle01Icon,
  FavouriteIcon,
  Calendar01Icon,
  ArrowRight01Icon,
  Home01Icon,
  Building02Icon,
} from "@hugeicons/core-free-icons";
import { Link } from "@/i18n/navigation";

// Deal stage info for display
const DEAL_STAGES = {
  interest: { label: "Interest", color: "bg-blue-100 text-blue-800" },
  broker_assigned: { label: "With Broker", color: "bg-purple-100 text-purple-800" },
  mortgage: { label: "Mortgage", color: "bg-orange-100 text-orange-800" },
  legal: { label: "Legal", color: "bg-indigo-100 text-indigo-800" },
  closing: { label: "Closing", color: "bg-yellow-100 text-yellow-800" },
  completed: { label: "Completed", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
} as const;

type DealStage = keyof typeof DEAL_STAGES;

interface InvestorDashboardProps {
  userName?: string;
}

export function InvestorDashboard({ userName }: InvestorDashboardProps) {
  const router = useRouter();
  const format = useFormatter();
  const stats = useQuery(api.dashboard.getStats);
  const deals = useQuery(api.deals.list, { limit: 3 });
  const properties = useQuery(api.properties.list, { status: "available" });

  const isLoading = stats === undefined;

  // Get properties for deals display
  const dealProperties = deals?.map((deal) => {
    const property = properties?.find((p) => p._id === deal.propertyId);
    return { deal, property };
  });

  // Filter to active deals only
  const activeDeals = dealProperties?.filter(
    ({ deal }) => deal.stage !== "completed" && deal.stage !== "cancelled"
  );

  if (isLoading) {
    return <InvestorDashboardSkeleton userName={userName} />;
  }

  // Handle non-investor or null stats
  if (!stats || stats.role !== "investor") {
    return null;
  }

  return (
    <div className="space-y-6 overflow-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{userName ? `, ${userName}` : ""}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <HugeiconsIcon
                  icon={Agreement01Icon}
                  size={20}
                  strokeWidth={1.5}
                  className="text-primary"
                />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeDeals}</p>
                <p className="text-xs text-muted-foreground">Active Deals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <HugeiconsIcon
                  icon={CheckmarkCircle01Icon}
                  size={20}
                  strokeWidth={1.5}
                  className="text-green-500"
                />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedDeals}</p>
                <p className="text-xs text-muted-foreground">Completed Deals</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <HugeiconsIcon
                  icon={FavouriteIcon}
                  size={20}
                  strokeWidth={1.5}
                  className="text-red-500"
                />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.savedProperties}</p>
                <p className="text-xs text-muted-foreground">Saved Properties</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  size={20}
                  strokeWidth={1.5}
                  className="text-yellow-500"
                />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                <p className="text-xs text-muted-foreground">Pending Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Deals Section */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">My Deals</CardTitle>
            <Link
              href="/deals"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              View all
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="rtl:-scale-x-100" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeDeals && activeDeals.length > 0 ? (
            activeDeals.map(({ deal, property }) => (
              <div
                key={deal._id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                onClick={() => router.push(`/deals/${deal._id}`)}
              >
                {/* Property Image */}
                <div className="h-12 w-12 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                  {property?.featuredImage ? (
                    <img
                      src={property.featuredImage}
                      alt={property.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <HugeiconsIcon
                        icon={Home01Icon}
                        size={20}
                        className="text-muted-foreground"
                      />
                    </div>
                  )}
                </div>

                {/* Deal Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">
                    {property?.title || "Property"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format.dateTime(new Date(deal.createdAt), 'monthDay')}
                  </p>
                </div>

                {/* Stage Badge */}
                <Badge
                  variant="secondary"
                  className={DEAL_STAGES[deal.stage as DealStage]?.color}
                >
                  {DEAL_STAGES[deal.stage as DealStage]?.label || deal.stage}
                </Badge>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <HugeiconsIcon
                icon={Agreement01Icon}
                size={32}
                className="mx-auto mb-2 opacity-50"
              />
              <p className="text-sm">No active deals yet</p>
              <p className="text-xs mt-1">
                Start by browsing properties and expressing interest
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <Link
            href="/properties"
            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            Browse Properties
          </Link>
          <Link
            href="/properties/saved"
            className="text-sm bg-muted text-foreground px-4 py-2 rounded-md hover:bg-muted/80 transition-colors"
          >
            View Saved
          </Link>
          <Link
            href="/deals"
            className="text-sm bg-muted text-foreground px-4 py-2 rounded-md hover:bg-muted/80 transition-colors"
          >
            View Deals
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

// Skeleton loader
function InvestorDashboardSkeleton({ userName }: { userName?: string }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{userName ? `, ${userName}` : ""}!
        </p>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>

      {/* Deals Section Skeleton */}
      <Skeleton className="h-48 w-full rounded-lg" />

      {/* Quick Actions Skeleton */}
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
}
