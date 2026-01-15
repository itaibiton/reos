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
