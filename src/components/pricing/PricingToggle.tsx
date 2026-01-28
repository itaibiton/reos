"use client";

import { useTranslations } from "next-intl";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface PricingToggleProps {
  isAnnual: boolean;
  onToggle: (isAnnual: boolean) => void;
}

export function PricingToggle({ isAnnual, onToggle }: PricingToggleProps) {
  const t = useTranslations("pricing.billing");

  return (
    <div className="flex items-center justify-center gap-3">
      <span
        className={cn(
          "text-sm font-medium transition-colors",
          !isAnnual ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {t("monthly")}
      </span>

      <Switch checked={isAnnual} onCheckedChange={onToggle} />

      <span
        className={cn(
          "text-sm font-medium transition-colors",
          isAnnual ? "text-foreground" : "text-muted-foreground"
        )}
      >
        {t("annual")}
      </span>

      <span className="px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 text-xs font-semibold rounded-full">
        {t("save")}
      </span>
    </div>
  );
}
