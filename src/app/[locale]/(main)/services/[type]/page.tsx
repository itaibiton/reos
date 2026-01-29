import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import Script from "next/script";
import { ProviderPageContent } from "./ProviderPageContent";

const VALID_TYPES = [
  "broker",
  "lawyer",
  "appraiser",
  "mortgage-advisor",
  "entrepreneur",
  "asset-manager",
  "financial-advisor",
] as const;

type ProviderType = (typeof VALID_TYPES)[number];

function isValidType(type: string): type is ProviderType {
  return (VALID_TYPES as readonly string[]).includes(type);
}

export function generateStaticParams() {
  return VALID_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}): Promise<Metadata> {
  const { locale, type } = await params;

  if (!isValidType(type)) return {};

  const t = await getTranslations({
    locale,
    namespace: `services.providers.${type}`,
  });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      locale: locale === "he" ? "he_IL" : "en_US",
      type: "website",
    },
    alternates: {
      languages: {
        en: `/en/services/${type}`,
        he: `/he/services/${type}`,
      },
    },
  };
}

export default async function ProviderPage({
  params,
}: {
  params: Promise<{ locale: string; type: string }>;
}) {
  const { locale, type } = await params;

  if (!isValidType(type)) {
    notFound();
  }

  const t = await getTranslations({
    locale,
    namespace: `services.providers.${type}`,
  });

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: t("name"),
    provider: {
      "@type": "Organization",
      name: "REOS",
      url: "https://reos.co",
    },
    areaServed: {
      "@type": "Country",
      name: "Israel",
    },
    description: t("meta.description"),
    audience: {
      "@type": "Audience",
      audienceType: "US Real Estate Investors",
    },
  };

  return (
    <>
      <Script
        id={`service-schema-${type}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <ProviderPageContent type={type} />
    </>
  );
}
