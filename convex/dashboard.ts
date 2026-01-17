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

// Property recommendations for investors
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
