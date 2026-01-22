"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { toast } from "sonner";

/**
 * Hook for adding a provider to the investor's team
 * Returns isOnTeam state and addToTeam function with toast feedback
 */
export function useProviderAdd(
  providerId: Id<"users">,
  providerType: "broker" | "mortgage_advisor" | "lawyer"
) {
  const [isAdding, setIsAdding] = useState(false);
  const addProvider = useMutation(api.teamManagement.addProviderToTeam);
  const activeDeals = useQuery(api.teamManagement.getActiveDealsWithProviders);

  // Compute isOnTeam from activeDeals
  const isOnTeam =
    activeDeals?.some((deal) => {
      if (providerType === "broker") return deal.brokerId === providerId;
      if (providerType === "mortgage_advisor")
        return deal.mortgageAdvisorId === providerId;
      if (providerType === "lawyer") return deal.lawyerId === providerId;
      return false;
    }) ?? false;

  async function addToTeam() {
    if (isOnTeam) return;

    setIsAdding(true);
    try {
      await addProvider({ providerId, providerType });
      toast.success("Added to your team", {
        description: "You can now contact this provider about your deal",
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";
      toast.error("Couldn't add provider", {
        description: message,
      });
    } finally {
      setIsAdding(false);
    }
  }

  return { isOnTeam, isAdding, addToTeam };
}
