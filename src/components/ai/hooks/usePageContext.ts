"use client";

import { useMemo } from "react";
import { usePathname } from "@/i18n/navigation";
import { useParams } from "next/navigation";

export interface PageContext {
  pageType: string;
  entityType?: "property" | "deal" | "provider" | "client" | "user";
  entityId?: string;
}

/**
 * Parses the current URL into a structured PageContext object.
 *
 * Uses usePathname from i18n/navigation (locale-stripped) and
 * useParams from next/navigation for route parameters.
 *
 * IMPORTANT: Specific sub-paths are checked BEFORE generic startsWith
 * to avoid false matches (e.g. /properties/saved matching /properties/[id]).
 */
export function usePageContext(): PageContext {
  const pathname = usePathname();
  const params = useParams();

  return useMemo(() => {
    // Helper to safely extract a string param
    const getParam = (key: string): string | undefined => {
      const val = params[key];
      if (!val) return undefined;
      return String(val);
    };

    // --- Properties ---
    if (pathname === "/properties/saved") return { pageType: "property_saved" };
    if (pathname === "/properties/listings") return { pageType: "property_listings" };
    if (pathname === "/properties/new") return { pageType: "property_create" };
    if (/^\/properties\/[^/]+\/edit$/.test(pathname)) {
      const id = getParam("id");
      if (id) return { pageType: "property_edit", entityType: "property", entityId: id };
    }
    if (/^\/properties\/[^/]+$/.test(pathname)) {
      const id = getParam("id");
      if (id) return { pageType: "property_detail", entityType: "property", entityId: id };
    }
    if (pathname === "/properties") return { pageType: "property_browse" };

    // --- Deals ---
    if (/^\/deals\/[^/]+$/.test(pathname)) {
      const id = getParam("id");
      if (id) return { pageType: "deal_detail", entityType: "deal", entityId: id };
    }
    if (pathname === "/deals") return { pageType: "deals_list" };

    // --- Providers ---
    if (/^\/providers\/[^/]+$/.test(pathname)) {
      const id = getParam("id");
      if (id) return { pageType: "provider_detail", entityType: "provider", entityId: id };
    }
    if (pathname === "/providers") return { pageType: "providers_browse" };

    // --- Clients ---
    // Dashboard client detail route
    if (/^\/dashboard\/clients\/[^/]+$/.test(pathname)) {
      const id = getParam("clientId");
      if (id) return { pageType: "client_detail", entityType: "client", entityId: id };
    }
    if (/^\/clients\/[^/]+$/.test(pathname)) {
      const id = getParam("id");
      if (id) return { pageType: "client_detail", entityType: "client", entityId: id };
    }

    // --- Profile ---
    if (pathname === "/profile/investor/summary") return { pageType: "profile_summary" };
    if (pathname === "/profile/investor" || pathname.startsWith("/profile/investor/"))
      return { pageType: "profile_investor" };
    if (pathname === "/profile/provider" || pathname.startsWith("/profile/provider/"))
      return { pageType: "profile_provider" };
    if (/^\/profile\/[^/]+$/.test(pathname)) {
      const id = getParam("id");
      if (id) return { pageType: "profile_detail", entityType: "user", entityId: id };
    }

    // --- Static pages ---
    if (pathname === "/dashboard" || pathname === "/") return { pageType: "dashboard" };
    if (pathname === "/feed") return { pageType: "social_feed" };
    if (pathname === "/chat") return { pageType: "messaging" };
    if (pathname === "/search") return { pageType: "search" };
    if (pathname === "/analytics") return { pageType: "analytics" };
    if (pathname === "/settings" || pathname.startsWith("/settings/"))
      return { pageType: "settings" };

    // --- Onboarding ---
    if (pathname === "/onboarding/questionnaire") return { pageType: "onboarding_questionnaire" };
    if (pathname === "/onboarding/vendor-profile") return { pageType: "onboarding_vendor" };
    if (pathname === "/onboarding" || pathname.startsWith("/onboarding/"))
      return { pageType: "onboarding" };

    // --- Fallback: extract first path segment ---
    const firstSegment = pathname.split("/").filter(Boolean)[0];
    return { pageType: firstSegment || "dashboard" };
  }, [pathname, params]);
}
