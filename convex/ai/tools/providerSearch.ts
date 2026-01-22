import { createTool } from "@convex-dev/agent";
import { z } from "zod";
import { api } from "../../_generated/api";

/**
 * Provider type for tool results
 */
type ProviderResult = {
  _id: string;
  name: string;
  imageUrl?: string;
  providerType: "broker" | "mortgage_advisor" | "lawyer";
  companyName?: string;
  yearsExperience: number;
  specializations: string[];
  serviceAreas: string[];
  languages: string[];
  bio?: string;
  avgRating: number;
  totalReviews: number;
  completedDeals: number;
  acceptingNewClients: boolean;
};

/**
 * Provider search tool for the AI agent.
 *
 * This tool allows the AI to search for service providers in the database
 * based on investor criteria like role, location, and language preferences.
 *
 * The tool is RAG-grounded: it only returns providers that actually exist
 * in the database, preventing hallucination of provider details.
 */
export const searchProvidersTool = createTool({
  description: `Search for service providers (brokers, mortgage advisors, lawyers) based on investor criteria.
Use this tool when:
- Investor asks for team recommendations or building their dream team
- Investor wants help finding a broker, mortgage advisor, or lawyer
- After showing properties, to suggest team building (proactive recommendation)
- Investor asks about next steps in their investment journey

This tool searches the actual provider database and returns real professionals.
NEVER invent or hallucinate providers - only mention providers returned by this tool.`,
  args: z.object({
    roles: z
      .array(z.enum(["broker", "mortgage_advisor", "lawyer"]))
      .describe("Provider roles to search"),
    serviceAreas: z
      .array(z.string())
      .optional()
      .describe(
        "Israeli cities from investor's target locations (e.g., ['Tel Aviv', 'Jerusalem'])"
      ),
    languages: z
      .array(z.enum(["english", "hebrew", "russian", "french", "spanish"]))
      .optional()
      .describe("Investor's language preferences"),
    maxPerRole: z
      .number()
      .default(3)
      .describe("Max providers per role (default 3, max 5)"),
  }),
  handler: async (
    ctx,
    args
  ): Promise<{
    providersByRole: {
      broker?: ProviderResult[];
      mortgage_advisor?: ProviderResult[];
      lawyer?: ProviderResult[];
    };
    totalCount: number;
    searchCriteria: {
      roles: ("broker" | "mortgage_advisor" | "lawyer")[];
      serviceAreas?: string[];
      languages?: ("english" | "hebrew" | "russian" | "french" | "spanish")[];
    };
    message: string;
  }> => {
    // Cap maxPerRole at 5
    const limit = Math.min(args.maxPerRole, 5);

    // Search for each requested role
    const providersByRole: {
      broker?: ProviderResult[];
      mortgage_advisor?: ProviderResult[];
      lawyer?: ProviderResult[];
    } = {};

    let totalCount = 0;

    for (const role of args.roles) {
      const providers = (await ctx.runQuery(
        api.ai.tools.providerQueries.searchProviders,
        {
          providerType: role,
          serviceAreas: args.serviceAreas,
          languages: args.languages,
          limit,
        }
      )) as ProviderResult[];

      providersByRole[role] = providers;
      totalCount += providers.length;
    }

    // Build search criteria for UI
    const searchCriteria = {
      roles: args.roles,
      serviceAreas: args.serviceAreas,
      languages: args.languages,
    };

    // Build descriptive message
    const counts: string[] = [];
    if (providersByRole.broker?.length) {
      counts.push(`${providersByRole.broker.length} broker${providersByRole.broker.length > 1 ? "s" : ""}`);
    }
    if (providersByRole.mortgage_advisor?.length) {
      counts.push(
        `${providersByRole.mortgage_advisor.length} mortgage advisor${providersByRole.mortgage_advisor.length > 1 ? "s" : ""}`
      );
    }
    if (providersByRole.lawyer?.length) {
      counts.push(`${providersByRole.lawyer.length} lawyer${providersByRole.lawyer.length > 1 ? "s" : ""}`);
    }

    const message =
      totalCount > 0
        ? `Found ${totalCount} providers: ${counts.join(", ")}`
        : "No providers match the specified criteria";

    return {
      providersByRole,
      totalCount,
      searchCriteria,
      message,
    };
  },
});
