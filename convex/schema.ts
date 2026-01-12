import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// User roles in the system
// - investor: finds and invests in properties
// - broker: real estate agent connecting investors with properties
// - mortgage_advisor: handles financing for deals
// - lawyer: handles legal process for closing
const userRoles = v.union(
  v.literal("investor"),
  v.literal("broker"),
  v.literal("mortgage_advisor"),
  v.literal("lawyer")
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
    // Onboarding completed flag
    onboardingComplete: v.boolean(),
    // Timestamps
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_role", ["role"]),
});
