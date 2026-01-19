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
  label: string;
  href: string;
  icon: LucideIcon;
  keywords: string[];
  category: "page" | "action";
};

/**
 * Keyword mappings for common navigation items
 * These provide alias terms that users might search for
 */
const KEYWORD_MAPPINGS: Record<string, string[]> = {
  Settings: ["preferences", "config", "account", "options"],
  Profile: ["me", "account", "my profile", "user"],
  Dashboard: ["home", "overview", "main"],
  "Browse Properties": ["listings", "real estate", "homes", "search properties"],
  "Saved Properties": ["favorites", "bookmarks", "saved", "liked"],
  "Your Listings": ["my listings", "my properties"],
  "Find Providers": ["professionals", "services", "experts"],
  Chat: ["messages", "inbox", "conversations", "messaging"],
  Feed: ["posts", "social", "news", "activity"],
  Deals: ["transactions", "purchases", "sales"],
  Analytics: ["stats", "metrics", "reports", "data"],
  Clients: ["customers", "contacts", "leads"],
  "Lead Management": ["leads", "prospects"],
  "Property Tours": ["showings", "appointments", "visits"],
  "New Applications": ["mortgage applications", "loan applications"],
  "Pre-approvals": ["pre-approval", "preapproval"],
  "Financing Deals": ["loans", "mortgages", "financing"],
  "Consultation Requests": ["consultations", "appointments"],
  "Contract Reviews": ["contracts", "agreements", "legal review"],
  "Transaction Documents": ["documents", "paperwork"],
  "Financial Analysis": ["analysis", "financial review"],
  "Tax Planning": ["taxes", "tax advice"],
  "Notarization Requests": ["notarize", "notary services"],
  "Document Signings": ["signing", "signatures"],
  "Tax Filing Requests": ["tax filing", "file taxes"],
  "Appraisal Requests": ["appraisals", "valuations"],
  "Property Valuations": ["valuations", "property value"],
  "Valuation Reports": ["reports", "appraisal reports"],
};

/**
 * Flatten a NavItem into QuickActions, recursively handling sub-items
 */
function flattenNavItem(item: NavItem): QuickAction[] {
  const actions: QuickAction[] = [];

  // Add the main item
  actions.push({
    label: item.label,
    href: item.href,
    icon: item.icon,
    keywords: KEYWORD_MAPPINGS[item.label] || [],
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
 */
function getMatchScore(action: QuickAction, query: string): number {
  const lowerQuery = query.toLowerCase();
  const lowerLabel = action.label.toLowerCase();

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
 */
export function filterQuickActions(
  actions: QuickAction[],
  query: string
): QuickAction[] {
  if (!query || query.length === 0) {
    return [];
  }

  const scored = actions
    .map((action) => ({
      action,
      score: getMatchScore(action, query),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  return scored.map(({ action }) => action);
}
