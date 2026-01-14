import { query } from "./_generated/server";
import { v } from "convex/values";

export const getByCity = query({
  args: { city: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("priceHistory")
      .withIndex("by_city", (q) => q.eq("city", args.city))
      .order("asc") // oldest first for chart
      .collect();
  },
});
