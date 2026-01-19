import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Add a review for a provider after completing a deal
// Constraint: One review per deal per reviewer
export const addReview = mutation({
  args: {
    providerId: v.id("users"),
    dealId: v.id("deals"),
    rating: v.number(),
    reviewText: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get the reviewer (caller)
    const reviewer = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!reviewer) {
      throw new Error("User not found");
    }

    // Validate rating is 1-5
    if (args.rating < 1 || args.rating > 5 || !Number.isInteger(args.rating)) {
      throw new Error("Rating must be an integer from 1 to 5");
    }

    // Get the deal
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new Error("Deal not found");
    }

    // Verify caller was the investor on this deal
    if (deal.investorId !== reviewer._id) {
      throw new Error("Only the investor on this deal can leave a review");
    }

    // Verify deal is completed
    if (deal.stage !== "completed") {
      throw new Error("Can only review after deal is completed");
    }

    // Verify provider was assigned to this deal
    const providerWasAssigned =
      deal.brokerId === args.providerId ||
      deal.mortgageAdvisorId === args.providerId ||
      deal.lawyerId === args.providerId;

    if (!providerWasAssigned) {
      throw new Error("This provider was not assigned to this deal");
    }

    // Check for existing review (one per deal per reviewer)
    const existingReview = await ctx.db
      .query("providerReviews")
      .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
      .filter((q) =>
        q.and(
          q.eq(q.field("reviewerId"), reviewer._id),
          q.eq(q.field("providerId"), args.providerId)
        )
      )
      .unique();

    if (existingReview) {
      throw new Error("You have already reviewed this provider for this deal");
    }

    // Insert the review
    const reviewId = await ctx.db.insert("providerReviews", {
      providerId: args.providerId,
      reviewerId: reviewer._id,
      dealId: args.dealId,
      rating: args.rating,
      reviewText: args.reviewText,
      createdAt: Date.now(),
    });

    return reviewId;
  },
});

// Get all reviews for a provider with reviewer info and deal context
export const getByProvider = query({
  args: {
    providerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get all reviews for this provider
    const reviews = await ctx.db
      .query("providerReviews")
      .withIndex("by_provider", (q) => q.eq("providerId", args.providerId))
      .collect();

    // Sort by createdAt desc (most recent first)
    reviews.sort((a, b) => b.createdAt - a.createdAt);

    // Enrich with reviewer info and deal property context
    const enrichedReviews = await Promise.all(
      reviews.map(async (review) => {
        // Get reviewer info
        const reviewer = await ctx.db.get(review.reviewerId);

        // Get deal to find property
        const deal = await ctx.db.get(review.dealId);
        let propertyTitle: string | undefined;

        if (deal) {
          const property = await ctx.db.get(deal.propertyId);
          propertyTitle = property?.title;
        }

        return {
          ...review,
          reviewerName: reviewer?.name,
          reviewerImageUrl: reviewer?.imageUrl,
          propertyTitle,
        };
      })
    );

    return enrichedReviews;
  },
});

// Get aggregated stats for a provider
export const getProviderStats = query({
  args: {
    providerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get provider user to determine their role
    const providerUser = await ctx.db.get(args.providerId);
    if (!providerUser) {
      return null;
    }

    // Get service provider profile for years experience
    const profile = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.providerId))
      .unique();

    // Get all reviews for this provider
    const reviews = await ctx.db
      .query("providerReviews")
      .withIndex("by_provider", (q) => q.eq("providerId", args.providerId))
      .collect();

    // Calculate average rating
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
        : 0;

    // Count completed deals where this provider was assigned
    // Need to check all three provider fields based on role
    let completedDeals = 0;

    // Get all completed deals
    const allCompletedDeals = await ctx.db
      .query("deals")
      .withIndex("by_stage", (q) => q.eq("stage", "completed"))
      .collect();

    // Filter to deals where this provider was assigned
    for (const deal of allCompletedDeals) {
      if (
        deal.brokerId === args.providerId ||
        deal.mortgageAdvisorId === args.providerId ||
        deal.lawyerId === args.providerId
      ) {
        completedDeals++;
      }
    }

    return {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      totalReviews,
      completedDeals,
      yearsExperience: profile?.yearsExperience ?? 0,
    };
  },
});
