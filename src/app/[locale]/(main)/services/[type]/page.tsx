import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProviderPageContent } from "./ProviderPageContent";

const VALID_TYPES = [
  "broker",
  "mortgage-advisor",
  "lawyer",
  "accountant",
  "notary",
  "tax-consultant",
  "appraiser",
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
  const { type } = await params;

  if (!isValidType(type)) {
    notFound();
  }

  return <ProviderPageContent type={type} />;
}
