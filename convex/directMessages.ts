import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { createNotification } from "./notifications";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List messages for a conversation
 */
export const list = query({
  args: { conversationId: v.id("conversations") },
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

    // Get the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return [];
    }

    // Verify user is a participant
    if (!conversation.participantIds.includes(user._id)) {
      return [];
    }

    // Get messages sorted by time (ascending for chat display)
    const messages = await ctx.db
      .query("directMessages")
      .withIndex("by_conversation_and_time", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    // Enrich with sender info
    const enrichedMessages = await Promise.all(
      messages.map(async (message) => {
        const sender = await ctx.db.get(message.senderId);
        return {
          ...message,
          senderName: sender?.name || sender?.email || "Unknown",
          senderImageUrl: sender?.imageUrl,
        };
      })
    );

    return enrichedMessages;
  },
});

/**
 * Get unread count for a conversation
 */
export const getUnreadCount = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
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

    // Get the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return 0;
    }

    // Verify user is a participant
    if (!conversation.participantIds.includes(user._id)) {
      return 0;
    }

    // Get all messages for this conversation
    const messages = await ctx.db
      .query("directMessages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    // Count unread messages (not sent by user and not in readBy array)
    const unreadCount = messages.filter(
      (msg) =>
        msg.senderId !== user._id && !msg.readBy.includes(user._id)
    ).length;

    return unreadCount;
  },
});

/**
 * Get total unread count across all conversations
 */
export const getTotalUnreadCount = query({
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

    // Get all conversations user is part of
    const allConversations = await ctx.db.query("conversations").collect();

    const userConversations = allConversations.filter((conv) =>
      conv.participantIds.includes(user._id)
    );

    // Count unread messages across all conversations
    let totalUnread = 0;

    for (const conv of userConversations) {
      const messages = await ctx.db
        .query("directMessages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", conv._id)
        )
        .collect();

      totalUnread += messages.filter(
        (msg) =>
          msg.senderId !== user._id && !msg.readBy.includes(user._id)
      ).length;
    }

    return totalUnread;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Send a message in a conversation
 */
export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    content: v.string(),
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

    // Get the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Verify user is a participant
    if (!conversation.participantIds.includes(user._id)) {
      throw new Error("Not a participant in this conversation");
    }

    // Validate content
    const trimmedContent = args.content.trim();
    if (!trimmedContent) {
      throw new Error("Message content cannot be empty");
    }

    const now = Date.now();

    // Create the message
    const messageId = await ctx.db.insert("directMessages", {
      conversationId: args.conversationId,
      senderId: user._id,
      content: trimmedContent,
      status: "sent",
      readBy: [user._id], // Sender has read their own message
      createdAt: now,
    });

    // Update conversation's updatedAt
    await ctx.db.patch(args.conversationId, {
      updatedAt: now,
    });

    // Send notifications to other participants
    const senderName = user.name || user.email || "Someone";
    const truncatedMessage =
      trimmedContent.length > 100
        ? trimmedContent.substring(0, 100) + "..."
        : trimmedContent;

    // Get conversation name for group chats or other user's name for direct
    let conversationName: string;
    if (conversation.type === "group") {
      conversationName = conversation.name || "Group Chat";
    } else {
      conversationName = senderName;
    }

    for (const participantId of conversation.participantIds) {
      if (participantId !== user._id) {
        await createNotification(ctx, {
          userId: participantId,
          type: "new_message",
          title: `${senderName} sent you a message`,
          message: truncatedMessage,
          link: `/chat?conversation=${args.conversationId}`,
          metadata: {
            senderId: user._id,
          },
        });
      }
    }

    return messageId;
  },
});

/**
 * Mark messages in a conversation as read
 */
export const markAsRead = mutation({
  args: { conversationId: v.id("conversations") },
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

    // Get the conversation
    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Verify user is a participant
    if (!conversation.participantIds.includes(user._id)) {
      throw new Error("Not a participant in this conversation");
    }

    // Get all unread messages for this user in this conversation
    const messages = await ctx.db
      .query("directMessages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    const unreadMessages = messages.filter(
      (msg) =>
        msg.senderId !== user._id && !msg.readBy.includes(user._id)
    );

    // Mark all as read by adding user to readBy array
    await Promise.all(
      unreadMessages.map((msg) =>
        ctx.db.patch(msg._id, {
          readBy: [...msg.readBy, user._id],
          status: "read",
        })
      )
    );

    return unreadMessages.length;
  },
});
