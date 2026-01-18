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

// Deal stages - investor progresses through these
export const dealStage = v.union(
  v.literal("interest"),        // Investor expressed interest
  v.literal("broker_assigned"), // Broker is working with investor
  v.literal("mortgage"),        // With mortgage advisor
  v.literal("legal"),           // With lawyer
  v.literal("closing"),         // In final closing process
  v.literal("completed"),       // Deal closed
  v.literal("cancelled")        // Deal cancelled at any stage
);

// Service request status
const requestStatus = v.union(
  v.literal("pending"),   // Request sent, awaiting provider response
  v.literal("accepted"),  // Provider accepted
  v.literal("declined"),  // Provider declined
  v.literal("cancelled")  // Investor cancelled request
);

// Deal file categories
const fileCategory = v.union(
  v.literal("contract"),
  v.literal("id_document"),
  v.literal("financial"),
  v.literal("legal"),
  v.literal("other")
);

// File visibility - who can see the file
const fileVisibility = v.union(
  v.literal("all"),            // All deal participants
  v.literal("providers_only")  // Only service providers
);

// Deal activity types - for audit trail
const activityType = v.union(
  v.literal("stage_change"),
  v.literal("provider_assigned"),
  v.literal("provider_removed"),
  v.literal("file_uploaded"),
  v.literal("file_deleted"),
  v.literal("note_added"),
  v.literal("handoff_initiated"),
  v.literal("handoff_completed")
);

// Message status for chat
const messageStatus = v.union(
  v.literal("sent"),
  v.literal("delivered"),
  v.literal("read")
);

// Notification types
const notificationType = v.union(
  v.literal("new_message"),
  v.literal("deal_stage_change"),
  v.literal("file_uploaded"),
  v.literal("request_received"),
  v.literal("request_accepted"),
  v.literal("request_declined")
);

// Investor questionnaire status
const questionnaireStatus = v.union(
  v.literal("draft"),
  v.literal("complete")
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
    // Onboarding step tracking (0 = not started, 1 = role selected, 2+ = questionnaire progress)
    onboardingStep: v.optional(v.number()),
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

  // Deals - tracking investor-property transactions through stages
  deals: defineTable({
    // Core references
    propertyId: v.id("properties"),
    investorId: v.id("users"),

    // Current stage
    stage: dealStage,

    // Service provider assignments (added as deal progresses)
    brokerId: v.optional(v.id("users")),
    mortgageAdvisorId: v.optional(v.id("users")),
    lawyerId: v.optional(v.id("users")),

    // Deal info
    offerPrice: v.optional(v.number()), // USD
    notes: v.optional(v.string()),

    // Stage history tracking
    stageHistory: v.array(v.object({
      stage: dealStage,
      timestamp: v.number(),
      notes: v.optional(v.string()),
    })),

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_investor", ["investorId"])
    .index("by_property", ["propertyId"])
    .index("by_stage", ["stage"])
    .index("by_broker", ["brokerId"])
    .index("by_mortgage_advisor", ["mortgageAdvisorId"])
    .index("by_lawyer", ["lawyerId"]),

  // Service requests - investors requesting providers for deals
  serviceRequests: defineTable({
    // References
    dealId: v.id("deals"),
    investorId: v.id("users"),
    providerId: v.id("users"),

    // What type of provider (broker, mortgage_advisor, lawyer)
    providerType: providerType,

    // Status
    status: requestStatus,

    // Messages
    investorMessage: v.optional(v.string()), // Initial request message
    providerResponse: v.optional(v.string()), // Response when accept/decline

    // Timestamps
    createdAt: v.number(),
    respondedAt: v.optional(v.number()),
  })
    .index("by_deal", ["dealId"])
    .index("by_investor", ["investorId"])
    .index("by_provider", ["providerId"])
    .index("by_provider_and_status", ["providerId", "status"]),

  // Deal files - documents attached to deals
  dealFiles: defineTable({
    // References
    dealId: v.id("deals"),
    uploadedBy: v.id("users"),

    // File info
    storageId: v.id("_storage"), // Convex file storage ID
    fileName: v.string(),        // Original filename
    fileType: v.string(),        // MIME type
    fileSize: v.number(),        // Bytes

    // Categorization
    category: fileCategory,

    // Optional description
    description: v.optional(v.string()),

    // Visibility: who can see this file
    visibility: fileVisibility,

    // Timestamps
    createdAt: v.number(),
  })
    .index("by_deal", ["dealId"])
    .index("by_uploader", ["uploadedBy"]),

  // Deal activity log - audit trail for all deal events
  dealActivity: defineTable({
    // Reference to deal
    dealId: v.id("deals"),
    // Who performed the action
    actorId: v.id("users"),
    // What type of activity
    activityType: activityType,

    // Details based on activity type
    details: v.object({
      fromStage: v.optional(v.string()),
      toStage: v.optional(v.string()),
      providerId: v.optional(v.id("users")),
      providerType: v.optional(v.string()),
      fileId: v.optional(v.id("dealFiles")),
      fileName: v.optional(v.string()),
      note: v.optional(v.string()),
    }),

    // Timestamp
    createdAt: v.number(),
  })
    .index("by_deal", ["dealId"])
    .index("by_deal_and_time", ["dealId", "createdAt"]),

  // Messages - chat between deal participants
  messages: defineTable({
    // Conversation context
    dealId: v.id("deals"),
    senderId: v.id("users"),
    recipientId: v.id("users"),

    // Message content
    content: v.string(),

    // Status tracking
    status: messageStatus,
    readAt: v.optional(v.number()),

    // Timestamps
    createdAt: v.number(),
  })
    .index("by_deal", ["dealId"])
    .index("by_deal_and_time", ["dealId", "createdAt"])
    .index("by_sender", ["senderId"])
    .index("by_recipient", ["recipientId"])
    .index("by_conversation", ["dealId", "senderId", "recipientId"]),

  // Notifications - real-time alerts for users
  notifications: defineTable({
    // Recipient of the notification
    userId: v.id("users"),

    // Notification type
    type: notificationType,

    // Display content
    title: v.string(),
    message: v.string(),

    // Read status
    read: v.boolean(),

    // Optional link to navigate to when clicked
    link: v.optional(v.string()),

    // Additional metadata for context
    metadata: v.object({
      dealId: v.optional(v.id("deals")),
      propertyId: v.optional(v.id("properties")),
      senderId: v.optional(v.id("users")),
      fileId: v.optional(v.id("dealFiles")),
      requestId: v.optional(v.id("serviceRequests")),
    }),

    // Timestamp
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_read", ["userId", "read"])
    .index("by_user_and_time", ["userId", "createdAt"]),

  // Investor questionnaires - stores draft and completed questionnaire data
  investorQuestionnaires: defineTable({
    // Reference to user
    userId: v.id("users"),

    // Status: draft while in progress, complete when finished
    status: questionnaireStatus,

    // Current step in the questionnaire (1-based for Phase 10+ UI)
    currentStep: v.number(),

    // Draft answers - basic fields for Phase 9 gate, expanded in Phases 11-14
    citizenship: v.optional(v.string()), // "israeli" | "non_israeli"
    residencyStatus: v.optional(v.string()), // "resident" | "returning_resident" | "non_resident" | "unsure"
    experienceLevel: v.optional(v.string()), // "none" | "some" | "experienced"
    ownsPropertyInIsrael: v.optional(v.boolean()),
    investmentType: v.optional(v.string()), // "residential" | "investment"

    // Phase 12 fields - financial context
    budgetMin: v.optional(v.number()), // USD minimum
    budgetMax: v.optional(v.number()), // USD maximum
    investmentHorizon: v.optional(v.string()), // "short_term" | "medium_term" | "long_term"
    investmentGoals: v.optional(v.array(v.string())), // ["appreciation", "rental_income", "diversification", "tax_benefits"]
    yieldPreference: v.optional(v.string()), // "rental_yield" | "appreciation" | "balanced"
    financingApproach: v.optional(v.string()), // "cash" | "mortgage" | "exploring"

    // Phase 13 fields - property preferences & location
    preferredPropertyTypes: v.optional(v.array(v.string())), // from PROPERTY_TYPES
    preferredLocations: v.optional(v.array(v.string())), // from ISRAELI_LOCATIONS
    minBedrooms: v.optional(v.number()),
    maxBedrooms: v.optional(v.number()),
    minArea: v.optional(v.number()), // in sqm
    maxArea: v.optional(v.number()), // in sqm
    preferredAmenities: v.optional(v.array(v.string())), // from PROPERTY_AMENITIES
    locationFlexibility: v.optional(v.string()), // "flexible" | "specific" | "nearby_cities"

    // Phase 14 fields - AI preferences & service selection
    purchaseTimeline: v.optional(v.string()), // "3_months" | "6_months" | "1_year" | "exploring"
    additionalPreferences: v.optional(v.string()), // free-text up to 2000 chars
    servicesNeeded: v.optional(v.array(v.string())), // ["broker", "mortgage_advisor", "lawyer"]

    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
