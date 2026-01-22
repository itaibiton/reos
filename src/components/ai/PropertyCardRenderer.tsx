"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { PropertyRecommendationCard, PropertyData, SearchCriteria } from "./PropertyRecommendationCard";
import { SaveAllButton } from "./SaveAllButton";
import { Id } from "../../../convex/_generated/dataModel";

interface ToolCall {
  toolCallId: string;
  toolName: string;
  args: any;
  result?: any;
}

interface PropertyCardRendererProps {
  toolCalls?: ToolCall[];
  isExecuting?: boolean;
}

/**
 * PropertyCardRenderer - Extracts and renders property cards from tool results
 *
 * Features:
 * - Shows loading indicator during tool execution ("Searching properties...")
 * - Extracts searchProperties tool results
 * - Type-guards result structure for safety
 * - Renders PropertyRecommendationCard for each property
 * - Shows SaveAllButton for 2+ properties
 */
export function PropertyCardRenderer({
  toolCalls,
  isExecuting = false,
}: PropertyCardRendererProps) {
  // Show loading indicator during tool execution
  if (isExecuting) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
        <HugeiconsIcon
          icon={Loading03Icon}
          size={16}
          className="animate-spin"
        />
        <span>Searching properties...</span>
      </div>
    );
  }

  // No tool calls yet
  if (!toolCalls || toolCalls.length === 0) {
    return null;
  }

  // Find searchProperties tool call
  const searchTool = toolCalls.find((tool) => tool.toolName === "searchProperties");
  if (!searchTool || !searchTool.result) {
    return null;
  }

  // Type-guard the result structure
  const result = searchTool.result;
  if (
    typeof result !== "object" ||
    result === null ||
    !Array.isArray(result.properties)
  ) {
    return null;
  }

  const properties = result.properties as PropertyData[];
  const searchCriteria = result.searchCriteria as SearchCriteria | undefined;

  // No properties found
  if (properties.length === 0) {
    return null;
  }

  // Extract property IDs for SaveAllButton
  const propertyIds = properties.map((p) => p._id as Id<"properties">);

  return (
    <div className="flex flex-col gap-2 mt-2">
      {/* Render property cards */}
      {properties.map((property) => (
        <PropertyRecommendationCard
          key={property._id}
          property={property}
          searchCriteria={searchCriteria}
        />
      ))}

      {/* Save All button for 2+ properties */}
      {properties.length >= 2 && (
        <div className="flex justify-end">
          <SaveAllButton propertyIds={propertyIds} />
        </div>
      )}
    </div>
  );
}
