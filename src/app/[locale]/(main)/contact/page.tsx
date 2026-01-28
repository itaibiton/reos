import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContactPageContent } from "./ContactPageContent";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact.meta" });

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
        en: "/en/contact",
        he: "/he/contact",
      },
    },
  };
}

export default function ContactPage() {
  return <ContactPageContent />;
}
