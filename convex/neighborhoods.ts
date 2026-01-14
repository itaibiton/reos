import { v } from "convex/values";
import { query } from "./_generated/server";

// Get neighborhood data by city
export const getByCity = query({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("neighborhoods")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .first();
  },
});
