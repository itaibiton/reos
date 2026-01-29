import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ThankYouContent } from "./ThankYouContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact.thankYou" });

  return {
    title: t("title"),
    description: t("description"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      locale: locale === "he" ? "he_IL" : "en_US",
      type: "website",
    },
    robots: {
      index: false, // Don't index thank-you pages
      follow: true,
    },
  };
}

export default function ThankYouPage() {
  return <ThankYouContent />;
}
