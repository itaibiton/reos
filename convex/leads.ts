import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Submit a new lead from the landing page contact form
 */
export const submitLead = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    investorType: v.union(
      v.literal("first_time"),
      v.literal("experienced"),
      v.literal("institutional"),
      v.literal("other")
    ),
    message: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const leadId = await ctx.db.insert("leads", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      investorType: args.investorType,
      message: args.message,
      source: args.source ?? "landing_page",
      createdAt: Date.now(),
    });

    return { leadId };
  },
});

/**
 * Get all leads (admin only - add auth check in production)
 */
export const listLeads = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_created")
      .order("desc")
      .take(limit);

    return leads;
  },
});

/**
 * Get leads by investor type
 */
export const getLeadsByType = query({
  args: {
    investorType: v.union(
      v.literal("first_time"),
      v.literal("experienced"),
      v.literal("institutional"),
      v.literal("other")
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;
    
    const leads = await ctx.db
      .query("leads")
      .withIndex("by_type", (q) => q.eq("investorType", args.investorType))
      .take(limit);

    return leads;
  },
});
