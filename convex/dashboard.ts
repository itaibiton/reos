import { v } from "convex/values";
import { query } from "./_generated/server";

// Dashboard statistics per role
export const getStats = query({
  args: {},
  handler: async (ctx) => {
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

    // Determine effective role (viewingAsRole for admins, otherwise actual role)
    const effectiveRole = user.role === "admin" && user.viewingAsRole
      ? user.viewingAsRole
      : user.role;

    // Admin viewing as admin (no viewingAsRole set) - return platform stats
    if (user.role === "admin" && !user.viewingAsRole) {
      const allDeals = await ctx.db.query("deals").collect();
      const allUsers = await ctx.db.query("users").collect();
      const allProperties = await ctx.db.query("properties").collect();

      const activeDeals = allDeals.filter(
        (d) => d.stage !== "completed" && d.stage !== "cancelled"
      );

      return {
        role: "admin" as const,
        totalDeals: allDeals.length,
        activeDeals: activeDeals.length,
        totalUsers: allUsers.length,
        totalProperties: allProperties.length,
      };
    }

    // Investor stats
    if (effectiveRole === "investor") {
      const investorDeals = await ctx.db
        .query("deals")
        .withIndex("by_investor", (q) => q.eq("investorId", user._id))
        .collect();

      const activeDeals = investorDeals.filter(
        (d) => d.stage !== "completed" && d.stage !== "cancelled"
      );
      const completedDeals = investorDeals.filter((d) => d.stage === "completed");

      const savedProperties = await ctx.db
        .query("favorites")
        .withIndex("by_user", (q) => q.eq("userId", user._id))
        .collect();

      const pendingRequests = await ctx.db
        .query("serviceRequests")
        .withIndex("by_investor", (q) => q.eq("investorId", user._id))
        .collect();
      const pendingCount = pendingRequests.filter((r) => r.status === "pending").length;

      return {
        role: "investor" as const,
        activeDeals: activeDeals.length,
        completedDeals: completedDeals.length,
        savedProperties: savedProperties.length,
        pendingRequests: pendingCount,
      };
    }

    // Service provider stats (broker, mortgage_advisor, lawyer)
    if (
      effectiveRole === "broker" ||
      effectiveRole === "mortgage_advisor" ||
      effectiveRole === "lawyer"
    ) {
      const pendingRequests = await ctx.db
        .query("serviceRequests")
        .withIndex("by_provider_and_status", (q) =>
          q.eq("providerId", user._id).eq("status", "pending")
        )
        .collect();

      const acceptedRequests = await ctx.db
        .query("serviceRequests")
        .withIndex("by_provider", (q) => q.eq("providerId", user._id))
        .collect();
      const acceptedCount = acceptedRequests.filter((r) => r.status === "accepted");

      // Get deals where this provider is assigned
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

      // Active clients = deals not completed/cancelled
      const activeClients = assignedDeals.filter(
        (d) => d.stage !== "completed" && d.stage !== "cancelled"
      ).length;

      // Recent activity - deal activity in last 7 days for assigned deals
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const dealIds = new Set(assignedDeals.map((d) => d._id));

      const allActivity = await ctx.db.query("dealActivity").collect();
      const recentActivity = allActivity.filter(
        (a) => dealIds.has(a.dealId) && a.createdAt >= sevenDaysAgo
      ).length;

      return {
        role: effectiveRole as "broker" | "mortgage_advisor" | "lawyer",
        pendingRequests: pendingRequests.length,
        activeClients,
        totalClients: acceptedCount.length,
        recentActivity,
      };
    }

    // Unknown role
    return null;
  },
});

// ============================================================================
// Property Recommendations
// ============================================================================
// Personalized property suggestions for investors based on their profile.
// Scores properties by: property type, budget, location, and ROI targets.
export const getRecommendedProperties = query({
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

    // Get investor profile for personalization
    const investorProfile = await ctx.db
      .query("investorProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    // Get available properties
    const availableProperties = await ctx.db
      .query("properties")
      .withIndex("by_status", (q) => q.eq("status", "available"))
      .collect();

    // Get user's saved properties to exclude
    const savedFavorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    const savedPropertyIds = new Set(savedFavorites.map((f) => f.propertyId));

    // Filter out already saved properties
    const candidateProperties = availableProperties.filter(
      (p) => !savedPropertyIds.has(p._id)
    );

    // If no profile, return random 6 properties
    if (!investorProfile) {
      const shuffled = candidateProperties.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 6).map((p) => ({ ...p, matchScore: 50 }));
    }

    // Score properties based on profile match
    const scoredProperties = candidateProperties.map((property) => {
      let score = 0;
      let maxScore = 0;

      // Property type match (25 points)
      if (investorProfile.propertyTypes.length > 0) {
        maxScore += 25;
        if (investorProfile.propertyTypes.includes(property.propertyType)) {
          score += 25;
        }
      }

      // Budget match (35 points)
      maxScore += 35;
      if (property.priceUsd <= investorProfile.budgetMax) {
        if (property.priceUsd >= investorProfile.budgetMin) {
          score += 35; // Within range
        } else {
          score += 15; // Below budget (still affordable)
        }
      }

      // Location match (25 points)
      if (investorProfile.targetLocations.length > 0) {
        maxScore += 25;
        if (investorProfile.targetLocations.includes(property.city)) {
          score += 25;
        }
      }

      // ROI match (15 points)
      if (investorProfile.targetRoiMin && property.expectedRoi) {
        maxScore += 15;
        if (property.expectedRoi >= investorProfile.targetRoiMin) {
          score += 15;
        } else if (property.expectedRoi >= investorProfile.targetRoiMin * 0.8) {
          score += 8; // Close to target
        }
      }

      // Calculate match percentage
      const matchScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 50;

      return { ...property, matchScore };
    });

    // Sort by score descending and return top 6
    scoredProperties.sort((a, b) => b.matchScore - a.matchScore);
    return scoredProperties.slice(0, 6);
  },
});

// ============================================================================
// Provider Active Deals
// ============================================================================
// Get active deals for a service provider with property and investor info.
// Returns deals where user is assigned (broker/mortgage_advisor/lawyer).
export const getProviderActiveDeals = query({
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

    // Get deals where this provider is assigned
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

    // Filter to active deals only (not completed or cancelled)
    const activeDeals = assignedDeals.filter(
      (d) => d.stage !== "completed" && d.stage !== "cancelled"
    );

    // Sort by createdAt descending and limit to 5
    activeDeals.sort((a, b) => b.createdAt - a.createdAt);
    const limitedDeals = activeDeals.slice(0, 5);

    // Enrich with property and investor info
    const enrichedDeals = await Promise.all(
      limitedDeals.map(async (deal) => {
        const property = await ctx.db.get(deal.propertyId);
        const investor = await ctx.db.get(deal.investorId);

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
          investor: investor
            ? {
                _id: investor._id,
                name: investor.name,
                imageUrl: investor.imageUrl,
              }
            : null,
        };
      })
    );

    return enrichedDeals;
  },
});

// ============================================================================
// Recent Activity
// ============================================================================
// Get recent deal activity for the current user's deals.
// Providers see activity on deals where they're assigned.
// Investors see activity on their own deals.
// Admins see all activity.
export const getRecentActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
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

    const limit = args.limit || 5;

    // Determine effective role
    const effectiveRole = user.role === "admin" && user.viewingAsRole
      ? user.viewingAsRole
      : user.role;

    // Get deals based on role
    let dealIds: Set<string>;

    if (user.role === "admin" && !user.viewingAsRole) {
      // Admin (no viewingAsRole) - all activity
      const allDeals = await ctx.db.query("deals").collect();
      dealIds = new Set(allDeals.map((d) => d._id));
    } else if (effectiveRole === "investor") {
      // Investor - their deals
      const investorDeals = await ctx.db
        .query("deals")
        .withIndex("by_investor", (q) => q.eq("investorId", user._id))
        .collect();
      dealIds = new Set(investorDeals.map((d) => d._id));
    } else if (effectiveRole === "broker") {
      const assignedDeals = await ctx.db
        .query("deals")
        .withIndex("by_broker", (q) => q.eq("brokerId", user._id))
        .collect();
      dealIds = new Set(assignedDeals.map((d) => d._id));
    } else if (effectiveRole === "mortgage_advisor") {
      const assignedDeals = await ctx.db
        .query("deals")
        .withIndex("by_mortgage_advisor", (q) => q.eq("mortgageAdvisorId", user._id))
        .collect();
      dealIds = new Set(assignedDeals.map((d) => d._id));
    } else if (effectiveRole === "lawyer") {
      const assignedDeals = await ctx.db
        .query("deals")
        .withIndex("by_lawyer", (q) => q.eq("lawyerId", user._id))
        .collect();
      dealIds = new Set(assignedDeals.map((d) => d._id));
    } else {
      return [];
    }

    if (dealIds.size === 0) {
      return [];
    }

    // Get all activity and filter to user's deals
    const allActivity = await ctx.db.query("dealActivity").collect();
    const relevantActivity = allActivity
      .filter((a) => dealIds.has(a.dealId))
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, limit);

    // Helper to generate description from activity type and details
    function getActivityDescription(
      activityType: string,
      details: {
        fromStage?: string;
        toStage?: string;
        providerType?: string;
        fileName?: string;
        note?: string;
      }
    ): string {
      switch (activityType) {
        case "stage_change":
          return `moved deal to ${details.toStage?.replace("_", " ") || "new stage"}`;
        case "provider_assigned":
          return `assigned a ${details.providerType?.replace("_", " ") || "provider"}`;
        case "provider_removed":
          return `removed a ${details.providerType?.replace("_", " ") || "provider"}`;
        case "file_uploaded":
          return `uploaded ${details.fileName || "a file"}`;
        case "file_deleted":
          return `deleted ${details.fileName || "a file"}`;
        case "note_added":
          return "added a note";
        case "handoff_initiated":
          return "initiated a handoff";
        case "handoff_completed":
          return "completed a handoff";
        default:
          return "performed an action";
      }
    }

    // Enrich with actor and property info
    const enrichedActivity = await Promise.all(
      relevantActivity.map(async (activity) => {
        const actor = await ctx.db.get(activity.actorId);
        const deal = await ctx.db.get(activity.dealId);
        const property = deal ? await ctx.db.get(deal.propertyId) : null;

        return {
          _id: activity._id,
          dealId: activity.dealId,
          activityType: activity.activityType,
          description: getActivityDescription(activity.activityType, activity.details),
          createdAt: activity.createdAt,
          actor: actor
            ? {
                _id: actor._id,
                name: actor.name,
                imageUrl: actor.imageUrl,
              }
            : null,
          property: property
            ? {
                _id: property._id,
                title: property.title,
              }
            : null,
        };
      })
    );

    return enrichedActivity;
  },
});
