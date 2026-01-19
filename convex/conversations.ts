import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * List all conversations for current user
 * Returns conversations sorted by most recent activity
 */
export const list = query({
  args: {},
  handler: async (ctx) => {
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

    // Get all conversations sorted by updatedAt
    const allConversations = await ctx.db
      .query("conversations")
      .withIndex("by_updated")
      .order("desc")
      .collect();

    // Filter to conversations where user is a participant
    const userConversations = allConversations.filter((conv) =>
      conv.participantIds.includes(user._id)
    );

    // Enrich with participant info and last message
    const enrichedConversations = await Promise.all(
      userConversations.map(async (conv) => {
        // Get participant details (excluding current user)
        const otherParticipantIds = conv.participantIds.filter(
          (id) => id !== user._id
        );
        const participants = await Promise.all(
          otherParticipantIds.map(async (id) => {
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

        // Get last message
        const lastMessage = await ctx.db
          .query("directMessages")
          .withIndex("by_conversation_and_time", (q) =>
            q.eq("conversationId", conv._id)
          )
          .order("desc")
          .first();

        let lastMessagePreview: string | undefined;
        let lastMessageSenderName: string | undefined;
        let lastMessageTime: number | undefined;

        if (lastMessage) {
          lastMessagePreview =
            lastMessage.content.length > 50
              ? lastMessage.content.substring(0, 50) + "..."
              : lastMessage.content;
          lastMessageTime = lastMessage.createdAt;

          if (lastMessage.senderId === user._id) {
            lastMessageSenderName = "You";
          } else {
            const sender = await ctx.db.get(lastMessage.senderId);
            lastMessageSenderName = sender?.name || sender?.email || "Unknown";
          }
        }

        // Get unread count for this conversation
        const messages = await ctx.db
          .query("directMessages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .collect();

        const unreadCount = messages.filter(
          (msg) =>
            msg.senderId !== user._id && !msg.readBy.includes(user._id)
        ).length;

        return {
          ...conv,
          participants: participants.filter(Boolean),
          lastMessagePreview,
          lastMessageSenderName,
          lastMessageTime,
          unreadCount,
        };
      })
    );

    return enrichedConversations;
  },
});

/**
 * Get a single conversation with full details
 */
export const get = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return null;
    }

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      return null;
    }

    // Verify user is a participant
    if (!conversation.participantIds.includes(user._id)) {
      return null;
    }

    // Get all participant details
    const participants = await Promise.all(
      conversation.participantIds.map(async (id) => {
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

    return {
      ...conversation,
      participants: participants.filter(Boolean),
    };
  },
});

/**
 * Find or create a direct (1-on-1) conversation with another user
 */
export const getOrCreateDirect = mutation({
  args: { otherUserId: v.id("users") },
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

    // Can't start a conversation with yourself
    if (args.otherUserId === user._id) {
      throw new Error("Cannot create a conversation with yourself");
    }

    // Check if the other user exists
    const otherUser = await ctx.db.get(args.otherUserId);
    if (!otherUser) {
      throw new Error("User not found");
    }

    // Look for existing direct conversation between these two users
    const allConversations = await ctx.db
      .query("conversations")
      .collect();

    const existingConversation = allConversations.find(
      (conv) =>
        conv.type === "direct" &&
        conv.participantIds.length === 2 &&
        conv.participantIds.includes(user._id) &&
        conv.participantIds.includes(args.otherUserId)
    );

    if (existingConversation) {
      return existingConversation._id;
    }

    // Create new direct conversation
    const now = Date.now();
    const conversationId = await ctx.db.insert("conversations", {
      type: "direct",
      participantIds: [user._id, args.otherUserId],
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return conversationId;
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create a group conversation
 */
export const createGroup = mutation({
  args: {
    name: v.optional(v.string()),
    participantIds: v.array(v.id("users")),
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

    // Validate participants
    if (args.participantIds.length < 1) {
      throw new Error("Group must have at least one other participant");
    }

    // Verify all participants exist
    for (const participantId of args.participantIds) {
      const participant = await ctx.db.get(participantId);
      if (!participant) {
        throw new Error(`Participant not found: ${participantId}`);
      }
    }

    // Remove duplicates and ensure creator is included
    const uniqueParticipants = [
      ...new Set([user._id, ...args.participantIds]),
    ];

    // Create the group conversation
    const now = Date.now();
    const conversationId = await ctx.db.insert("conversations", {
      type: "group",
      name: args.name,
      participantIds: uniqueParticipants,
      createdBy: user._id,
      createdAt: now,
      updatedAt: now,
    });

    return conversationId;
  },
});

/**
 * Update group conversation (name, participants)
 */
export const updateGroup = mutation({
  args: {
    conversationId: v.id("conversations"),
    name: v.optional(v.string()),
    addParticipants: v.optional(v.array(v.id("users"))),
    removeParticipants: v.optional(v.array(v.id("users"))),
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

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Only group conversations can be updated
    if (conversation.type !== "group") {
      throw new Error("Only group conversations can be updated");
    }

    // User must be a participant
    if (!conversation.participantIds.includes(user._id)) {
      throw new Error("Not a participant in this conversation");
    }

    let updatedParticipants = [...conversation.participantIds];

    // Add new participants
    if (args.addParticipants) {
      for (const participantId of args.addParticipants) {
        const participant = await ctx.db.get(participantId);
        if (!participant) {
          throw new Error(`Participant not found: ${participantId}`);
        }
        if (!updatedParticipants.includes(participantId)) {
          updatedParticipants.push(participantId);
        }
      }
    }

    // Remove participants
    if (args.removeParticipants) {
      updatedParticipants = updatedParticipants.filter(
        (id) => !args.removeParticipants!.includes(id)
      );
    }

    // Group must have at least 2 participants
    if (updatedParticipants.length < 2) {
      throw new Error("Group must have at least 2 participants");
    }

    // Update the conversation
    const updates: {
      name?: string;
      participantIds?: Id<"users">[];
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      updates.name = args.name;
    }

    if (
      args.addParticipants?.length ||
      args.removeParticipants?.length
    ) {
      updates.participantIds = updatedParticipants;
    }

    await ctx.db.patch(args.conversationId, updates);

    return args.conversationId;
  },
});

/**
 * Delete a group conversation (creator only)
 */
export const deleteGroup = mutation({
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

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Only group conversations can be deleted
    if (conversation.type !== "group") {
      throw new Error("Only group conversations can be deleted");
    }

    // Only the creator can delete a group
    if (conversation.createdBy !== user._id) {
      throw new Error("Only the creator can delete this group");
    }

    // Delete all messages in the conversation
    const messages = await ctx.db
      .query("directMessages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId)
      )
      .collect();

    await Promise.all(messages.map((msg) => ctx.db.delete(msg._id)));

    // Delete the conversation
    await ctx.db.delete(args.conversationId);

    return null;
  },
});

/**
 * Leave a group conversation
 */
export const leave = mutation({
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

    const conversation = await ctx.db.get(args.conversationId);
    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Only group conversations can be left
    if (conversation.type !== "group") {
      throw new Error("Cannot leave a direct conversation");
    }

    // User must be a participant
    if (!conversation.participantIds.includes(user._id)) {
      throw new Error("Not a participant in this conversation");
    }

    // Remove user from participants
    const updatedParticipants = conversation.participantIds.filter(
      (id) => id !== user._id
    );

    // If no participants left, delete the conversation
    if (updatedParticipants.length === 0) {
      // Delete all messages first
      const messages = await ctx.db
        .query("directMessages")
        .withIndex("by_conversation", (q) =>
          q.eq("conversationId", args.conversationId)
        )
        .collect();

      await Promise.all(messages.map((msg) => ctx.db.delete(msg._id)));

      // Delete the conversation
      await ctx.db.delete(args.conversationId);
      return null;
    }

    // Update the conversation
    await ctx.db.patch(args.conversationId, {
      participantIds: updatedParticipants,
      updatedAt: Date.now(),
    });

    return args.conversationId;
  },
});
