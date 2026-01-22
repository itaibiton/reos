"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export function usePropertySave(propertyId: Id<"properties">) {
  const isSavedQuery = useQuery(api.favorites.isSaved, { propertyId });
  const toggleMutation = useMutation(api.favorites.toggle);

  const toggleSave = async () => {
    await toggleMutation({ propertyId });
  };

  return {
    isSaved: isSavedQuery ?? false,
    isLoading: isSavedQuery === undefined,
    toggleSave,
  };
}
