"use client";

import { useQuery, useMutation } from "convex/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  UserMultiple02Icon,
  User02Icon,
  Activity01Icon,
  ArrowRight01Icon,
  CheckmarkCircle01Icon,
  Cancel01Icon,
  Location01Icon,
  Agreement01Icon,
  Building05Icon,
} from "@hugeicons/core-free-icons";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";
import { useState } from "react";

// Format date
function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

// Format relative time
function formatRelativeTime(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return formatDate(timestamp);
}

// Format USD
function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Get initials from name
function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// Stage badge color mapping
function getStageBadgeClasses(stage: string): string {
  switch (stage) {
    case "broker_assigned":
      return "bg-blue-100 text-blue-800";
    case "mortgage":
      return "bg-purple-100 text-purple-800";
    case "legal":
      return "bg-orange-100 text-orange-800";
    case "closing":
      return "bg-green-100 text-green-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

// Format stage name for display
function formatStageName(stage: string): string {
  return stage
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// Active Deal Card component
interface ActiveDealCardProps {
  deal: {
    _id: string;
    stage: string;
    createdAt: number;
    property: {
      _id: string;
      title: string;
      city: string;
      priceUsd: number;
      images: string[];
    } | null;
    investor: {
      _id: string;
      name?: string;
      imageUrl?: string;
    } | null;
  };
}

function ActiveDealCard({ deal }: ActiveDealCardProps) {
  const router = useRouter();

  return (
    <div
      className="flex gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
      onClick={() => router.push(`/deals/${deal._id}`)}
    >
      {/* Property Image */}
      <div className="h-16 w-16 rounded-md overflow-hidden bg-muted flex-shrink-0">
        {deal.property?.images && deal.property.images.length > 0 ? (
          <img
            src={deal.property.images[0]}
            alt={deal.property?.title || "Property"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <HugeiconsIcon
              icon={Building05Icon}
              size={24}
              className="text-muted-foreground"
            />
          </div>
        )}
      </div>

      {/* Deal Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          {deal.property?.title || "Property"}
        </p>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <HugeiconsIcon icon={Location01Icon} size={12} />
          <span>{deal.property?.city || "Unknown"}</span>
          <span>•</span>
          <span>{formatUSD(deal.property?.priceUsd || 0)}</span>
        </div>

        {/* Investor + Stage */}
        <div className="flex items-center gap-2 mt-1">
          <Avatar className="h-5 w-5">
            <AvatarImage src={deal.investor?.imageUrl} />
            <AvatarFallback className="text-[8px]">
              {getInitials(deal.investor?.name)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">
            {deal.investor?.name || "Investor"}
          </span>
          <Badge
            variant="secondary"
            className={`text-[10px] px-1.5 py-0 ${getStageBadgeClasses(deal.stage)}`}
          >
            {formatStageName(deal.stage)}
          </Badge>
        </div>
      </div>
    </div>
  );
}

interface ProviderDashboardProps {
  userName?: string;
}

export function ProviderDashboard({ userName }: ProviderDashboardProps) {
  const t = useTranslations("dashboard");
  const tCommon = useTranslations("common.actions");
  const router = useRouter();
  const [respondingId, setRespondingId] = useState<Id<"serviceRequests"> | null>(null);

  const stats = useQuery(api.dashboard.getStats);
  const activeDeals = useQuery(api.dashboard.getProviderActiveDeals);
  const pendingRequests = useQuery(api.serviceRequests.listForProvider, {
    status: "pending",
  });
  const recentActivity = useQuery(api.dashboard.getRecentActivity, { limit: 5 });

  const respondToRequest = useMutation(api.serviceRequests.respond);

  const isLoading = stats === undefined;

  // Handle accept
  async function handleAccept(requestId: Id<"serviceRequests">) {
    setRespondingId(requestId);
    try {
      await respondToRequest({ requestId, accept: true });
      toast.success(t("requests.accepted"));
    } catch (error) {
      console.error("Error accepting request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to accept request");
    } finally {
      setRespondingId(null);
    }
  }

  // Handle decline
  async function handleDecline(requestId: Id<"serviceRequests">) {
    setRespondingId(requestId);
    try {
      await respondToRequest({ requestId, accept: false });
      toast.success(t("requests.declined"));
    } catch (error) {
      console.error("Error declining request:", error);
      toast.error(error instanceof Error ? error.message : "Failed to decline request");
    } finally {
      setRespondingId(null);
    }
  }

  if (isLoading) {
    return <ProviderDashboardSkeleton userName={userName} t={t} />;
  }

  // Handle non-provider or null stats
  if (!stats || !["broker", "mortgage_advisor", "lawyer"].includes(stats.role)) {
    return null;
  }

  const providerStats = stats as {
    role: "broker" | "mortgage_advisor" | "lawyer";
    pendingRequests: number;
    activeClients: number;
    totalClients: number;
    recentActivity: number;
  };

  return (
    <div className="space-y-6 overflow-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">
          {userName ? t("welcome", { name: userName }) : t("welcomeGeneric")}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/clients?filter=pending">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/10 rounded-lg">
                  <HugeiconsIcon
                    icon={Clock01Icon}
                    size={20}
                    strokeWidth={1.5}
                    className="text-yellow-500"
                  />
                </div>
                <div>
                  <p className="text-2xl font-bold">{providerStats.pendingRequests}</p>
                  <p className="text-xs text-muted-foreground">{t("stats.pendingRequests")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/clients?filter=accepted">
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <HugeiconsIcon
                    icon={UserMultiple02Icon}
                    size={20}
                    strokeWidth={1.5}
                    className="text-green-500"
                  />
                </div>
                <div>
                  <p className="text-2xl font-bold">{providerStats.activeClients}</p>
                  <p className="text-xs text-muted-foreground">{t("stats.activeClients")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <HugeiconsIcon
                  icon={User02Icon}
                  size={20}
                  strokeWidth={1.5}
                  className="text-blue-500"
                />
              </div>
              <div>
                <p className="text-2xl font-bold">{providerStats.totalClients}</p>
                <p className="text-xs text-muted-foreground">{t("stats.totalClients")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <HugeiconsIcon
                  icon={Activity01Icon}
                  size={20}
                  strokeWidth={1.5}
                  className="text-purple-500"
                />
              </div>
              <div>
                <p className="text-2xl font-bold">{providerStats.recentActivity}</p>
                <p className="text-xs text-muted-foreground">{t("stats.activity7d")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Active Deals Section */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t("sections.myActiveDeals")}</CardTitle>
            <Link
              href="/deals"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {tCommon("viewAll")}
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="rtl:-scale-x-100" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {activeDeals === undefined ? (
            // Loading state
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3 p-3 border rounded-lg">
                  <Skeleton className="h-16 w-16 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : activeDeals.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {activeDeals.map((deal) => (
                <ActiveDealCard key={deal._id} deal={deal} />
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <HugeiconsIcon
                icon={Building05Icon}
                size={32}
                className="mx-auto mb-2 opacity-50"
              />
              <p className="text-sm">{t("empty.noDeals")}</p>
              <p className="text-xs mt-1">{t("empty.noActiveDeals")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Requests Section */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">{t("sections.pendingRequests")}</CardTitle>
            <Link
              href="/clients"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {tCommon("viewAll")}
              <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="rtl:-scale-x-100" />
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingRequests === undefined ? (
            // Loading state
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2">
                  <Skeleton className="h-10 w-10 rounded-md" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          ) : pendingRequests.length > 0 ? (
            pendingRequests.slice(0, 3).map((request) => (
              <div
                key={request._id}
                className="flex items-center gap-3 p-2 rounded-lg border bg-card"
              >
                {/* Investor Avatar */}
                <Avatar className="h-10 w-10">
                  <AvatarImage src={request.investor?.imageUrl} />
                  <AvatarFallback className="text-xs">
                    {getInitials(request.investor?.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Request Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate text-sm">
                    {request.investor?.name || "Investor"}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    {request.property && (
                      <>
                        <span className="truncate">{request.property.title}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>{formatDate(request.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="default"
                    className="h-8 px-2"
                    onClick={() => handleAccept(request._id)}
                    disabled={respondingId === request._id}
                  >
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2"
                        disabled={respondingId === request._id}
                      >
                        <HugeiconsIcon icon={Cancel01Icon} size={14} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>{t("requests.declineTitle")}</AlertDialogTitle>
                        <AlertDialogDescription>
                          {t("requests.declineDesc")}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>{tCommon("cancel")}</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDecline(request._id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {t("requests.decline")}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <HugeiconsIcon
                icon={Clock01Icon}
                size={32}
                className="mx-auto mb-2 opacity-50"
              />
              <p className="text-sm">{t("empty.noRequests")}</p>
              <p className="text-xs mt-1">{t("empty.noRequestsDesc")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("sections.recentActivity")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentActivity === undefined ? (
            // Loading state
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div
                key={activity._id}
                className="flex items-start gap-3 text-sm cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors"
                onClick={() => router.push(`/deals/${activity.dealId}`)}
              >
                {/* Actor Avatar */}
                <Avatar className="h-8 w-8">
                  <AvatarImage src={activity.actor?.imageUrl} />
                  <AvatarFallback className="text-xs">
                    {getInitials(activity.actor?.name)}
                  </AvatarFallback>
                </Avatar>

                {/* Activity Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {activity.actor?.name || "Someone"}
                    </span>{" "}
                    {activity.description}
                    {activity.property && (
                      <>
                        {" "}
                        on <span className="font-medium">{activity.property.title}</span>
                      </>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatRelativeTime(activity.createdAt)}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <HugeiconsIcon
                icon={Activity01Icon}
                size={32}
                className="mx-auto mb-2 opacity-50"
              />
              <p className="text-sm">{t("empty.noActivity")}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">{t("quickActions.title")}</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 flex-wrap">
          <Link
            href="/clients"
            className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            {t("quickActions.viewClients")}
          </Link>
          <Link
            href="/deals"
            className="text-sm bg-muted text-foreground px-4 py-2 rounded-md hover:bg-muted/80 transition-colors"
          >
            {t("quickActions.viewDeals")}
          </Link>
          <Link
            href="/properties"
            className="text-sm bg-muted text-foreground px-4 py-2 rounded-md hover:bg-muted/80 transition-colors"
          >
            {t("quickActions.browse")}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

// Skeleton loader
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ProviderDashboardSkeleton({ userName, t }: { userName?: string; t: ReturnType<typeof useTranslations<any>> }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground">
          {userName ? t("welcome", { name: userName }) : t("welcomeGeneric")}!
        </p>
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>

      {/* Active Deals Skeleton */}
      <Skeleton className="h-48 w-full rounded-lg" />

      {/* Pending Requests Skeleton */}
      <Skeleton className="h-48 w-full rounded-lg" />

      {/* Activity Skeleton */}
      <Skeleton className="h-48 w-full rounded-lg" />

      {/* Quick Actions Skeleton */}
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  );
}
