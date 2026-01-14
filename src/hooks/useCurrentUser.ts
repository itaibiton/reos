"use client";

import { useQuery, useMutation } from "convex/react";
import { useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect } from "react";

export type UserRole =
  | "investor"
  | "broker"
  | "mortgage_advisor"
  | "lawyer"
  | "admin";

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

  // Effective role: viewingAsRole (for admins) or actual role
  // This is what the UI should use for role-based rendering
  const effectiveRole = (user?.viewingAsRole ?? user?.role) as
    | UserRole
    | undefined;

  // Check if user is actually an admin (regardless of viewingAsRole)
  const isAdmin = user?.role === "admin";

  // Check if effective role is a service provider type
  const isServiceProvider =
    effectiveRole === "broker" ||
    effectiveRole === "mortgage_advisor" ||
    effectiveRole === "lawyer";

  return {
    user,
    isLoading: isAuthLoading || (isAuthenticated && user === undefined),
    isAuthenticated,
    // Role utilities
    effectiveRole,
    isAdmin,
    isServiceProvider,
    isInvestor: effectiveRole === "investor",
  };
}
