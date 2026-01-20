"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Building05Icon, Location01Icon } from "@hugeicons/core-free-icons";
import { useTranslations, useFormatter } from "next-intl";

interface PortfolioItem {
  dealId: string;
  propertyTitle?: string | null;
  propertyCity?: string | null;
  propertyImage?: string | null;
  soldPrice?: number | null;
}

interface PortfolioSectionProps {
  portfolio: PortfolioItem[];
}

export function PortfolioSection({ portfolio }: PortfolioSectionProps) {
  const t = useTranslations("providers");
  const format = useFormatter();

  if (portfolio.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <HugeiconsIcon icon={Building05Icon} size={32} className="mx-auto mb-2 opacity-50" />
        <p>{t("profile.noDeals")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {portfolio.map((deal) => (
        <div
          key={deal.dealId}
          className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          {/* Property Image */}
          <div className="h-14 w-14 rounded-md overflow-hidden bg-muted flex-shrink-0">
            {deal.propertyImage ? (
              <img
                src={deal.propertyImage}
                alt={deal.propertyTitle || "Property"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <HugeiconsIcon
                  icon={Building05Icon}
                  size={20}
                  className="text-muted-foreground"
                />
              </div>
            )}
          </div>

          {/* Deal Info */}
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">
              {deal.propertyTitle || "Property"}
            </p>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <HugeiconsIcon icon={Location01Icon} size={10} />
              <span>{deal.propertyCity || "Unknown"}</span>
            </div>
            {deal.soldPrice && (
              <p className="text-xs font-medium text-green-600 mt-0.5">
                {format.number(deal.soldPrice, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
