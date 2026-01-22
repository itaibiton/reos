import { v } from "convex/values";
import { query } from "../../_generated/server";

/**
 * Search properties with multi-criteria filtering.
 * Used by the AI agent to find real properties from the database.
 *
 * Returns only available properties with essential fields for recommendations.
 */
export const searchProperties = query({
  args: {
    budgetMin: v.optional(v.number()),
    budgetMax: v.optional(v.number()),
    cities: v.optional(v.array(v.string())),
    propertyTypes: v.optional(
      v.array(
        v.union(
          v.literal("residential"),
          v.literal("commercial"),
          v.literal("mixed_use"),
          v.literal("land")
        )
      )
    ),
    minBedrooms: v.optional(v.number()),
    limit: v.number(),
  },
  handler: async (ctx, args) => {
    // Get all available properties
    let properties = await ctx.db
      .query("properties")
      .withIndex("by_status", (q) => q.eq("status", "available"))
      .collect();

    // Apply budget filters
    if (args.budgetMin !== undefined) {
      properties = properties.filter((p) => p.priceUsd >= args.budgetMin!);
    }

    if (args.budgetMax !== undefined) {
      properties = properties.filter((p) => p.priceUsd <= args.budgetMax!);
    }

    // Apply city filter
    if (args.cities && args.cities.length > 0) {
      properties = properties.filter((p) => args.cities!.includes(p.city));
    }

    // Apply property type filter
    if (args.propertyTypes && args.propertyTypes.length > 0) {
      properties = properties.filter((p) =>
        args.propertyTypes!.includes(p.propertyType)
      );
    }

    // Apply minimum bedrooms filter (handle undefined gracefully)
    if (args.minBedrooms !== undefined) {
      properties = properties.filter(
        (p) => p.bedrooms !== undefined && p.bedrooms >= args.minBedrooms!
      );
    }

    // Sort by newest first
    properties.sort((a, b) => b.createdAt - a.createdAt);

    // Apply limit and return essential fields only
    return properties.slice(0, args.limit).map((p) => ({
      _id: p._id,
      title: p.title,
      city: p.city,
      address: p.address,
      priceUsd: p.priceUsd,
      bedrooms: p.bedrooms,
      bathrooms: p.bathrooms,
      squareMeters: p.squareMeters,
      propertyType: p.propertyType,
      featuredImage: p.featuredImage,
      expectedRoi: p.expectedRoi,
      capRate: p.capRate,
    }));
  },
});
