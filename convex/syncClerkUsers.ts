/**
 * Sync Clerk Users with Convex
 *
 * Updates Convex users table to use actual Clerk user IDs
 */

import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Clerk user IDs from the seed-clerk-users-correct script output
const CLERK_USER_MAPPINGS = {
  "david.cohen@reosbrokers.com": "user_38pwZTADaAQoKjPRdkf56n6XTjT",
  "sarah.levy@tlvproperties.com": "user_38pwZWhX3Eu1yJ2iQOALktcQXZs",
  "michael@jerusalemhomes.com": "user_38pwZZhK41jEuVuuy8QjcSbJZYj",
  "rachel@haifarealty.com": "user_38pwZc1fKLUiFQX4UxOATiYqTZI",
  "yosef@southernproperties.com": "user_38pwZiCrkEZphraXvUFYi76rKNm",
  "natan@mortgageisrael.com": "user_38pwZrtzlmqIUXoOmKwOc3rO5t3",
  "tamar@homeloans.co.il": "user_38pwZpuoj8UM9VJ6fT3wWEAMsYe",
  "avi@finansim.co.il": "user_38pwa3PCEe6HA0FGA7yP7TAVDPT",
  "ruth.katz@katzlaw.co.il": "user_38pwZwXXgwF5TNb198x2SEVxvtK",
  "daniel@peretzlaw.com": "user_38pwa6ajMEvCH7LrONT696iW5OT",
  "miriam@southlegal.co.il": "user_38pwaBgwKCvc7oiMHtyNvLw5reR",
};

export const syncClerkIds = mutation({
  args: {},
  handler: async (ctx) => {
    const results = {
      updated: 0,
      notFound: 0,
      errors: [] as string[],
    };

    for (const [email, clerkId] of Object.entries(CLERK_USER_MAPPINGS)) {
      try {
        // Find user by email
        const user = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("email"), email))
          .first();

        if (!user) {
          results.notFound++;
          results.errors.push(`User not found: ${email}`);
          continue;
        }

        // Update clerkId
        await ctx.db.patch(user._id, {
          clerkId,
          updatedAt: Date.now(),
        });

        results.updated++;
        console.log(`✅ Updated ${email} with Clerk ID: ${clerkId}`);
      } catch (error: any) {
        results.errors.push(`Error updating ${email}: ${error.message}`);
      }
    }

    return {
      success: true,
      results,
      message: `✅ Synced ${results.updated} users with Clerk IDs. Not found: ${results.notFound}. Errors: ${results.errors.length}`,
    };
  },
});
