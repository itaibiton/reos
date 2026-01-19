import { v } from "convex/values";
import { query } from "./_generated/server";

// Get comprehensive analytics for a provider
export const getProviderAnalytics = query({
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

    // Verify user is a provider
    const providerRoles = ["broker", "mortgage_advisor", "lawyer"];
    if (!user.role || !providerRoles.includes(user.role)) {
      return null;
    }

    const providerId = user._id;

    // =========================================================================
    // DEAL METRICS
    // =========================================================================

    // Get all deals where this provider is assigned
    const allDeals = await ctx.db.query("deals").collect();

    const myDeals = allDeals.filter(
      (deal) =>
        deal.brokerId === providerId ||
        deal.mortgageAdvisorId === providerId ||
        deal.lawyerId === providerId
    );

    const completedDeals = myDeals.filter((d) => d.stage === "completed");
    const activeDeals = myDeals.filter(
      (d) => d.stage !== "completed" && d.stage !== "cancelled"
    );

    // Calculate deal values (from offer price or property price)
    let totalDealValue = 0;
    for (const deal of completedDeals) {
      if (deal.offerPrice) {
        totalDealValue += deal.offerPrice;
      } else {
        // Fallback to property price
        const property = await ctx.db.get(deal.propertyId);
        if (property) {
          totalDealValue += property.priceUsd;
        }
      }
    }

    const avgDealValue =
      completedDeals.length > 0 ? totalDealValue / completedDeals.length : 0;

    // =========================================================================
    // REQUEST METRICS
    // =========================================================================

    const allRequests = await ctx.db
      .query("serviceRequests")
      .withIndex("by_provider", (q) => q.eq("providerId", providerId))
      .collect();

    const acceptedRequests = allRequests.filter((r) => r.status === "accepted");
    const declinedRequests = allRequests.filter((r) => r.status === "declined");
    const pendingRequests = allRequests.filter((r) => r.status === "pending");

    const totalRequests = allRequests.length;
    const conversionRate =
      totalRequests > 0 ? (acceptedRequests.length / totalRequests) * 100 : 0;

    // Calculate average response time (for responded requests)
    const respondedRequests = allRequests.filter((r) => r.respondedAt);
    let avgResponseTimeHours = 0;

    if (respondedRequests.length > 0) {
      const totalResponseTime = respondedRequests.reduce((sum, r) => {
        const responseTime = r.respondedAt! - r.createdAt;
        return sum + responseTime;
      }, 0);
      // Convert ms to hours
      avgResponseTimeHours =
        totalResponseTime / respondedRequests.length / (1000 * 60 * 60);
    }

    // =========================================================================
    // RATING METRICS (from providerReviews)
    // =========================================================================

    const reviews = await ctx.db
      .query("providerReviews")
      .withIndex("by_provider", (q) => q.eq("providerId", providerId))
      .collect();

    const totalReviews = reviews.length;
    const avgRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    // =========================================================================
    // MONTHLY TRENDS (last 6 months)
    // =========================================================================

    const now = Date.now();
    const sixMonthsAgo = now - 6 * 30 * 24 * 60 * 60 * 1000; // Approximate

    // Build monthly buckets
    const monthlyData: Record<string, { deals: number; requests: number }> = {};

    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      monthlyData[monthKey] = { deals: 0, requests: 0 };
    }

    // Count completed deals by month (using completion timestamp from stageHistory)
    for (const deal of completedDeals) {
      // Find completion timestamp from stageHistory
      const completionEntry = deal.stageHistory.find(
        (h) => h.stage === "completed"
      );
      const completedAt = completionEntry?.timestamp ?? deal.updatedAt;

      if (completedAt >= sixMonthsAgo) {
        const date = new Date(completedAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].deals++;
        }
      }
    }

    // Count requests by month
    for (const request of allRequests) {
      if (request.createdAt >= sixMonthsAgo) {
        const date = new Date(request.createdAt);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        if (monthlyData[monthKey]) {
          monthlyData[monthKey].requests++;
        }
      }
    }

    // Convert to sorted array (oldest to newest)
    const monthlyTrends = Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        deals: data.deals,
        requests: data.requests,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // =========================================================================
    // RETURN ANALYTICS
    // =========================================================================

    return {
      // Deal metrics
      completedDeals: completedDeals.length,
      activeDeals: activeDeals.length,
      totalDealValue: Math.round(totalDealValue),
      avgDealValue: Math.round(avgDealValue),

      // Request metrics
      totalRequests,
      acceptedRequests: acceptedRequests.length,
      declinedRequests: declinedRequests.length,
      pendingRequests: pendingRequests.length,
      conversionRate: Math.round(conversionRate * 10) / 10, // 1 decimal
      avgResponseTimeHours: Math.round(avgResponseTimeHours * 10) / 10, // 1 decimal

      // Rating metrics
      avgRating: Math.round(avgRating * 10) / 10, // 1 decimal
      totalReviews,

      // Monthly trends
      monthlyTrends,
    };
  },
});
