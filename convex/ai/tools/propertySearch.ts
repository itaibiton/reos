import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { api } from "../../_generated/api";

/**
 * Property search tool for the AI agent.
 *
 * This tool allows the AI to search for real properties in the database
 * based on investor criteria like budget, location, and property type.
 *
 * The tool is RAG-grounded: it only returns properties that actually exist
 * in the database, preventing hallucination of property details.
 */
export const searchPropertiesTool = createTool({
  description: `Search for real estate properties based on investor criteria.
Use this tool when:
- Investor asks for property recommendations
- Investor specifies budget, location, or property type preferences
- Investor wants to see available properties

This tool searches the actual property database and returns real listings.
NEVER invent or hallucinate properties - only mention properties returned by this tool.`,
  args: z.object({
    budgetMin: z
      .number()
      .optional()
      .describe("Minimum budget in USD (e.g., 200000)"),
    budgetMax: z
      .number()
      .optional()
      .describe("Maximum budget in USD (e.g., 500000)"),
    cities: z
      .array(z.string())
      .optional()
      .describe(
        "Israeli cities to search (e.g., ['Tel Aviv', 'Jerusalem', 'Haifa'])"
      ),
    propertyTypes: z
      .array(
        z.enum(["residential", "commercial", "mixed_use", "land"]).describe(
          "Property type: residential (apartments, houses), commercial (offices, retail), mixed_use (combined), or land (undeveloped)"
        )
      )
      .optional()
      .describe("Types of properties to include in search"),
    minBedrooms: z
      .number()
      .optional()
      .describe("Minimum number of bedrooms (e.g., 2)"),
    maxResults: z
      .number()
      .default(5)
      .describe("Maximum number of results to return (default: 5, max: 5)"),
  }),
  handler: async (ctx, args): Promise<{
    properties: any[];
    count: number;
    searchCriteria: {
      budgetMin?: number;
      budgetMax?: number;
      cities?: string[];
      propertyTypes?: Array<"residential" | "commercial" | "mixed_use" | "land">;
      minBedrooms?: number;
    };
    message: string;
  }> => {
    // Cap maxResults at 5 to avoid overwhelming the chat
    const limit = Math.min(args.maxResults, 5);

    // Call the property search query
    const properties = await ctx.runQuery(
      api.ai.tools.propertyQueries.searchProperties,
      {
        budgetMin: args.budgetMin,
        budgetMax: args.budgetMax,
        cities: args.cities,
        propertyTypes: args.propertyTypes,
        minBedrooms: args.minBedrooms,
        limit,
      }
    );

    // Build search criteria summary for UI match badges
    const searchCriteria = {
      budgetMin: args.budgetMin,
      budgetMax: args.budgetMax,
      cities: args.cities,
      propertyTypes: args.propertyTypes,
      minBedrooms: args.minBedrooms,
    };

    // Return results with metadata
    return {
      properties,
      count: properties.length,
      searchCriteria,
      message:
        properties.length > 0
          ? `Found ${properties.length} property matches`
          : "No properties match the specified criteria",
    };
  },
});
