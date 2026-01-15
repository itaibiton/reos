import { v } from "convex/values";
import { mutation, query, QueryCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// File category type
const fileCategory = v.union(
  v.literal("contract"),
  v.literal("id_document"),
  v.literal("financial"),
  v.literal("legal"),
  v.literal("other")
);

// File visibility type
const fileVisibility = v.union(
  v.literal("all"),
  v.literal("providers_only")
);

// Helper: Check if user is a deal participant
async function isDealParticipant(
  ctx: QueryCtx,
  dealId: Id<"deals">,
  userId: Id<"users">
): Promise<boolean> {
  const deal = await ctx.db.get(dealId);
  if (!deal) return false;

  return (
    deal.investorId === userId ||
    deal.brokerId === userId ||
    deal.mortgageAdvisorId === userId ||
    deal.lawyerId === userId
  );
}

// Helper: Check if user is a service provider on the deal
async function isServiceProvider(
  ctx: QueryCtx,
  dealId: Id<"deals">,
  userId: Id<"users">
): Promise<boolean> {
  const deal = await ctx.db.get(dealId);
  if (!deal) return false;

  return (
    deal.brokerId === userId ||
    deal.mortgageAdvisorId === userId ||
    deal.lawyerId === userId
  );
}

// Generate an upload URL for client-side uploads
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.storage.generateUploadUrl();
  },
});

// Save file metadata after upload
export const saveFile = mutation({
  args: {
    dealId: v.id("deals"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    category: fileCategory,
    description: v.optional(v.string()),
    visibility: fileVisibility,
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

    // Verify user is deal participant or admin
    const isParticipant = await isDealParticipant(ctx, args.dealId, user._id);
    if (!isParticipant && user.role !== "admin") {
      throw new Error("Not authorized to upload files to this deal");
    }

    const fileId = await ctx.db.insert("dealFiles", {
      dealId: args.dealId,
      uploadedBy: user._id,
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      category: args.category,
      description: args.description,
      visibility: args.visibility,
      createdAt: Date.now(),
    });

    return fileId;
  },
});

// Delete a file
export const deleteFile = mutation({
  args: {
    fileId: v.id("dealFiles"),
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

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new Error("File not found");
    }

    // Only uploader or admin can delete
    if (file.uploadedBy !== user._id && user.role !== "admin") {
      throw new Error("Not authorized to delete this file");
    }

    // Delete from storage
    await ctx.storage.delete(file.storageId);

    // Delete record
    await ctx.db.delete(args.fileId);

    return { success: true };
  },
});

// List files for a deal
export const listForDeal = query({
  args: {
    dealId: v.id("deals"),
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

    // Check access
    const isParticipant = await isDealParticipant(ctx, args.dealId, user._id);
    if (!isParticipant && user.role !== "admin") {
      return [];
    }

    // Get all files for this deal
    let files = await ctx.db
      .query("dealFiles")
      .withIndex("by_deal", (q) => q.eq("dealId", args.dealId))
      .collect();

    // If user is investor (not a service provider), exclude providers_only files
    const isProvider = await isServiceProvider(ctx, args.dealId, user._id);
    if (!isProvider && user.role !== "admin") {
      files = files.filter((file) => file.visibility !== "providers_only");
    }

    // Get download URLs and uploader info for each file
    const filesWithUrls = await Promise.all(
      files.map(async (file) => {
        const url = await ctx.storage.getUrl(file.storageId);
        const uploader = await ctx.db.get(file.uploadedBy);
        return {
          ...file,
          url,
          uploaderName: uploader?.name || uploader?.email || "Unknown",
        };
      })
    );

    // Sort by most recent first
    filesWithUrls.sort((a, b) => b.createdAt - a.createdAt);

    return filesWithUrls;
  },
});

// Get download URL for a specific file
export const getDownloadUrl = query({
  args: {
    fileId: v.id("dealFiles"),
  },
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

    const file = await ctx.db.get(args.fileId);
    if (!file) {
      return null;
    }

    // Check deal access
    const isParticipant = await isDealParticipant(ctx, file.dealId, user._id);
    if (!isParticipant && user.role !== "admin") {
      return null;
    }

    // Check visibility for investors
    const isProvider = await isServiceProvider(ctx, file.dealId, user._id);
    if (
      file.visibility === "providers_only" &&
      !isProvider &&
      user.role !== "admin"
    ) {
      return null;
    }

    const url = await ctx.storage.getUrl(file.storageId);
    return url;
  },
});
