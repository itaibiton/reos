import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// User roles in the system
// - investor: finds and invests in properties
// - broker: real estate agent connecting investors with properties
// - mortgage_advisor: handles financing for deals
// - lawyer: handles legal process for closing
// - admin: platform administrator with role-switching capability
const userRoles = v.union(
  v.literal("investor"),
  v.literal("broker"),
  v.literal("mortgage_advisor"),
  v.literal("lawyer"),
  v.literal("admin")
);

// Property types for investor preferences
const propertyTypes = v.union(
  v.literal("residential"),
  v.literal("commercial"),
  v.literal("mixed_use"),
  v.literal("land")
);

// Risk tolerance levels
const riskTolerance = v.union(
  v.literal("conservative"),
  v.literal("moderate"),
  v.literal("aggressive")
);

// Investment timeline options
const investmentTimeline = v.union(
  v.literal("short_term"), // < 2 years
  v.literal("medium_term"), // 2-5 years
  v.literal("long_term") // 5+ years
);

// Service provider types
const providerType = v.union(
  v.literal("broker"),
  v.literal("mortgage_advisor"),
  v.literal("lawyer")
);

// Property status
const propertyStatus = v.union(
  v.literal("available"),
  v.literal("pending"),
  v.literal("sold")
);

// Languages spoken
const language = v.union(
  v.literal("english"),
  v.literal("hebrew"),
  v.literal("russian"),
  v.literal("french"),
  v.literal("spanish")
);

// Contact preference
const contactPreference = v.union(
  v.literal("email"),
  v.literal("phone"),
  v.literal("whatsapp")
);

export default defineSchema({
  users: defineTable({
    // Clerk user ID (from JWT subject claim)
    clerkId: v.string(),
    // User email from Clerk
    email: v.string(),
    // Display name
    name: v.optional(v.string()),
    // Profile image URL
    imageUrl: v.optional(v.string()),
    // User's role in the system
    role: v.optional(userRoles),
    // Role the admin is viewing as (for testing different perspectives)
    // Only used by admins - their actual role stays "admin"
    viewingAsRole: v.optional(userRoles),
    // Onboarding completed flag
    onboardingComplete: v.boolean(),
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),

  // Investor investment preferences
  investorProfiles: defineTable({
    // Reference to user
    userId: v.id("users"),

    // Investment preferences
    propertyTypes: v.array(propertyTypes),

    // Target locations (Israeli cities/regions)
    targetLocations: v.array(v.string()),

    // Budget in USD
    budgetMin: v.number(),
    budgetMax: v.number(),

    // Risk tolerance
    riskTolerance: riskTolerance,

    // Target metrics
    targetRoiMin: v.optional(v.number()), // Percentage
    investmentTimeline: v.optional(investmentTimeline),

    // Additional notes
    notes: v.optional(v.string()),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // Service provider business profiles
  serviceProviderProfiles: defineTable({
    // Reference to user
    userId: v.id("users"),

    // Provider type (mirrors user role)
    providerType: providerType,

    // Business information
    companyName: v.optional(v.string()),
    licenseNumber: v.optional(v.string()),
    yearsExperience: v.optional(v.number()),

    // Specializations (depends on provider type)
    specializations: v.array(v.string()),

    // Service areas (Israeli cities/regions they cover)
    serviceAreas: v.array(v.string()),

    // Languages spoken
    languages: v.array(language),

    // Bio/description
    bio: v.optional(v.string()),

    // Contact preferences
    phoneNumber: v.optional(v.string()),
    preferredContact: v.optional(contactPreference),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_provider_type", ["providerType"]),

  // Property listings
  properties: defineTable({
    // Core fields
    title: v.string(),
    description: v.string(),
    address: v.string(),
    city: v.string(), // Israeli city from ISRAELI_LOCATIONS
    latitude: v.optional(v.number()), // Decimal degrees
    longitude: v.optional(v.number()), // Decimal degrees
    propertyType: propertyTypes,
    status: propertyStatus,

    // Pricing
    priceUsd: v.number(),
    priceIls: v.number(), // Calculated or entered

    // Investment metrics
    expectedRoi: v.optional(v.number()), // Percentage
    cashOnCash: v.optional(v.number()), // Percentage
    capRate: v.optional(v.number()), // Percentage
    monthlyRent: v.optional(v.number()), // USD

    // Property details
    bedrooms: v.optional(v.number()),
    bathrooms: v.optional(v.number()),
    squareMeters: v.optional(v.number()),
    yearBuilt: v.optional(v.number()),

    // Amenities - flexible string array for amenity keys
    amenities: v.optional(v.array(v.string())),

    // Media
    images: v.array(v.string()), // URLs for now, file storage later
    featuredImage: v.optional(v.string()), // Main image URL

    // Sale info (for sold properties)
    soldDate: v.optional(v.number()), // Timestamp when sold
    soldPrice: v.optional(v.number()), // Final sale price in USD

    // Metadata
    createdBy: v.id("users"), // Admin/user who uploaded
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_city", ["city"])
    .index("by_property_type", ["propertyType"])
    .index("by_status", ["status"])
    .index("by_price", ["priceUsd"]),

  // Neighborhood data for city/area statistics
  neighborhoods: defineTable({
    city: v.string(), // Israeli city
    population: v.optional(v.number()),
    avgPricePerSqm: v.number(), // USD per square meter
    priceChange1Year: v.optional(v.number()), // Percentage change
    nearbyAmenities: v.array(v.string()), // ["schools", "parks", "shopping", "transit", "beaches", "hospitals"]
    description: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_city", ["city"]),

  // Price history for properties and market averages
  priceHistory: defineTable({
    propertyId: v.optional(v.id("properties")), // null for area-wide market data
    city: v.string(),
    date: v.number(), // timestamp
    priceUsd: v.number(), // price at that date
    eventType: v.union(
      v.literal("listing"),
      v.literal("sale"),
      v.literal("market_avg")
    ),
    createdAt: v.number(),
  }).index("by_city", ["city"]),

  // User favorites (saved properties)
  favorites: defineTable({
    // Reference to user
    userId: v.id("users"),
    // Reference to property
    propertyId: v.id("properties"),
    // Timestamp
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_property", ["propertyId"])
    .index("by_user_and_property", ["userId", "propertyId"]),
});
