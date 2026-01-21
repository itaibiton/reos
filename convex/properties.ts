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

// Zillow-style validators
const parkingTypeValidator = v.union(
  v.literal("garage"),
  v.literal("covered"),
  v.literal("street"),
  v.literal("none")
);

const heatingTypeValidator = v.union(
  v.literal("central"),
  v.literal("electric"),
  v.literal("gas"),
  v.literal("none")
);

const coolingTypeValidator = v.union(
  v.literal("central_ac"),
  v.literal("split"),
  v.literal("none")
);

const laundryTypeValidator = v.union(
  v.literal("in_unit"),
  v.literal("shared"),
  v.literal("none")
);

// List properties with optional filters
// By default, shows available properties only
// Supports full filter set for smart search (see PropertyFilters in search.ts)
export const list = query({
  args: {
    // Basic filters
    status: v.optional(propertyStatusValidator),
    city: v.optional(v.string()),
    propertyType: v.optional(propertyTypeValidator),
    limit: v.optional(v.number()),
    // Price range filters
    priceMin: v.optional(v.number()),
    priceMax: v.optional(v.number()),
    // Property feature filters
    bedroomsMin: v.optional(v.number()),
    bathroomsMin: v.optional(v.number()),
    squareMetersMin: v.optional(v.number()),
    squareMetersMax: v.optional(v.number()),
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

    // Apply basic filters
    if (args.city) {
      properties = properties.filter((p) => p.city === args.city);
    }

    if (args.propertyType) {
      properties = properties.filter((p) => p.propertyType === args.propertyType);
    }

    // Apply price range filters
    if (args.priceMin !== undefined) {
      properties = properties.filter((p) => p.priceUsd >= args.priceMin!);
    }

    if (args.priceMax !== undefined) {
      properties = properties.filter((p) => p.priceUsd <= args.priceMax!);
    }

    // Apply property feature filters (handle undefined property values gracefully)
    if (args.bedroomsMin !== undefined) {
      properties = properties.filter(
        (p) => p.bedrooms !== undefined && p.bedrooms >= args.bedroomsMin!
      );
    }

    if (args.bathroomsMin !== undefined) {
      properties = properties.filter(
        (p) => p.bathrooms !== undefined && p.bathrooms >= args.bathroomsMin!
      );
    }

    if (args.squareMetersMin !== undefined) {
      properties = properties.filter(
        (p) => p.squareMeters !== undefined && p.squareMeters >= args.squareMetersMin!
      );
    }

    if (args.squareMetersMax !== undefined) {
      properties = properties.filter(
        (p) => p.squareMeters !== undefined && p.squareMeters <= args.squareMetersMax!
      );
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
    // Zillow-style fields
    floors: v.optional(v.number()),
    lotSize: v.optional(v.number()),
    parkingSpaces: v.optional(v.number()),
    parkingType: v.optional(parkingTypeValidator),
    heatingType: v.optional(heatingTypeValidator),
    coolingType: v.optional(coolingTypeValidator),
    flooringType: v.optional(v.array(v.string())),
    laundryType: v.optional(laundryTypeValidator),
    hoaFees: v.optional(v.number()),
    propertyTax: v.optional(v.number()),
    constructionMaterials: v.optional(v.array(v.string())),
    appliances: v.optional(v.array(v.string())),
    exteriorFeatures: v.optional(v.array(v.string())),
    view: v.optional(v.array(v.string())),
    amenities: v.optional(v.array(v.string())),
    // Coordinates
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
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
      // Zillow-style fields
      floors: args.floors,
      lotSize: args.lotSize,
      parkingSpaces: args.parkingSpaces,
      parkingType: args.parkingType,
      heatingType: args.heatingType,
      coolingType: args.coolingType,
      flooringType: args.flooringType,
      laundryType: args.laundryType,
      hoaFees: args.hoaFees,
      propertyTax: args.propertyTax,
      constructionMaterials: args.constructionMaterials,
      appliances: args.appliances,
      exteriorFeatures: args.exteriorFeatures,
      view: args.view,
      amenities: args.amenities,
      // Coordinates
      latitude: args.latitude,
      longitude: args.longitude,
      images: args.images,
      featuredImage: args.featuredImage,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });
  },
});

// Get properties created by the current user (my listings)
export const listMyListings = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get current user
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    // Get properties created by this user
    const properties = await ctx.db
      .query("properties")
      .withIndex("by_created_by", (q) => q.eq("createdBy", user._id))
      .collect();

    // Sort by createdAt descending (newest first)
    properties.sort((a, b) => b.createdAt - a.createdAt);

    return properties;
  },
});

// Get sold properties in a city
export const getSoldInCity = query({
  args: { city: v.string(), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const results = await ctx.db
      .query("properties")
      .withIndex("by_status", (q) => q.eq("status", "sold"))
      .collect();

    // Filter by city in memory (Convex single-index constraint)
    return results
      .filter((p) => p.city === args.city)
      .slice(0, args.limit || 5);
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
    // Zillow-style fields
    floors: v.optional(v.number()),
    lotSize: v.optional(v.number()),
    parkingSpaces: v.optional(v.number()),
    parkingType: v.optional(parkingTypeValidator),
    heatingType: v.optional(heatingTypeValidator),
    coolingType: v.optional(coolingTypeValidator),
    flooringType: v.optional(v.array(v.string())),
    laundryType: v.optional(laundryTypeValidator),
    hoaFees: v.optional(v.number()),
    propertyTax: v.optional(v.number()),
    constructionMaterials: v.optional(v.array(v.string())),
    appliances: v.optional(v.array(v.string())),
    exteriorFeatures: v.optional(v.array(v.string())),
    view: v.optional(v.array(v.string())),
    amenities: v.optional(v.array(v.string())),
    // Coordinates
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
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

    // Zillow-style fields
    if (args.floors !== undefined) {
      updates.floors = args.floors;
    }

    if (args.lotSize !== undefined) {
      updates.lotSize = args.lotSize;
    }

    if (args.parkingSpaces !== undefined) {
      updates.parkingSpaces = args.parkingSpaces;
    }

    if (args.parkingType !== undefined) {
      updates.parkingType = args.parkingType;
    }

    if (args.heatingType !== undefined) {
      updates.heatingType = args.heatingType;
    }

    if (args.coolingType !== undefined) {
      updates.coolingType = args.coolingType;
    }

    if (args.flooringType !== undefined) {
      updates.flooringType = args.flooringType;
    }

    if (args.laundryType !== undefined) {
      updates.laundryType = args.laundryType;
    }

    if (args.hoaFees !== undefined) {
      updates.hoaFees = args.hoaFees;
    }

    if (args.propertyTax !== undefined) {
      updates.propertyTax = args.propertyTax;
    }

    if (args.constructionMaterials !== undefined) {
      updates.constructionMaterials = args.constructionMaterials;
    }

    if (args.appliances !== undefined) {
      updates.appliances = args.appliances;
    }

    if (args.exteriorFeatures !== undefined) {
      updates.exteriorFeatures = args.exteriorFeatures;
    }

    if (args.view !== undefined) {
      updates.view = args.view;
    }

    if (args.amenities !== undefined) {
      updates.amenities = args.amenities;
    }

    if (args.latitude !== undefined) {
      updates.latitude = args.latitude;
    }

    if (args.longitude !== undefined) {
      updates.longitude = args.longitude;
    }

    await ctx.db.patch(args.id, updates);

    return args.id;
  },
});
