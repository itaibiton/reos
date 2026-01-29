"use client";

import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import {
  Briefcase,
  Landmark,
  Scale,
  Calculator,
  Stamp,
  FileSpreadsheet,
  ClipboardCheck,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const PROVIDER_TYPES = [
  "broker",
  "mortgage-advisor",
  "lawyer",
  "accountant",
  "notary",
  "tax-consultant",
  "appraiser",
] as const;

const providerIcons: Record<string, LucideIcon> = {
  broker: Briefcase,
  "mortgage-advisor": Landmark,
  lawyer: Scale,
  accountant: Calculator,
  notary: Stamp,
  "tax-consultant": FileSpreadsheet,
  appraiser: ClipboardCheck,
};

export function ServicesIndexContent() {
  const t = useTranslations("services");
  const locale = useLocale();

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-landing-text">
            {t("index.title")}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t("index.subtitle")}
          </p>
        </div>

        {/* Provider cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROVIDER_TYPES.map((type, index) => {
            const Icon = providerIcons[type];
            const isEven = index % 2 === 0;

            return (
              <Link
                key={type}
                href={`/${locale}/services/${type}`}
                className={cn(
                  "group relative flex flex-col p-6 rounded-xl",
                  "bg-card border border-border",
                  "shadow-sm transition-all duration-300",
                  "hover:shadow-lg hover:border-landing-primary/30",
                  "hover:-translate-y-1",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-landing-primary focus-visible:ring-offset-2"
                )}
              >
                {/* Icon */}
                <div
                  className={cn(
                    "w-12 h-12 rounded-lg mb-4",
                    "flex items-center justify-center",
                    isEven
                      ? "bg-landing-primary/10"
                      : "bg-landing-accent/10"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-6 h-6",
                      isEven
                        ? "text-landing-primary"
                        : "text-landing-accent"
                    )}
                    aria-hidden="true"
                  />
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold mb-2 text-landing-text">
                  {t(`providers.${type}.name`)}
                </h2>

                {/* Short description */}
                <p className="text-sm text-muted-foreground mb-4 flex-grow">
                  {t(`providers.${type}.shortDescription`)}
                </p>

                {/* CTA arrow */}
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-sm font-medium",
                    isEven
                      ? "text-landing-primary"
                      : "text-landing-accent"
                  )}
                >
                  {t("index.learnMore")}
                  <ArrowRight
                    className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
