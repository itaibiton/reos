"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { DEAL_STAGES, DealStage } from "@/lib/deal-constants";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Home01Icon } from "@hugeicons/core-free-icons";

interface DealSelectorProps {
  selectedDealId: Id<"deals"> | null;
  onSelect: (dealId: string) => void;
}

// Format currency for display
function formatPrice(amount: number) {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  return `$${(amount / 1000).toFixed(0)}K`;
}

// Stage key map for translations
const stageKeyMap: Record<string, string> = {
  interest: "interest",
  broker_assigned: "brokerAssigned",
  mortgage: "mortgage",
  legal: "legal",
  closing: "closing",
  completed: "completed",
  cancelled: "cancelled",
};

export function DealSelector({ selectedDealId, onSelect }: DealSelectorProps) {
  const t = useTranslations("chat.dealSelector");
  const tDeals = useTranslations("deals.stages");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch deals with property data
  const dealsWithProperties = useQuery(api.deals.listWithProperties, {});

  // Filter to active deals only
  const activeDeals = useMemo(() => {
    if (!dealsWithProperties) return [];
    return dealsWithProperties.filter(
      (d) => d.stage !== "completed" && d.stage !== "cancelled"
    );
  }, [dealsWithProperties]);

  // Filter by search query
  const filteredDeals = useMemo(() => {
    if (!searchQuery.trim()) return activeDeals;

    const query = searchQuery.toLowerCase();
    return activeDeals.filter((deal) => {
      if (!deal.property) return false;
      return (
        deal.property.title?.toLowerCase().includes(query) ||
        deal.property.address?.toLowerCase().includes(query) ||
        deal.property.city?.toLowerCase().includes(query)
      );
    });
  }, [activeDeals, searchQuery]);

  if (activeDeals.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("noActiveDeals")}</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Search input */}
      <div className="relative">
        <HugeiconsIcon
          icon={Search01Icon}
          size={16}
          className="absolute start-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="text"
          placeholder={t("searchDeals")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="ps-8 h-9"
        />
      </div>

      {/* Deals list */}
      <div className="space-y-1.5">
        {filteredDeals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            {t("noMatch")}
          </p>
        ) : (
          filteredDeals.map((deal) => {
            const stageInfo = DEAL_STAGES[deal.stage as DealStage];
            const isSelected = selectedDealId === deal._id;

            return (
              <button
                key={deal._id}
                onClick={() => onSelect(deal._id)}
                className={cn(
                  "w-full flex items-start gap-2.5 p-2 rounded-lg text-start transition-colors",
                  isSelected
                    ? "bg-primary/10 ring-1 ring-primary/20"
                    : "hover:bg-muted/50"
                )}
              >
                {/* Thumbnail */}
                <div className="h-12 w-12 rounded-md bg-muted flex-shrink-0 overflow-hidden">
                  {deal.property?.featuredImage ? (
                    <img
                      src={deal.property.featuredImage}
                      alt={deal.property.title || t("property")}
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

                {/* Deal info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {deal.property?.title || t("property")}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {deal.property?.city || t("unknown")}
                    {deal.property?.priceUsd && (
                      <>
                        {" "}
                        &bull; {formatPrice(deal.property.priceUsd)}
                      </>
                    )}
                  </p>
                  <Badge
                    variant="secondary"
                    className={cn("mt-1 text-[10px] px-1.5 py-0", stageInfo?.color)}
                  >
                    {tDeals(stageKeyMap[deal.stage] || deal.stage)}
                  </Badge>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
