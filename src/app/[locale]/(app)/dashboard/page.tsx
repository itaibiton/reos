"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
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
import { ProviderDashboard } from "@/components/dashboard/ProviderDashboard";
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
  const router = useRouter();
  const { user, isLoading: userLoading, effectiveRole, isAdmin } = useCurrentUser();
  const properties = useQuery(api.properties.list, { status: "available" });

  const isLoading = userLoading || properties === undefined;

  // Calculate stats from properties (for admin view)
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

  // Redirect investors to properties page - they don't have a dashboard
  useEffect(() => {
    if (!userLoading && effectiveRole === "investor") {
      router.replace("/properties");
    }
  }, [userLoading, effectiveRole, router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  // Investor - redirect in progress (show nothing while redirecting)
  if (effectiveRole === "investor") {
    return null;
  }

  // Service Provider Dashboard (broker, mortgage_advisor, lawyer)
  if (effectiveRole === "broker" || effectiveRole === "mortgage_advisor" || effectiveRole === "lawyer") {
    return (
      <div className="p-6">
        <ProviderDashboard userName={user?.name} />
      </div>
    );
  }

  // Admin Dashboard (no viewingAsRole set) - Platform-wide stats
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{user?.name ? `, ${user.name}` : ""}! Platform overview.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
  );
}
