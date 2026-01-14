"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardMap } from "@/components/dashboard/DashboardMap";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Building02Icon,
  ChartLineData02Icon,
  Money01Icon,
} from "@hugeicons/core-free-icons";
import Link from "next/link";

// Currency formatter for USD
const formatUSD = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DashboardPage() {
  const { user, isLoading: userLoading } = useCurrentUser();
  const properties = useQuery(api.properties.list, { status: "available" });

  const isLoading = userLoading || properties === undefined;

  // Calculate stats from properties
  const stats = properties
    ? {
        totalProperties: properties.length,
        totalValue: properties.reduce((sum, p) => sum + p.priceUsd, 0),
        avgRoi: properties.length > 0
          ? properties.reduce((sum, p) => sum + (p.expectedRoi || 0), 0) / properties.length
          : 0,
        cities: new Set(properties.map((p) => p.city)).size,
      }
    : null;

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
        }))
    : [];

  if (isLoading) {
    return (
      <div className="p-6 h-[calc(100vh-4rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Left side skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-8 w-48" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
          {/* Right side map skeleton */}
          <Skeleton className="h-full min-h-[400px] rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 h-[calc(100vh-4rem)]">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
        {/* Left Column - Dashboard Content */}
        <div className="space-y-6 overflow-auto">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back{user?.name ? `, ${user.name}` : ""}!
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <HugeiconsIcon
                      icon={Home01Icon}
                      size={20}
                      strokeWidth={1.5}
                      className="text-primary"
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.totalProperties || 0}</p>
                    <p className="text-xs text-muted-foreground">Available Properties</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <HugeiconsIcon
                      icon={Money01Icon}
                      size={20}
                      strokeWidth={1.5}
                      className="text-green-500"
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats ? formatUSD(stats.totalValue) : "$0"}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Value</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-lg">
                    <HugeiconsIcon
                      icon={ChartLineData02Icon}
                      size={20}
                      strokeWidth={1.5}
                      className="text-blue-500"
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {stats ? `${stats.avgRoi.toFixed(1)}%` : "0%"}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg. ROI</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-lg">
                    <HugeiconsIcon
                      icon={Building02Icon}
                      size={20}
                      strokeWidth={1.5}
                      className="text-purple-500"
                    />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stats?.cities || 0}</p>
                    <p className="text-xs text-muted-foreground">Cities</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Profile Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Your Profile</CardTitle>
              <CardDescription>Account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Email</span>
                <span className="text-sm">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Role</span>
                {user?.role ? (
                  <Badge variant="secondary">{user.role.replace("_", " ")}</Badge>
                ) : (
                  <Badge variant="outline">Not set</Badge>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Onboarding</span>
                <Badge variant={user?.onboardingComplete ? "default" : "destructive"}>
                  {user?.onboardingComplete ? "Complete" : "Incomplete"}
                </Badge>
              </div>
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
                Saved Properties
              </Link>
              <Link
                href="/properties/new"
                className="text-sm bg-muted text-foreground px-4 py-2 rounded-md hover:bg-muted/80 transition-colors"
              >
                Add Property
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Interactive Map */}
        <div className="h-full min-h-[400px] lg:min-h-0">
          <Card className="h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Property Locations</CardTitle>
              <CardDescription>
                {mapProperties.length} properties on map
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 pt-0 h-[calc(100%-5rem)]">
              <DashboardMap
                properties={mapProperties}
                className="h-full rounded-lg overflow-hidden"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
