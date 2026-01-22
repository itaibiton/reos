import { v } from "convex/values";
import { query } from "../../_generated/server";

/**
 * Search service providers with multi-criteria filtering.
 * Used by the AI agent to find real providers from the database.
 *
 * Returns provider profiles enriched with user info, ratings, and deal counts.
 */
export const searchProviders = query({
  args: {
    providerType: v.union(
      v.literal("broker"),
      v.literal("mortgage_advisor"),
      v.literal("lawyer")
    ),
    serviceAreas: v.optional(v.array(v.string())),
    languages: v.optional(v.array(v.string())),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    // Get profiles by provider type
    let profiles = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_provider_type", (q) => q.eq("providerType", args.providerType))
      .collect();

    // Apply service areas filter (case-insensitive, any overlap)
    if (args.serviceAreas && args.serviceAreas.length > 0) {
      const lowerServiceAreas = args.serviceAreas.map((a) => a.toLowerCase());
      profiles = profiles.filter((p) =>
        p.serviceAreas.some((area) =>
          lowerServiceAreas.includes(area.toLowerCase())
        )
      );
    }

    // Apply languages filter (any overlap)
    if (args.languages && args.languages.length > 0) {
      const lowerLanguages = args.languages.map((l) => l.toLowerCase());
      profiles = profiles.filter((p) =>
        p.languages.some((lang) => lowerLanguages.includes(lang.toLowerCase()))
      );
    }

    // Enrich profiles with user data, ratings, and deal counts
    const enrichedProfiles = await Promise.all(
      profiles.map(async (profile) => {
        // Get user info
        const user = await ctx.db.get(profile.userId);

        // Get reviews for this provider
        const reviews = await ctx.db
          .query("providerReviews")
          .withIndex("by_provider", (q) => q.eq("providerId", profile.userId))
          .collect();

        // Calculate average rating
        const avgRating =
          reviews.length > 0
            ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
            : 0;

        // Count completed deals based on provider type
        let completedDeals = 0;
        if (args.providerType === "broker") {
          const deals = await ctx.db
            .query("deals")
            .withIndex("by_broker", (q) => q.eq("brokerId", profile.userId))
            .filter((q) => q.eq(q.field("stage"), "completed"))
            .collect();
          completedDeals = deals.length;
        } else if (args.providerType === "mortgage_advisor") {
          const deals = await ctx.db
            .query("deals")
            .withIndex("by_mortgage_advisor", (q) =>
              q.eq("mortgageAdvisorId", profile.userId)
            )
            .filter((q) => q.eq(q.field("stage"), "completed"))
            .collect();
          completedDeals = deals.length;
        } else if (args.providerType === "lawyer") {
          const deals = await ctx.db
            .query("deals")
            .withIndex("by_lawyer", (q) => q.eq("lawyerId", profile.userId))
            .filter((q) => q.eq(q.field("stage"), "completed"))
            .collect();
          completedDeals = deals.length;
        }

        return {
          _id: profile.userId, // Use userId as identifier for team management
          name: user?.name ?? "Unknown",
          imageUrl: user?.imageUrl,
          providerType: profile.providerType,
          companyName: profile.companyName,
          yearsExperience: profile.yearsExperience ?? 0,
          specializations: profile.specializations,
          serviceAreas: profile.serviceAreas,
          languages: profile.languages,
          bio: profile.bio,
          avgRating,
          totalReviews: reviews.length,
          completedDeals,
          acceptingNewClients: profile.acceptingNewClients ?? true,
        };
      })
    );

    // Sort by: avgRating desc, yearsExperience desc, completedDeals desc
    enrichedProfiles.sort((a, b) => {
      if (b.avgRating !== a.avgRating) return b.avgRating - a.avgRating;
      if (b.yearsExperience !== a.yearsExperience)
        return b.yearsExperience - a.yearsExperience;
      return b.completedDeals - a.completedDeals;
    });

    // Apply limit and return
    return enrichedProfiles.slice(0, args.limit);
  },
});
