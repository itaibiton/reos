import { mutation } from "./_generated/server";
import { SEED_PROPERTIES, SEED_NEIGHBORHOODS, SEED_PRICE_HISTORY, SEED_DEALS, SEED_SERVICE_PROVIDERS, SEED_DEAL_SCENARIOS, SEED_MESSAGE_TEMPLATES, SEED_POSTS, SEED_COMMENTS, SEED_FOLLOWS } from "./seedData";
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
        // Update existing user role and onboarding status if needed
        const updates: Record<string, unknown> = {};
        if (existingUser.role !== provider.role) {
          updates.role = provider.role;
        }
        // Ensure service providers are marked as onboarding complete
        if (!existingUser.onboardingComplete) {
          updates.onboardingComplete = true;
          updates.onboardingStep = undefined;
        }
        if (Object.keys(updates).length > 0) {
          updates.updatedAt = now;
          await ctx.db.patch(existingUser._id, updates);
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

// Seed comprehensive deal flow data - creates deals with providers, service requests, activity, and messages
// Call from Convex dashboard or CLI: npx convex run seed:seedDealFlow
export const seedDealFlow = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const results = {
      deals: 0,
      serviceRequests: 0,
      dealActivity: 0,
      messages: 0,
    };

    // Get investor user (or create one)
    let investorId = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "investor"))
      .first()
      .then((user) => user?._id);

    if (!investorId) {
      const adminUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("role"), "admin"))
        .first();
      if (adminUser) {
        investorId = adminUser._id;
      } else {
        investorId = await ctx.db.insert("users", {
          clerkId: "test_investor_dealflow",
          email: "investor@reos.dev",
          name: "Test Investor",
          role: "investor",
          onboardingComplete: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Get all properties
    const properties = await ctx.db.query("properties").collect();
    if (properties.length === 0) {
      return {
        success: false,
        results,
        message: "No properties found. Please run seed:seedProperties first.",
      };
    }

    // Build provider email to user ID map
    const providerMap: Map<string, Id<"users">> = new Map();
    for (const provider of SEED_SERVICE_PROVIDERS) {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), provider.email))
        .first();
      if (user) {
        providerMap.set(provider.email, user._id);
      }
    }

    // Clear existing deal-related data
    const existingDeals = await ctx.db.query("deals").collect();
    for (const deal of existingDeals) {
      await ctx.db.delete(deal._id);
    }

    const existingRequests = await ctx.db.query("serviceRequests").collect();
    for (const request of existingRequests) {
      await ctx.db.delete(request._id);
    }

    const existingActivity = await ctx.db.query("dealActivity").collect();
    for (const activity of existingActivity) {
      await ctx.db.delete(activity._id);
    }

    const existingMessages = await ctx.db.query("messages").collect();
    for (const message of existingMessages) {
      await ctx.db.delete(message._id);
    }

    // Process each deal scenario
    for (const scenario of SEED_DEAL_SCENARIOS) {
      // Skip if property index doesn't exist
      if (scenario.propertyIndex >= properties.length) {
        continue;
      }

      const property = properties[scenario.propertyIndex];
      const createdAt = now - scenario.daysAgo * 24 * 60 * 60 * 1000;

      // Determine provider IDs based on scenario
      const brokerId = scenario.brokerEmail ? providerMap.get(scenario.brokerEmail) : undefined;
      const mortgageAdvisorId = scenario.mortgageAdvisorEmail ? providerMap.get(scenario.mortgageAdvisorEmail) : undefined;
      const lawyerId = scenario.lawyerEmail ? providerMap.get(scenario.lawyerEmail) : undefined;

      // Generate stage history
      const stageHistory = generateStageHistory(
        scenario.stage,
        scenario.daysAgo,
        scenario.notes
      );

      // Create the deal
      const dealId = await ctx.db.insert("deals", {
        propertyId: property._id,
        investorId: investorId,
        stage: scenario.stage,
        offerPrice: scenario.offerPrice,
        notes: scenario.notes,
        brokerId,
        mortgageAdvisorId,
        lawyerId,
        stageHistory,
        createdAt,
        updatedAt: now,
      });
      results.deals++;

      // Create service requests for each assigned provider
      const providerAssignments: Array<{ providerId: Id<"users">; providerType: "broker" | "mortgage_advisor" | "lawyer" }> = [];

      if (brokerId) {
        providerAssignments.push({ providerId: brokerId, providerType: "broker" });
      }
      if (mortgageAdvisorId) {
        providerAssignments.push({ providerId: mortgageAdvisorId, providerType: "mortgage_advisor" });
      }
      if (lawyerId) {
        providerAssignments.push({ providerId: lawyerId, providerType: "lawyer" });
      }

      for (let i = 0; i < providerAssignments.length; i++) {
        const { providerId, providerType } = providerAssignments[i];
        // Stagger request creation times
        const requestCreatedAt = createdAt + i * 2 * 24 * 60 * 60 * 1000; // 2 days apart
        const requestRespondedAt = requestCreatedAt + 12 * 60 * 60 * 1000; // 12 hours later

        await ctx.db.insert("serviceRequests", {
          dealId,
          investorId: investorId,
          providerId,
          providerType,
          status: "accepted",
          investorMessage: `I'd like your help with this ${property.city} property.`,
          createdAt: requestCreatedAt,
          respondedAt: requestRespondedAt,
        });
        results.serviceRequests++;

        // Create activity log for provider assignment
        await ctx.db.insert("dealActivity", {
          dealId,
          actorId: providerId,
          activityType: "provider_assigned",
          details: { providerType },
          createdAt: requestRespondedAt,
        });
        results.dealActivity++;
      }

      // Create stage change activity logs based on stage history
      for (let i = 0; i < stageHistory.length; i++) {
        const historyEntry = stageHistory[i];
        const prevStage = i > 0 ? stageHistory[i - 1].stage : undefined;
        await ctx.db.insert("dealActivity", {
          dealId,
          actorId: investorId,
          activityType: "stage_change",
          details: {
            fromStage: prevStage,
            toStage: historyEntry.stage,
            note: historyEntry.notes,
          },
          createdAt: historyEntry.timestamp,
        });
        results.dealActivity++;
      }

      // Create messages from templates
      for (const threadIndex of scenario.messageThreads) {
        if (threadIndex >= SEED_MESSAGE_TEMPLATES.length) continue;

        const thread = SEED_MESSAGE_TEMPLATES[threadIndex];

        // Determine the provider for this thread
        let threadProviderId: Id<"users"> | undefined;
        if (thread.providerRole === "broker" && brokerId) {
          threadProviderId = brokerId;
        } else if (thread.providerRole === "mortgage_advisor" && mortgageAdvisorId) {
          threadProviderId = mortgageAdvisorId;
        } else if (thread.providerRole === "lawyer" && lawyerId) {
          threadProviderId = lawyerId;
        }

        if (!threadProviderId) continue;

        // Calculate thread start time (based on deal age)
        const threadStartTime = createdAt + Math.random() * 3 * 24 * 60 * 60 * 1000; // within first 3 days

        // Create messages
        for (const msg of thread.messages) {
          const msgTime = threadStartTime + msg.offsetMinutes * 60 * 1000;

          const senderId = msg.fromInvestor ? investorId : threadProviderId;
          const recipientId = msg.fromInvestor ? threadProviderId : investorId;

          await ctx.db.insert("messages", {
            dealId,
            senderId,
            recipientId,
            content: msg.content,
            status: "read", // All seed messages are read
            readAt: msgTime + 5 * 60 * 1000, // Read 5 minutes after sent
            createdAt: msgTime,
          });
          results.messages++;
        }
      }
    }

    return {
      success: true,
      results,
      message: `Seeded ${results.deals} deals, ${results.serviceRequests} service requests, ${results.dealActivity} activity logs, ${results.messages} messages`,
    };
  },
});

// Seed social feed data - posts, comments, likes, saves, and follows
// Call from Convex dashboard or CLI: npx convex run seed:seedSocialData
export const seedSocialData = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const results = {
      posts: 0,
      comments: 0,
      likes: 0,
      saves: 0,
      follows: 0,
    };

    // Get or create a system investor user for seeding posts without authorProviderIndex
    let investorId = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "investor"))
      .first()
      .then((user) => user?._id);

    if (!investorId) {
      const adminUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("role"), "admin"))
        .first();
      if (adminUser) {
        investorId = adminUser._id;
      } else {
        investorId = await ctx.db.insert("users", {
          clerkId: "seed_investor_social",
          email: "investor@reos.dev",
          name: "Seed Investor",
          role: "investor",
          onboardingComplete: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Build provider email to user ID map
    const providerMap: Map<number, Id<"users">> = new Map();
    for (let i = 0; i < SEED_SERVICE_PROVIDERS.length; i++) {
      const provider = SEED_SERVICE_PROVIDERS[i];
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), provider.email))
        .first();
      if (user) {
        providerMap.set(i, user._id);
      }
    }

    // Get all properties for property_listing posts
    const properties = await ctx.db.query("properties").collect();

    // Clear existing social data
    const existingPosts = await ctx.db.query("posts").collect();
    for (const post of existingPosts) {
      await ctx.db.delete(post._id);
    }

    const existingComments = await ctx.db.query("postComments").collect();
    for (const comment of existingComments) {
      await ctx.db.delete(comment._id);
    }

    const existingLikes = await ctx.db.query("postLikes").collect();
    for (const like of existingLikes) {
      await ctx.db.delete(like._id);
    }

    const existingSaves = await ctx.db.query("postSaves").collect();
    for (const save of existingSaves) {
      await ctx.db.delete(save._id);
    }

    const existingFollows = await ctx.db.query("userFollows").collect();
    for (const follow of existingFollows) {
      await ctx.db.delete(follow._id);
    }

    // Create posts and store their IDs
    const postIds: Id<"posts">[] = [];

    for (const seedPost of SEED_POSTS) {
      // Determine author
      const authorId = seedPost.authorProviderIndex !== undefined
        ? providerMap.get(seedPost.authorProviderIndex) || investorId
        : investorId;

      // Determine property for property_listing
      let propertyId: Id<"properties"> | undefined;
      if (seedPost.postType === "property_listing" && seedPost.propertyIndex !== undefined) {
        if (seedPost.propertyIndex < properties.length) {
          propertyId = properties[seedPost.propertyIndex]._id;
        }
      }

      const createdAt = now - seedPost.daysAgo * 24 * 60 * 60 * 1000;

      const postId = await ctx.db.insert("posts", {
        authorId,
        postType: seedPost.postType,
        content: seedPost.content,
        visibility: seedPost.visibility,
        propertyId,
        serviceType: seedPost.serviceType,
        likeCount: seedPost.likeCount,
        commentCount: seedPost.commentCount,
        shareCount: seedPost.shareCount,
        saveCount: seedPost.saveCount,
        createdAt,
        updatedAt: createdAt,
      });

      postIds.push(postId);
      results.posts++;
    }

    // Create comments
    for (const seedComment of SEED_COMMENTS) {
      if (seedComment.postIndex >= postIds.length) continue;

      const postId = postIds[seedComment.postIndex];
      const post = await ctx.db.get(postId);
      if (!post) continue;

      const authorId = seedComment.authorProviderIndex !== undefined
        ? providerMap.get(seedComment.authorProviderIndex) || investorId
        : investorId;

      const commentCreatedAt = post.createdAt + seedComment.offsetHours * 60 * 60 * 1000;

      await ctx.db.insert("postComments", {
        postId,
        authorId,
        content: seedComment.content,
        createdAt: commentCreatedAt,
      });
      results.comments++;
    }

    // Create likes with realistic distribution
    // Use a deterministic approach based on post index
    const allUserIds = [investorId, ...Array.from(providerMap.values())];
    for (let i = 0; i < postIds.length; i++) {
      const postId = postIds[i];
      const post = SEED_POSTS[i];
      // Like from a subset of users based on likeCount
      const likerCount = Math.min(post.likeCount, allUserIds.length);
      for (let j = 0; j < likerCount; j++) {
        const userIndex = (i + j) % allUserIds.length;
        const userId = allUserIds[userIndex];

        // Check for duplicates
        const existing = await ctx.db
          .query("postLikes")
          .withIndex("by_post_and_user", (q) =>
            q.eq("postId", postId).eq("userId", userId)
          )
          .unique();

        if (!existing) {
          await ctx.db.insert("postLikes", {
            postId,
            userId,
            createdAt: now - Math.random() * 7 * 24 * 60 * 60 * 1000,
          });
          results.likes++;
        }
      }
    }

    // Create saves with realistic distribution
    for (let i = 0; i < postIds.length; i++) {
      const postId = postIds[i];
      const post = SEED_POSTS[i];
      // Save from a subset of users based on saveCount
      const saverCount = Math.min(post.saveCount, allUserIds.length);
      for (let j = 0; j < saverCount; j++) {
        const userIndex = (i + j + 3) % allUserIds.length; // Offset to get different users than likes
        const userId = allUserIds[userIndex];

        // Check for duplicates
        const existing = await ctx.db
          .query("postSaves")
          .withIndex("by_post_and_user", (q) =>
            q.eq("postId", postId).eq("userId", userId)
          )
          .unique();

        if (!existing) {
          await ctx.db.insert("postSaves", {
            postId,
            userId,
            createdAt: now - Math.random() * 7 * 24 * 60 * 60 * 1000,
          });
          results.saves++;
        }
      }
    }

    // Create follow relationships
    for (const seedFollow of SEED_FOLLOWS) {
      const followerId = seedFollow.followerProviderIndex !== undefined
        ? providerMap.get(seedFollow.followerProviderIndex)
        : investorId;

      const followingId = seedFollow.followingProviderIndex !== undefined
        ? providerMap.get(seedFollow.followingProviderIndex)
        : investorId;

      if (!followerId || !followingId || followerId === followingId) continue;

      // Check for duplicate follows
      const existing = await ctx.db
        .query("userFollows")
        .withIndex("by_follower_and_following", (q) =>
          q.eq("followerId", followerId).eq("followingId", followingId)
        )
        .unique();

      if (!existing) {
        await ctx.db.insert("userFollows", {
          followerId,
          followingId,
          createdAt: now - Math.random() * 30 * 24 * 60 * 60 * 1000,
        });
        results.follows++;
      }
    }

    return {
      success: true,
      results,
      message: `Seeded ${results.posts} posts, ${results.comments} comments, ${results.likes} likes, ${results.saves} saves, ${results.follows} follows`,
    };
  },
});

// Seed direct message conversations between users
// Call from Convex dashboard or CLI: npx convex run seed:seedConversations
export const seedConversations = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const results = {
      conversations: 0,
      messages: 0,
    };

    // Get existing users
    const users = await ctx.db.query("users").collect();
    if (users.length < 2) {
      return {
        success: false,
        results,
        message: "Need at least 2 users to create conversations. Please seed users first.",
      };
    }

    // Clear existing conversations and direct messages
    const existingConversations = await ctx.db.query("conversations").collect();
    for (const conv of existingConversations) {
      await ctx.db.delete(conv._id);
    }

    const existingDMs = await ctx.db.query("directMessages").collect();
    for (const dm of existingDMs) {
      await ctx.db.delete(dm._id);
    }

    // Get provider users by role
    const brokers = users.filter(u => u.role === "broker");
    const mortgageAdvisors = users.filter(u => u.role === "mortgage_advisor");
    const lawyers = users.filter(u => u.role === "lawyer");
    const investors = users.filter(u => u.role === "investor" || u.role === "admin");

    // Sample conversation templates
    const conversationTemplates = [
      {
        topic: "Investment inquiry",
        messages: [
          "Hi, I'm interested in learning more about investment opportunities in Tel Aviv.",
          "Great to hear! I'd be happy to help. What's your budget range?",
          "I'm looking at properties in the $500K - $800K range.",
          "That's a great range for Tel Aviv. I have several properties to show you.",
          "When can we schedule a call to discuss?",
        ],
      },
      {
        topic: "Mortgage question",
        messages: [
          "Hello, I need help with a mortgage for a property purchase.",
          "Hi! I'd be glad to assist. Are you an Israeli resident?",
          "No, I'm based in the US but looking to buy in Israel.",
          "No problem. For non-residents, banks typically require 50% down. Let me explain the process.",
          "That would be very helpful, thank you!",
        ],
      },
      {
        topic: "Legal consultation",
        messages: [
          "I need a lawyer to review a purchase contract.",
          "Sure, I can help with that. When do you need it reviewed by?",
          "The seller wants to close within 30 days.",
          "That's manageable. Please send over the contract and I'll review it this week.",
        ],
      },
      {
        topic: "Market update",
        messages: [
          "Any updates on the Jerusalem market?",
          "Yes! Prices have stabilized and there are some good opportunities in Baka.",
          "Interesting, I've been watching that area.",
          "I can send you some listings if you're interested.",
          "Please do!",
        ],
      },
      {
        topic: "Referral follow-up",
        messages: [
          "Thanks for the referral to your mortgage advisor!",
          "You're welcome! Did they help you out?",
          "Yes, got pre-approved last week.",
          "Excellent! Let me know when you're ready to look at properties.",
        ],
      },
    ];

    // Create 1-on-1 conversations between different user types
    const conversationPairs: Array<{ user1: typeof users[0]; user2: typeof users[0] }> = [];

    // Investor-Broker conversations
    if (investors.length > 0 && brokers.length > 0) {
      conversationPairs.push({ user1: investors[0], user2: brokers[0] });
      if (brokers.length > 1) {
        conversationPairs.push({ user1: investors[0], user2: brokers[1] });
      }
    }

    // Investor-Mortgage Advisor conversations
    if (investors.length > 0 && mortgageAdvisors.length > 0) {
      conversationPairs.push({ user1: investors[0], user2: mortgageAdvisors[0] });
    }

    // Investor-Lawyer conversations
    if (investors.length > 0 && lawyers.length > 0) {
      conversationPairs.push({ user1: investors[0], user2: lawyers[0] });
    }

    // Broker-Broker conversations
    if (brokers.length > 1) {
      conversationPairs.push({ user1: brokers[0], user2: brokers[1] });
    }

    // Broker-Mortgage Advisor conversations
    if (brokers.length > 0 && mortgageAdvisors.length > 0) {
      conversationPairs.push({ user1: brokers[0], user2: mortgageAdvisors[0] });
    }

    // Broker-Lawyer conversations
    if (brokers.length > 0 && lawyers.length > 0) {
      conversationPairs.push({ user1: brokers[0], user2: lawyers[0] });
    }

    // Mortgage-Lawyer conversations
    if (mortgageAdvisors.length > 0 && lawyers.length > 0) {
      conversationPairs.push({ user1: mortgageAdvisors[0], user2: lawyers[0] });
    }

    // Create conversations with messages
    for (let i = 0; i < conversationPairs.length; i++) {
      const pair = conversationPairs[i];
      const template = conversationTemplates[i % conversationTemplates.length];

      // Create conversation
      const conversationCreatedAt = now - (15 - i) * 24 * 60 * 60 * 1000;
      const conversationId = await ctx.db.insert("conversations", {
        type: "direct",
        participantIds: [pair.user1._id, pair.user2._id],
        createdBy: pair.user1._id,
        createdAt: conversationCreatedAt,
        updatedAt: now,
      });
      results.conversations++;

      // Add messages
      for (let j = 0; j < template.messages.length; j++) {
        const senderId = j % 2 === 0 ? pair.user1._id : pair.user2._id;
        const messageCreatedAt = conversationCreatedAt + j * 30 * 60 * 1000; // 30 min apart

        await ctx.db.insert("directMessages", {
          conversationId,
          senderId,
          content: template.messages[j],
          status: "read",
          readBy: [pair.user1._id, pair.user2._id],
          createdAt: messageCreatedAt,
        });
        results.messages++;
      }
    }

    // Create one group conversation if we have enough users
    if (users.length >= 3) {
      const groupParticipants = users.slice(0, Math.min(4, users.length));
      const groupCreatedAt = now - 10 * 24 * 60 * 60 * 1000;

      const groupId = await ctx.db.insert("conversations", {
        type: "group",
        name: "Deal Team - Tel Aviv Property",
        participantIds: groupParticipants.map(u => u._id),
        createdBy: groupParticipants[0]._id,
        createdAt: groupCreatedAt,
        updatedAt: now,
      });
      results.conversations++;

      // Add group messages
      const groupMessages = [
        "Welcome everyone to the deal team!",
        "Thanks for setting this up. Looking forward to working together.",
        "I'll send over the property details shortly.",
        "Great, I'll start on the financing options once I see the numbers.",
        "I can begin the legal review as soon as we have a contract.",
      ];

      for (let j = 0; j < groupMessages.length; j++) {
        const senderId = groupParticipants[j % groupParticipants.length]._id;
        const messageCreatedAt = groupCreatedAt + j * 2 * 60 * 60 * 1000; // 2 hours apart

        await ctx.db.insert("directMessages", {
          conversationId: groupId,
          senderId,
          content: groupMessages[j],
          status: "read",
          readBy: groupParticipants.map(u => u._id),
          createdAt: messageCreatedAt,
        });
        results.messages++;
      }
    }

    return {
      success: true,
      results,
      message: `Seeded ${results.conversations} conversations with ${results.messages} messages`,
    };
  },
});

// Clear all social data
// Call from Convex dashboard or CLI: npx convex run seed:clearSocialData
export const clearSocialData = mutation({
  args: {},
  handler: async (ctx) => {
    let deletedPosts = 0;
    let deletedComments = 0;
    let deletedLikes = 0;
    let deletedSaves = 0;
    let deletedFollows = 0;
    let deletedConversations = 0;
    let deletedDMs = 0;

    // Delete posts
    const posts = await ctx.db.query("posts").collect();
    for (const post of posts) {
      await ctx.db.delete(post._id);
      deletedPosts++;
    }

    // Delete comments
    const comments = await ctx.db.query("postComments").collect();
    for (const comment of comments) {
      await ctx.db.delete(comment._id);
      deletedComments++;
    }

    // Delete likes
    const likes = await ctx.db.query("postLikes").collect();
    for (const like of likes) {
      await ctx.db.delete(like._id);
      deletedLikes++;
    }

    // Delete saves
    const saves = await ctx.db.query("postSaves").collect();
    for (const save of saves) {
      await ctx.db.delete(save._id);
      deletedSaves++;
    }

    // Delete follows
    const follows = await ctx.db.query("userFollows").collect();
    for (const follow of follows) {
      await ctx.db.delete(follow._id);
      deletedFollows++;
    }

    // Delete conversations and direct messages
    const conversations = await ctx.db.query("conversations").collect();
    for (const conv of conversations) {
      await ctx.db.delete(conv._id);
      deletedConversations++;
    }

    const dms = await ctx.db.query("directMessages").collect();
    for (const dm of dms) {
      await ctx.db.delete(dm._id);
      deletedDMs++;
    }

    return {
      success: true,
      deleted: {
        posts: deletedPosts,
        comments: deletedComments,
        likes: deletedLikes,
        saves: deletedSaves,
        follows: deletedFollows,
        conversations: deletedConversations,
        directMessages: deletedDMs,
      },
      message: `Cleared all social data`,
    };
  },
});

// Clear investor profile data - questionnaires, AI threads, and reset user onboarding
// Call from Convex dashboard or CLI: npx convex run seed:clearInvestorData
export const clearInvestorData = mutation({
  args: {},
  handler: async (ctx) => {
    let deletedQuestionnaires = 0;
    let deletedAiThreads = 0;
    let resetUsers = 0;

    // Delete all investor questionnaires
    const questionnaires = await ctx.db.query("investorQuestionnaires").collect();
    for (const q of questionnaires) {
      await ctx.db.delete(q._id);
      deletedQuestionnaires++;
    }

    // Delete all AI threads
    const threads = await ctx.db.query("aiThreads").collect();
    for (const thread of threads) {
      await ctx.db.delete(thread._id);
      deletedAiThreads++;
    }

    // Reset all investor users' onboarding status
    const investors = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "investor"))
      .collect();

    for (const investor of investors) {
      await ctx.db.patch(investor._id, {
        onboardingComplete: false,
        onboardingStep: undefined,
        updatedAt: Date.now(),
      });
      resetUsers++;
    }

    return {
      success: true,
      deleted: {
        questionnaires: deletedQuestionnaires,
        aiThreads: deletedAiThreads,
        usersReset: resetUsers,
      },
      message: `Cleared investor data: ${deletedQuestionnaires} questionnaires, ${deletedAiThreads} AI threads, ${resetUsers} users reset`,
    };
  },
});

// Clear ALL data from ALL tables - complete database reset
// Call from Convex dashboard or CLI: npx convex run seed:clearAll
export const clearAll = mutation({
  args: {},
  handler: async (ctx) => {
    const results: Record<string, number> = {};

    // Clear all tables in order (respecting foreign key-like relationships)
    const tablesToClear = [
      "aiThreads",
      "postComments",
      "postLikes",
      "postReposts",
      "postSaves",
      "posts",
      "userFollows",
      "directMessages",
      "conversations",
      "messages",
      "dealActivity",
      "dealFiles",
      "notifications",
      "providerReviews",
      "providerUnavailableDates",
      "searchHistory",
      "serviceRequests",
      "favorites",
      "deals",
      "properties",
      "neighborhoods",
      "priceHistory",
      "investorProfiles",
      "investorQuestionnaires",
      "serviceProviderProfiles",
      "users",
    ] as const;

    for (const tableName of tablesToClear) {
      const docs = await ctx.db.query(tableName).collect();
      for (const doc of docs) {
        await ctx.db.delete(doc._id);
      }
      results[tableName] = docs.length;
    }

    return {
      success: true,
      results,
      message: `Cleared all tables: ${Object.entries(results).map(([k, v]) => `${k}:${v}`).join(", ")}`,
    };
  },
});

// Scraped real properties from JPost and Yad2
const SCRAPED_PROPERTIES = [
  {
    title: "Luxury Villa in Rishpon",
    address: "Rishpon",
    city: "Rishpon",
    priceIls: 19000000,
    bedrooms: 5,
    bathrooms: 3,
    squareMeters: 300,
    propertyType: "residential" as const,
    description: "A luxurious villa for sale in Rishpon with premium finishes, spacious rooms, and beautiful garden. Perfect for families looking for upscale living in a prestigious neighborhood.",
    latitude: 32.201856,
    longitude: 34.824723,
    featuredImage: "https://realestate.jpost.com/wp-content/uploads/2025/12/WhatsApp-Image-2025-11-25-at-16.18.36-eyal-katz.jpeg",
    yearBuilt: 2020,
  },
  {
    title: "Mini Penthouse with Panoramic Views",
    address: "Hashofet Chaim Cohen St., Jerusalem",
    city: "Jerusalem",
    priceIls: 7400000,
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 151,
    propertyType: "residential" as const,
    description: "Sophisticated mini penthouse with great views from all exposures. High-end finishes throughout with modern design.",
    latitude: 31.7458457,
    longitude: 35.2191009,
    featuredImage: "https://realestate.jpost.com/wp-content/uploads/2025/12/תוכניות-אדריכליות-כללי-min-Natalia-Volkov.jpg",
    yearBuilt: 2023,
  },
  {
    title: "Semi-Detached House in Yavniel",
    address: "Main Street, Yavniel",
    city: "Yavniel",
    priceIls: 5100000,
    bedrooms: 4,
    bathrooms: 2,
    squareMeters: 250,
    propertyType: "residential" as const,
    description: "Beautiful semi-detached house on 2 floors in the scenic village of Yavniel. Spacious layout with mountain views.",
    latitude: 32.7037641,
    longitude: 35.5062245,
    featuredImage: "https://realestate.jpost.com/wp-content/uploads/2025/12/IMG_4599-Jacqueline-Perle-1.jpeg",
    yearBuilt: 2018,
  },
  {
    title: "Penthouse with Temple Mount View",
    address: "Arnona, Jerusalem",
    city: "Jerusalem",
    priceIls: 8500000,
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 153,
    propertyType: "residential" as const,
    description: "Spectacular penthouse with breathtaking views of the Temple Mount and the Dead Sea. Premium location.",
    latitude: 31.7458457,
    longitude: 35.2191009,
    featuredImage: "https://realestate.jpost.com/wp-content/uploads/2025/12/Hashofet-Chaim-Cohen-East-mini-penthouse-23rd-floor-11-scaled-Natalia-Volkov.jpg",
    yearBuilt: 2022,
  },
  {
    title: "Modern Apartment in Arnona Tower",
    address: "Arnona, Jerusalem",
    city: "Jerusalem",
    priceIls: 3800000,
    bedrooms: 2,
    bathrooms: 1,
    squareMeters: 96,
    propertyType: "residential" as const,
    description: "New 3BR resale in Arnona luxury tower. Modern finishes, great views, and premium building amenities.",
    latitude: 31.7458457,
    longitude: 35.2191009,
    featuredImage: "https://realestate.jpost.com/wp-content/uploads/2025/12/y2_1pa_010477_20240518221307-scaled-Natalia-Volkov.jpeg",
    yearBuilt: 2024,
  },
  {
    title: "German Colony Pre-Construction",
    address: "Hamagid Street, German Colony, Jerusalem",
    city: "Jerusalem",
    priceIls: 5950000,
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 101,
    propertyType: "residential" as const,
    description: "Pre-construction opportunity in the prestigious German Colony. 101 sqm on Hamagid Street with balcony.",
    latitude: 31.7657597,
    longitude: 35.220131,
    featuredImage: "https://realestate.jpost.com/wp-content/uploads/2025/12/Hamagid6-furnished-balcony-Natalia-Volkov.jpeg",
    yearBuilt: 2026,
  },
  {
    title: "Old Katamon Park View Apartment",
    address: "Old Katamon, Jerusalem",
    city: "Jerusalem",
    priceIls: 12140000,
    bedrooms: 4,
    bathrooms: 3,
    squareMeters: 194,
    propertyType: "residential" as const,
    description: "Pre-development opportunity in Old Katamon by the park. Spacious 4-bedroom with stunning park views.",
    latitude: 31.7768831,
    longitude: 35.2224346,
    featuredImage: "https://realestate.jpost.com/wp-content/uploads/2025/12/Building-Illustrauion-Old-Katamon-1-Natalia-Volkov.jpeg",
    yearBuilt: 2026,
  },
  {
    title: "Kiryat Moshe Premium Apartment",
    address: "Rova 1, Kiryat Moshe, Jerusalem",
    city: "Jerusalem",
    priceIls: 8990000,
    bedrooms: 5,
    bathrooms: 3,
    squareMeters: 210,
    propertyType: "residential" as const,
    description: "Rare luxury 210sqm listing in Kiryat Moshe - Rova 1 premium project. High-end finishes.",
    latitude: 31.7855031,
    longitude: 35.1966557,
    featuredImage: "https://realestate.jpost.com/wp-content/uploads/2025/11/רובע-אחד-הדמיה_-min-Natalia-Volkov-1.jpeg",
    yearBuilt: 2025,
  },
  {
    title: "Magshimim Country Estate",
    address: "Moshav Magshimim",
    city: "Magshimim",
    priceIls: 18500000,
    bedrooms: 4,
    bathrooms: 3,
    squareMeters: 320,
    propertyType: "residential" as const,
    description: "Spacious country estate property in Moshav Magshimim, Central Israel. Large plot with landscaping.",
    latitude: 32.0506884,
    longitude: 34.9023182,
    featuredImage: "https://realestate.jpost.com/wp-content/uploads/2025/11/WhatsApp-Image-2025-11-27-at-13.27.58-3-Jessica-Kamir.jpeg",
    yearBuilt: 2019,
  },
  {
    title: "Galilee Mountain Villa",
    address: "Kfar Shamay",
    city: "Kfar Shamay",
    priceIls: 8500000,
    bedrooms: 7,
    bathrooms: 4,
    squareMeters: 500,
    propertyType: "residential" as const,
    description: "Beautiful vacation villa in the green mountains of the Galilee, overlooking mountains of Meron.",
    latitude: 32.955698,
    longitude: 35.457916,
    featuredImage: "https://realestate.jpost.com/wp-content/uploads/2025/11/9-Isaac-Nuri.jpeg",
    yearBuilt: 2015,
  },
  {
    title: "Garden Apartment in Kiryat Shmuel",
    address: "Kiryat Shmuel, Jerusalem",
    city: "Jerusalem",
    priceIls: 7700000,
    bedrooms: 4,
    bathrooms: 2,
    squareMeters: 150,
    propertyType: "residential" as const,
    description: "Stunning new garden apartment in Kiryat Shmuel on the border of Rechavia. Contemporary design.",
    latitude: 31.7768831,
    longitude: 35.2224346,
    featuredImage: "https://realestate.jpost.com/wp-content/uploads/2025/11/1-Kenny-Sherman.jpg",
    yearBuilt: 2024,
  },
  {
    title: "Telz Stone Garden Apartment",
    address: "Telz Stone, Kiryat Ye'arim",
    city: "Kiryat Ye'arim",
    priceIls: 4550000,
    bedrooms: 4,
    bathrooms: 2,
    squareMeters: 142,
    propertyType: "residential" as const,
    description: "Beautiful and spacious garden apartment in the Telz Stone community. Family-friendly neighborhood.",
    latitude: 31.8049549,
    longitude: 35.151392,
    featuredImage: "https://realestate.jpost.com/wp-content/uploads/2025/11/noi9the5vgYk0gwJDPFL_17622535648286-אורטל-מצליח.jpg",
    yearBuilt: 2017,
  },
  {
    title: "German Colony Garden Apartment",
    address: "German Colony, Jerusalem",
    city: "Jerusalem",
    priceIls: 5800000,
    bedrooms: 1,
    bathrooms: 1,
    squareMeters: 90,
    propertyType: "residential" as const,
    description: "Charming garden apartment in the German Colony with 90 sqm living space and 77 sqm private garden.",
    latitude: 31.7768831,
    longitude: 35.22243460000001,
    featuredImage: "https://realestate.jpost.com/wp-content/uploads/2025/11/IMG_3200-טפרברג-נכסים.jpg",
    yearBuilt: 2010,
  },
  {
    title: "Family Apartment in Lahavim",
    address: "Agur 26, Lahavim",
    city: "Lahavim",
    priceIls: 2850000,
    bedrooms: 4,
    bathrooms: 2,
    squareMeters: 159,
    propertyType: "residential" as const,
    description: "Spacious ground floor apartment in the quiet and green town of Lahavim. Perfect for families.",
    latitude: 31.3747,
    longitude: 34.8242,
    featuredImage: "https://img.yad2.co.il/Pic/202601/24/2_1/o/y2_1pa_010326_20260124193714.jpeg",
    yearBuilt: 2015,
  },
  {
    title: "Modern Apartment in Tel Aviv",
    address: "Modigliani 12, Tel Aviv",
    city: "Tel Aviv",
    priceIls: 4650000,
    bedrooms: 3,
    bathrooms: 2,
    squareMeters: 75,
    propertyType: "residential" as const,
    description: "Modern apartment on the 3rd floor in central Tel Aviv. Walking distance to Rothschild Boulevard.",
    latitude: 32.0853,
    longitude: 34.7818,
    featuredImage: "https://img.yad2.co.il/Pic/202601/23/2_1/o/y2_1_05256_20260123160117.jpeg",
    yearBuilt: 2020,
  },
  {
    title: "Large Family Home in Or Akiva",
    address: "Kerem 13, Or Akiva",
    city: "Or Akiva",
    priceIls: 4600000,
    bedrooms: 7,
    bathrooms: 3,
    squareMeters: 250,
    propertyType: "residential" as const,
    description: "Spacious 7-room family home with large garden. Ground floor with direct access. Great for large families.",
    latitude: 32.5063,
    longitude: 34.9172,
    featuredImage: "https://img.yad2.co.il/Pic/202601/23/2_1/o/y2_1pa_010198_20260123102428.jpeg",
    yearBuilt: 2012,
  },
  {
    title: "Penthouse in Modiin",
    address: "Ofroni 9, Modiin",
    city: "Modiin",
    priceIls: 5400000,
    bedrooms: 4,
    bathrooms: 2,
    squareMeters: 180,
    propertyType: "residential" as const,
    description: "Stunning penthouse on the 4th floor in Modiin Maccabim. Luxury living with panoramic views.",
    latitude: 31.8977,
    longitude: 35.0104,
    featuredImage: "https://img.yad2.co.il/Pic/202601/20/2_1/o/y2_1pa_010481_20260120112947.jpeg",
    yearBuilt: 2021,
  },
  {
    title: "Desert Retreat in Mitzpe Ramon",
    address: "Har Tzin 2, Mitzpe Ramon",
    city: "Mitzpe Ramon",
    priceIls: 790000,
    bedrooms: 8,
    bathrooms: 4,
    squareMeters: 498,
    propertyType: "residential" as const,
    description: "Unique property overlooking the Ramon Crater. Perfect for a desert retreat or B&B business.",
    latitude: 30.6095,
    longitude: 34.8014,
    featuredImage: "https://img.yad2.co.il/Pic/202511/23/2_1/o/y2_1pa_010583_20251123102454.jpeg",
    yearBuilt: 2000,
  },
  {
    title: "Affordable Apartment in Dimona",
    address: "Merhavim 1332, Dimona",
    city: "Dimona",
    priceIls: 560000,
    bedrooms: 3,
    bathrooms: 1,
    squareMeters: 80,
    propertyType: "residential" as const,
    description: "Affordable 3-room apartment on the 4th floor in Dimona. Great investment opportunity in southern Israel.",
    latitude: 31.0697,
    longitude: 35.0328,
    featuredImage: "https://img.yad2.co.il/Pic/202601/22/2_1/o/y2_1_04086_20260122210440.jpeg",
    yearBuilt: 1985,
  },
  {
    title: "Luxury Villa in Baka Jerusalem",
    address: "Baka, Jerusalem",
    city: "Jerusalem",
    priceIls: 25000000,
    bedrooms: 6,
    bathrooms: 5,
    squareMeters: 768,
    propertyType: "residential" as const,
    description: "One-of-a-kind luxury villa in Baka. Distinctive architecture with premium finishes. Private garden and pool.",
    latitude: 31.7768831,
    longitude: 35.22243460000001,
    featuredImage: "https://realestate.jpost.com/wp-content/uploads/2025/12/Baka-Jerusalem-private-house-for-sale-3-Natalia-Volkov-1.jpeg",
    yearBuilt: 2018,
  },
];

// Seed scraped properties from real estate websites
// Call from Convex dashboard or CLI: npx convex run seed:seedScrapedProperties
export const seedScrapedProperties = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const ILS_TO_USD = 0.27;

    // Create a system user for scraped properties
    let creatorId = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "admin"))
      .first()
      .then((user) => user?._id);

    if (!creatorId) {
      creatorId = await ctx.db.insert("users", {
        clerkId: "system_scraper",
        email: "scraper@reos.dev",
        name: "Property Scraper",
        onboardingComplete: true,
        role: "admin",
        createdAt: now,
        updatedAt: now,
      });
    }

    let insertedCount = 0;

    for (const property of SCRAPED_PROPERTIES) {
      const priceUsd = Math.round(property.priceIls * ILS_TO_USD);
      const monthlyRent = Math.round((property.priceIls * 0.0035) / 3.7);
      const expectedRoi = 3 + Math.random() * 4;
      const capRate = 2.5 + Math.random() * 3;
      const cashOnCash = 4 + Math.random() * 5;

      await ctx.db.insert("properties", {
        title: property.title,
        description: property.description,
        address: property.address,
        city: property.city,
        latitude: property.latitude,
        longitude: property.longitude,
        propertyType: property.propertyType,
        status: "available",
        priceUsd,
        priceIls: property.priceIls,
        expectedRoi,
        capRate,
        cashOnCash,
        monthlyRent,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        squareMeters: property.squareMeters,
        yearBuilt: property.yearBuilt,
        amenities: ["Parking", "Air Conditioning", "Balcony"],
        images: [property.featuredImage],
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
      message: `Seeded ${insertedCount} scraped properties from JPost and Yad2`,
    };
  },
});

// Seed EVERYTHING - comprehensive database seeding with all data types
// Call from Convex dashboard or CLI: npx convex run seed:seedEverything
export const seedEverything = mutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const results = {
      serviceProviders: 0,
      properties: 0,
      neighborhoods: 0,
      priceHistory: 0,
      deals: 0,
      serviceRequests: 0,
      dealActivity: 0,
      dealMessages: 0,
      dealFiles: 0,
      conversations: 0,
      directMessages: 0,
      posts: 0,
      comments: 0,
      likes: 0,
      saves: 0,
      follows: 0,
      notifications: 0,
    };

    // Step 1: Seed service providers first (they need to exist for deals)
    console.log("Seeding service providers...");
    for (const provider of SEED_SERVICE_PROVIDERS) {
      const existingUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), provider.email))
        .first();

      let userId: Id<"users">;

      if (existingUser) {
        userId = existingUser._id;
      } else {
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

      const existingProfile = await ctx.db
        .query("serviceProviderProfiles")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .first();

      if (!existingProfile) {
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

    // Step 2: Create investor user if doesn't exist
    let investorId = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("role"), "investor"))
      .first()
      .then((user) => user?._id);

    if (!investorId) {
      const adminUser = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("role"), "admin"))
        .first();
      if (adminUser) {
        investorId = adminUser._id;
      } else {
        investorId = await ctx.db.insert("users", {
          clerkId: "seed_investor_main",
          email: "investor@reos.dev",
          name: "John Investor",
          role: "investor",
          onboardingComplete: true,
          createdAt: now,
          updatedAt: now,
        });
      }
    }

    // Step 3: Seed properties
    console.log("Seeding properties...");
    const properties = await ctx.db.query("properties").collect();
    if (properties.length === 0) {
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
          createdBy: investorId,
          createdAt: now,
          updatedAt: now,
        });
        results.properties++;
      }
    }

    // Step 4: Seed neighborhoods
    console.log("Seeding neighborhoods...");
    const existingNeighborhoods = await ctx.db.query("neighborhoods").collect();
    if (existingNeighborhoods.length === 0) {
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
    }

    // Step 5: Seed price history
    console.log("Seeding price history...");
    const existingHistory = await ctx.db.query("priceHistory").collect();
    if (existingHistory.length === 0) {
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
    }

    // Step 6: Seed deals with full workflow (providers, requests, activity, messages, files)
    console.log("Seeding deals...");
    const seededProperties = await ctx.db.query("properties").collect();

    // Build provider map
    const providerMap: Map<string, Id<"users">> = new Map();
    for (const provider of SEED_SERVICE_PROVIDERS) {
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), provider.email))
        .first();
      if (user) {
        providerMap.set(provider.email, user._id);
      }
    }

    // NOTE: File seeding skipped - requires actual Convex storage uploads

    for (const scenario of SEED_DEAL_SCENARIOS) {
      if (scenario.propertyIndex >= seededProperties.length) continue;

      const property = seededProperties[scenario.propertyIndex];
      const createdAt = now - scenario.daysAgo * 24 * 60 * 60 * 1000;

      const brokerId = scenario.brokerEmail ? providerMap.get(scenario.brokerEmail) : undefined;
      const mortgageAdvisorId = scenario.mortgageAdvisorEmail ? providerMap.get(scenario.mortgageAdvisorEmail) : undefined;
      const lawyerId = scenario.lawyerEmail ? providerMap.get(scenario.lawyerEmail) : undefined;

      const stageHistory = generateStageHistory(scenario.stage, scenario.daysAgo, scenario.notes);

      const dealId = await ctx.db.insert("deals", {
        propertyId: property._id,
        investorId: investorId,
        stage: scenario.stage,
        offerPrice: scenario.offerPrice,
        notes: scenario.notes,
        brokerId,
        mortgageAdvisorId,
        lawyerId,
        stageHistory,
        createdAt,
        updatedAt: now,
      });
      results.deals++;

      // Create service requests
      const providerAssignments: Array<{ providerId: Id<"users">; providerType: "broker" | "mortgage_advisor" | "lawyer" }> = [];
      if (brokerId) providerAssignments.push({ providerId: brokerId, providerType: "broker" });
      if (mortgageAdvisorId) providerAssignments.push({ providerId: mortgageAdvisorId, providerType: "mortgage_advisor" });
      if (lawyerId) providerAssignments.push({ providerId: lawyerId, providerType: "lawyer" });

      for (let i = 0; i < providerAssignments.length; i++) {
        const { providerId, providerType } = providerAssignments[i];
        const requestCreatedAt = createdAt + i * 2 * 24 * 60 * 60 * 1000;
        const requestRespondedAt = requestCreatedAt + 12 * 60 * 60 * 1000;

        await ctx.db.insert("serviceRequests", {
          dealId,
          investorId: investorId,
          providerId,
          providerType,
          status: "accepted",
          investorMessage: `I'd like your help with this ${property.city} property.`,
          providerResponse: "I'd be happy to help! Let's schedule a call.",
          createdAt: requestCreatedAt,
          respondedAt: requestRespondedAt,
        });
        results.serviceRequests++;

        await ctx.db.insert("dealActivity", {
          dealId,
          actorId: providerId,
          activityType: "provider_assigned",
          details: { providerType },
          createdAt: requestRespondedAt,
        });
        results.dealActivity++;
      }

      // Create stage change activities
      for (let i = 0; i < stageHistory.length; i++) {
        const historyEntry = stageHistory[i];
        const prevStage = i > 0 ? stageHistory[i - 1].stage : undefined;
        await ctx.db.insert("dealActivity", {
          dealId,
          actorId: investorId,
          activityType: "stage_change",
          details: {
            fromStage: prevStage,
            toStage: historyEntry.stage,
            note: historyEntry.notes,
          },
          createdAt: historyEntry.timestamp,
        });
        results.dealActivity++;
      }

      // Create messages in deals
      for (const threadIndex of scenario.messageThreads) {
        if (threadIndex >= SEED_MESSAGE_TEMPLATES.length) continue;
        const thread = SEED_MESSAGE_TEMPLATES[threadIndex];

        let threadProviderId: Id<"users"> | undefined;
        if (thread.providerRole === "broker" && brokerId) threadProviderId = brokerId;
        else if (thread.providerRole === "mortgage_advisor" && mortgageAdvisorId) threadProviderId = mortgageAdvisorId;
        else if (thread.providerRole === "lawyer" && lawyerId) threadProviderId = lawyerId;

        if (!threadProviderId) continue;

        const threadStartTime = createdAt + Math.random() * 3 * 24 * 60 * 60 * 1000;

        for (const msg of thread.messages) {
          const msgTime = threadStartTime + msg.offsetMinutes * 60 * 1000;
          const senderId = msg.fromInvestor ? investorId : threadProviderId;
          const recipientId = msg.fromInvestor ? threadProviderId : investorId;

          await ctx.db.insert("messages", {
            dealId,
            senderId,
            recipientId,
            content: msg.content,
            status: "read",
            readAt: msgTime + 5 * 60 * 1000,
            createdAt: msgTime,
          });
          results.dealMessages++;
        }
      }

      // NOTE: Skipping deal files - they require actual file uploads via Convex storage
      // Files can be uploaded manually through the UI or via dealFiles:generateUploadUrl
      // Uncomment below if you have a way to generate real storage IDs

      // if (["mortgage", "legal", "closing", "completed"].includes(scenario.stage)) {
      //   // Deal file seeding would go here with real storage IDs
      // }

      // Create notifications for deal participants
      if (brokerId) {
        await ctx.db.insert("notifications", {
          userId: brokerId,
          type: "request_received",
          title: "New Service Request",
          message: `You have a new request for ${property.title}`,
          read: true,
          link: `/deals/${dealId}`,
          metadata: { dealId, propertyId: property._id },
          createdAt: createdAt + 12 * 60 * 60 * 1000,
        });
        results.notifications++;
      }
    }

    // Step 7: Seed direct message conversations
    console.log("Seeding conversations...");
    const users = await ctx.db.query("users").collect();
    const brokers = users.filter(u => u.role === "broker");
    const mortgageAdvisors = users.filter(u => u.role === "mortgage_advisor");
    const lawyers = users.filter(u => u.role === "lawyer");
    const investors = users.filter(u => u.role === "investor" || u.role === "admin");

    const conversationTemplates = [
      ["Hi, I'm interested in investment opportunities in Tel Aviv.", "Great! I have several properties to show you.", "When can we schedule a call?"],
      ["I need help with a mortgage.", "I'd be glad to assist. Are you an Israeli resident?", "No, I'm based in the US.", "No problem. Let me explain the process."],
      ["I need a lawyer for a purchase contract.", "Sure, when do you need it reviewed?", "Within 30 days.", "That's manageable."],
    ];

    if (investors.length > 0 && brokers.length > 0) {
      const convId = await ctx.db.insert("conversations", {
        type: "direct",
        participantIds: [investors[0]._id, brokers[0]._id],
        createdBy: investors[0]._id,
        createdAt: now - 10 * 24 * 60 * 60 * 1000,
        updatedAt: now,
      });
      results.conversations++;

      for (let i = 0; i < conversationTemplates[0].length; i++) {
        await ctx.db.insert("directMessages", {
          conversationId: convId,
          senderId: i % 2 === 0 ? investors[0]._id : brokers[0]._id,
          content: conversationTemplates[0][i],
          status: "read",
          readBy: [investors[0]._id, brokers[0]._id],
          createdAt: now - (10 - i) * 24 * 60 * 60 * 1000,
        });
        results.directMessages++;
      }
    }

    // Create group conversation
    if (users.length >= 3) {
      const groupParticipants = users.slice(0, Math.min(4, users.length));
      const groupId = await ctx.db.insert("conversations", {
        type: "group",
        name: "Deal Team - Premium Property",
        participantIds: groupParticipants.map(u => u._id),
        createdBy: groupParticipants[0]._id,
        createdAt: now - 5 * 24 * 60 * 60 * 1000,
        updatedAt: now,
      });
      results.conversations++;

      const groupMessages = [
        "Welcome to the deal team!",
        "Looking forward to working together.",
        "I'll send property details shortly.",
        "Great, I'll start on financing options.",
      ];

      for (let i = 0; i < groupMessages.length; i++) {
        await ctx.db.insert("directMessages", {
          conversationId: groupId,
          senderId: groupParticipants[i % groupParticipants.length]._id,
          content: groupMessages[i],
          status: "read",
          readBy: groupParticipants.map(u => u._id),
          createdAt: now - (5 - i) * 24 * 60 * 60 * 1000,
        });
        results.directMessages++;
      }
    }

    // Step 8: Seed social feed data
    console.log("Seeding social data...");
    const providerMapByIndex: Map<number, Id<"users">> = new Map();
    for (let i = 0; i < SEED_SERVICE_PROVIDERS.length; i++) {
      const provider = SEED_SERVICE_PROVIDERS[i];
      const user = await ctx.db
        .query("users")
        .filter((q) => q.eq(q.field("email"), provider.email))
        .first();
      if (user) {
        providerMapByIndex.set(i, user._id);
      }
    }

    const postIds: Id<"posts">[] = [];
    for (const seedPost of SEED_POSTS) {
      const authorId = seedPost.authorProviderIndex !== undefined
        ? providerMapByIndex.get(seedPost.authorProviderIndex) || investorId
        : investorId;

      let propertyId: Id<"properties"> | undefined;
      if (seedPost.postType === "property_listing" && seedPost.propertyIndex !== undefined) {
        if (seedPost.propertyIndex < seededProperties.length) {
          propertyId = seededProperties[seedPost.propertyIndex]._id;
        }
      }

      const postCreatedAt = now - seedPost.daysAgo * 24 * 60 * 60 * 1000;
      const postId = await ctx.db.insert("posts", {
        authorId,
        postType: seedPost.postType,
        content: seedPost.content,
        visibility: seedPost.visibility,
        propertyId,
        serviceType: seedPost.serviceType,
        likeCount: seedPost.likeCount,
        commentCount: seedPost.commentCount,
        shareCount: seedPost.shareCount,
        saveCount: seedPost.saveCount,
        createdAt: postCreatedAt,
        updatedAt: postCreatedAt,
      });
      postIds.push(postId);
      results.posts++;
    }

    // Create comments
    for (const seedComment of SEED_COMMENTS) {
      if (seedComment.postIndex >= postIds.length) continue;
      const postId = postIds[seedComment.postIndex];
      const post = await ctx.db.get(postId);
      if (!post) continue;

      const authorId = seedComment.authorProviderIndex !== undefined
        ? providerMapByIndex.get(seedComment.authorProviderIndex) || investorId
        : investorId;

      await ctx.db.insert("postComments", {
        postId,
        authorId,
        content: seedComment.content,
        createdAt: post.createdAt + seedComment.offsetHours * 60 * 60 * 1000,
      });
      results.comments++;
    }

    // Create likes and saves
    const allUserIds = [investorId, ...Array.from(providerMapByIndex.values())];
    for (let i = 0; i < postIds.length; i++) {
      const postId = postIds[i];
      const post = SEED_POSTS[i];

      for (let j = 0; j < Math.min(post.likeCount, allUserIds.length); j++) {
        const userId = allUserIds[(i + j) % allUserIds.length];
        const existing = await ctx.db
          .query("postLikes")
          .withIndex("by_post_and_user", (q) => q.eq("postId", postId).eq("userId", userId))
          .unique();
        if (!existing) {
          await ctx.db.insert("postLikes", {
            postId,
            userId,
            createdAt: now - Math.random() * 7 * 24 * 60 * 60 * 1000,
          });
          results.likes++;
        }
      }

      for (let j = 0; j < Math.min(post.saveCount, allUserIds.length); j++) {
        const userId = allUserIds[(i + j + 3) % allUserIds.length];
        const existing = await ctx.db
          .query("postSaves")
          .withIndex("by_post_and_user", (q) => q.eq("postId", postId).eq("userId", userId))
          .unique();
        if (!existing) {
          await ctx.db.insert("postSaves", {
            postId,
            userId,
            createdAt: now - Math.random() * 7 * 24 * 60 * 60 * 1000,
          });
          results.saves++;
        }
      }
    }

    // Create follows
    for (const seedFollow of SEED_FOLLOWS) {
      const followerId = seedFollow.followerProviderIndex !== undefined
        ? providerMapByIndex.get(seedFollow.followerProviderIndex)
        : investorId;
      const followingId = seedFollow.followingProviderIndex !== undefined
        ? providerMapByIndex.get(seedFollow.followingProviderIndex)
        : investorId;

      if (!followerId || !followingId || followerId === followingId) continue;

      const existing = await ctx.db
        .query("userFollows")
        .withIndex("by_follower_and_following", (q) =>
          q.eq("followerId", followerId).eq("followingId", followingId)
        )
        .unique();

      if (!existing) {
        await ctx.db.insert("userFollows", {
          followerId,
          followingId,
          createdAt: now - Math.random() * 30 * 24 * 60 * 60 * 1000,
        });
        results.follows++;
      }
    }

    return {
      success: true,
      results,
      message: `✅ Seeded comprehensive database:
      - ${results.serviceProviders} service providers
      - ${results.properties} properties
      - ${results.neighborhoods} neighborhoods
      - ${results.priceHistory} price history entries
      - ${results.deals} deals
      - ${results.serviceRequests} service requests
      - ${results.dealActivity} deal activities
      - ${results.dealMessages} deal messages
      - ${results.conversations} conversations (${results.conversations - 1} direct, 1 group)
      - ${results.directMessages} direct messages
      - ${results.posts} posts
      - ${results.comments} comments
      - ${results.likes} likes
      - ${results.saves} saves
      - ${results.follows} follows
      - ${results.notifications} notifications

      Note: Deal files skipped (require actual file uploads via Convex storage)`,
    };
  },
});
