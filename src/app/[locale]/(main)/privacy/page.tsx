import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { useTranslations } from "next-intl";
import { TableOfContents, LegalSection } from "@/components/legal";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal.privacy.meta" });

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
        en: "/en/privacy",
        he: "/he/privacy",
      },
    },
  };
}

export default function PrivacyPolicyPage() {
  const t = useTranslations("legal.privacy");

  // Define headings array for TOC - must match section ids
  const headings = [
    { id: "introduction", text: t("sections.introduction.heading") },
    { id: "data-collection", text: t("sections.dataCollection.heading") },
    { id: "data-use", text: t("sections.dataUse.heading") },
    { id: "data-processors", text: t("sections.dataProcessors.heading") },
    { id: "cross-border", text: t("sections.crossBorder.heading") },
    { id: "data-sharing", text: t("sections.dataSharing.heading") },
    { id: "your-rights", text: t("sections.yourRights.heading") },
    { id: "data-security", text: t("sections.dataSecurity.heading") },
    { id: "cookies", text: t("sections.cookies.heading") },
    { id: "retention", text: t("sections.retention.heading") },
    { id: "children", text: t("sections.children.heading") },
    { id: "changes", text: t("sections.changes.heading") },
    { id: "contact", text: t("sections.contact.heading") },
  ];

  return (
    <div className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page title + last updated */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-3">{t("title")}</h1>
          <p className="text-muted-foreground">{t("lastUpdated")}</p>
        </div>

        {/* Two-column layout: TOC (sticky sidebar) + Content */}
        <div className="flex gap-12">
          {/* Sidebar TOC - desktop only, sticky */}
          <aside className="hidden lg:block w-64 shrink-0">
            <TableOfContents headings={headings} />
          </aside>

          {/* Main content */}
          <article className="flex-1 max-w-[75ch] space-y-12">
            {/* Mobile TOC - inline, non-sticky */}
            <div className="lg:hidden mb-8">
              <TableOfContents headings={headings} />
            </div>

            {/* Introduction */}
            <LegalSection
              id="introduction"
              heading={t("sections.introduction.heading")}
            >
              <p>{t("sections.introduction.content")}</p>
            </LegalSection>

            {/* Information We Collect */}
            <LegalSection
              id="data-collection"
              heading={t("sections.dataCollection.heading")}
            >
              <h3 className="text-lg font-medium mt-4 mb-2">
                {t("sections.dataCollection.whatWeCollect.heading")}
              </h3>
              <p>{t("sections.dataCollection.whatWeCollect.content")}</p>

              <h3 className="text-lg font-medium mt-4 mb-2">
                {t("sections.dataCollection.automaticData.heading")}
              </h3>
              <p>{t("sections.dataCollection.automaticData.content")}</p>
            </LegalSection>

            {/* How We Use Your Information */}
            <LegalSection
              id="data-use"
              heading={t("sections.dataUse.heading")}
            >
              <p>{t("sections.dataUse.content")}</p>
            </LegalSection>

            {/* Data Processors and Sub-Processors */}
            <LegalSection
              id="data-processors"
              heading={t("sections.dataProcessors.heading")}
            >
              <p>{t("sections.dataProcessors.content")}</p>
              <ul className="list-disc ps-6 space-y-2 mt-4">
                <li>{t("sections.dataProcessors.processors.clerk")}</li>
                <li>{t("sections.dataProcessors.processors.convex")}</li>
                <li>{t("sections.dataProcessors.processors.anthropic")}</li>
              </ul>
              <p className="mt-4">{t("sections.dataProcessors.note")}</p>
            </LegalSection>

            {/* Cross-Border Data Transfers */}
            <LegalSection
              id="cross-border"
              heading={t("sections.crossBorder.heading")}
            >
              <p>{t("sections.crossBorder.content")}</p>
            </LegalSection>

            {/* Information Sharing */}
            <LegalSection
              id="data-sharing"
              heading={t("sections.dataSharing.heading")}
            >
              <p>{t("sections.dataSharing.content")}</p>
            </LegalSection>

            {/* Your Privacy Rights */}
            <LegalSection
              id="your-rights"
              heading={t("sections.yourRights.heading")}
            >
              <p>{t("sections.yourRights.content")}</p>

              <h3 className="text-lg font-medium mt-4 mb-2">
                {t("sections.yourRights.ccpa.heading")}
              </h3>
              <p>{t("sections.yourRights.ccpa.content")}</p>

              <h3 className="text-lg font-medium mt-4 mb-2">
                {t("sections.yourRights.gdpr.heading")}
              </h3>
              <p>{t("sections.yourRights.gdpr.content")}</p>

              <h3 className="text-lg font-medium mt-4 mb-2">
                {t("sections.yourRights.israel.heading")}
              </h3>
              <p>{t("sections.yourRights.israel.content")}</p>
            </LegalSection>

            {/* Data Security */}
            <LegalSection
              id="data-security"
              heading={t("sections.dataSecurity.heading")}
            >
              <p>{t("sections.dataSecurity.content")}</p>
            </LegalSection>

            {/* Cookies and Tracking */}
            <LegalSection id="cookies" heading={t("sections.cookies.heading")}>
              <p>{t("sections.cookies.content")}</p>
            </LegalSection>

            {/* Data Retention */}
            <LegalSection
              id="retention"
              heading={t("sections.retention.heading")}
            >
              <p>{t("sections.retention.content")}</p>
            </LegalSection>

            {/* Children's Privacy */}
            <LegalSection
              id="children"
              heading={t("sections.children.heading")}
            >
              <p>{t("sections.children.content")}</p>
            </LegalSection>

            {/* Changes to This Policy */}
            <LegalSection id="changes" heading={t("sections.changes.heading")}>
              <p>{t("sections.changes.content")}</p>
            </LegalSection>

            {/* Contact Us */}
            <LegalSection id="contact" heading={t("sections.contact.heading")}>
              <p>{t("sections.contact.content")}</p>
            </LegalSection>
          </article>
        </div>
      </div>
    </div>
  );
}
