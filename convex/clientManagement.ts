import { v } from "convex/values";
import { query } from "./_generated/server";

// Get all clients (investors) for the current service provider
export const getMyClients = query({
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

    // Only service providers can view clients
    if (!["broker", "mortgage_advisor", "lawyer"].includes(user.role || "")) {
      return [];
    }

    // Query deals based on provider role
    let deals;
    switch (user.role) {
      case "broker":
        deals = await ctx.db
          .query("deals")
          .withIndex("by_broker", (q) => q.eq("brokerId", user._id))
          .collect();
        break;
      case "mortgage_advisor":
        deals = await ctx.db
          .query("deals")
          .withIndex("by_mortgage_advisor", (q) => q.eq("mortgageAdvisorId", user._id))
          .collect();
        break;
      case "lawyer":
        deals = await ctx.db
          .query("deals")
          .withIndex("by_lawyer", (q) => q.eq("lawyerId", user._id))
          .collect();
        break;
      default:
        return [];
    }

    // Build client list with deduplicated investors
    const clientMap = new Map();

    for (const deal of deals) {
      const investorId = deal.investorId;

      // If we haven't seen this investor yet, fetch their data
      if (!clientMap.has(investorId)) {
        const investor = await ctx.db.get(investorId);
        if (!investor) continue;

        const property = await ctx.db.get(deal.propertyId);
        if (!property) continue;

        clientMap.set(investorId, {
          investorId: investor._id,
          investorName: investor.name || investor.email,
          investorEmail: investor.email,
          investorImage: investor.imageUrl,
          dealId: deal._id,
          propertyTitle: property.title,
          currentStage: deal.stage,
          createdAt: deal.createdAt,
        });
      } else {
        // If this deal is more recent, update the entry
        const existingEntry = clientMap.get(investorId);
        if (deal.createdAt > existingEntry.createdAt) {
          const property = await ctx.db.get(deal.propertyId);
          if (!property) continue;

          clientMap.set(investorId, {
            ...existingEntry,
            dealId: deal._id,
            propertyTitle: property.title,
            currentStage: deal.stage,
            createdAt: deal.createdAt,
          });
        }
      }
    }

    // Convert map to array and sort by most recent deal
    const clients = Array.from(clientMap.values());
    clients.sort((a, b) => b.createdAt - a.createdAt);

    return clients;
  },
});

// Get all deals between current provider and a specific client
export const getClientDeals = query({
  args: {
    clientId: v.id("users"),
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

    // Only service providers can view client deals
    if (!["broker", "mortgage_advisor", "lawyer"].includes(user.role || "")) {
      return [];
    }

    // Query deals based on provider role
    let deals;
    switch (user.role) {
      case "broker":
        deals = await ctx.db
          .query("deals")
          .withIndex("by_broker", (q) => q.eq("brokerId", user._id))
          .collect();
        break;
      case "mortgage_advisor":
        deals = await ctx.db
          .query("deals")
          .withIndex("by_mortgage_advisor", (q) => q.eq("mortgageAdvisorId", user._id))
          .collect();
        break;
      case "lawyer":
        deals = await ctx.db
          .query("deals")
          .withIndex("by_lawyer", (q) => q.eq("lawyerId", user._id))
          .collect();
        break;
      default:
        return [];
    }

    // Filter to only deals with the specified client
    const clientDeals = deals.filter((deal) => deal.investorId === args.clientId);

    // Enrich with property data
    const enrichedDeals = await Promise.all(
      clientDeals.map(async (deal) => {
        const property = await ctx.db.get(deal.propertyId);
        return {
          ...deal,
          property: property
            ? {
                title: property.title,
                address: property.address,
                city: property.city,
                priceUsd: property.priceUsd,
                featuredImage: property.featuredImage,
              }
            : null,
        };
      })
    );

    // Sort by most recent first
    enrichedDeals.sort((a, b) => b.createdAt - a.createdAt);

    return enrichedDeals;
  },
});

// Get all documents for a specific deal
export const getClientDocuments = query({
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

    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      return [];
    }

    // Check access - user must be a participant in the deal
    const isParticipant =
      deal.investorId === user._id ||
      deal.brokerId === user._id ||
      deal.mortgageAdvisorId === user._id ||
      deal.lawyerId === user._id;

    if (!isParticipant) {
      return [];
    }

    // Get all files for this deal
    const files = await ctx.db
      .query("dealFiles")
      .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
      .collect();

    // Enrich with download URLs and uploader info
    const enrichedFiles = await Promise.all(
      files.map(async (file) => {
        const downloadUrl = await ctx.storage.getUrl(file.storageId);
        const uploader = await ctx.db.get(file.uploadedBy);

        return {
          _id: file._id,
          fileName: file.fileName,
          fileType: file.fileType,
          fileSize: file.fileSize,
          category: file.category,
          description: file.description,
          createdAt: file.createdAt,
          downloadUrl,
          uploadedBy: uploader
            ? {
                name: uploader.name || uploader.email,
                email: uploader.email,
              }
            : null,
        };
      })
    );

    // Sort by most recent first
    enrichedFiles.sort((a, b) => b.createdAt - a.createdAt);

    return enrichedFiles;
  },
});
