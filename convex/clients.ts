import { v } from "convex/values";
import { query } from "./_generated/server";

// ============================================================================
// Get Clients
// ============================================================================
// Get unique clients (investors) for the current service provider.
// Returns clients with deal statistics sorted by latest activity.
export const getClients = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    // Determine effective role (viewingAsRole for admins, otherwise actual role)
    const effectiveRole = user.role === "admin" && user.viewingAsRole
      ? user.viewingAsRole
      : user.role;

    // Only for service providers
    if (
      effectiveRole !== "broker" &&
      effectiveRole !== "mortgage_advisor" &&
      effectiveRole !== "lawyer"
    ) {
      return [];
    }

    // Get deals where this provider is assigned based on role
    let assignedDeals;
    if (effectiveRole === "broker") {
      assignedDeals = await ctx.db
        .query("deals")
        .withIndex("by_broker", (q) => q.eq("brokerId", user._id))
        .collect();
    } else if (effectiveRole === "mortgage_advisor") {
      assignedDeals = await ctx.db
        .query("deals")
        .withIndex("by_mortgage_advisor", (q) => q.eq("mortgageAdvisorId", user._id))
        .collect();
    } else {
      assignedDeals = await ctx.db
        .query("deals")
        .withIndex("by_lawyer", (q) => q.eq("lawyerId", user._id))
        .collect();
    }

    // Extract unique investor IDs
    const investorIds = [...new Set(assignedDeals.map((d) => d.investorId))];

    if (investorIds.length === 0) {
      return [];
    }

    // Fetch investor details and calculate stats for each
    const clients = await Promise.all(
      investorIds.map(async (investorId) => {
        const investor = await ctx.db.get(investorId);
        if (!investor) return null;

        // Get deals for this specific client with current provider
        const clientDeals = assignedDeals.filter((d) => d.investorId === investorId);

        // Calculate stats
        const totalDeals = clientDeals.length;
        const activeDeals = clientDeals.filter(
          (d) => d.stage !== "completed" && d.stage !== "cancelled"
        ).length;

        // Calculate total value by fetching properties
        let totalValue = 0;
        for (const deal of clientDeals) {
          const property = await ctx.db.get(deal.propertyId);
          if (property) {
            totalValue += property.priceUsd;
          }
        }

        // Get latest activity timestamp (most recent deal createdAt or updatedAt)
        const lastActivityAt = Math.max(
          ...clientDeals.map((d) => d.updatedAt ?? d.createdAt)
        );

        return {
          _id: investor._id,
          name: investor.name,
          email: investor.email,
          imageUrl: investor.imageUrl,
          totalDeals,
          activeDeals,
          totalValue,
          lastActivityAt,
        };
      })
    );

    // Filter out null entries and sort by latest activity (most recent first)
    const validClients = clients.filter((c) => c !== null);
    validClients.sort((a, b) => b.lastActivityAt - a.lastActivityAt);

    return validClients;
  },
});

// ============================================================================
// Get Client Details
// ============================================================================
// Get detailed information about a specific client including deal history.
// Only accessible to service providers who have worked with this client.
export const getClientDetails = query({
  args: {
    clientId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    // Determine effective role
    const effectiveRole = user.role === "admin" && user.viewingAsRole
      ? user.viewingAsRole
      : user.role;

    // Only for service providers
    if (
      effectiveRole !== "broker" &&
      effectiveRole !== "mortgage_advisor" &&
      effectiveRole !== "lawyer"
    ) {
      return null;
    }

    // Get deals where this provider is assigned AND investorId matches clientId
    let clientDeals;
    if (effectiveRole === "broker") {
      const allDeals = await ctx.db
        .query("deals")
        .withIndex("by_broker", (q) => q.eq("brokerId", user._id))
        .collect();
      clientDeals = allDeals.filter((d) => d.investorId === args.clientId);
    } else if (effectiveRole === "mortgage_advisor") {
      const allDeals = await ctx.db
        .query("deals")
        .withIndex("by_mortgage_advisor", (q) => q.eq("mortgageAdvisorId", user._id))
        .collect();
      clientDeals = allDeals.filter((d) => d.investorId === args.clientId);
    } else {
      const allDeals = await ctx.db
        .query("deals")
        .withIndex("by_lawyer", (q) => q.eq("lawyerId", user._id))
        .collect();
      clientDeals = allDeals.filter((d) => d.investorId === args.clientId);
    }

    // If no deals found with this client, return null (unauthorized)
    if (clientDeals.length === 0) {
      return null;
    }

    // Fetch client (investor) user details
    const client = await ctx.db.get(args.clientId);
    if (!client) {
      return null;
    }

    // Fetch investor questionnaire if exists
    const questionnaire = await ctx.db
      .query("investorQuestionnaires")
      .withIndex("by_user", (q) => q.eq("userId", args.clientId))
      .unique();

    // Sort deals by createdAt descending
    clientDeals.sort((a, b) => b.createdAt - a.createdAt);

    // Enrich deals with property and provider info
    const enrichedDeals = await Promise.all(
      clientDeals.map(async (deal) => {
        // Fetch property
        const property = await ctx.db.get(deal.propertyId);

        // Fetch providers
        const broker = deal.brokerId ? await ctx.db.get(deal.brokerId) : null;
        const mortgageAdvisor = deal.mortgageAdvisorId
          ? await ctx.db.get(deal.mortgageAdvisorId)
          : null;
        const lawyer = deal.lawyerId ? await ctx.db.get(deal.lawyerId) : null;

        return {
          _id: deal._id,
          stage: deal.stage,
          createdAt: deal.createdAt,
          property: property
            ? {
                _id: property._id,
                title: property.title,
                city: property.city,
                priceUsd: property.priceUsd,
                images: property.images,
              }
            : null,
          providers: {
            broker: broker
              ? { name: broker.name, imageUrl: broker.imageUrl }
              : null,
            mortgageAdvisor: mortgageAdvisor
              ? { name: mortgageAdvisor.name, imageUrl: mortgageAdvisor.imageUrl }
              : null,
            lawyer: lawyer
              ? { name: lawyer.name, imageUrl: lawyer.imageUrl }
              : null,
          },
        };
      })
    );

    // Calculate stats
    const totalDeals = clientDeals.length;
    const activeDeals = clientDeals.filter(
      (d) => d.stage !== "completed" && d.stage !== "cancelled"
    ).length;
    const completedDeals = clientDeals.filter(
      (d) => d.stage === "completed"
    ).length;

    // Calculate total value
    let totalValue = 0;
    for (const deal of enrichedDeals) {
      if (deal.property) {
        totalValue += deal.property.priceUsd;
      }
    }

    return {
      client: {
        _id: client._id,
        name: client.name,
        email: client.email,
        imageUrl: client.imageUrl,
      },
      questionnaire: questionnaire
        ? {
            citizenship: questionnaire.citizenship,
            residencyStatus: questionnaire.residencyStatus,
            experienceLevel: questionnaire.experienceLevel,
            ownsPropertyInIsrael: questionnaire.ownsPropertyInIsrael,
            investmentType: questionnaire.investmentType,
            budgetMin: questionnaire.budgetMin,
            budgetMax: questionnaire.budgetMax,
            investmentHorizon: questionnaire.investmentHorizon,
            investmentGoals: questionnaire.investmentGoals,
            yieldPreference: questionnaire.yieldPreference,
            financingApproach: questionnaire.financingApproach,
            preferredPropertyTypes: questionnaire.preferredPropertyTypes,
            preferredLocations: questionnaire.preferredLocations,
            minBedrooms: questionnaire.minBedrooms,
            maxBedrooms: questionnaire.maxBedrooms,
            minArea: questionnaire.minArea,
            maxArea: questionnaire.maxArea,
            preferredAmenities: questionnaire.preferredAmenities,
            purchaseTimeline: questionnaire.purchaseTimeline,
            additionalPreferences: questionnaire.additionalPreferences,
            servicesNeeded: questionnaire.servicesNeeded,
          }
        : null,
      deals: enrichedDeals,
      stats: {
        totalDeals,
        activeDeals,
        completedDeals,
        totalValue,
      },
    };
  },
});
