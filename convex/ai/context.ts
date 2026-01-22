import { internalQuery } from "../_generated/server";
import { v } from "convex/values";

/**
 * Build a structured profile context string from investor questionnaire data.
 *
 * This context is injected into the AI system prompt, NOT saved as messages.
 * It's rebuilt fresh on each AI call to ensure current data.
 *
 * Per CONTEXT.md decisions:
 * - Profile data is NEVER summarized
 * - Always in context for every AI call
 * - Referenced when relevant, not repeated unnecessarily
 */
export const buildProfileContext = internalQuery({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    // Get the user's questionnaire data
    const questionnaire = await ctx.db
      .query("investorQuestionnaires")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!questionnaire) {
      return null;
    }

    // Build structured profile sections
    const sections: string[] = [];

    // Section 1: Background (Phase 11 fields)
    const background: string[] = [];
    if (questionnaire.citizenship) {
      background.push(`Citizenship: ${formatCitizenship(questionnaire.citizenship)}`);
    }
    if (questionnaire.residencyStatus) {
      background.push(`Residency: ${formatResidency(questionnaire.residencyStatus)}`);
    }
    if (questionnaire.experienceLevel) {
      background.push(`Experience: ${formatExperience(questionnaire.experienceLevel)}`);
    }
    if (questionnaire.ownsPropertyInIsrael !== undefined) {
      background.push(`Owns property in Israel: ${questionnaire.ownsPropertyInIsrael ? "Yes" : "No"}`);
    }
    if (questionnaire.investmentType) {
      background.push(`Investment type: ${formatInvestmentType(questionnaire.investmentType)}`);
    }
    if (background.length > 0) {
      sections.push(`### Background\n${background.join("\n")}`);
    }

    // Section 2: Financial Context (Phase 12 fields)
    const financial: string[] = [];
    if (questionnaire.budgetMin !== undefined || questionnaire.budgetMax !== undefined) {
      const min = questionnaire.budgetMin ? `$${(questionnaire.budgetMin / 1000).toFixed(0)}K` : "any";
      const max = questionnaire.budgetMax ? `$${(questionnaire.budgetMax / 1000).toFixed(0)}K` : "any";
      financial.push(`Budget: ${min} - ${max}`);
    }
    if (questionnaire.investmentHorizon) {
      financial.push(`Investment horizon: ${formatHorizon(questionnaire.investmentHorizon)}`);
    }
    if (questionnaire.investmentGoals && questionnaire.investmentGoals.length > 0) {
      financial.push(`Goals: ${questionnaire.investmentGoals.map(formatGoal).join(", ")}`);
    }
    if (questionnaire.yieldPreference) {
      financial.push(`Yield preference: ${formatYieldPref(questionnaire.yieldPreference)}`);
    }
    if (questionnaire.financingApproach) {
      financial.push(`Financing: ${formatFinancing(questionnaire.financingApproach)}`);
    }
    if (financial.length > 0) {
      sections.push(`### Financial Context\n${financial.join("\n")}`);
    }

    // Section 3: Property Preferences (Phase 13 fields)
    const property: string[] = [];
    if (questionnaire.preferredPropertyTypes && questionnaire.preferredPropertyTypes.length > 0) {
      property.push(`Property types: ${questionnaire.preferredPropertyTypes.join(", ")}`);
    }
    if (questionnaire.preferredLocations && questionnaire.preferredLocations.length > 0) {
      property.push(`Preferred locations: ${questionnaire.preferredLocations.join(", ")}`);
    }
    if (questionnaire.minBedrooms !== undefined || questionnaire.maxBedrooms !== undefined) {
      const min = questionnaire.minBedrooms ?? "any";
      const max = questionnaire.maxBedrooms ?? "any";
      property.push(`Bedrooms: ${min} - ${max}`);
    }
    if (questionnaire.minArea !== undefined || questionnaire.maxArea !== undefined) {
      const min = questionnaire.minArea ?? "any";
      const max = questionnaire.maxArea ?? "any";
      property.push(`Area: ${min} - ${max} sqm`);
    }
    if (questionnaire.preferredAmenities && questionnaire.preferredAmenities.length > 0) {
      property.push(`Desired amenities: ${questionnaire.preferredAmenities.join(", ")}`);
    }
    if (questionnaire.locationFlexibility) {
      property.push(`Location flexibility: ${formatFlexibility(questionnaire.locationFlexibility)}`);
    }
    if (property.length > 0) {
      sections.push(`### Property Preferences\n${property.join("\n")}`);
    }

    // Section 4: Timeline & Services (Phase 14 fields)
    const timeline: string[] = [];
    if (questionnaire.purchaseTimeline) {
      timeline.push(`Purchase timeline: ${formatTimeline(questionnaire.purchaseTimeline)}`);
    }
    if (questionnaire.servicesNeeded && questionnaire.servicesNeeded.length > 0) {
      timeline.push(`Services needed: ${questionnaire.servicesNeeded.map(formatService).join(", ")}`);
    }
    if (questionnaire.additionalPreferences) {
      timeline.push(`Additional notes: ${questionnaire.additionalPreferences}`);
    }
    if (timeline.length > 0) {
      sections.push(`### Timeline & Services\n${timeline.join("\n")}`);
    }

    // Return null if no meaningful profile data
    if (sections.length === 0) {
      return null;
    }

    // Build final context
    return `## Investor Profile

${sections.join("\n\n")}

---
Profile data is current as of the investor's last questionnaire update.`;
  },
});

// Formatting helpers
function formatCitizenship(value: string): string {
  const map: Record<string, string> = {
    israeli: "Israeli citizen",
    non_israeli: "Non-Israeli citizen",
  };
  return map[value] ?? value;
}

function formatResidency(value: string): string {
  const map: Record<string, string> = {
    resident: "Israeli resident",
    returning_resident: "Returning resident (Toshav Chozer)",
    non_resident: "Non-resident",
    unsure: "Unsure of status",
  };
  return map[value] ?? value;
}

function formatExperience(value: string): string {
  const map: Record<string, string> = {
    none: "First-time investor",
    some: "Some experience",
    experienced: "Experienced investor",
  };
  return map[value] ?? value;
}

function formatInvestmentType(value: string): string {
  const map: Record<string, string> = {
    residential: "Personal residence",
    investment: "Investment property",
  };
  return map[value] ?? value;
}

function formatHorizon(value: string): string {
  const map: Record<string, string> = {
    short_term: "Short-term (< 2 years)",
    medium_term: "Medium-term (2-5 years)",
    long_term: "Long-term (5+ years)",
  };
  return map[value] ?? value;
}

function formatGoal(value: string): string {
  const map: Record<string, string> = {
    appreciation: "Capital appreciation",
    rental_income: "Rental income",
    diversification: "Portfolio diversification",
    tax_benefits: "Tax benefits",
  };
  return map[value] ?? value;
}

function formatYieldPref(value: string): string {
  const map: Record<string, string> = {
    rental_yield: "Prioritize rental yield",
    appreciation: "Prioritize appreciation",
    balanced: "Balanced approach",
  };
  return map[value] ?? value;
}

function formatFinancing(value: string): string {
  const map: Record<string, string> = {
    cash: "Cash purchase",
    mortgage: "Will need mortgage",
    exploring: "Exploring options",
  };
  return map[value] ?? value;
}

function formatFlexibility(value: string): string {
  const map: Record<string, string> = {
    flexible: "Flexible on location",
    specific: "Specific locations only",
    nearby_cities: "Open to nearby cities",
  };
  return map[value] ?? value;
}

function formatTimeline(value: string): string {
  const map: Record<string, string> = {
    "3_months": "Within 3 months",
    "6_months": "Within 6 months",
    "1_year": "Within 1 year",
    exploring: "Just exploring",
  };
  return map[value] ?? value;
}

function formatService(value: string): string {
  const map: Record<string, string> = {
    broker: "Broker",
    mortgage_advisor: "Mortgage advisor",
    lawyer: "Lawyer",
  };
  return map[value] ?? value;
}
