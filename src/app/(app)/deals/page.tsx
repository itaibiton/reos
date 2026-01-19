"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Agreement01Icon,
  Calendar01Icon,
  Location01Icon,
  UserIcon,
  ArrowUp01Icon,
  ArrowDown01Icon,
} from "@hugeicons/core-free-icons";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { DEAL_STAGES, DealStage } from "@/lib/deal-constants";

// Format date
function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Currency formatter for USD
function formatUSD(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

// Skeleton loader for deal cards
function DealCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Image skeleton */}
          <Skeleton className="h-24 w-24 rounded-lg flex-shrink-0" />

          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Deal card component
interface DealWithProperty {
  _id: Id<"deals">;
  propertyId: Id<"properties">;
  investorId: Id<"users">;
  stage: DealStage;
  brokerId?: Id<"users">;
  mortgageAdvisorId?: Id<"users">;
  lawyerId?: Id<"users">;
  createdAt: number;
  updatedAt: number;
}

interface DealCardProps {
  deal: DealWithProperty;
  property: {
    _id: Id<"properties">;
    title: string;
    city: string;
    priceUsd: number;
    featuredImage?: string;
  } | null;
  onClick: () => void;
}

function DealCard({ deal, property, onClick }: DealCardProps) {
  const stageInfo = DEAL_STAGES[deal.stage];
  const providerCount = [deal.brokerId, deal.mortgageAdvisorId, deal.lawyerId].filter(Boolean).length;

  return (
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex gap-4 p-4">
          {/* Property image */}
          <div className="h-24 w-24 rounded-lg bg-muted flex-shrink-0 overflow-hidden">
            {property?.featuredImage ? (
              <img
                src={property.featuredImage}
                alt={property.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <HugeiconsIcon
                  icon={Agreement01Icon}
                  size={32}
                  className="text-muted-foreground"
                />
              </div>
            )}
          </div>

          {/* Deal info */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold truncate">
                {property?.title || "Property"}
              </h3>
              <Badge className={stageInfo.color}>
                {stageInfo.label}
              </Badge>
            </div>

            {property && (
              <>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <HugeiconsIcon icon={Location01Icon} size={14} />
                  <span>{property.city}</span>
                  <span className="mx-1">•</span>
                  <span>{formatUSD(property.priceUsd)}</span>
                </div>
              </>
            )}

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <HugeiconsIcon icon={Calendar01Icon} size={14} />
              <span>Started {formatDate(deal.createdAt)}</span>
            </div>

            {providerCount > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <HugeiconsIcon icon={UserIcon} size={14} />
                <span>{providerCount} provider{providerCount > 1 ? "s" : ""} assigned</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function DealsPage() {
  const router = useRouter();
  const { effectiveRole } = useCurrentUser();
  const [stageFilter, setStageFilter] = useState<string>("__all__");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  // Fetch deals
  const deals = useQuery(api.deals.list, {});

  // Fetch properties for all deals
  const propertyIds = useMemo(() => {
    if (!deals) return [];
    return [...new Set(deals.map((d) => d.propertyId))];
  }, [deals]);

  // We need to fetch properties individually - let's make a query for each deal's property
  // For now, we'll just show deals without property info loading (it's in the deal already)

  // Filter and sort deals
  const filteredDeals = useMemo(() => {
    if (!deals) return [];

    let result = [...deals];

    // Filter by stage
    if (stageFilter !== "__all__") {
      result = result.filter((deal) => deal.stage === stageFilter);
    }

    // Sort
    result.sort((a, b) => {
      if (sortOrder === "newest") {
        return b.createdAt - a.createdAt;
      }
      return a.createdAt - b.createdAt;
    });

    return result;
  }, [deals, stageFilter, sortOrder]);

  // Loading state
  if (deals === undefined) {
    return (
      <div className="p-6">
        {/* Header skeleton */}
        <div className="mb-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-5 w-24 mt-1" />
        </div>

        {/* Filter skeleton */}
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 w-36" />
          <Skeleton className="h-10 w-36" />
        </div>

        {/* Cards skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <DealCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (deals.length === 0) {
    const isInvestor = effectiveRole === "investor";
    return (
      <div className="p-6">
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
          <div className="rounded-full bg-muted p-4 mb-4 text-muted-foreground">
            <HugeiconsIcon icon={Agreement01Icon} size={48} strokeWidth={1.5} />
          </div>
          <h2 className="text-xl font-semibold mb-2">No deals yet</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            {isInvestor
              ? "Start by browsing properties and requesting a broker to help you with a purchase."
              : "You don't have any assigned deals yet. Deals will appear here when investors request your services."}
          </p>
          {isInvestor && (
            <Link href="/properties">
              <Button>Browse Properties</Button>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">My Deals</h1>
        <p className="text-muted-foreground">
          {filteredDeals.length} {filteredDeals.length === 1 ? "deal" : "deals"}
          {stageFilter !== "__all__" && " matching filter"}
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        {/* Stage filter */}
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="All stages" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all__">All stages</SelectItem>
            {Object.entries(DEAL_STAGES).map(([value, info]) => (
              <SelectItem key={value} value={value}>
                {info.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort order */}
        <Button
          variant="outline"
          onClick={() => setSortOrder(sortOrder === "newest" ? "oldest" : "newest")}
          className="gap-2"
        >
          {sortOrder === "newest" ? (
            <>
              <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
              Newest first
            </>
          ) : (
            <>
              <HugeiconsIcon icon={ArrowUp01Icon} size={16} />
              Oldest first
            </>
          )}
        </Button>
      </div>

      {/* No results for filter */}
      {filteredDeals.length === 0 && deals.length > 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No deals match the selected filter
          </p>
          <Button variant="outline" onClick={() => setStageFilter("__all__")}>
            Clear filter
          </Button>
        </div>
      )}

      {/* Deals list */}
      <div className="space-y-4">
        {filteredDeals.map((deal) => (
          <DealCardWithProperty
            key={deal._id}
            deal={deal as DealWithProperty}
            onClick={() => router.push(`/deals/${deal._id}`)}
          />
        ))}
      </div>
    </div>
  );
}

// Wrapper component that fetches property data for a deal
function DealCardWithProperty({
  deal,
  onClick,
}: {
  deal: DealWithProperty;
  onClick: () => void;
}) {
  const property = useQuery(api.properties.getById, { id: deal.propertyId });

  // Show card with property loading state
  if (property === undefined) {
    return (
      <DealCard
        deal={deal}
        property={null}
        onClick={onClick}
      />
    );
  }

  return (
    <DealCard
      deal={deal}
      property={property ? {
        _id: property._id,
        title: property.title,
        city: property.city,
        priceUsd: property.priceUsd,
        featuredImage: property.featuredImage,
      } : null}
      onClick={onClick}
    />
  );
}
