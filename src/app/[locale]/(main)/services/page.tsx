import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ServicesIndexContent } from "./ServicesIndexContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "services.meta" });

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
        en: "/en/services",
        he: "/he/services",
      },
    },
  };
}

export default function ServicesPage() {
  return <ServicesIndexContent />;
}
