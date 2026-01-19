import { mutation } from "./_generated/server";

// Seed data for analytics testing - adds reviews, service requests, and messages
// This is a development-only mutation that should not be used in production
export const seedAnalyticsData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneMonth = 30 * oneDay;

    // Get all users
    const users = await ctx.db.query("users").collect();
    const brokers = users.filter((u) => u.role === "broker");
    const mortgageAdvisors = users.filter((u) => u.role === "mortgage_advisor");
    const lawyers = users.filter((u) => u.role === "lawyer");
    const investors = users.filter((u) => u.role === "investor");

    // Get completed deals
    const completedDeals = await ctx.db
      .query("deals")
      .withIndex("by_stage", (q) => q.eq("stage", "completed"))
      .collect();

    // Add reviews for completed deals
    const reviewsToAdd: Array<{
      providerId: string;
      reviewerId: string;
      dealId: string;
      rating: number;
      reviewText: string;
    }> = [];

    for (const deal of completedDeals) {
      // Get investor
      const investor = await ctx.db.get(deal.investorId);
      if (!investor) continue;

      // Add reviews for each provider on the deal
      if (deal.brokerId) {
        const broker = await ctx.db.get(deal.brokerId);
        if (broker && broker.role !== "admin") {
          // Check if review exists
          const existingReview = await ctx.db
            .query("providerReviews")
            .withIndex("by_deal", (q) => q.eq("dealId", deal._id))
            .filter((q) =>
              q.and(
                q.eq(q.field("reviewerId"), deal.investorId),
                q.eq(q.field("providerId"), deal.brokerId!)
              )
            )
            .unique();

          if (!existingReview) {
            await ctx.db.insert("providerReviews", {
              providerId: deal.brokerId,
              reviewerId: deal.investorId,
              dealId: deal._id,
              rating: Math.floor(Math.random() * 2) + 4, // 4-5 stars
              reviewText:
                "Great experience working with this broker. Very professional and knowledgeable about the local market.",
              createdAt: deal.updatedAt + oneDay,
            });
          }
        }
      }

      if (deal.mortgageAdvisorId) {
        const existingReview = await ctx.db
          .query("providerReviews")
          .withIndex("by_deal", (q) => q.eq("dealId", deal._id))
          .filter((q) =>
            q.and(
              q.eq(q.field("reviewerId"), deal.investorId),
              q.eq(q.field("providerId"), deal.mortgageAdvisorId!)
            )
          )
          .unique();

        if (!existingReview) {
          await ctx.db.insert("providerReviews", {
            providerId: deal.mortgageAdvisorId,
            reviewerId: deal.investorId,
            dealId: deal._id,
            rating: Math.floor(Math.random() * 2) + 4,
            reviewText:
              "Helped us secure a great rate. Very responsive and explained everything clearly.",
            createdAt: deal.updatedAt + oneDay * 2,
          });
        }
      }

      if (deal.lawyerId) {
        const existingReview = await ctx.db
          .query("providerReviews")
          .withIndex("by_deal", (q) => q.eq("dealId", deal._id))
          .filter((q) =>
            q.and(
              q.eq(q.field("reviewerId"), deal.investorId),
              q.eq(q.field("providerId"), deal.lawyerId!)
            )
          )
          .unique();

        if (!existingReview) {
          await ctx.db.insert("providerReviews", {
            providerId: deal.lawyerId,
            reviewerId: deal.investorId,
            dealId: deal._id,
            rating: Math.floor(Math.random() * 2) + 4,
            reviewText:
              "Thorough and professional. Made the legal process smooth and stress-free.",
            createdAt: deal.updatedAt + oneDay * 3,
          });
        }
      }
    }

    // Add more service requests with varied statuses
    // Get existing pending requests
    const existingRequests = await ctx.db
      .query("serviceRequests")
      .collect();

    // Add some declined requests
    const activeDeals = await ctx.db
      .query("deals")
      .filter((q) =>
        q.and(
          q.neq(q.field("stage"), "completed"),
          q.neq(q.field("stage"), "cancelled")
        )
      )
      .collect();

    let declinedCount = 0;
    for (const deal of activeDeals.slice(0, 3)) {
      // Add a declined broker request
      const availableBrokers = brokers.filter(
        (b) =>
          b._id !== deal.brokerId &&
          !existingRequests.some(
            (r) => r.dealId === deal._id && r.providerId === b._id
          )
      );

      if (availableBrokers.length > 0 && declinedCount < 5) {
        const broker = availableBrokers[Math.floor(Math.random() * availableBrokers.length)];
        await ctx.db.insert("serviceRequests", {
          dealId: deal._id,
          investorId: deal.investorId,
          providerId: broker._id,
          providerType: "broker",
          status: "declined",
          investorMessage: "Would you be able to help with this property?",
          providerResponse: "Unfortunately I'm fully booked at the moment. Best of luck with your search!",
          createdAt: now - Math.floor(Math.random() * 3) * oneMonth,
          respondedAt: now - Math.floor(Math.random() * 3) * oneMonth + oneDay,
        });
        declinedCount++;
      }
    }

    // Add some additional reviews for variety
    // Get all deals with providers assigned
    const allDeals = await ctx.db.query("deals").collect();

    for (const broker of brokers.filter((b) => b.role !== "admin").slice(0, 3)) {
      // Add a review from each test investor
      for (const investor of investors.slice(0, 2)) {
        // Find a completed deal they could have worked on (or fake it)
        const deal = completedDeals.find(
          (d) =>
            d.investorId === investor._id ||
            (d.brokerId === broker._id && d.investorId)
        );

        if (deal) {
          const existingReview = await ctx.db
            .query("providerReviews")
            .withIndex("by_provider", (q) => q.eq("providerId", broker._id))
            .filter((q) => q.eq(q.field("reviewerId"), investor._id))
            .unique();

          if (!existingReview) {
            await ctx.db.insert("providerReviews", {
              providerId: broker._id,
              reviewerId: investor._id,
              dealId: deal._id,
              rating: Math.floor(Math.random() * 2) + 4,
              reviewText: [
                "Excellent service! Found us the perfect property within our budget.",
                "Very knowledgeable about the market. Highly recommend!",
                "Professional and responsive throughout the entire process.",
                "Made the buying process smooth and stress-free.",
              ][Math.floor(Math.random() * 4)],
              createdAt: now - Math.floor(Math.random() * 60) * oneDay,
            });
          }
        }
      }
    }

    // Add some chat messages
    const chatsToAdd = [
      "Thank you for all your help with the property search!",
      "The documents look good. Let me review and get back to you.",
      "When can we schedule the property viewing?",
      "I've submitted the mortgage application. Should hear back soon.",
      "Great news! The offer was accepted.",
    ];

    // Add messages to active deals
    for (const deal of activeDeals.slice(0, 3)) {
      if (deal.brokerId) {
        await ctx.db.insert("messages", {
          dealId: deal._id,
          senderId: deal.investorId,
          recipientId: deal.brokerId,
          content: chatsToAdd[Math.floor(Math.random() * chatsToAdd.length)],
          status: "sent",
          createdAt: now - Math.floor(Math.random() * 7) * oneDay,
        });
      }
    }

    return {
      success: true,
      message: "Analytics data seeded successfully",
    };
  },
});
