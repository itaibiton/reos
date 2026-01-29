import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

/**
 * Submit a new contact form submission
 */
export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    subject: v.union(
      v.literal("general"),
      v.literal("pricing"),
      v.literal("support"),
      v.literal("partnerships"),
      v.literal("provider")
    ),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const submissionId = await ctx.db.insert("contactSubmissions", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      subject: args.subject,
      message: args.message,
      createdAt: Date.now(),
    });

    return { submissionId };
  },
});

/**
 * Get all contact submissions (admin only - add auth check in production)
 */
export const listSubmissions = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const submissions = await ctx.db
      .query("contactSubmissions")
      .withIndex("by_created")
      .order("desc")
      .take(limit);

    return submissions;
  },
});
