"use client";

import { useQuery } from "convex/react";
import { useRouter, useParams } from "next/navigation";
import { useTranslations, useFormatter } from "next-intl";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Message01Icon,
  Agreement01Icon,
  Building05Icon,
  Location01Icon,
  Calendar01Icon,
  CheckmarkCircle01Icon,
  Money01Icon,
  Target01Icon,
  Home01Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { Link } from "@/i18n/navigation";
import { useCurrentUser } from "@/hooks/useCurrentUser";

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
    case "interest":
      return "bg-gray-100 text-gray-800";
    case "broker_assigned":
      return "bg-blue-100 text-blue-800";
    case "mortgage":
      return "bg-purple-100 text-purple-800";
    case "legal":
      return "bg-orange-100 text-orange-800";
    case "closing":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-emerald-100 text-emerald-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
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

// Label mappings for questionnaire display
const LABEL_MAPS = {
  citizenship: {
    israeli: "Israeli Citizen",
    non_israeli: "Non-Israeli",
  },
  residencyStatus: {
    resident: "Current Resident",
    returning_resident: "Returning Resident",
    non_resident: "Non-Resident",
    unsure: "Unsure",
  },
  experienceLevel: {
    none: "First-time Buyer",
    some: "Some Experience",
    experienced: "Experienced Investor",
  },
  investmentHorizon: {
    short_term: "Short Term (<2 years)",
    medium_term: "Medium Term (2-5 years)",
    long_term: "Long Term (5+ years)",
  },
  yieldPreference: {
    rental_yield: "Rental Income Focus",
    appreciation: "Appreciation Focus",
    balanced: "Balanced Approach",
  },
  financingApproach: {
    cash: "Cash Purchase",
    mortgage: "Mortgage Financing",
    exploring: "Exploring Options",
  },
  purchaseTimeline: {
    "3_months": "Within 3 Months",
    "6_months": "Within 6 Months",
    "1_year": "Within 1 Year",
    exploring: "Just Exploring",
  },
} as const;

function getLabel(
  category: keyof typeof LABEL_MAPS,
  value: string | undefined
): string {
  if (!value) return "Not specified";
  const map = LABEL_MAPS[category] as Record<string, string>;
  return map[value] || value;
}

// Skeleton for client detail page
function ClientDetailSkeleton() {
  return (
    <div className="p-6 space-y-6">
      {/* Back button */}
      <Skeleton className="h-9 w-24" />

      {/* Header */}
      <div className="flex items-start gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-5 w-36" />
          <div className="flex gap-2 mt-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function ClientDetailPage() {
  const t = useTranslations("clients");
  const format = useFormatter();
  const router = useRouter();
  const params = useParams();
  const { effectiveRole } = useCurrentUser();
  const clientId = params.id as string;

  // Fetch client details
  const clientDetails = useQuery(
    api.clients.getClientDetails,
    clientId ? { clientId: clientId as Id<"users"> } : "skip"
  );

  // Check if user is a service provider
  const isProvider = ["broker", "mortgage_advisor", "lawyer", "admin"].includes(
    effectiveRole || ""
  );

  // Not a provider
  if (!isProvider) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <h2 className="text-xl font-semibold mb-2">{t("access.providerOnly")}</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {t("access.providerOnlyDesc")}
          </p>
          <Button onClick={() => router.push("/")}>{t("access.goHome")}</Button>
        </div>
      </div>
    );
  }

  // Loading state
  if (clientDetails === undefined) {
    return <ClientDetailSkeleton />;
  }

  // Not found or unauthorized
  if (clientDetails === null) {
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <h2 className="text-xl font-semibold mb-2">{t("access.notFound")}</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {t("access.notFoundDesc")}
          </p>
          <Button onClick={() => router.push("/clients")}>{t("detail.backToClients")}</Button>
        </div>
      </div>
    );
  }

  const { client, questionnaire, deals, stats } = clientDetails;

  return (
    <div className="p-6 space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" onClick={() => router.push("/clients")}>
        <HugeiconsIcon icon={ArrowLeft01Icon} size={16} className="me-1 rtl:-scale-x-100" />
        {t("detail.backToClients")}
      </Button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        <Avatar className="h-16 w-16 flex-shrink-0">
          <AvatarImage src={client.imageUrl} />
          <AvatarFallback className="text-xl">
            {getInitials(client.name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <h1 className="text-2xl font-bold">{client.name || "Unknown Client"}</h1>
          {client.email && (
            <p className="text-muted-foreground">{client.email}</p>
          )}

          {/* Stats badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="secondary" className="flex items-center gap-1">
              <HugeiconsIcon icon={Agreement01Icon} size={12} />
              {stats.totalDeals} {t("detail.total")}
            </Badge>
            {stats.activeDeals > 0 && (
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                <HugeiconsIcon icon={Clock01Icon} size={12} />
                {stats.activeDeals} {t("detail.active")}
              </Badge>
            )}
            {stats.completedDeals > 0 && (
              <Badge className="bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} />
                {stats.completedDeals} {t("detail.completed")}
              </Badge>
            )}
            <Badge variant="outline" className="flex items-center gap-1">
              <HugeiconsIcon icon={Money01Icon} size={12} />
              {format.number(stats.totalValue, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })} {t("detail.total")}
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <Button asChild>
          <Link href={`/chat?client=${clientId}`}>
            <HugeiconsIcon icon={Message01Icon} size={16} className="me-2" />
            {t("detail.startChat")}
          </Link>
        </Button>
      </div>

      {/* Main content - Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Deal History (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HugeiconsIcon icon={Agreement01Icon} size={20} />
                {t("detail.dealHistory")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {deals.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>{t("detail.noDeals")}</p>
                </div>
              ) : (
                deals.map((deal) => (
                  <div
                    key={deal._id}
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
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium truncate">
                          {deal.property?.title || "Property"}
                        </p>
                        <Badge
                          className={`text-xs px-2 py-0.5 ${getStageBadgeClasses(deal.stage)}`}
                        >
                          {formatStageName(deal.stage)}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <HugeiconsIcon icon={Location01Icon} size={12} />
                        <span>{deal.property?.city || "Unknown"}</span>
                        <span>•</span>
                        <span>{format.number(deal.property?.priceUsd || 0, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <HugeiconsIcon icon={Calendar01Icon} size={12} />
                        <span>{t("detail.started", { date: format.dateTime(new Date(deal.createdAt), 'short') })}</span>
                      </div>

                      {/* Providers */}
                      <div className="flex items-center gap-1 mt-2">
                        {deal.providers.broker && (
                          <Avatar className="h-5 w-5 border-2 border-background">
                            <AvatarImage src={deal.providers.broker.imageUrl} />
                            <AvatarFallback className="text-[8px]">
                              {getInitials(deal.providers.broker.name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {deal.providers.mortgageAdvisor && (
                          <Avatar className="h-5 w-5 -ms-1 border-2 border-background">
                            <AvatarImage src={deal.providers.mortgageAdvisor.imageUrl} />
                            <AvatarFallback className="text-[8px]">
                              {getInitials(deal.providers.mortgageAdvisor.name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {deal.providers.lawyer && (
                          <Avatar className="h-5 w-5 -ms-1 border-2 border-background">
                            <AvatarImage src={deal.providers.lawyer.imageUrl} />
                            <AvatarFallback className="text-[8px]">
                              {getInitials(deal.providers.lawyer.name)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column - Client Profile (1/3) */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HugeiconsIcon icon={Target01Icon} size={20} />
                {t("detail.investmentProfile")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {questionnaire ? (
                <>
                  {/* Background */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {t("questionnaire.background")}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">{t("questionnaire.citizenship")}:</span>{" "}
                        {getLabel("citizenship", questionnaire.citizenship)}
                      </p>
                      <p>
                        <span className="text-muted-foreground">{t("questionnaire.residency")}:</span>{" "}
                        {getLabel("residencyStatus", questionnaire.residencyStatus)}
                      </p>
                      <p>
                        <span className="text-muted-foreground">{t("questionnaire.experience")}:</span>{" "}
                        {getLabel("experienceLevel", questionnaire.experienceLevel)}
                      </p>
                      {questionnaire.ownsPropertyInIsrael !== undefined && (
                        <p>
                          <span className="text-muted-foreground">{t("questionnaire.ownsProperty")}:</span>{" "}
                          {questionnaire.ownsPropertyInIsrael ? "Yes" : "No"}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Budget */}
                  {(questionnaire.budgetMin || questionnaire.budgetMax) && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        {t("questionnaire.budget")}
                      </h4>
                      <div className="flex items-center gap-1 text-sm">
                        <HugeiconsIcon icon={Money01Icon} size={14} className="text-muted-foreground" />
                        <span>
                          {questionnaire.budgetMin && format.number(questionnaire.budgetMin, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                          {questionnaire.budgetMin && questionnaire.budgetMax && " – "}
                          {questionnaire.budgetMax && format.number(questionnaire.budgetMax, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Investment Goals */}
                  {questionnaire.investmentGoals && questionnaire.investmentGoals.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        {t("questionnaire.goals")}
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {questionnaire.investmentGoals.map((goal) => (
                          <Badge key={goal} variant="secondary" className="text-xs">
                            {goal.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Preferences */}
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                      {t("questionnaire.preferences")}
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">{t("questionnaire.horizon")}:</span>{" "}
                        {getLabel("investmentHorizon", questionnaire.investmentHorizon)}
                      </p>
                      <p>
                        <span className="text-muted-foreground">{t("questionnaire.focus")}:</span>{" "}
                        {getLabel("yieldPreference", questionnaire.yieldPreference)}
                      </p>
                      <p>
                        <span className="text-muted-foreground">{t("questionnaire.financing")}:</span>{" "}
                        {getLabel("financingApproach", questionnaire.financingApproach)}
                      </p>
                      <p>
                        <span className="text-muted-foreground">{t("questionnaire.timeline")}:</span>{" "}
                        {getLabel("purchaseTimeline", questionnaire.purchaseTimeline)}
                      </p>
                    </div>
                  </div>

                  {/* Property Types */}
                  {questionnaire.preferredPropertyTypes && questionnaire.preferredPropertyTypes.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        {t("questionnaire.propertyTypes")}
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {questionnaire.preferredPropertyTypes.map((type) => (
                          <Badge key={type} variant="outline" className="text-xs flex items-center gap-1">
                            <HugeiconsIcon icon={Home01Icon} size={10} />
                            {type.replace("_", " ")}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Locations */}
                  {questionnaire.preferredLocations && questionnaire.preferredLocations.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        {t("questionnaire.preferredLocations")}
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {questionnaire.preferredLocations.map((location) => (
                          <Badge key={location} variant="outline" className="text-xs flex items-center gap-1">
                            <HugeiconsIcon icon={Location01Icon} size={10} />
                            {location}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional Notes */}
                  {questionnaire.additionalPreferences && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-2">
                        {t("questionnaire.additionalNotes")}
                      </h4>
                      <p className="text-sm text-muted-foreground italic">
                        &quot;{questionnaire.additionalPreferences}&quot;
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  <p className="text-sm">{t("questionnaire.noProfile")}</p>
                  <p className="text-xs mt-1">
                    {t("questionnaire.notCompleted")}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
