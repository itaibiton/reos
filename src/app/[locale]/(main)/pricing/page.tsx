import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Script from "next/script";
import { PricingPageContent } from "./PricingPageContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "pricing.meta" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale: locale === "he" ? "he_IL" : "en_US",
      type: "website",
    },
    alternates: {
      languages: {
        en: "/en/pricing",
        he: "/he/pricing",
      },
    },
  };
}

export default function PricingPage() {
  const pricingSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: "REOS Platform",
    description:
      "Real estate operating system connecting US investors with Israeli properties",
    offers: [
      {
        "@type": "Offer",
        name: "Investor",
        price: "0",
        priceCurrency: "USD",
        description: "Free plan for individual investors",
      },
      {
        "@type": "Offer",
        name: "Broker",
        price: "49",
        priceCurrency: "USD",
        description: "Professional plan for real estate brokers",
        priceValidUntil: "2026-12-31",
      },
      {
        "@type": "Offer",
        name: "Agency",
        description: "Custom pricing for agencies and teams",
      },
    ],
  };

  return (
    <>
      <Script
        id="pricing-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pricingSchema) }}
      />
      <PricingPageContent />
    </>
  );
}
