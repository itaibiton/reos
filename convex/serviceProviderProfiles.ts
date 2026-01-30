import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { createNotification } from "./notifications";

// Helper: resolve custom profile photo URL (prefer custom upload over Clerk photo)
async function resolveProfilePhotoUrl(
  ctx: any,
  user: { imageUrl?: string; customImageStorageId?: any }
): Promise<string | undefined> {
  if (user.customImageStorageId) {
    const customUrl = await ctx.storage.getUrl(user.customImageStorageId);
    if (customUrl) return customUrl;
  }
  return user.imageUrl;
}

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
// Returns full profile with user name and email for wizard pre-population and resubmission
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
    if (!user.role || user.role === "investor" || user.role === "admin") {
      return null;
    }

    // Get service provider profile
    const profile = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!profile) {
      return null;
    }

    // Return full profile object with user data for wizard
    return {
      profile,
      userName: user.name || user.email || "",
      userEmail: user.email,
    };
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

    // Check for existing profile
    const existingProfile = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    const now = Date.now();

    // Map user role to provider type
    const providerType = user.role as "broker" | "mortgage_advisor" | "lawyer";

    if (existingProfile) {
      // Update existing profile (do NOT change approvalStatus)
      await ctx.db.patch(existingProfile._id, {
        ...args,
        providerType,
        updatedAt: now,
      });
      return existingProfile._id;
    } else {
      // Create new profile with default notification preferences
      const defaultNotificationPreferences = {
        emailNotifications: true,
        inAppNotifications: true,
        newMessageNotify: true,
        dealStageNotify: true,
        fileUploadedNotify: true,
        requestReceivedNotify: true,
      };

      return await ctx.db.insert("serviceProviderProfiles", {
        userId: user._id,
        providerType,
        ...args,
        acceptingNewClients: true, // Default to accepting
        notificationPreferences: defaultNotificationPreferences,
        approvalStatus: "draft", // New profiles start as draft
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

    // Filter out unapproved vendors (grandfathering: undefined = approved)
    providers = providers.filter(
      (p) => p.approvalStatus === "approved" || p.approvalStatus === undefined
    );

    // Filter by service area if specified
    if (args.serviceArea) {
      providers = providers.filter((p) =>
        p.serviceAreas.includes(args.serviceArea!)
      );
    }

    // Get user info for each provider (with custom photo)
    const providersWithUser = await Promise.all(
      providers.map(async (provider) => {
        const user = await ctx.db.get(provider.userId);
        const photoUrl = user ? await resolveProfilePhotoUrl(ctx, user) : undefined;
        return {
          ...provider,
          name: user?.name,
          email: user?.email,
          imageUrl: photoUrl || user?.imageUrl,
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

    // Filter out unapproved vendors (grandfathering: undefined = approved)
    providers = providers.filter(
      (p) => p.approvalStatus === "approved" || p.approvalStatus === undefined
    );

    // Filter by city if provided (check serviceAreas)
    if (args.city) {
      providers = providers.filter((p) =>
        p.serviceAreas.some(
          (area) => area.toLowerCase() === args.city!.toLowerCase()
        )
      );
    }

    // Get user info for each provider (with custom photo)
    const providersWithUser = await Promise.all(
      providers.map(async (provider) => {
        const user = await ctx.db.get(provider.userId);
        const photoUrl = user ? await resolveProfilePhotoUrl(ctx, user) : undefined;
        return {
          ...provider,
          name: user?.name,
          email: user?.email,
          imageUrl: photoUrl || user?.imageUrl,
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

    // Return combined profile + user info (with custom photo)
    const photoUrl = await resolveProfilePhotoUrl(ctx, user);
    return {
      ...profile,
      name: user.name,
      email: user.email,
      imageUrl: photoUrl || user.imageUrl,
    };
  },
});

// Get public profile with all data needed for the public profile page
// Combines: profile, user info, stats, recent reviews, portfolio (completed deals)
export const getPublicProfile = query({
  args: {
    providerId: v.id("users"),
  },
  handler: async (ctx, args) => {
    // Get user
    const user = await ctx.db.get(args.providerId);
    if (!user) {
      return null;
    }

    // Check if user is a service provider
    if (!user.role || user.role === "investor" || user.role === "admin") {
      return null;
    }

    // Get service provider profile
    const profile = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_user", (q) => q.eq("userId", args.providerId))
      .unique();

    if (!profile) {
      return null;
    }

    // Visibility check: hide unapproved profiles from non-owners and non-admins
    if (
      profile.approvalStatus !== "approved" &&
      profile.approvalStatus !== undefined
    ) {
      // Get current user
      const identity = await ctx.auth.getUserIdentity();
      let currentUser = null;
      if (identity) {
        currentUser = await ctx.db
          .query("users")
          .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
          .unique();
      }

      // Check if current user is the owner or an admin
      const isOwner = currentUser?._id === args.providerId;
      const isAdmin = currentUser?.role === "admin";

      if (!isOwner && !isAdmin) {
        return null;
      }
    }

    // Get reviews for this provider
    const allReviews = await ctx.db
      .query("providerReviews")
      .withIndex("by_provider", (q) => q.eq("providerId", args.providerId))
      .collect();

    // Sort by createdAt desc and take last 5
    allReviews.sort((a, b) => b.createdAt - a.createdAt);
    const recentReviews = allReviews.slice(0, 5);

    // Enrich reviews with reviewer info and property context
    const enrichedReviews = await Promise.all(
      recentReviews.map(async (review) => {
        const reviewer = await ctx.db.get(review.reviewerId);
        const deal = await ctx.db.get(review.dealId);
        let propertyTitle: string | undefined;

        if (deal) {
          const property = await ctx.db.get(deal.propertyId);
          propertyTitle = property?.title;
        }

        return {
          _id: review._id,
          rating: review.rating,
          reviewText: review.reviewText,
          createdAt: review.createdAt,
          reviewerName: reviewer?.name,
          reviewerImageUrl: reviewer?.imageUrl,
          propertyTitle,
        };
      })
    );

    // Calculate stats
    const totalReviews = allReviews.length;
    const averageRating =
      totalReviews > 0
        ? Math.round(
            (allReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) *
              10
          ) / 10
        : 0;

    // Count completed deals where this provider was assigned
    const allCompletedDeals = await ctx.db
      .query("deals")
      .withIndex("by_stage", (q) => q.eq("stage", "completed"))
      .collect();

    const providerCompletedDeals = allCompletedDeals.filter(
      (deal) =>
        deal.brokerId === args.providerId ||
        deal.mortgageAdvisorId === args.providerId ||
        deal.lawyerId === args.providerId
    );

    // Get last 5 completed deals for portfolio
    const portfolioDeals = providerCompletedDeals
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, 5);

    // Enrich portfolio with property info
    const portfolio = await Promise.all(
      portfolioDeals.map(async (deal) => {
        const property = await ctx.db.get(deal.propertyId);

        return {
          dealId: deal._id,
          propertyId: deal.propertyId,
          propertyTitle: property?.title,
          propertyCity: property?.city,
          propertyImage: property?.featuredImage ?? property?.images[0],
          soldPrice: property?.soldPrice ?? deal.offerPrice ?? property?.priceUsd,
          completedAt: deal.updatedAt,
        };
      })
    );

    const stats = {
      averageRating,
      totalReviews,
      completedDeals: providerCompletedDeals.length,
      yearsExperience: profile.yearsExperience ?? 0,
    };

    // Resolve profile photo (prefer custom upload)
    const profilePhotoUrl = await resolveProfilePhotoUrl(ctx, user);

    return {
      // User info
      name: user.name,
      email: user.email,
      imageUrl: profilePhotoUrl || user.imageUrl,
      role: user.role,

      // Profile info
      companyName: profile.companyName,
      licenseNumber: profile.licenseNumber,
      yearsExperience: profile.yearsExperience,
      specializations: profile.specializations,
      serviceAreas: profile.serviceAreas,
      languages: profile.languages,
      bio: profile.bio,
      phoneNumber: profile.phoneNumber,
      preferredContact: profile.preferredContact,
      websiteUrl: profile.websiteUrl,
      externalRecommendations: profile.externalRecommendations,

      // Stats
      stats,

      // Reviews (last 5)
      reviews: enrichedReviews,

      // Portfolio (last 5 completed deals)
      portfolio,
    };
  },
});

// ============================================================================
// VENDOR APPROVAL WORKFLOW (v1.9)
// ============================================================================

// Submit vendor profile for approval (vendor-facing)
export const submitForApproval = mutation({
  args: {},
  handler: async (ctx) => {
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

    // Get profile
    const profile = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!profile) {
      throw new Error("Profile not found");
    }

    // Validate required fields
    if (!profile.bio || profile.bio.trim().length === 0) {
      throw new Error("Bio is required");
    }
    if (!profile.serviceAreas || profile.serviceAreas.length === 0) {
      throw new Error("At least one service area is required");
    }
    if (!profile.languages || profile.languages.length === 0) {
      throw new Error("At least one language is required");
    }
    if (!profile.phoneNumber || profile.phoneNumber.trim().length === 0) {
      throw new Error("Phone number is required");
    }

    const now = Date.now();

    // Update profile to pending status
    await ctx.db.patch(profile._id, {
      approvalStatus: "pending",
      submittedAt: now,
      rejectionReason: undefined,
      updatedAt: now,
    });

    // Notify all admin users
    const admins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "admin"))
      .collect();

    for (const admin of admins) {
      await createNotification(ctx, {
        userId: admin._id,
        type: "vendor_submitted",
        title: "New vendor pending approval",
        message: `${user.name || user.email} submitted their profile for approval`,
        link: "/admin/vendors/pending",
      });
    }

    return { success: true };
  },
});

// Approve vendor (admin-only)
export const approveVendor = mutation({
  args: {
    profileId: v.id("serviceProviderProfiles"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get current user (admin check)
    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!adminUser || adminUser.role !== "admin") {
      throw new Error("Only admins can approve vendors");
    }

    // Get profile
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    // State machine guard: only pending profiles can be approved
    if (profile.approvalStatus !== "pending") {
      throw new Error("Only pending profiles can be approved");
    }

    const now = Date.now();

    // Update profile to approved
    await ctx.db.patch(args.profileId, {
      approvalStatus: "approved",
      reviewedAt: now,
      reviewedBy: adminUser._id,
      updatedAt: now,
    });

    // Mark vendor user as onboarding complete
    await ctx.db.patch(profile.userId, {
      onboardingComplete: true,
      updatedAt: now,
    });

    // Notify vendor
    await createNotification(ctx, {
      userId: profile.userId,
      type: "vendor_approved",
      title: "Profile approved!",
      message: "Your service provider profile has been approved. Welcome to REOS!",
      link: "/dashboard",
    });

    return { success: true };
  },
});

// Reject vendor (admin-only)
export const rejectVendor = mutation({
  args: {
    profileId: v.id("serviceProviderProfiles"),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get current user (admin check)
    const adminUser = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!adminUser || adminUser.role !== "admin") {
      throw new Error("Only admins can reject vendors");
    }

    // Get profile
    const profile = await ctx.db.get(args.profileId);
    if (!profile) {
      throw new Error("Profile not found");
    }

    // State machine guard: only pending profiles can be rejected
    if (profile.approvalStatus !== "pending") {
      throw new Error("Only pending profiles can be rejected");
    }

    const now = Date.now();

    // Update profile to rejected
    await ctx.db.patch(args.profileId, {
      approvalStatus: "rejected",
      reviewedAt: now,
      reviewedBy: adminUser._id,
      rejectionReason: args.reason,
      updatedAt: now,
    });

    // Notify vendor
    const rejectionMessage = args.reason
      ? `Your profile was not approved. Reason: ${args.reason}. You can revise and resubmit.`
      : "Your profile was not approved. Please revise and resubmit.";

    await createNotification(ctx, {
      userId: profile.userId,
      type: "vendor_rejected",
      title: "Profile not approved",
      message: rejectionMessage,
      link: "/onboarding",
    });

    return { success: true };
  },
});

// List pending vendors (admin-only)
export const listPendingVendors = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get current user (admin check)
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user || user.role !== "admin") {
      return [];
    }

    // Query pending vendors
    const pendingProfiles = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_approval_status", (q) => q.eq("approvalStatus", "pending"))
      .collect();

    // Enrich with user data
    const enrichedProfiles = await Promise.all(
      pendingProfiles.map(async (profile) => {
        const vendorUser = await ctx.db.get(profile.userId);
        const photoUrl = vendorUser ? await resolveProfilePhotoUrl(ctx, vendorUser) : undefined;
        return {
          ...profile,
          name: vendorUser?.name,
          email: vendorUser?.email,
          imageUrl: photoUrl || vendorUser?.imageUrl,
        };
      })
    );

    // Sort by submittedAt descending (most recent first)
    enrichedProfiles.sort((a, b) => (b.submittedAt || 0) - (a.submittedAt || 0));

    return enrichedProfiles;
  },
});

// Get my approval status (vendor-facing)
export const getMyApprovalStatus = query({
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

    // Get profile
    const profile = await ctx.db
      .query("serviceProviderProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .unique();

    if (!profile) {
      return null;
    }

    return {
      status: profile.approvalStatus ?? null,
      submittedAt: profile.submittedAt,
      reviewedAt: profile.reviewedAt,
      rejectionReason: profile.rejectionReason,
    };
  },
});
