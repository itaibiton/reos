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
  const t = await getTranslations({ locale, namespace: "legal.terms.meta" });

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
        en: "/en/terms",
        he: "/he/terms",
      },
    },
  };
}

export default function TermsOfServicePage() {
  const t = useTranslations("legal.terms");

  // Define headings array for TOC - must match section ids
  const headings = [
    { id: "introduction", text: t("sections.introduction.heading") },
    { id: "eligibility", text: t("sections.eligibility.heading") },
    { id: "account-terms", text: t("sections.accountTerms.heading") },
    { id: "platform-use", text: t("sections.platformUse.heading") },
    { id: "investor-terms", text: t("sections.investorTerms.heading") },
    { id: "provider-terms", text: t("sections.providerTerms.heading") },
    {
      id: "intellectual-property",
      text: t("sections.intellectualProperty.heading"),
    },
    { id: "user-content", text: t("sections.userContent.heading") },
    { id: "disclaimer", text: t("sections.disclaimer.heading") },
    {
      id: "limitation-of-liability",
      text: t("sections.limitationOfLiability.heading"),
    },
    { id: "indemnification", text: t("sections.indemnification.heading") },
    { id: "termination", text: t("sections.termination.heading") },
    { id: "governing-law", text: t("sections.governingLaw.heading") },
    {
      id: "dispute-resolution",
      text: t("sections.disputeResolution.heading"),
    },
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

            {/* Eligibility */}
            <LegalSection
              id="eligibility"
              heading={t("sections.eligibility.heading")}
            >
              <p>{t("sections.eligibility.content")}</p>
            </LegalSection>

            {/* Account Terms */}
            <LegalSection
              id="account-terms"
              heading={t("sections.accountTerms.heading")}
            >
              <p>{t("sections.accountTerms.content")}</p>
            </LegalSection>

            {/* Platform Use and Restrictions */}
            <LegalSection
              id="platform-use"
              heading={t("sections.platformUse.heading")}
            >
              <p>{t("sections.platformUse.content")}</p>
            </LegalSection>

            {/* Terms for Investors */}
            <LegalSection
              id="investor-terms"
              heading={t("sections.investorTerms.heading")}
            >
              <p>{t("sections.investorTerms.content")}</p>
            </LegalSection>

            {/* Terms for Service Providers */}
            <LegalSection
              id="provider-terms"
              heading={t("sections.providerTerms.heading")}
            >
              <p>{t("sections.providerTerms.content")}</p>
            </LegalSection>

            {/* Intellectual Property */}
            <LegalSection
              id="intellectual-property"
              heading={t("sections.intellectualProperty.heading")}
            >
              <p>{t("sections.intellectualProperty.content")}</p>
            </LegalSection>

            {/* User Content and Conduct */}
            <LegalSection
              id="user-content"
              heading={t("sections.userContent.heading")}
            >
              <p>{t("sections.userContent.content")}</p>
            </LegalSection>

            {/* Disclaimer of Warranties */}
            <LegalSection
              id="disclaimer"
              heading={t("sections.disclaimer.heading")}
            >
              <p>{t("sections.disclaimer.content")}</p>
            </LegalSection>

            {/* Limitation of Liability */}
            <LegalSection
              id="limitation-of-liability"
              heading={t("sections.limitationOfLiability.heading")}
            >
              <p>{t("sections.limitationOfLiability.content")}</p>
            </LegalSection>

            {/* Indemnification */}
            <LegalSection
              id="indemnification"
              heading={t("sections.indemnification.heading")}
            >
              <p>{t("sections.indemnification.content")}</p>
            </LegalSection>

            {/* Termination */}
            <LegalSection
              id="termination"
              heading={t("sections.termination.heading")}
            >
              <p>{t("sections.termination.content")}</p>
            </LegalSection>

            {/* Governing Law and Jurisdiction */}
            <LegalSection
              id="governing-law"
              heading={t("sections.governingLaw.heading")}
            >
              <p>{t("sections.governingLaw.content")}</p>
            </LegalSection>

            {/* Dispute Resolution */}
            <LegalSection
              id="dispute-resolution"
              heading={t("sections.disputeResolution.heading")}
            >
              <p>{t("sections.disputeResolution.content")}</p>
            </LegalSection>

            {/* Changes to Terms */}
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
