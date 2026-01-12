"use client";

import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

export function useCurrentUser() {
  const { isAuthenticated, isLoading: isAuthLoading } = useConvexAuth();
  const user = useQuery(
    api.users.getCurrentUser,
    isAuthenticated ? {} : "skip"
  );
  const getOrCreateUser = useMutation(api.users.getOrCreateUser);

  // Ensure user exists in Convex when authenticated
  useEffect(() => {
    if (isAuthenticated && user === null) {
      getOrCreateUser();
    }
  }, [isAuthenticated, user, getOrCreateUser]);

  return {
    user,
    isLoading: isAuthLoading || (isAuthenticated && user === undefined),
    isAuthenticated,
  };
}
