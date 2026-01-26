"use client";

import { useTranslations } from "next-intl";
import { SectionWrapper, SectionHeader } from "../shared";
import { LogoGrid } from "./LogoGrid";

// ============================================================================
// TrustSection Component
// ============================================================================

export function TrustSection() {
  const t = useTranslations("landing.trust");

  return (
    <SectionWrapper
      id="trust"
      background="muted"
      animate={true}
      ariaLabel="Trust and partnerships section"
    >
      <SectionHeader
        title={t("heading")}
        subtitle={t("subheading")}
        centered={true}
        useDisplayFont={true}
      />
      <LogoGrid />
    </SectionWrapper>
  );
}

export default TrustSection;
