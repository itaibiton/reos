"use client";

import { useTranslations } from "next-intl";
import { SectionWrapper, SectionHeader } from "../shared";
import { FeatureCard } from "./FeatureCard";
import { iconMap, type IconKey } from "./iconMap";

// ============================================================================
// Types
// ============================================================================

interface FeatureCardItem {
  key: string;
  icon: IconKey;
  title: string;
  description: string;
}

// ============================================================================
// FeatureCardsSection Component
// ============================================================================

export function FeatureCardsSection() {
  const t = useTranslations("landing.featureCards");
  const items = t.raw("items") as FeatureCardItem[];

  return (
    <SectionWrapper
      id="features"
      background="transparent"
      animate={true}
      ariaLabel={t("heading")}
    >
      <SectionHeader
        title={t("heading")}
        subtitle={t("subheading")}
        centered={true}
      />

      {/* Responsive grid: 4→2→1 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {items.map((feature) => {
          const IconComponent = iconMap[feature.icon];
          return (
            <FeatureCard
              key={feature.key}
              icon={IconComponent}
              title={feature.title}
              description={feature.description}
            />
          );
        })}
      </div>
    </SectionWrapper>
  );
}

export default FeatureCardsSection;
