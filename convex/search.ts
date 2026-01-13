import { v } from "convex/values";
import { action } from "./_generated/server";
import Anthropic from "@anthropic-ai/sdk";

// Property filter type for search results
// Matches the args expected by properties.list query
export type PropertyFilters = {
  status?: "available" | "pending" | "sold";
  city?: string;
  propertyType?: "residential" | "commercial" | "mixed_use" | "land";
  priceMin?: number;
  priceMax?: number;
  bedroomsMin?: number;
  bathroomsMin?: number;
  squareMetersMin?: number;
  squareMetersMax?: number;
  limit?: number;
};

// Valid values for filter fields (must match schema and constants)
const VALID_PROPERTY_TYPES = ["residential", "commercial", "mixed_use", "land"];
const VALID_CITIES = [
  "Tel Aviv",
  "Jerusalem",
  "Haifa",
  "Netanya",
  "Herzliya",
  "Ra'anana",
  "Ashdod",
  "Beer Sheva",
  "Eilat",
  "Tiberias",
  "Nahariya",
  "Petah Tikva",
  "Rishon LeZion",
  "Bat Yam",
  "Holon",
];

// System prompt for Claude to parse search queries
const SYSTEM_PROMPT = `You are a search query parser for a real estate investment platform focused on Israeli properties.

Your job is to extract structured filters from natural language search queries.

VALID VALUES:
- propertyType: ${VALID_PROPERTY_TYPES.join(", ")}
- city: ${VALID_CITIES.join(", ")}
- priceMin, priceMax: numbers in USD (user might say "500k" = 500000, "$1M" = 1000000)
- bedroomsMin: minimum number of bedrooms
- bathroomsMin: minimum number of bathrooms
- squareMetersMin, squareMetersMax: size in square meters

MAPPING RULES:
- "apartment" or "house" or "home" → propertyType: "residential"
- "office" or "retail" or "warehouse" → propertyType: "commercial"
- Budget mentions like "under $X" → priceMax: X
- Budget mentions like "from $X" or "at least $X" → priceMin: X
- "3 bedroom" or "3 bed" or "3br" → bedroomsMin: 3

RESPONSE FORMAT:
Return ONLY valid JSON matching this schema (no markdown, no explanation):
{
  "city": "string or null",
  "propertyType": "string or null",
  "priceMin": "number or null",
  "priceMax": "number or null",
  "bedroomsMin": "number or null",
  "bathroomsMin": "number or null",
  "squareMetersMin": "number or null",
  "squareMetersMax": "number or null"
}

Use null for fields that cannot be determined from the query.
Only include fields you can confidently extract.`;

/**
 * Parse a natural language search query into structured property filters.
 *
 * Example usage:
 *   const filters = await parseSearchQuery({ query: "apartments in Tel Aviv under $500k" });
 *   // Returns: { city: "Tel Aviv", propertyType: "residential", priceMax: 500000 }
 *
 * Then pass filters to properties.list query to get matching properties.
 */
export const parseSearchQuery = action({
  args: {
    query: v.string(),
  },
  handler: async (_, args): Promise<PropertyFilters> => {
    // Empty query returns empty filters (show all)
    if (!args.query.trim()) {
      return {};
    }

    try {
      // Initialize Anthropic client
      // API key must be set in Convex environment variables
      const anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });

      // Call Claude to parse the query
      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 256,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Parse this search query into filters: "${args.query}"`,
          },
        ],
      });

      // Extract the text response
      const textBlock = response.content.find((block) => block.type === "text");
      if (!textBlock || textBlock.type !== "text") {
        console.error("No text response from Claude");
        return {};
      }

      // Parse the JSON response
      const parsed = JSON.parse(textBlock.text);

      // Build the filter object, only including non-null values
      const filters: PropertyFilters = {};

      // Validate and add city
      if (parsed.city && VALID_CITIES.includes(parsed.city)) {
        filters.city = parsed.city;
      }

      // Validate and add propertyType
      if (
        parsed.propertyType &&
        VALID_PROPERTY_TYPES.includes(parsed.propertyType)
      ) {
        filters.propertyType = parsed.propertyType as PropertyFilters["propertyType"];
      }

      // Add numeric filters (only if positive numbers)
      if (typeof parsed.priceMin === "number" && parsed.priceMin > 0) {
        filters.priceMin = parsed.priceMin;
      }
      if (typeof parsed.priceMax === "number" && parsed.priceMax > 0) {
        filters.priceMax = parsed.priceMax;
      }
      if (typeof parsed.bedroomsMin === "number" && parsed.bedroomsMin > 0) {
        filters.bedroomsMin = parsed.bedroomsMin;
      }
      if (typeof parsed.bathroomsMin === "number" && parsed.bathroomsMin > 0) {
        filters.bathroomsMin = parsed.bathroomsMin;
      }
      if (
        typeof parsed.squareMetersMin === "number" &&
        parsed.squareMetersMin > 0
      ) {
        filters.squareMetersMin = parsed.squareMetersMin;
      }
      if (
        typeof parsed.squareMetersMax === "number" &&
        parsed.squareMetersMax > 0
      ) {
        filters.squareMetersMax = parsed.squareMetersMax;
      }

      return filters;
    } catch (error) {
      // Log error but return empty filters to allow graceful fallback
      console.error("Error parsing search query:", error);
      return {};
    }
  },
});
