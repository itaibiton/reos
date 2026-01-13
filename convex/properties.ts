import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Validators for reuse
const propertyTypeValidator = v.union(
  v.literal("residential"),
  v.literal("commercial"),
  v.literal("mixed_use"),
  v.literal("land")
);

const propertyStatusValidator = v.union(
  v.literal("available"),
  v.literal("pending"),
  v.literal("sold")
);

// List properties with optional filters
// By default, shows available properties only
export const list = query({
  args: {
    status: v.optional(propertyStatusValidator),
    city: v.optional(v.string()),
    propertyType: v.optional(propertyTypeValidator),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Filter by status (default to available)
    const status = args.status ?? "available";

    // Get all results then filter in memory for additional criteria
    // (Convex doesn't support multiple index filters in a single query)
    let properties = await ctx.db
      .query("properties")
      .withIndex("by_status", (q) => q.eq("status", status))
      .collect();

    // Apply additional filters
    if (args.city) {
      properties = properties.filter((p) => p.city === args.city);
    }

    if (args.propertyType) {
      properties = properties.filter((p) => p.propertyType === args.propertyType);
    }

    // Sort by createdAt descending (newest first)
    properties.sort((a, b) => b.createdAt - a.createdAt);

    // Apply limit
    if (args.limit) {
      properties = properties.slice(0, args.limit);
    }

    return properties;
  },
});

// Get a single property by ID
export const getById = query({
  args: {
    id: v.id("properties"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db.get(args.id);
  },
});

// Create a new property
// For MVP, any authenticated user can add properties
export const create = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    address: v.string(),
    city: v.string(),
    propertyType: propertyTypeValidator,
    status: v.optional(propertyStatusValidator),
    priceUsd: v.number(),
    priceIls: v.number(),
    expectedRoi: v.optional(v.number()),
    cashOnCash: v.optional(v.number()),
    capRate: v.optional(v.number()),
    monthlyRent: v.optional(v.number()),
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    squareMeters: v.optional(v.number()),
    yearBuilt: v.optional(v.number()),
    images: v.array(v.string()),
    featuredImage: v.optional(v.string()),
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

    // Validation
    if (!args.title.trim()) {
      throw new Error("Title is required");
    }

    if (!args.address.trim()) {
      throw new Error("Address is required");
    }

    if (!args.city.trim()) {
      throw new Error("City is required");
    }

    if (args.priceUsd <= 0) {
      throw new Error("Price must be a positive number");
    }

    const now = Date.now();

    // Create property
    return await ctx.db.insert("properties", {
      title: args.title.trim(),
      description: args.description.trim(),
      address: args.address.trim(),
      city: args.city,
      propertyType: args.propertyType,
      status: args.status ?? "available",
      priceUsd: args.priceUsd,
      priceIls: args.priceIls,
      expectedRoi: args.expectedRoi,
      cashOnCash: args.cashOnCash,
      capRate: args.capRate,
      monthlyRent: args.monthlyRent,
      bedrooms: args.bedrooms,
      bathrooms: args.bathrooms,
      squareMeters: args.squareMeters,
      yearBuilt: args.yearBuilt,
      images: args.images,
      featuredImage: args.featuredImage,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Update an existing property
export const update = mutation({
  args: {
    id: v.id("properties"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    address: v.optional(v.string()),
    city: v.optional(v.string()),
    propertyType: v.optional(propertyTypeValidator),
    status: v.optional(propertyStatusValidator),
    priceUsd: v.optional(v.number()),
    priceIls: v.optional(v.number()),
    expectedRoi: v.optional(v.number()),
    cashOnCash: v.optional(v.number()),
    capRate: v.optional(v.number()),
    monthlyRent: v.optional(v.number()),
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    squareMeters: v.optional(v.number()),
    yearBuilt: v.optional(v.number()),
    images: v.optional(v.array(v.string())),
    featuredImage: v.optional(v.string()),
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

    // Get property
    const property = await ctx.db.get(args.id);
    if (!property) {
      throw new Error("Property not found");
    }

    // For MVP, any authenticated user can update any property
    // In future, restrict to creator or admin

    // Build update object with only provided fields
    const updates: Record<string, unknown> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) {
      if (!args.title.trim()) {
        throw new Error("Title cannot be empty");
      }
      updates.title = args.title.trim();
    }

    if (args.description !== undefined) {
      updates.description = args.description.trim();
    }

    if (args.address !== undefined) {
      if (!args.address.trim()) {
        throw new Error("Address cannot be empty");
      }
      updates.address = args.address.trim();
    }

    if (args.city !== undefined) {
      if (!args.city.trim()) {
        throw new Error("City cannot be empty");
      }
      updates.city = args.city;
    }

    if (args.propertyType !== undefined) {
      updates.propertyType = args.propertyType;
    }

    if (args.status !== undefined) {
      updates.status = args.status;
    }

    if (args.priceUsd !== undefined) {
      if (args.priceUsd <= 0) {
        throw new Error("Price must be a positive number");
      }
      updates.priceUsd = args.priceUsd;
    }

    if (args.priceIls !== undefined) {
      updates.priceIls = args.priceIls;
    }

    if (args.expectedRoi !== undefined) {
      updates.expectedRoi = args.expectedRoi;
    }

    if (args.cashOnCash !== undefined) {
      updates.cashOnCash = args.cashOnCash;
    }

    if (args.capRate !== undefined) {
      updates.capRate = args.capRate;
    }

    if (args.monthlyRent !== undefined) {
      updates.monthlyRent = args.monthlyRent;
    }

    if (args.bedrooms !== undefined) {
      updates.bedrooms = args.bedrooms;
    }

    if (args.bathrooms !== undefined) {
      updates.bathrooms = args.bathrooms;
    }

    if (args.squareMeters !== undefined) {
      updates.squareMeters = args.squareMeters;
    }

    if (args.yearBuilt !== undefined) {
      updates.yearBuilt = args.yearBuilt;
    }

    if (args.images !== undefined) {
      updates.images = args.images;
    }

    if (args.featuredImage !== undefined) {
      updates.featuredImage = args.featuredImage;
    }

    await ctx.db.patch(args.id, updates);

    return args.id;
  },
});
