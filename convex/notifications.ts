import { v } from "convex/values";
import { mutation, query, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Notification type validator (matches schema)
const notificationTypeValidator = v.union(
  v.literal("new_message"),
  v.literal("deal_stage_change"),
  v.literal("file_uploaded"),
  v.literal("request_received"),
  v.literal("request_accepted"),
  v.literal("request_declined"),
  v.literal("vendor_submitted"),
  v.literal("vendor_approved"),
  v.literal("vendor_rejected")
);

// Type for notification type
export type NotificationType =
  | "new_message"
  | "deal_stage_change"
  | "file_uploaded"
  | "request_received"
  | "request_accepted"
  | "request_declined"
  | "vendor_submitted"
  | "vendor_approved"
  | "vendor_rejected";

// ============================================================================
// HELPER FUNCTION - For use by other modules
// ============================================================================

/**
 * Create a notification for a user
 * Call this from other mutations to send notifications
 */
export async function createNotification(
  ctx: MutationCtx,
  data: {
    userId: Id<"users">;
    type: NotificationType;
    title: string;
    message: string;
    link?: string;
    metadata?: {
      dealId?: Id<"deals">;
      propertyId?: Id<"properties">;
      senderId?: Id<"users">;
      fileId?: Id<"dealFiles">;
      requestId?: Id<"serviceRequests">;
    };
  }
): Promise<Id<"notifications">> {
  const now = Date.now();

  return await ctx.db.insert("notifications", {
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    read: false,
    link: data.link,
    metadata: data.metadata || {},
    createdAt: now,
  });
}

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List user's notifications (most recent 20)
 * Enriched with sender info when available
 */
export const list = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const limit = args.limit || 20;

    // Get notifications sorted by time (most recent first)
    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_time", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);

    // Enrich with sender info if senderId exists in metadata
    const enrichedNotifications = await Promise.all(
      notifications.map(async (notification) => {
        let senderName: string | undefined;
        let senderImageUrl: string | undefined;

        if (notification.metadata?.senderId) {
          const sender = await ctx.db.get(notification.metadata.senderId);
          if (sender) {
            senderName = sender.name || sender.email || "Unknown";
            senderImageUrl = sender.imageUrl;
          }
        }

        return {
          ...notification,
          senderName,
          senderImageUrl,
        };
      })
    );

    return enrichedNotifications;
  },
});

/**
 * Get count of unread notifications for current user
 */
export const getUnreadCount = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return 0;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return 0;
    }

    // Query unread notifications using the index
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();

    return unreadNotifications.length;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Mark a single notification as read
 */
export const markAsRead = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get the notification
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    // Verify user owns this notification
    if (notification.userId !== user._id) {
      throw new Error("Not authorized to mark this notification as read");
    }

    // Update to read
    await ctx.db.patch(args.notificationId, {
      read: true,
    });

    return args.notificationId;
  },
});

/**
 * Mark all user's notifications as read
 */
export const markAllAsRead = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    // Get all unread notifications for user
    const unreadNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_and_read", (q) =>
        q.eq("userId", user._id).eq("read", false)
      )
      .collect();

    // Mark all as read
    await Promise.all(
      unreadNotifications.map((notification) =>
        ctx.db.patch(notification._id, { read: true })
      )
    );

    return unreadNotifications.length;
  },
});

/**
 * Create a notification (internal use - for calling from other mutations)
 * This is exposed as a mutation for direct testing, but typically
 * use the createNotification helper function from other files
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    type: notificationTypeValidator,
    title: v.string(),
    message: v.string(),
    link: v.optional(v.string()),
    metadata: v.optional(
      v.object({
        dealId: v.optional(v.id("deals")),
        propertyId: v.optional(v.id("properties")),
        senderId: v.optional(v.id("users")),
        fileId: v.optional(v.id("dealFiles")),
        requestId: v.optional(v.id("serviceRequests")),
      })
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const notificationId = await ctx.db.insert("notifications", {
      userId: args.userId,
      type: args.type,
      title: args.title,
      message: args.message,
      read: false,
      link: args.link,
      metadata: args.metadata || {},
      createdAt: now,
    });

    return notificationId;
  },
});
