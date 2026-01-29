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
  CheckCircle2,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const providerIcons: Record<string, LucideIcon> = {
  broker: Briefcase,
  "mortgage-advisor": Landmark,
  lawyer: Scale,
  accountant: Calculator,
  notary: Stamp,
  "tax-consultant": FileSpreadsheet,
  appraiser: ClipboardCheck,
};

interface ProviderPageContentProps {
  type: string;
}

export function ProviderPageContent({ type }: ProviderPageContentProps) {
  const t = useTranslations(`services.providers.${type}`);
  const tCommon = useTranslations("services.common");
  const locale = useLocale();
  const Icon = providerIcons[type] ?? Briefcase;

  const benefits = [
    { title: t("benefits.0.title"), description: t("benefits.0.description") },
    { title: t("benefits.1.title"), description: t("benefits.1.description") },
    { title: t("benefits.2.title"), description: t("benefits.2.description") },
  ];

  const steps = [
    { title: t("steps.0.title"), description: t("steps.0.description") },
    { title: t("steps.1.title"), description: t("steps.1.description") },
    { title: t("steps.2.title"), description: t("steps.2.description") },
    { title: t("steps.3.title"), description: t("steps.3.description") },
  ];

  return (
    <div>
      {/* Hero */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-landing-primary/5 to-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-16 h-16 rounded-xl bg-landing-primary/10 flex items-center justify-center mx-auto mb-6">
              <Icon
                className="w-8 h-8 text-landing-primary"
                aria-hidden="true"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-landing-text">
              {t("heroTitle")}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t("heroDescription")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-landing-primary hover:bg-landing-primary/90 text-white"
              >
                <Link href={`/${locale}/sign-up`}>{tCommon("ctaSignUp")}</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={`/${locale}/contact`}>{tCommon("ctaContact")}</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-landing-text">
            {tCommon("benefitsTitle")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={index}
                  className={cn(
                    "rounded-xl border border-border bg-card p-6",
                    "shadow-sm transition-all duration-300",
                    "hover:shadow-md hover:border-landing-primary/20"
                  )}
                >
                  <div
                    className={cn(
                      "w-10 h-10 rounded-lg mb-4 flex items-center justify-center",
                      isEven
                        ? "bg-landing-primary/10"
                        : "bg-landing-accent/10"
                    )}
                  >
                    <CheckCircle2
                      className={cn(
                        "w-5 h-5",
                        isEven
                          ? "text-landing-primary"
                          : "text-landing-accent"
                      )}
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="text-lg font-semibold mb-2 text-landing-text">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-landing-text">
            {tCommon("howItWorksTitle")}
          </h2>
          <div className="max-w-3xl mx-auto space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex gap-6">
                {/* Step number */}
                <div className="flex-shrink-0">
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-white",
                      index % 2 === 0
                        ? "bg-landing-primary"
                        : "bg-landing-accent"
                    )}
                  >
                    {index + 1}
                  </div>
                </div>
                {/* Step content */}
                <div className="pt-1">
                  <h3 className="text-lg font-semibold mb-1 text-landing-text">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-gradient-to-r from-landing-primary/10 via-landing-accent/5 to-landing-primary/10 border border-landing-primary/10 p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4 text-landing-text">
              {t("ctaTitle")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              {t("ctaDescription")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                asChild
                size="lg"
                className="bg-landing-primary hover:bg-landing-primary/90 text-white"
              >
                <Link href={`/${locale}/sign-up`}>
                  {tCommon("ctaSignUp")}
                  <ArrowRight className="w-4 h-4 ms-2" aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href={`/${locale}/services`}>
                  {tCommon("viewAllServices")}
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
