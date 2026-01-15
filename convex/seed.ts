import { mutation } from "./_generated/server";
import { SEED_PROPERTIES, SEED_NEIGHBORHOODS, SEED_PRICE_HISTORY, SEED_DEALS, SEED_SERVICE_PROVIDERS } from "./seedData";
import { Id } from "./_generated/dataModel";

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
        soldDate: property.soldDate,
        soldPrice: property.soldPrice,
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

// Helper to generate stage history for a deal
function generateStageHistory(
  targetStage: string,
  daysAgo: number,
  notes?: string
): Array<{ stage: "interest" | "broker_assigned" | "mortgage" | "legal" | "closing" | "completed" | "cancelled"; timestamp: number; notes?: string }> {
  const stageOrder = ["interest", "broker_assigned", "mortgage", "legal", "closing", "completed"];
  const targetIndex = targetStage === "cancelled" ? -1 : stageOrder.indexOf(targetStage);
  const history: Array<{ stage: "interest" | "broker_assigned" | "mortgage" | "legal" | "closing" | "completed" | "cancelled"; timestamp: number; notes?: string }> = [];

  const now = Date.now();
  const createdAt = now - daysAgo * 24 * 60 * 60 * 1000;
  const daysBetweenStages = Math.max(1, Math.floor(daysAgo / (targetIndex + 1)));

  for (let i = 0; i <= targetIndex; i++) {
    const stageTime = createdAt + i * daysBetweenStages * 24 * 60 * 60 * 1000;
    history.push({
      stage: stageOrder[i] as "interest" | "broker_assigned" | "mortgage" | "legal" | "closing" | "completed",
      timestamp: stageTime,
      notes: i === targetIndex ? notes : `Progressed to ${stageOrder[i]}`,
    });
  }

  return history;
}

// Seed deals - inserts sample deal data for testing
// Call from Convex dashboard or CLI: npx convex run seed:seedDeals
// NOTE: Requires existing users and properties. Will use system user as investor for testing.
export const seedDeals = mutation({
  args: {},
  handler: async (ctx) => {
    // Get or create a system user for seeding
    let investorId = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "investor"))
      .first()
      .then((user) => user?._id);

    // If no investor, try admin
    if (!investorId) {
      investorId = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("role"), "admin"))
        .first()
        .then((user) => user?._id);
    }

    // If still no user, create a test investor
    if (!investorId) {
      investorId = await ctx.db.insert("users", {
        clerkId: "test_investor_seed_user",
        email: "test-investor@reos.dev",
        name: "Test Investor",
        role: "investor",
        onboardingComplete: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Get all properties to map indexes to IDs
    const properties = await ctx.db.query("properties").collect();
    if (properties.length === 0) {
      return {
        success: false,
        insertedCount: 0,
        message: "No properties found. Please seed properties first.",
      };
    }

    // Clear existing deals first
    const existingDeals = await ctx.db.query("deals").collect();
    for (const deal of existingDeals) {
      await ctx.db.delete(deal._id);
    }

    const now = Date.now();
    let insertedCount = 0;

    for (const dealTemplate of SEED_DEALS) {
      // Skip if property index doesn't exist
      if (dealTemplate.propertyIndex >= properties.length) {
        continue;
      }

      const property = properties[dealTemplate.propertyIndex];
      const createdAt = now - dealTemplate.daysAgo * 24 * 60 * 60 * 1000;
      const stageHistory = generateStageHistory(
        dealTemplate.stage,
        dealTemplate.daysAgo,
        dealTemplate.notes
      );

      await ctx.db.insert("deals", {
        propertyId: property._id as Id<"properties">,
        investorId: investorId,
        stage: dealTemplate.stage,
        offerPrice: dealTemplate.offerPrice,
        notes: dealTemplate.notes,
        stageHistory,
        createdAt,
        updatedAt: now,
      });
      insertedCount++;
    }

    return {
      success: true,
      insertedCount,
      message: `Seeded ${insertedCount} deals (using ${investorId} as investor)`,
    };
  },
});

// Clear all deals
// Call from Convex dashboard or CLI: npx convex run seed:clearDeals
export const clearDeals = mutation({
  args: {},
  handler: async (ctx) => {
    const allDeals = await ctx.db.query("deals").collect();

    for (const deal of allDeals) {
      await ctx.db.delete(deal._id);
    }

    return {
      success: true,
      deletedCount: allDeals.length,
      message: `Deleted ${allDeals.length} deals`,
    };
  },
});

// Seed service providers - creates users and profiles for brokers, mortgage advisors, and lawyers
// Call from Convex dashboard or CLI: npx convex run seed:seedServiceProviders
export const seedServiceProviders = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    let insertedCount = 0;

    for (const provider of SEED_SERVICE_PROVIDERS) {
      // Check if user already exists by email
      const existingUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), provider.email))
        .first();

      let userId: Id<"users">;

      if (existingUser) {
        // Update existing user role if needed
        if (existingUser.role !== provider.role) {
          await ctx.db.patch(existingUser._id, { role: provider.role });
        }
        userId = existingUser._id;
      } else {
        // Create new user
        userId = await ctx.db.insert("users", {
          clerkId: `seed_${provider.role}_${provider.email.split("@")[0]}`,
          email: provider.email,
          name: provider.name,
          role: provider.role,
          imageUrl: provider.imageUrl,
          onboardingComplete: true,
          createdAt: now,
          updatedAt: now,
        });
      }

      // Check if profile already exists
      const existingProfile = await ctx.db
        .query("serviceProviderProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (!existingProfile) {
        // Create service provider profile
        await ctx.db.insert("serviceProviderProfiles", {
          userId,
          providerType: provider.role,
          companyName: provider.profile.companyName,
          licenseNumber: provider.profile.licenseNumber,
          yearsExperience: provider.profile.yearsExperience,
          specializations: provider.profile.specializations,
          serviceAreas: provider.profile.serviceAreas,
          bio: provider.profile.bio,
          languages: provider.profile.languages,
          phoneNumber: provider.profile.phoneNumber,
          createdAt: now,
          updatedAt: now,
        });
        insertedCount++;
      }
    }

    return {
      success: true,
      insertedCount,
      message: `Seeded ${insertedCount} service providers`,
    };
  },
});

// Clear all service providers (users and profiles)
// Call from Convex dashboard or CLI: npx convex run seed:clearServiceProviders
export const clearServiceProviders = mutation({
  args: {},
  handler: async (ctx) => {
    // Get all seed provider emails
    const seedEmails = SEED_SERVICE_PROVIDERS.map((p) => p.email);
    let deletedUsers = 0;
    let deletedProfiles = 0;

    for (const email of seedEmails) {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), email))
        .first();

      if (user) {
        // Delete profile first
        const profile = await ctx.db
          .query("serviceProviderProfiles")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .first();

        if (profile) {
          await ctx.db.delete(profile._id);
          deletedProfiles++;
        }

        // Delete user
        await ctx.db.delete(user._id);
        deletedUsers++;
      }
    }

    return {
      success: true,
      deletedUsers,
      deletedProfiles,
      message: `Deleted ${deletedUsers} users and ${deletedProfiles} profiles`,
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
      deals: 0,
      serviceProviders: 0,
    };

    // Clear existing data
    const existingDeals = await ctx.db.query("deals").collect();
    for (const deal of existingDeals) {
      await ctx.db.delete(deal._id);
    }

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
        soldDate: property.soldDate,
        soldPrice: property.soldPrice,
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

    // Seed deals - need to get freshly inserted properties
    const seededProperties = await ctx.db.query("properties").collect();
    if (seededProperties.length > 0) {
      for (const dealTemplate of SEED_DEALS) {
        if (dealTemplate.propertyIndex >= seededProperties.length) {
          continue;
        }

        const property = seededProperties[dealTemplate.propertyIndex];
        const createdAt = now - dealTemplate.daysAgo * 24 * 60 * 60 * 1000;
        const stageHistory = generateStageHistory(
          dealTemplate.stage,
          dealTemplate.daysAgo,
          dealTemplate.notes
        );

        await ctx.db.insert("deals", {
          propertyId: property._id,
          investorId: creatorId,
          stage: dealTemplate.stage,
          offerPrice: dealTemplate.offerPrice,
          notes: dealTemplate.notes,
          stageHistory,
          createdAt,
          updatedAt: now,
        });
        results.deals++;
      }
    }

    // Seed service providers
    for (const provider of SEED_SERVICE_PROVIDERS) {
      // Check if user already exists by email
      const existingUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), provider.email))
        .first();

      let userId: Id<"users">;

      if (existingUser) {
        userId = existingUser._id;
      } else {
        // Create new user
        userId = await ctx.db.insert("users", {
          clerkId: `seed_${provider.role}_${provider.email.split("@")[0]}`,
          email: provider.email,
          name: provider.name,
          role: provider.role,
          imageUrl: provider.imageUrl,
          onboardingComplete: true,
          createdAt: now,
          updatedAt: now,
        });
      }

      // Check if profile already exists
      const existingProfile = await ctx.db
        .query("serviceProviderProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (!existingProfile) {
        // Create service provider profile
        await ctx.db.insert("serviceProviderProfiles", {
          userId,
          providerType: provider.role,
          companyName: provider.profile.companyName,
          licenseNumber: provider.profile.licenseNumber,
          yearsExperience: provider.profile.yearsExperience,
          specializations: provider.profile.specializations,
          serviceAreas: provider.profile.serviceAreas,
          bio: provider.profile.bio,
          languages: provider.profile.languages,
          phoneNumber: provider.profile.phoneNumber,
          createdAt: now,
          updatedAt: now,
        });
        results.serviceProviders++;
      }
    }

    return {
      success: true,
      results,
      message: `Seeded ${results.properties} properties, ${results.neighborhoods} neighborhoods, ${results.priceHistory} price history entries, ${results.deals} deals, ${results.serviceProviders} service providers`,
    };
  },
});
