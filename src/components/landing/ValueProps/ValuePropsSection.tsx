"use client";

import { useTranslations } from "next-intl";
import { Globe, BarChart3, Users, ShieldCheck, type LucideIcon } from "lucide-react";
import { SectionWrapper, SectionHeader } from "../shared";
import { ValuePropCard } from "./ValuePropCard";

// ============================================================================
// Types
// ============================================================================

interface ValuePropItem {
  key: string;
  icon: string;
  title: string;
  description: string;
}

// ============================================================================
// Icon Mapping
// ============================================================================

const iconMapping: Record<string, LucideIcon> = {
  network: Globe,
  tracking: BarChart3,
  partners: Users,
  security: ShieldCheck,
};

// ============================================================================
// ValuePropsSection Component
// ============================================================================

export function ValuePropsSection() {
  const t = useTranslations("landing.valueProps");
  const items = t.raw("items") as ValuePropItem[];

  return (
    <SectionWrapper
      id="value-props"
      background="transparent"
      animate={true}
      ariaLabel="Value propositions section"
    >
      <SectionHeader
        title={t("heading")}
        subtitle={t("subheading")}
        centered={true}
        useDisplayFont={true}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {items.map((item) => {
          const IconComponent = iconMapping[item.icon] || Globe;
          return (
            <ValuePropCard
              key={item.key}
              icon={IconComponent}
              title={item.title}
              description={item.description}
            />
          );
        })}
      </div>
    </SectionWrapper>
  );
}

export default ValuePropsSection;
