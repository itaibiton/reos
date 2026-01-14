import { mutation } from "./_generated/server";
import { SEED_PROPERTIES, SEED_NEIGHBORHOODS, SEED_PRICE_HISTORY } from "./seedData";

// Seed properties - inserts mock data into the database
// Call from Convex dashboard or CLI: npx convex run seed:seedProperties
export const seedProperties = mutation({
  args: {},
  handler: async (ctx) => {
    // Get or create a system user for seeding
    // First check if there's any admin user we can use
    let creatorId = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .first()
      .then((user) => user?._id);

    // If no admin, use any existing user
    if (!creatorId) {
      const anyUser = await ctx.db.query("users").first();
      creatorId = anyUser?._id;
    }

    // If still no user, we need to create a system user
    if (!creatorId) {
      creatorId = await ctx.db.insert("users", {
        clerkId: "system_seed_user",
        email: "system@reos.dev",
        name: "System",
        onboardingComplete: true,
        role: "admin",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    const now = Date.now();
    let insertedCount = 0;

    for (const property of SEED_PROPERTIES) {
      await ctx.db.insert("properties", {
        title: property.title,
        description: property.description,
        address: property.address,
        city: property.city,
        latitude: property.latitude,
        longitude: property.longitude,
        propertyType: property.propertyType,
        status: property.status,
        priceUsd: property.priceUsd,
        priceIls: property.priceIls,
        expectedRoi: property.expectedRoi,
        cashOnCash: property.cashOnCash,
        capRate: property.capRate,
        monthlyRent: property.monthlyRent,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        squareMeters: property.squareMeters,
        yearBuilt: property.yearBuilt,
        amenities: property.amenities,
        images: property.images,
        featuredImage: property.featuredImage,
        createdBy: creatorId,
        createdAt: now,
        updatedAt: now,
      });
      insertedCount++;
    }

    return {
      success: true,
      insertedCount,
      message: `Seeded ${insertedCount} properties`,
    };
  },
});

// Clear all properties - useful for resetting the database
// Call from Convex dashboard or CLI: npx convex run seed:clearProperties
export const clearProperties = mutation({
  args: {},
  handler: async (ctx) => {
    const allProperties = await ctx.db.query("properties").collect();

    for (const property of allProperties) {
      // Also delete any favorites for this property
      const favorites = await ctx.db
        .query("favorites")
        .withIndex("by_property", (q) => q.eq("propertyId", property._id))
        .collect();

      for (const favorite of favorites) {
        await ctx.db.delete(favorite._id);
      }

      await ctx.db.delete(property._id);
    }

    return {
      success: true,
      deletedCount: allProperties.length,
      message: `Deleted ${allProperties.length} properties and their favorites`,
    };
  },
});

// Seed neighborhoods - inserts neighborhood data for 9 Israeli cities
// Call from Convex dashboard or CLI: npx convex run seed:seedNeighborhoods
export const seedNeighborhoods = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear existing neighborhoods first
    const existingNeighborhoods = await ctx.db.query("neighborhoods").collect();
    for (const neighborhood of existingNeighborhoods) {
      await ctx.db.delete(neighborhood._id);
    }

    const now = Date.now();
    let insertedCount = 0;

    for (const neighborhood of SEED_NEIGHBORHOODS) {
      await ctx.db.insert("neighborhoods", {
        city: neighborhood.city,
        population: neighborhood.population,
        avgPricePerSqm: neighborhood.avgPricePerSqm,
        priceChange1Year: neighborhood.priceChange1Year,
        nearbyAmenities: neighborhood.nearbyAmenities,
        description: neighborhood.description,
        createdAt: now,
        updatedAt: now,
      });
      insertedCount++;
    }

    return {
      success: true,
      insertedCount,
      message: `Seeded ${insertedCount} neighborhoods`,
    };
  },
});

// Clear all neighborhoods
// Call from Convex dashboard or CLI: npx convex run seed:clearNeighborhoods
export const clearNeighborhoods = mutation({
  args: {},
  handler: async (ctx) => {
    const allNeighborhoods = await ctx.db.query("neighborhoods").collect();

    for (const neighborhood of allNeighborhoods) {
      await ctx.db.delete(neighborhood._id);
    }

    return {
      success: true,
      deletedCount: allNeighborhoods.length,
      message: `Deleted ${allNeighborhoods.length} neighborhoods`,
    };
  },
});

// Seed price history - inserts market average price data for all cities
// Call from Convex dashboard or CLI: npx convex run seed:seedPriceHistory
export const seedPriceHistory = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear existing price history first
    const existingHistory = await ctx.db.query("priceHistory").collect();
    for (const entry of existingHistory) {
      await ctx.db.delete(entry._id);
    }

    const now = Date.now();
    let insertedCount = 0;

    for (const entry of SEED_PRICE_HISTORY) {
      await ctx.db.insert("priceHistory", {
        propertyId: undefined, // market averages don't belong to specific properties
        city: entry.city,
        date: entry.date,
        priceUsd: entry.priceUsd,
        eventType: entry.eventType,
        createdAt: now,
      });
      insertedCount++;
    }

    return {
      success: true,
      insertedCount,
      message: `Seeded ${insertedCount} price history entries`,
    };
  },
});

// Clear all price history
// Call from Convex dashboard or CLI: npx convex run seed:clearPriceHistory
export const clearPriceHistory = mutation({
  args: {},
  handler: async (ctx) => {
    const allHistory = await ctx.db.query("priceHistory").collect();

    for (const entry of allHistory) {
      await ctx.db.delete(entry._id);
    }

    return {
      success: true,
      deletedCount: allHistory.length,
      message: `Deleted ${allHistory.length} price history entries`,
    };
  },
});

// Seed all data - convenience function to seed everything at once
// Call from Convex dashboard or CLI: npx convex run seed:seedAll
export const seedAll = mutation({
  args: {},
  handler: async (ctx) => {
    // Get or create a system user for seeding
    let creatorId = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .first()
      .then((user) => user?._id);

    if (!creatorId) {
      const anyUser = await ctx.db.query("users").first();
      creatorId = anyUser?._id;
    }

    if (!creatorId) {
      creatorId = await ctx.db.insert("users", {
        clerkId: "system_seed_user",
        email: "system@reos.dev",
        name: "System",
        onboardingComplete: true,
        role: "admin",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    const now = Date.now();
    const results = {
      properties: 0,
      neighborhoods: 0,
      priceHistory: 0,
    };

    // Clear existing data
    const existingProperties = await ctx.db.query("properties").collect();
    for (const property of existingProperties) {
      const favorites = await ctx.db
        .query("favorites")
        .withIndex("by_property", (q) => q.eq("propertyId", property._id))
        .collect();
      for (const favorite of favorites) {
        await ctx.db.delete(favorite._id);
      }
      await ctx.db.delete(property._id);
    }

    const existingNeighborhoods = await ctx.db.query("neighborhoods").collect();
    for (const neighborhood of existingNeighborhoods) {
      await ctx.db.delete(neighborhood._id);
    }

    const existingHistory = await ctx.db.query("priceHistory").collect();
    for (const entry of existingHistory) {
      await ctx.db.delete(entry._id);
    }

    // Seed properties
    for (const property of SEED_PROPERTIES) {
      await ctx.db.insert("properties", {
        title: property.title,
        description: property.description,
        address: property.address,
        city: property.city,
        latitude: property.latitude,
        longitude: property.longitude,
        propertyType: property.propertyType,
        status: property.status,
        priceUsd: property.priceUsd,
        priceIls: property.priceIls,
        expectedRoi: property.expectedRoi,
        cashOnCash: property.cashOnCash,
        capRate: property.capRate,
        monthlyRent: property.monthlyRent,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        squareMeters: property.squareMeters,
        yearBuilt: property.yearBuilt,
        amenities: property.amenities,
        images: property.images,
        featuredImage: property.featuredImage,
        createdBy: creatorId,
        createdAt: now,
        updatedAt: now,
      });
      results.properties++;
    }

    // Seed neighborhoods
    for (const neighborhood of SEED_NEIGHBORHOODS) {
      await ctx.db.insert("neighborhoods", {
        city: neighborhood.city,
        population: neighborhood.population,
        avgPricePerSqm: neighborhood.avgPricePerSqm,
        priceChange1Year: neighborhood.priceChange1Year,
        nearbyAmenities: neighborhood.nearbyAmenities,
        description: neighborhood.description,
        createdAt: now,
        updatedAt: now,
      });
      results.neighborhoods++;
    }

    // Seed price history
    for (const entry of SEED_PRICE_HISTORY) {
      await ctx.db.insert("priceHistory", {
        propertyId: undefined,
        city: entry.city,
        date: entry.date,
        priceUsd: entry.priceUsd,
        eventType: entry.eventType,
        createdAt: now,
      });
      results.priceHistory++;
    }

    return {
      success: true,
      results,
      message: `Seeded ${results.properties} properties, ${results.neighborhoods} neighborhoods, ${results.priceHistory} price history entries`,
    };
  },
});
