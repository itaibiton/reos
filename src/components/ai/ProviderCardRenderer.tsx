"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ProviderRecommendationCard,
  ProviderData,
  ProviderSearchCriteria,
} from "./ProviderRecommendationCard";

interface ToolCall {
  toolCallId: string;
  toolName: string;
  args: any;
  result?: any;
}

interface ProviderCardRendererProps {
  toolCalls?: ToolCall[];
  isExecuting?: boolean;
}

/**
 * ProviderCardRenderer - Extracts and renders provider cards from tool results
 *
 * Features:
 * - Shows loading indicator during tool execution ("Searching providers...")
 * - Extracts searchProviders tool results
 * - Groups providers by role in accordion sections
 * - All accordion sections start expanded
 * - Renders ProviderRecommendationCard for each provider
 */
export function ProviderCardRenderer({
  toolCalls,
  isExecuting = false,
}: ProviderCardRendererProps) {
  // Show loading indicator during tool execution
  if (isExecuting) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <HugeiconsIcon
          icon={Loading03Icon}
          size={16}
          className="animate-spin"
        />
        <span>Searching providers...</span>
      </div>
    );
  }

  // No tool calls yet
  if (!toolCalls || toolCalls.length === 0) {
    return null;
  }

  // Find searchProviders tool call
  const searchTool = toolCalls.find(
    (tool) => tool.toolName === "searchProviders"
  );
  if (!searchTool || !searchTool.result) {
    return null;
  }

  // Type-guard the result structure
  const result = searchTool.result;
  if (
    typeof result !== "object" ||
    result === null ||
    typeof result.providersByRole !== "object" ||
    typeof result.totalCount !== "number"
  ) {
    return null;
  }

  const providersByRole = result.providersByRole as Record<string, ProviderData[]>;
  const totalCount = result.totalCount as number;
  const searchCriteria = result.searchCriteria as ProviderSearchCriteria | undefined;

  // No providers found
  if (totalCount === 0) {
    return null;
  }

  // Role labels for display
  const roleLabels: Record<string, string> = {
    broker: "Brokers",
    mortgage_advisor: "Mortgage Advisors",
    lawyer: "Lawyers",
  };

  // Get roles that have providers for defaultValue (all expanded)
  const rolesWithProviders = Object.entries(providersByRole)
    .filter(([, providers]) => providers.length > 0)
    .map(([role]) => role);

  // Build summary string: "X brokers, Y advisors, Z lawyers"
  const summaryParts: string[] = [];
  if (providersByRole.broker?.length) {
    summaryParts.push(`${providersByRole.broker.length} brokers`);
  }
  if (providersByRole.mortgage_advisor?.length) {
    summaryParts.push(`${providersByRole.mortgage_advisor.length} advisors`);
  }
  if (providersByRole.lawyer?.length) {
    summaryParts.push(`${providersByRole.lawyer.length} lawyers`);
  }
  const summary = summaryParts.join(", ");

  return (
    <div className="flex flex-col gap-2 mt-2">
      {/* Summary count */}
      <p className="text-sm text-muted-foreground">
        Found {totalCount} providers: {summary}
      </p>

      {/* Accordion - all sections start expanded */}
      <Accordion
        type="multiple"
        defaultValue={rolesWithProviders}
        className="w-full"
      >
        {Object.entries(providersByRole).map(([role, providers]) => {
          if (providers.length === 0) return null;

          return (
            <AccordionItem key={role} value={role}>
              <AccordionTrigger className="text-base font-semibold">
                {roleLabels[role] || role} ({providers.length})
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2">
                  {providers.map((provider) => (
                    <ProviderRecommendationCard
                      key={provider._id}
                      provider={provider}
                      searchCriteria={searchCriteria}
                    />
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
