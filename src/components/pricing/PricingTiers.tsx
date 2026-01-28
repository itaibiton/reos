"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface PricingTiersProps {
  isAnnual: boolean;
}

export function PricingTiers({ isAnnual }: PricingTiersProps) {
  const t = useTranslations("pricing");

  const tiers = [
    {
      key: "investor" as const,
      isPopular: false,
      trustSignal: t("trustSignals.noCreditCard"),
    },
    {
      key: "broker" as const,
      isPopular: true,
      trustSignal: t("trustSignals.freeTrial"),
    },
    {
      key: "agency" as const,
      isPopular: false,
      trustSignal: null,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
      {tiers.map((tier) => {
        const tierT = t.raw(`tiers.${tier.key}`) as {
          name: string;
          description: string;
          priceMonthly: string;
          priceAnnual: string;
          cta: string;
          popular?: string;
          features: string[];
        };

        const price = isAnnual ? tierT.priceAnnual : tierT.priceMonthly;
        const period = isAnnual ? t("billing.perYear") : t("billing.perMonth");

        return (
          <div
            key={tier.key}
            className={cn(
              "relative flex flex-col rounded-xl border p-6",
              tier.isPopular
                ? "border-primary shadow-lg ring-2 ring-primary/20"
                : "border-border"
            )}
          >
            {tier.isPopular && tierT.popular && (
              <div className="absolute -top-3 start-1/2 -translate-x-1/2">
                <span className="inline-block px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                  {tierT.popular}
                </span>
              </div>
            )}

            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-2">{tierT.name}</h3>
              <p className="text-sm text-muted-foreground mb-6">
                {tierT.description}
              </p>

              <div className="mb-6">
                {price === "Custom" || price === "מותאם אישית" ? (
                  <div className="text-3xl font-bold">{price}</div>
                ) : (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-muted-foreground">{period}</span>
                  </div>
                )}
              </div>

              <Button
                className="w-full mb-6"
                variant={tier.isPopular ? "default" : "outline"}
              >
                {tierT.cta}
              </Button>

              {tier.trustSignal && (
                <p className="text-xs text-center text-muted-foreground mb-6">
                  {tier.trustSignal}
                </p>
              )}

              <ul className="space-y-3">
                {tierT.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check
                      className="size-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        );
      })}
    </div>
  );
}
