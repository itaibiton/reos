"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  PricingTiers,
  PricingToggle,
  FeatureComparison,
  BillingFAQ,
} from "@/components/pricing";
import { Shield, CreditCard, Clock } from "lucide-react";

export function PricingPageContent() {
  const [isAnnual, setIsAnnual] = useState(true);
  const t = useTranslations("pricing");

  return (
    <div className="pt-32 pb-16 md:pt-48 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-light tracking-tighter mb-4">{t("title")}</h1>
          <p className="text-lg md:text-xl text-foreground/50 font-light max-w-2xl mx-auto">
            {t("subtitle")}
          </p>
        </div>

        {/* Billing toggle */}
        <div className="flex justify-center mb-12">
          <PricingToggle isAnnual={isAnnual} onToggle={setIsAnnual} />
        </div>

        {/* Pricing tier cards */}
        <PricingTiers isAnnual={isAnnual} />

        {/* Trust signals row */}
        <div className="flex flex-wrap items-center justify-center gap-6 mt-8 mb-16">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CreditCard className="w-4 h-4" aria-hidden="true" />
            <span>{t("trustSignals.noCreditCard")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" aria-hidden="true" />
            <span>{t("trustSignals.freeTrial")}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4" aria-hidden="true" />
            <span>{t("trustSignals.securePayment")}</span>
          </div>
        </div>

        {/* Feature comparison */}
        <div className="mb-16">
          <FeatureComparison />
        </div>

        {/* Billing FAQ */}
        <div className="max-w-3xl mx-auto">
          <BillingFAQ />
        </div>
      </div>
    </div>
  );
}
