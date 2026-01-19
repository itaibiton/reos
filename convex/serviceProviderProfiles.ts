import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Validators
const providerTypeValidator = v.union(
  v.literal("broker"),
  v.literal("mortgage_advisor"),
  v.literal("lawyer")
);

const languageValidator = v.union(
  v.literal("english"),
  v.literal("hebrew"),
  v.literal("russian"),
  v.literal("french"),
  v.literal("spanish")
);

const contactPreferenceValidator = v.union(
  v.literal("email"),
  v.literal("phone"),
  v.literal("whatsapp")
);

// Get current user's service provider profile
export const getMyProfile = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    // Check if user is a service provider
    if (!user.role || user.role === "investor") {
      return null;
    }

    // Get service provider profile
    return await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();
  },
});

// Create or update service provider profile
export const upsertProfile = mutation({
  args: {
    companyName: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    yearsExperience: v.optional(v.number()),
    specializations: v.array(v.string()),
    serviceAreas: v.array(v.string()),
    languages: v.array(languageValidator),
    bio: v.optional(v.string()),
    phoneNumber: v.optional(v.string()),
    preferredContact: v.optional(contactPreferenceValidator),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is a service provider
    if (!user.role || user.role === "investor") {
      throw new Error("Only service providers can create service provider profiles");
    }

    // Validation
    if (args.serviceAreas.length === 0) {
      throw new Error("At least one service area is required");
    }

    if (args.languages.length === 0) {
      throw new Error("At least one language is required");
    }

    // Check for existing profile
    const existingProfile = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const now = Date.now();

    // Map user role to provider type
    const providerType = user.role as "broker" | "mortgage_advisor" | "lawyer";

    if (existingProfile) {
      // Update existing profile
      await ctx.db.patch(existingProfile._id, {
        ...args,
        providerType,
        updatedAt: now,
      });
      return existingProfile._id;
    } else {
      // Create new profile
      return await ctx.db.insert("serviceProviderProfiles", {
        userId: user._id,
        providerType,
        ...args,
        createdAt: now,
        updatedAt: now,
      });
    }
  },
});

// Get providers by type (for future marketplace)
export const getProvidersByType = query({
  args: {
    providerType: providerTypeValidator,
    serviceArea: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let providers = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_provider_type", (q) => q.eq("providerType", args.providerType))
      .collect();

    // Filter by service area if specified
    if (args.serviceArea) {
      providers = providers.filter((p) =>
        p.serviceAreas.includes(args.serviceArea!)
      );
    }

    // Get user info for each provider
    const providersWithUser = await Promise.all(
      providers.map(async (provider) => {
        const user = await ctx.db.get(provider.userId);
        return {
          ...provider,
          name: user?.name,
          email: user?.email,
          imageUrl: user?.imageUrl,
        };
      })
    );

    return providersWithUser;
  },
});

// List providers by type with optional city filter, sorted by experience
// Powers the "Find a Provider" UI
export const listByType = query({
  args: {
    providerType: providerTypeValidator,
    city: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let providers = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_provider_type", (q) =>
        q.eq("providerType", args.providerType)
      )
      .collect();

    // Filter by city if provided (check serviceAreas)
    if (args.city) {
      providers = providers.filter((p) =>
        p.serviceAreas.some(
          (area) => area.toLowerCase() === args.city!.toLowerCase()
        )
      );
    }

    // Get user info for each provider
    const providersWithUser = await Promise.all(
      providers.map(async (provider) => {
        const user = await ctx.db.get(provider.userId);
        return {
          ...provider,
          name: user?.name,
          email: user?.email,
          imageUrl: user?.imageUrl,
        };
      })
    );

    // Sort by years experience (descending)
    providersWithUser.sort(
      (a, b) => (b.yearsExperience || 0) - (a.yearsExperience || 0)
    );

    return providersWithUser;
  },
});

// Get a provider profile with user details
// Powers provider detail view and profile cards
export const getWithUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    // Get service provider profile
    const profile = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    if (!profile) {
      return null;
    }

    // Return combined profile + user info
    return {
      ...profile,
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
    };
  },
});

// Get public profile with all data needed for the public profile page
// Combines: profile, user info, stats, recent reviews, portfolio (completed deals)
export const getPublicProfile = query({
  args: {
    providerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.db.get(args.providerId);
    if (!user) {
      return null;
    }

    // Check if user is a service provider
    if (!user.role || user.role === "investor" || user.role === "admin") {
      return null;
    }

    // Get service provider profile
    const profile = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.providerId))
      .unique();

    if (!profile) {
      return null;
    }

    // Get reviews for this provider
    const allReviews = await ctx.db
      .query("providerReviews")
      .withIndex("by_provider", (q) => q.eq("providerId", args.providerId))
      .collect();

    // Sort by createdAt desc and take last 5
    allReviews.sort((a, b) => b.createdAt - a.createdAt);
    const recentReviews = allReviews.slice(0, 5);

    // Enrich reviews with reviewer info and property context
    const enrichedReviews = await Promise.all(
      recentReviews.map(async (review) => {
        const reviewer = await ctx.db.get(review.reviewerId);
        const deal = await ctx.db.get(review.dealId);
        let propertyTitle: string | undefined;

        if (deal) {
          const property = await ctx.db.get(deal.propertyId);
          propertyTitle = property?.title;
        }

        return {
          _id: review._id,
          rating: review.rating,
          reviewText: review.reviewText,
          createdAt: review.createdAt,
          reviewerName: reviewer?.name,
          reviewerImageUrl: reviewer?.imageUrl,
          propertyTitle,
        };
      })
    );

    // Calculate stats
    const totalReviews = allReviews.length;
    const averageRating =
      totalReviews > 0
        ? Math.round(
            (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) *
              10
          ) / 10
        : 0;

    // Count completed deals where this provider was assigned
    const allCompletedDeals = await ctx.db
      .query("deals")
      .withIndex("by_stage", (q) => q.eq("stage", "completed"))
      .collect();

    const providerCompletedDeals = allCompletedDeals.filter(
      (deal) =>
        deal.brokerId === args.providerId ||
        deal.mortgageAdvisorId === args.providerId ||
        deal.lawyerId === args.providerId
    );

    // Get last 5 completed deals for portfolio
    const portfolioDeals = providerCompletedDeals
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5);

    // Enrich portfolio with property info
    const portfolio = await Promise.all(
      portfolioDeals.map(async (deal) => {
        const property = await ctx.db.get(deal.propertyId);

        return {
          dealId: deal._id,
          propertyId: deal.propertyId,
          propertyTitle: property?.title,
          propertyCity: property?.city,
          propertyImage: property?.featuredImage ?? property?.images[0],
          soldPrice: property?.soldPrice ?? deal.offerPrice ?? property?.priceUsd,
          completedAt: deal.updatedAt,
        };
      })
    );

    const stats = {
      averageRating,
      totalReviews,
      completedDeals: providerCompletedDeals.length,
      yearsExperience: profile.yearsExperience ?? 0,
    };

    return {
      // User info
      name: user.name,
      email: user.email,
      imageUrl: user.imageUrl,
      role: user.role,

      // Profile info
      companyName: profile.companyName,
      licenseNumber: profile.licenseNumber,
      yearsExperience: profile.yearsExperience,
      specializations: profile.specializations,
      serviceAreas: profile.serviceAreas,
      languages: profile.languages,
      bio: profile.bio,
      phoneNumber: profile.phoneNumber,
      preferredContact: profile.preferredContact,

      // Stats
      stats,

      // Reviews (last 5)
      reviews: enrichedReviews,

      // Portfolio (last 5 completed deals)
      portfolio,
    };
  },
});
