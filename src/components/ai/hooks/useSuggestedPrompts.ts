"use client";

import { useTranslations } from "next-intl";
import { useMemo } from "react";

/**
 * Prompt translation keys organized by page type.
 *
 * Each key maps to a path under `aiAssistant.suggestions.*` in the
 * message files. The hook resolves these via useTranslations.
 */
const PROMPT_KEYS_BY_PAGE_TYPE: Record<string, string[]> = {
  property_detail: [
    "propertyDetail.investmentAnalysis",
    "propertyDetail.comparison",
    "propertyDetail.startDeal",
  ],
  deal_detail: [
    "dealDetail.nextStep",
    "dealDetail.currentStage",
    "dealDetail.documents",
  ],
  property_browse: [
    "propertyBrowse.matchProfile",
    "propertyBrowse.bestAreas",
    "propertyBrowse.explainTypes",
  ],
  deals_list: [
    "dealsList.summary",
    "dealsList.attention",
    "dealsList.explainStages",
  ],
  dashboard: [
    "dashboard.portfolio",
    "dashboard.nextAction",
    "dashboard.help",
  ],
  providers_browse: [
    "providersBrowse.findBroker",
    "providersBrowse.mortgageAdvice",
    "providersBrowse.recommend",
  ],
  provider_detail: [
    "providerDetail.evaluate",
    "providerDetail.connect",
    "providerDetail.compare",
  ],
  property_saved: [
    "propertySaved.compare",
    "propertySaved.bestMatch",
    "propertySaved.nextStep",
  ],
  onboarding_questionnaire: [
    "onboarding.helpQuestion",
    "onboarding.whyMatters",
    "onboarding.canChange",
  ],
  settings: [
    "settings.help",
    "settings.features",
  ],
};

/**
 * Returns translated suggested prompts for the given page type.
 *
 * Falls back to dashboard prompts when the page type has no specific
 * prompts defined, then to an empty array if dashboard is also missing.
 */
export function useSuggestedPrompts(pageType: string): string[] {
  const t = useTranslations("aiAssistant.suggestions");

  return useMemo(() => {
    const keys =
      PROMPT_KEYS_BY_PAGE_TYPE[pageType] ??
      PROMPT_KEYS_BY_PAGE_TYPE["dashboard"] ??
      [];

    return keys.map((key) => t(key));
  }, [pageType, t]);
}
