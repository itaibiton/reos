"use client";

import { useTranslations } from "next-intl";
import { Check, Minus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function FeatureComparison() {
  const t = useTranslations("pricing.comparison");
  const tPricing = useTranslations("pricing");

  const features = t.raw("features") as Array<{
    name: string;
    investor: boolean;
    provider: boolean;
    enterprise: boolean;
  }>;

  const tiers = [
    { key: "investor", name: tPricing("tiers.investor.name") },
    { key: "provider", name: tPricing("tiers.provider.name") },
    { key: "enterprise", name: tPricing("tiers.enterprise.name") },
  ];

  return (
    <div>
      <h2 className="text-3xl md:text-5xl font-light tracking-tighter text-center mb-8">{t("title")}</h2>

      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2">{t("feature")}</TableHead>
              {tiers.map((tier) => (
                <TableHead key={tier.key} className="text-center">
                  {tier.name}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((feature, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{feature.name}</TableCell>
                <TableCell className="text-center">
                  {feature.investor ? (
                    <Check
                      className="inline-block size-5 text-green-600 dark:text-green-400"
                      aria-label="Included"
                    />
                  ) : (
                    <Minus
                      className="inline-block size-5 text-muted-foreground"
                      aria-label="Not included"
                    />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {feature.provider ? (
                    <Check
                      className="inline-block size-5 text-green-600 dark:text-green-400"
                      aria-label="Included"
                    />
                  ) : (
                    <Minus
                      className="inline-block size-5 text-muted-foreground"
                      aria-label="Not included"
                    />
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {feature.enterprise ? (
                    <Check
                      className="inline-block size-5 text-green-600 dark:text-green-400"
                      aria-label="Included"
                    />
                  ) : (
                    <Minus
                      className="inline-block size-5 text-muted-foreground"
                      aria-label="Not included"
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile stacked cards */}
      <div className="md:hidden space-y-6">
        {tiers.map((tier) => {
          const includedFeatures = features.filter(
            (f) => f[tier.key as keyof typeof f] === true
          );

          return (
            <div key={tier.key} className="border rounded-lg p-4">
              <h3 className="text-xl font-light tracking-tight mb-4">{tier.name}</h3>
              <ul className="space-y-2">
                {includedFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check
                      className="size-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <span className="text-sm">{feature.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
