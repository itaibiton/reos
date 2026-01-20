"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { useTranslations, useFormatter } from "next-intl";
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
import { Link } from "@/i18n/navigation";

export default function DashboardPage() {
  const t = useTranslations("dashboard");
  const format = useFormatter();
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
        <h1 className="text-2xl font-bold">{t("adminDashboard")}</h1>
        <p className="text-muted-foreground">
          {user?.name ? t("welcome", { name: user.name }) : t("welcomeGeneric")}! {t("platformOverview")}.
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
                <p className="text-xs text-muted-foreground">{t("stats.availableProperties")}</p>
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
                  {stats ? format.number(stats.totalValue, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }) : "$0"}
                </p>
                <p className="text-xs text-muted-foreground">{t("stats.totalValue")}</p>
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
                <p className="text-xs text-muted-foreground">{t("stats.avgRoi")}</p>
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
                <p className="text-xs text-muted-foreground">{t("stats.cities")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Profile Card */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("sections.yourProfile")}</CardTitle>
          <CardDescription>{t("sections.accountInfo")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("profile.email")}</span>
            <span className="text-sm">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("profile.role")}</span>
            {user?.role ? (
              <Badge variant="secondary">{user.role.replace("_", " ")}</Badge>
            ) : (
              <Badge variant="outline">{t("profile.notSet")}</Badge>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{t("profile.onboarding")}</span>
            <Badge variant={user?.onboardingComplete ? "default" : "destructive"}>
              {user?.onboardingComplete ? t("profile.complete") : t("profile.incomplete")}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("quickActions.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <Link
            href="/properties"
            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            {t("quickActions.browse")}
          </Link>
          <Link
            href="/properties/saved"
            className="text-sm bg-muted text-foreground px-4 py-2 rounded-md hover:bg-muted/80 transition-colors"
          >
            {t("quickActions.saved")}
          </Link>
          <Link
            href="/properties/new"
            className="text-sm bg-muted text-foreground px-4 py-2 rounded-md hover:bg-muted/80 transition-colors"
          >
            {t("quickActions.newListing")}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
