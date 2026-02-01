import { internalQuery, QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { Id } from "../_generated/dataModel";

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

/**
 * Build page-level context for the AI system prompt.
 *
 * Resolves entity data server-side from lightweight identifiers sent by the frontend.
 * Enforces access control -- unauthorized entity access returns null, not data.
 * Returns a markdown string injected into the system prompt after profile context.
 */
export const buildPageContext = internalQuery({
  args: {
    userId: v.id("users"),
    pageType: v.string(),
    entityType: v.optional(v.string()),
    entityId: v.optional(v.string()),
  },
  handler: async (ctx, { userId, pageType, entityType, entityId }) => {
    // If no entity, return list page context
    if (!entityType || !entityId) {
      const listContext = buildListPageContext(pageType);
      const helpGuidance = getHelpGuidance(pageType);
      return combineContextSections(listContext, helpGuidance);
    }

    // Resolve entity context based on type
    let entityContext: string | null = null;
    switch (entityType) {
      case "property":
        entityContext = await resolvePropertyContext(ctx, entityId);
        break;
      case "deal":
        entityContext = await resolveDealContext(ctx, userId, entityId);
        break;
      case "provider":
        entityContext = await resolveProviderContext(ctx, entityId);
        break;
      case "client":
        entityContext = await resolveClientContext(ctx, userId, entityId);
        break;
      default:
        return null;
    }

    const helpGuidance = getHelpGuidance(pageType);
    return combineContextSections(entityContext, helpGuidance);
  },
});

/**
 * Combine entity context and help guidance sections.
 * Returns null if both are null.
 */
function combineContextSections(
  entityContext: string | null,
  helpGuidance: string | null
): string | null {
  if (entityContext && helpGuidance) {
    return entityContext + "\n\n" + helpGuidance;
  }
  return entityContext ?? helpGuidance ?? null;
}

/**
 * Check if a string looks like a valid Convex ID (contains an underscore).
 */
function isValidConvexId(id: string): boolean {
  return id.includes("_");
}

/**
 * Format a USD price with commas: 150000 -> "$150,000"
 */
function formatUsdPrice(price: number): string {
  return "$" + price.toLocaleString("en-US");
}

// ============================================================================
// Entity Resolvers (private -- not exported)
// ============================================================================

async function resolvePropertyContext(
  ctx: QueryCtx,
  entityId: string
): Promise<string | null> {
  try {
    if (!isValidConvexId(entityId)) return null;
    const property = await ctx.db.get(entityId as Id<"properties">);
    if (!property) return null;

    const lines: string[] = [];
    lines.push(`- **Title:** "${property.title}"`);
    lines.push(`- **Location:** ${property.city}${property.address ? ", " + property.address : ""}`);
    lines.push(`- **Price:** ${formatUsdPrice(property.priceUsd)}`);
    lines.push(`- **Type:** ${property.propertyType}`);
    lines.push(`- **Status:** ${property.status}`);
    if (property.bedrooms != null) lines.push(`- **Bedrooms:** ${property.bedrooms}`);
    if (property.bathrooms != null) lines.push(`- **Bathrooms:** ${property.bathrooms}`);
    if (property.squareMeters != null) lines.push(`- **Area:** ${property.squareMeters} sqm`);
    if (property.expectedRoi != null) lines.push(`- **Expected ROI:** ${property.expectedRoi}%`);
    if (property.capRate != null) lines.push(`- **Cap Rate:** ${property.capRate}%`);
    if (property.monthlyRent != null) lines.push(`- **Monthly Rent:** ${formatUsdPrice(property.monthlyRent)}`);

    return `## Current Page Context\n\nThe user is viewing a property listing:\n${lines.join("\n")}\n\nTailor responses to this property. Offer investment analysis, comparisons, or next steps when relevant.`;
  } catch {
    return null;
  }
}

async function resolveDealContext(
  ctx: QueryCtx,
  userId: Id<"users">,
  entityId: string
): Promise<string | null> {
  try {
    if (!isValidConvexId(entityId)) return null;
    const deal = await ctx.db.get(entityId as Id<"deals">);
    if (!deal) return null;

    // Access check: user must be a participant
    const isParticipant =
      deal.investorId === userId ||
      deal.brokerId === userId ||
      deal.mortgageAdvisorId === userId ||
      deal.lawyerId === userId;
    if (!isParticipant) return null;

    // Get property title
    const property = await ctx.db.get(deal.propertyId);
    const propertyTitle = property?.title ?? "Unknown property";

    const lines: string[] = [];
    lines.push(`- **Property:** "${propertyTitle}"`);
    lines.push(`- **Stage:** ${deal.stage}`);
    lines.push(`- **Started:** ${new Date(deal.createdAt).toLocaleDateString("en-US")}`);
    lines.push(`- **Broker:** ${deal.brokerId ? "Assigned" : "Not assigned"}`);
    lines.push(`- **Mortgage Advisor:** ${deal.mortgageAdvisorId ? "Assigned" : "Not assigned"}`);
    lines.push(`- **Lawyer:** ${deal.lawyerId ? "Assigned" : "Not assigned"}`);

    return `## Current Page Context\n\nThe user is viewing a deal:\n${lines.join("\n")}\n\nHelp with deal progression, explain next steps, or answer questions about the ${deal.stage} stage.`;
  } catch {
    return null;
  }
}

async function resolveProviderContext(
  ctx: QueryCtx,
  entityId: string
): Promise<string | null> {
  try {
    if (!isValidConvexId(entityId)) return null;

    // Try looking up by userId index first
    let profile = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_user", (q) => q.eq("userId", entityId as Id<"users">))
      .unique();

    // Fallback: try direct get (entityId might be a profile ID)
    if (!profile) {
      profile = await ctx.db.get(entityId as Id<"serviceProviderProfiles">);
    }
    if (!profile) return null;

    // Get user record for name
    const user = await ctx.db.get(profile.userId);
    const providerName = user?.name ?? "Unknown provider";

    const lines: string[] = [];
    lines.push(`- **Name:** ${providerName}`);
    lines.push(`- **Type:** ${profile.providerType}`);
    if (profile.serviceAreas.length > 0) {
      lines.push(`- **Service Areas:** ${profile.serviceAreas.join(", ")}`);
    }
    if (profile.yearsExperience != null) {
      lines.push(`- **Experience:** ${profile.yearsExperience} years`);
    }
    if (profile.companyName) {
      lines.push(`- **Company:** ${profile.companyName}`);
    }
    if (profile.bio) {
      const bioSnippet = profile.bio.length > 100 ? profile.bio.substring(0, 100) + "..." : profile.bio;
      lines.push(`- **Bio:** ${bioSnippet}`);
    }

    return `## Current Page Context\n\nThe user is viewing a service provider profile:\n${lines.join("\n")}\n\nHelp the user evaluate this provider or connect with them.`;
  } catch {
    return null;
  }
}

async function resolveClientContext(
  ctx: QueryCtx,
  userId: Id<"users">,
  entityId: string
): Promise<string | null> {
  try {
    if (!isValidConvexId(entityId)) return null;
    const clientUser = await ctx.db.get(entityId as Id<"users">);
    if (!clientUser) return null;

    // Access check: current user must be an assigned provider on at least one of this client's deals
    const clientDeals = await ctx.db
      .query("deals")
      .withIndex("by_investor", (q) => q.eq("investorId", entityId as Id<"users">))
      .collect();

    const assignedDeals = clientDeals.filter(
      (deal) =>
        deal.brokerId === userId ||
        deal.mortgageAdvisorId === userId ||
        deal.lawyerId === userId
    );

    if (assignedDeals.length === 0) return null;

    const stages = Array.from(new Set(assignedDeals.map((d) => d.stage)));
    const clientName = clientUser.name ?? "Unknown client";

    const lines: string[] = [];
    lines.push(`- **Client:** ${clientName}`);
    lines.push(`- **Deals:** ${assignedDeals.length}`);
    lines.push(`- **Deal Stages:** ${stages.join(", ")}`);

    return `## Current Page Context\n\nThe user is viewing a client profile:\n${lines.join("\n")}\n\nHelp manage this client's deals, review progress, or plan next steps.`;
  } catch {
    return null;
  }
}

// ============================================================================
// List Page Context (private -- static strings for non-entity pages)
// ============================================================================

function buildListPageContext(pageType: string): string | null {
  const contextMap: Record<string, string> = {
    property_browse:
      "## Current Page Context\n\nThe user is browsing the property marketplace. Help them search, filter, or understand available properties.",
    property_saved:
      "## Current Page Context\n\nThe user is viewing their saved properties. Help compare or suggest next steps.",
    property_listings:
      "## Current Page Context\n\nThe user is viewing their property listings. Help with listing management.",
    property_create:
      "## Current Page Context\n\nThe user is creating a new property listing. Help with listing best practices, pricing, and required information.",
    deals_list:
      "## Current Page Context\n\nThe user is viewing their deals list. Help with deal status, next steps, or comparisons between deals.",
    dashboard:
      "## Current Page Context\n\nThe user is on the main dashboard. Give portfolio overviews, highlight important updates, or suggest actions.",
    providers_browse:
      "## Current Page Context\n\nThe user is browsing service providers. Help them find the right broker, mortgage advisor, or lawyer.",
    settings:
      "## Current Page Context\n\nThe user is on the settings page. Help with account settings, preferences, or platform features.",
    onboarding:
      "## Current Page Context\n\nThe user is going through onboarding. Help them understand the platform and get started.",
    onboarding_questionnaire:
      "## Current Page Context\n\nThe user is filling out their investor questionnaire. Help them understand each question and why it matters.",
    onboarding_vendor:
      "## Current Page Context\n\nThe user is setting up their vendor profile. Help with profile optimization and best practices.",
    social_feed:
      "## Current Page Context\n\nThe user is viewing the social feed. Help them engage with content or find relevant posts.",
    messaging:
      "## Current Page Context\n\nThe user is in direct messaging. Help with communication tips or platform questions.",
    analytics:
      "## Current Page Context\n\nThe user is viewing analytics. Help interpret data and suggest improvements.",
  };
  return contextMap[pageType] ?? null;
}

// ============================================================================
// Help Guidance (private -- AI guidance strings per pageType)
// ============================================================================

function getHelpGuidance(pageType: string): string | null {
  const guidanceMap: Record<string, string> = {
    property_detail:
      "## Help Guidance\n\nIf the user asks for help:\n- Explain how to save properties, start deals, and compare listings\n- Mention the mortgage calculator and neighborhood data\n- Offer investment analysis for this specific property",
    property_edit:
      "## Help Guidance\n\nIf the user asks for help:\n- Guide them through each listing field\n- Suggest pricing strategies and compelling descriptions\n- Explain which fields matter most for buyer visibility",
    deal_detail:
      "## Help Guidance\n\nIf the user asks for help:\n- Explain the deal stages: interest -> broker_assigned -> mortgage -> legal -> closing -> completed\n- Explain what each provider role does (broker, mortgage advisor, lawyer)\n- Guide them on requesting providers and uploading documents",
    deals_list:
      "## Help Guidance\n\nIf the user asks for help:\n- Explain how deals work on REOS\n- Help prioritize which deal needs attention\n- Explain deal stages and typical timelines",
    property_browse:
      "## Help Guidance\n\nIf the user asks for help:\n- Explain search filters and how to find matching properties\n- Describe property types and what to look for\n- Suggest starting a deal when they find something interesting",
    providers_browse:
      "## Help Guidance\n\nIf the user asks for help:\n- Explain the different provider roles and when you need each\n- Help evaluate provider profiles\n- Guide them on requesting a provider for their deal",
    dashboard:
      "## Help Guidance\n\nIf the user asks for help:\n- Give a tour of the dashboard features\n- Explain key metrics and what they mean\n- Suggest the most important next action based on their status",
    onboarding_questionnaire:
      "## Help Guidance\n\nIf the user asks for help:\n- Explain why each question matters for property recommendations\n- Help them think through budget, location, and investment goals\n- Reassure them that preferences can be updated later",
  };
  return guidanceMap[pageType] ?? null;
}

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
