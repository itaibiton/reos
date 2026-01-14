import { mutation } from "./_generated/server";
import { SEED_PROPERTIES } from "./seedData";

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
