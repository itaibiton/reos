import type { LucideIcon } from "lucide-react";
import {
  type UserRole,
  type NavItem,
  getNavigationForRole,
} from "./navigation";

/**
 * A quick action that can be searched and executed
 */
export type QuickAction = {
  labelKey: string; // Translation key (e.g., "navigation.items.dashboard")
  href: string;
  icon: LucideIcon;
  keywords: string[];
  category: "page" | "action";
};

/**
 * Keyword mappings for common navigation items by labelKey
 * These provide alias terms that users might search for
 */
const KEYWORD_MAPPINGS: Record<string, string[]> = {
  "navigation.items.settings": ["preferences", "config", "account", "options"],
  "navigation.items.profile": ["me", "account", "my profile", "user"],
  "navigation.items.dashboard": ["home", "overview", "main"],
  "navigation.items.browseProperties": ["listings", "real estate", "homes", "search properties"],
  "navigation.items.savedProperties": ["favorites", "bookmarks", "saved", "liked"],
  "navigation.items.yourListings": ["my listings", "my properties"],
  "navigation.items.findProviders": ["professionals", "services", "experts"],
  "navigation.items.chat": ["messages", "inbox", "conversations", "messaging"],
  "navigation.items.feed": ["posts", "social", "news", "activity"],
  "navigation.items.deals": ["transactions", "purchases", "sales"],
  "navigation.items.analytics": ["stats", "metrics", "reports", "data"],
  "navigation.items.clients": ["customers", "contacts", "leads"],
  "navigation.items.leadManagement": ["leads", "prospects"],
  "navigation.items.propertyTours": ["showings", "appointments", "visits"],
  "navigation.items.newApplications": ["mortgage applications", "loan applications"],
  "navigation.items.preApprovals": ["pre-approval", "preapproval"],
  "navigation.items.financingDeals": ["loans", "mortgages", "financing"],
  "navigation.items.consultationRequests": ["consultations", "appointments"],
  "navigation.items.contractReviews": ["contracts", "agreements", "legal review"],
  "navigation.items.transactionDocuments": ["documents", "paperwork"],
  "navigation.items.financialAnalysis": ["analysis", "financial review"],
  "navigation.items.taxPlanning": ["taxes", "tax advice"],
  "navigation.items.notarizationRequests": ["notarize", "notary services"],
  "navigation.items.documentSignings": ["signing", "signatures"],
  "navigation.items.taxFilingRequests": ["tax filing", "file taxes"],
  "navigation.items.appraisalRequests": ["appraisals", "valuations"],
  "navigation.items.propertyValuations": ["valuations", "property value"],
  "navigation.items.valuationReports": ["reports", "appraisal reports"],
};

/**
 * Flatten a NavItem into QuickActions, recursively handling sub-items
 */
function flattenNavItem(item: NavItem): QuickAction[] {
  const actions: QuickAction[] = [];

  // Add the main item
  actions.push({
    labelKey: item.labelKey,
    href: item.href,
    icon: item.icon,
    keywords: KEYWORD_MAPPINGS[item.labelKey] || [],
    category: "page",
  });

  // Recursively add sub-items if present
  if (item.items) {
    for (const subItem of item.items) {
      actions.push(...flattenNavItem(subItem));
    }
  }

  return actions;
}

/**
 * Get all quick actions available for a specific role
 */
export function getQuickActionsForRole(role: UserRole): QuickAction[] {
  const navigation = getNavigationForRole(role);
  const actions: QuickAction[] = [];
  const seenHrefs = new Set<string>();

  for (const group of navigation.groups) {
    for (const item of group.items) {
      const flattenedItems = flattenNavItem(item);
      for (const action of flattenedItems) {
        // Deduplicate by href
        if (!seenHrefs.has(action.href)) {
          seenHrefs.add(action.href);
          actions.push(action);
        }
      }
    }
  }

  return actions;
}

/**
 * Calculate match score for a quick action against a query
 * Higher score = better match
 * Returns 0 for no match
 *
 * @param action The quick action to score
 * @param query The search query
 * @param translatedLabel The translated label text for matching
 */
function getMatchScore(action: QuickAction, query: string, translatedLabel: string): number {
  const lowerQuery = query.toLowerCase();
  const lowerLabel = translatedLabel.toLowerCase();

  // Exact match (highest priority)
  if (lowerLabel === lowerQuery) {
    return 100;
  }

  // Starts with query (high priority)
  if (lowerLabel.startsWith(lowerQuery)) {
    return 80;
  }

  // Label contains query
  if (lowerLabel.includes(lowerQuery)) {
    return 60;
  }

  // Check keywords
  for (const keyword of action.keywords) {
    const lowerKeyword = keyword.toLowerCase();
    if (lowerKeyword === lowerQuery) {
      return 50;
    }
    if (lowerKeyword.startsWith(lowerQuery)) {
      return 40;
    }
    if (lowerKeyword.includes(lowerQuery)) {
      return 30;
    }
  }

  // Word boundary match in label (e.g., "prop" matches "Browse Properties")
  const words = lowerLabel.split(" ");
  for (const word of words) {
    if (word.startsWith(lowerQuery)) {
      return 70;
    }
  }

  return 0;
}

/**
 * Filter and sort quick actions based on a search query
 * Returns actions sorted by match quality (best matches first)
 *
 * @param actions The quick actions to filter
 * @param query The search query
 * @param getTranslatedLabel Function to get translated label from labelKey
 */
export function filterQuickActions(
  actions: QuickAction[],
  query: string,
  getTranslatedLabel?: (labelKey: string) => string
): QuickAction[] {
  if (!query || query.length === 0) {
    return [];
  }

  // Default to using labelKey as-is if no translation function provided
  const translate = getTranslatedLabel || ((key: string) => key.split(".").pop() || key);

  const scored = actions
    .map((action) => ({
      action,
      score: getMatchScore(action, query, translate(action.labelKey)),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map(({ action }) => action);
}
