import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";
import { createNotification } from "./notifications";

// ============================================================================
// QUERIES
// ============================================================================

// List all messages for a deal (participant access only)
export const listForDeal = query({
  args: { dealId: v.id("deals") },
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

    // Get the deal
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      return [];
    }

    // Check access - user must be a participant
    const isParticipant =
      deal.investorId === user._id ||
      deal.brokerId === user._id ||
      deal.mortgageAdvisorId === user._id ||
      deal.lawyerId === user._id;

    if (!isParticipant && user.role !== "admin") {
      return [];
    }

    // Get messages sorted by time (ascending for chat display)
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_deal_and_time", (q) => q.eq("dealId", args.dealId))
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

// List messages between current user and specific participant
export const listConversation = query({
  args: {
    dealId: v.id("deals"),
    participantId: v.id("users"),
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

    // Get the deal
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      return [];
    }

    // Check access - user must be a participant
    const isParticipant =
      deal.investorId === user._id ||
      deal.brokerId === user._id ||
      deal.mortgageAdvisorId === user._id ||
      deal.lawyerId === user._id;

    if (!isParticipant && user.role !== "admin") {
      return [];
    }

    // Get all messages for this deal
    const allMessages = await ctx.db
      .query("messages")
      .withIndex("by_deal_and_time", (q) => q.eq("dealId", args.dealId))
      .collect();

    // Filter to conversation between current user and participant
    const conversationMessages = allMessages.filter(
      (msg) =>
        (msg.senderId === user._id && msg.recipientId === args.participantId) ||
        (msg.senderId === args.participantId && msg.recipientId === user._id)
    );

    // Enrich with sender info
    const enrichedMessages = await Promise.all(
      conversationMessages.map(async (message) => {
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

// Get unread message count for current user in a deal
export const getUnreadCount = query({
  args: { dealId: v.id("deals") },
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

    // Get all messages where user is recipient
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
      .collect();

    // Count unread (status != "read") where recipient is current user
    const unreadCount = messages.filter(
      (msg) => msg.recipientId === user._id && msg.status !== "read"
    ).length;

    return unreadCount;
  },
});

// Get all participants user can chat with in a deal
export const getDealParticipants = query({
  args: { dealId: v.id("deals") },
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

    // Get the deal
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      return [];
    }

    // Check access - user must be a participant
    const isParticipant =
      deal.investorId === user._id ||
      deal.brokerId === user._id ||
      deal.mortgageAdvisorId === user._id ||
      deal.lawyerId === user._id;

    if (!isParticipant && user.role !== "admin") {
      return [];
    }

    // Collect all participant IDs (excluding current user)
    const participantIds: Id<"users">[] = [];

    if (deal.investorId && deal.investorId !== user._id) {
      participantIds.push(deal.investorId);
    }
    if (deal.brokerId && deal.brokerId !== user._id) {
      participantIds.push(deal.brokerId);
    }
    if (deal.mortgageAdvisorId && deal.mortgageAdvisorId !== user._id) {
      participantIds.push(deal.mortgageAdvisorId);
    }
    if (deal.lawyerId && deal.lawyerId !== user._id) {
      participantIds.push(deal.lawyerId);
    }

    // Fetch user details for each participant
    const participants = await Promise.all(
      participantIds.map(async (id) => {
        const participant = await ctx.db.get(id);
        if (!participant) return null;

        return {
          _id: participant._id,
          name: participant.name || participant.email || "Unknown",
          email: participant.email,
          imageUrl: participant.imageUrl,
          role: participant.role,
        };
      })
    );

    // Filter out nulls
    return participants.filter(Boolean);
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

// Send a message
export const send = mutation({
  args: {
    dealId: v.id("deals"),
    recipientId: v.id("users"),
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

    // Get the deal
    const deal = await ctx.db.get(args.dealId);
    if (!deal) {
      throw new Error("Deal not found");
    }

    // Validate: sender is deal participant
    const isSenderParticipant =
      deal.investorId === user._id ||
      deal.brokerId === user._id ||
      deal.mortgageAdvisorId === user._id ||
      deal.lawyerId === user._id;

    if (!isSenderParticipant && user.role !== "admin") {
      throw new Error("Not authorized to send messages in this deal");
    }

    // Validate: recipient is deal participant
    const isRecipientParticipant =
      deal.investorId === args.recipientId ||
      deal.brokerId === args.recipientId ||
      deal.mortgageAdvisorId === args.recipientId ||
      deal.lawyerId === args.recipientId;

    if (!isRecipientParticipant) {
      throw new Error("Recipient is not a participant in this deal");
    }

    // Validate: content is not empty
    const trimmedContent = args.content.trim();
    if (!trimmedContent) {
      throw new Error("Message content cannot be empty");
    }

    // Create the message
    const now = Date.now();
    const messageId = await ctx.db.insert("messages", {
      dealId: args.dealId,
      senderId: user._id,
      recipientId: args.recipientId,
      content: trimmedContent,
      status: "sent",
      createdAt: now,
    });

    // Create notification for recipient
    const senderName = user.name || user.email || "Someone";
    const truncatedMessage =
      trimmedContent.length > 100
        ? trimmedContent.substring(0, 100) + "..."
        : trimmedContent;

    await createNotification(ctx, {
      userId: args.recipientId,
      type: "new_message",
      title: `${senderName} sent you a message`,
      message: truncatedMessage,
      link: `/deals/${args.dealId}/messages`,
      metadata: {
        dealId: args.dealId,
        senderId: user._id,
      },
    });

    return messageId;
  },
});

// Mark messages as read
export const markAsRead = mutation({
  args: {
    dealId: v.id("deals"),
    senderId: v.id("users"),
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

    // Get all unread messages from sender to current user in this deal
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
      .collect();

    const unreadMessages = messages.filter(
      (msg) =>
        msg.senderId === args.senderId &&
        msg.recipientId === user._id &&
        msg.status !== "read"
    );

    // Update all unread messages to read
    const now = Date.now();
    await Promise.all(
      unreadMessages.map((msg) =>
        ctx.db.patch(msg._id, {
          status: "read",
          readAt: now,
        })
      )
    );

    return unreadMessages.length;
  },
});
