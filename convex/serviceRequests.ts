import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Provider type validator (same as schema)
const providerTypeValidator = v.union(
  v.literal("broker"),
  v.literal("mortgage_advisor"),
  v.literal("lawyer")
);

// Request status validator
const requestStatusValidator = v.union(
  v.literal("pending"),
  v.literal("accepted"),
  v.literal("declined"),
  v.literal("cancelled")
);

// ============================================================================
// QUERIES
// ============================================================================

// List requests for a provider (their leads)
export const listForProvider = query({
  args: {
    status: v.optional(requestStatusValidator),
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

    // Get requests where this user is the provider
    let requests;
    if (args.status) {
      requests = await ctx.db
        .query("serviceRequests")
        .withIndex("by_provider_and_status", (q) =>
          q.eq("providerId", user._id).eq("status", args.status!)
        )
        .collect();
    } else {
      requests = await ctx.db
        .query("serviceRequests")
        .withIndex("by_provider", (q) => q.eq("providerId", user._id))
        .collect();
    }

    // Enrich with deal and investor info
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const deal = await ctx.db.get(request.dealId);
        const investor = await ctx.db.get(request.investorId);
        const property = deal ? await ctx.db.get(deal.propertyId) : null;

        return {
          ...request,
          deal: deal
            ? {
                _id: deal._id,
                stage: deal.stage,
                createdAt: deal.createdAt,
              }
            : null,
          investor: investor
            ? {
                _id: investor._id,
                name: investor.name,
                email: investor.email,
                imageUrl: investor.imageUrl,
              }
            : null,
          property: property
            ? {
                _id: property._id,
                title: property.title,
                city: property.city,
                priceUsd: property.priceUsd,
              }
            : null,
        };
      })
    );

    // Sort by most recent first
    enrichedRequests.sort((a, b) => b.createdAt - a.createdAt);

    return enrichedRequests;
  },
});

// List all requests for a deal
export const listForDeal = query({
  args: {
    dealId: v.id("deals"),
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

    // Get the deal
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      return [];
    }

    // Check access - user must be a participant or admin
    const isParticipant =
      deal.investorId === user._id ||
      deal.brokerId === user._id ||
      deal.mortgageAdvisorId === user._id ||
      deal.lawyerId === user._id;

    if (!isParticipant && user.role !== "admin") {
      return [];
    }

    // Get requests for this deal
    const requests = await ctx.db
      .query("serviceRequests")
      .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
      .collect();

    // Enrich with provider info
    const enrichedRequests = await Promise.all(
      requests.map(async (request) => {
        const provider = await ctx.db.get(request.providerId);
        const providerProfile = provider
          ? await ctx.db
              .query("serviceProviderProfiles")
              .withIndex("by_user", (q) => q.eq("userId", provider._id))
              .unique()
          : null;

        return {
          ...request,
          provider: provider
            ? {
                _id: provider._id,
                name: provider.name,
                email: provider.email,
                imageUrl: provider.imageUrl,
              }
            : null,
          providerProfile: providerProfile
            ? {
                companyName: providerProfile.companyName,
                yearsExperience: providerProfile.yearsExperience,
                specializations: providerProfile.specializations,
              }
            : null,
        };
      })
    );

    return enrichedRequests;
  },
});

// Get recommended providers for a deal
export const getRecommendedProviders = query({
  args: {
    dealId: v.id("deals"),
    providerType: providerTypeValidator,
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

    // Get the deal
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      return [];
    }

    // Check access - user must be investor or admin
    if (deal.investorId !== user._id && user.role !== "admin") {
      return [];
    }

    // Get property to match service areas
    const property = await ctx.db.get(deal.propertyId);
    if (!property) {
      return [];
    }

    // Get existing requests for this deal and provider type
    const existingRequests = await ctx.db
      .query("serviceRequests")
      .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
      .collect();

    const alreadyRequestedProviderIds = new Set(
      existingRequests
        .filter((r) => r.providerType === args.providerType)
        .map((r) => r.providerId.toString())
    );

    // Get providers of the requested type
    const providerProfiles = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_provider_type", (q) =>
        q.eq("providerType", args.providerType)
      )
      .collect();

    // Filter by service area matching property city
    const matchingProfiles = providerProfiles.filter(
      (profile) =>
        profile.serviceAreas.includes(property.city) &&
        !alreadyRequestedProviderIds.has(profile.userId.toString())
    );

    // Enrich with user info
    const providersWithUser = await Promise.all(
      matchingProfiles.map(async (profile) => {
        const providerUser = await ctx.db.get(profile.userId);
        return {
          ...profile,
          name: providerUser?.name,
          email: providerUser?.email,
          imageUrl: providerUser?.imageUrl,
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

// ============================================================================
// MUTATIONS
// ============================================================================

// Create a service request (investor requests a provider)
export const create = mutation({
  args: {
    dealId: v.id("deals"),
    providerId: v.id("users"),
    message: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the deal
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new Error("Deal not found");
    }

    // Validate: requester is deal investor
    if (deal.investorId !== user._id) {
      throw new Error("Only the deal investor can request providers");
    }

    // Get the provider
    const provider = await ctx.db.get(args.providerId);
    if (!provider) {
      throw new Error("Provider not found");
    }

    // Validate: provider has matching role (broker, mortgage_advisor, or lawyer)
    if (
      !provider.role ||
      !["broker", "mortgage_advisor", "lawyer"].includes(provider.role)
    ) {
      throw new Error("User is not a service provider");
    }

    const providerType = provider.role as
      | "broker"
      | "mortgage_advisor"
      | "lawyer";

    // Check: no existing pending request for same provider/deal
    const existingRequests = await ctx.db
      .query("serviceRequests")
      .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
      .collect();

    const hasPendingRequest = existingRequests.some(
      (r) =>
        r.providerId === args.providerId &&
        r.status === "pending"
    );

    if (hasPendingRequest) {
      throw new Error(
        "You already have a pending request for this provider on this deal"
      );
    }

    // Create the request
    const now = Date.now();
    const requestId = await ctx.db.insert("serviceRequests", {
      dealId: args.dealId,
      investorId: user._id,
      providerId: args.providerId,
      providerType,
      status: "pending",
      investorMessage: args.message,
      createdAt: now,
    });

    return requestId;
  },
});

// Respond to a service request (provider accepts or declines)
export const respond = mutation({
  args: {
    requestId: v.id("serviceRequests"),
    accept: v.boolean(),
    response: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the request
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    // Validate: responder is the provider
    if (request.providerId !== user._id) {
      throw new Error("Only the requested provider can respond");
    }

    // Validate: request is pending
    if (request.status !== "pending") {
      throw new Error("Request is no longer pending");
    }

    const now = Date.now();

    if (args.accept) {
      // Update request status to accepted
      await ctx.db.patch(args.requestId, {
        status: "accepted",
        providerResponse: args.response,
        respondedAt: now,
      });

      // Update deal to assign this provider
      const deal = await ctx.db.get(request.dealId);
      if (!deal) {
        throw new Error("Deal not found");
      }

      // Determine which field to update based on provider type
      const updateFields: Record<string, unknown> = {
        updatedAt: now,
      };

      switch (request.providerType) {
        case "broker":
          updateFields.brokerId = user._id;
          break;
        case "mortgage_advisor":
          updateFields.mortgageAdvisorId = user._id;
          break;
        case "lawyer":
          updateFields.lawyerId = user._id;
          break;
      }

      // If broker accepted and deal is in "interest" stage, advance to "broker_assigned"
      if (request.providerType === "broker" && deal.stage === "interest") {
        updateFields.stage = "broker_assigned";
        updateFields.stageHistory = [
          ...deal.stageHistory,
          {
            stage: "broker_assigned" as const,
            timestamp: now,
            notes: "Broker assigned via service request",
          },
        ];
      }

      await ctx.db.patch(request.dealId, updateFields);
    } else {
      // Update request status to declined
      await ctx.db.patch(args.requestId, {
        status: "declined",
        providerResponse: args.response,
        respondedAt: now,
      });
    }

    return args.requestId;
  },
});

// Cancel a service request (investor cancels)
export const cancel = mutation({
  args: {
    requestId: v.id("serviceRequests"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the request
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Request not found");
    }

    // Validate: canceller is the investor
    if (request.investorId !== user._id) {
      throw new Error("Only the investor who created the request can cancel it");
    }

    // Only allowed if status is pending
    if (request.status !== "pending") {
      throw new Error("Can only cancel pending requests");
    }

    await ctx.db.patch(args.requestId, {
      status: "cancelled",
    });

    return args.requestId;
  },
});
