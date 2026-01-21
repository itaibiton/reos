import type { LucideIcon } from "lucide-react";
import {
  Home,
  Building2,
  Heart,
  Building,
  Handshake,
  CalendarDays,
  Users,
  UserSearch,
  FileText,
  Calculator,
  Scale,
  Stamp,
  Receipt,
  ClipboardCheck,
  MessageSquare,
  UserCircle,
  Settings,
  BarChart3,
  Rss,
} from "lucide-react";
import type { IconSvgElement } from "@hugeicons/react";
import {
  Home01Icon,
  Building02Icon,
  News01Icon,
  Message02Icon,
  Agreement01Icon,
  UserIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons";

// All user roles in the system (extended for future roles)
export type UserRole =
  | "investor"
  | "broker"
  | "mortgage_advisor"
  | "lawyer"
  | "accountant"
  | "notary"
  | "tax_consultant"
  | "appraiser"
  | "admin";

// Navigation item type
export type NavItem = {
  labelKey: string; // Translation key (e.g., "navigation.items.dashboard")
  href: string;
  icon: LucideIcon;
  items?: NavItem[]; // For sub-items in collapsible groups
};

// Navigation group type
export type NavGroup = {
  labelKey?: string; // Optional group label translation key (e.g., "navigation.groups.marketplace")
  items: NavItem[];
};

// Mobile tab item for bottom navigation
export type MobileTabItem = {
  labelKey: string; // Translation key (e.g., "navigation.items.chat")
  href: string;
  icon: LucideIcon; // Lucide icon for compatibility
  hugeIcon: IconSvgElement; // HugeIcon for mobile display
  showBadge?: "chat" | "notifications"; // Which unread count to show
};

// Role-based navigation configuration
export type RoleNavigation = {
  groups: NavGroup[];
};

// Full navigation config
export type NavigationConfig = Record<UserRole, RoleNavigation>;

// Investor Navigation
const investorNavigation: RoleNavigation = {
  groups: [
    {
      labelKey: "navigation.groups.marketplace",
      items: [
        { labelKey: "navigation.items.browseProperties", href: "/properties", icon: Building2 },
        { labelKey: "navigation.items.savedProperties", href: "/properties/saved", icon: Heart },
        { labelKey: "navigation.items.yourListings", href: "/properties/listings", icon: Building },
        { labelKey: "navigation.items.findProviders", href: "/providers", icon: UserSearch },
        { labelKey: "navigation.items.deals", href: "/deals", icon: Handshake },
      ],
    },
    {
      items: [
        { labelKey: "navigation.items.feed", href: "/feed", icon: Rss },
        { labelKey: "navigation.items.chat", href: "/chat", icon: MessageSquare },
        { labelKey: "navigation.items.profile", href: "/profile/investor", icon: UserCircle },
        { labelKey: "navigation.items.settings", href: "/settings", icon: Settings },
      ],
    },
  ],
};

// Broker Navigation
const brokerNavigation: RoleNavigation = {
  groups: [
    {
      items: [
        { labelKey: "navigation.items.dashboard", href: "/dashboard", icon: Home },
        { labelKey: "navigation.items.analytics", href: "/analytics", icon: BarChart3 },
      ],
    },
    {
      labelKey: "navigation.groups.marketplace",
      items: [
        { labelKey: "navigation.items.browseProperties", href: "/properties", icon: Building2 },
        { labelKey: "navigation.items.savedProperties", href: "/properties/saved", icon: Heart },
        { labelKey: "navigation.items.yourListings", href: "/properties/listings", icon: Building },
        { labelKey: "navigation.items.deals", href: "/deals", icon: Handshake },
      ],
    },
    {
      labelKey: "navigation.groups.propertyManagement",
      items: [
        { labelKey: "navigation.items.propertyTours", href: "/properties/tours", icon: CalendarDays },
        { labelKey: "navigation.items.leadManagement", href: "/leads", icon: Users },
      ],
    },
    {
      items: [
        { labelKey: "navigation.items.clients", href: "/clients", icon: Users },
        { labelKey: "navigation.items.feed", href: "/feed", icon: Rss },
        { labelKey: "navigation.items.chat", href: "/chat", icon: MessageSquare },
        { labelKey: "navigation.items.profile", href: "/profile/provider", icon: UserCircle },
        { labelKey: "navigation.items.settings", href: "/settings", icon: Settings },
      ],
    },
  ],
};

// Mortgage Advisor Navigation
const mortgageAdvisorNavigation: RoleNavigation = {
  groups: [
    {
      items: [
        { labelKey: "navigation.items.dashboard", href: "/dashboard", icon: Home },
        { labelKey: "navigation.items.analytics", href: "/analytics", icon: BarChart3 },
      ],
    },
    {
      labelKey: "navigation.groups.marketplace",
      items: [
        { labelKey: "navigation.items.browseProperties", href: "/properties", icon: Building2 },
        { labelKey: "navigation.items.savedProperties", href: "/properties/saved", icon: Heart },
        { labelKey: "navigation.items.deals", href: "/deals", icon: Handshake },
      ],
    },
    {
      labelKey: "navigation.groups.mortgageRequests",
      items: [
        { labelKey: "navigation.items.newApplications", href: "/mortgage/applications", icon: FileText },
        { labelKey: "navigation.items.preApprovals", href: "/mortgage/pre-approvals", icon: ClipboardCheck },
        { labelKey: "navigation.items.financingDeals", href: "/mortgage/deals", icon: Calculator },
      ],
    },
    {
      items: [
        { labelKey: "navigation.items.clients", href: "/clients", icon: Users },
        { labelKey: "navigation.items.feed", href: "/feed", icon: Rss },
        { labelKey: "navigation.items.chat", href: "/chat", icon: MessageSquare },
        { labelKey: "navigation.items.profile", href: "/profile/provider", icon: UserCircle },
        { labelKey: "navigation.items.settings", href: "/settings", icon: Settings },
      ],
    },
  ],
};

// Lawyer Navigation
const lawyerNavigation: RoleNavigation = {
  groups: [
    {
      items: [
        { labelKey: "navigation.items.dashboard", href: "/dashboard", icon: Home },
        { labelKey: "navigation.items.analytics", href: "/analytics", icon: BarChart3 },
      ],
    },
    {
      labelKey: "navigation.groups.marketplace",
      items: [
        { labelKey: "navigation.items.browseProperties", href: "/properties", icon: Building2 },
        { labelKey: "navigation.items.savedProperties", href: "/properties/saved", icon: Heart },
        { labelKey: "navigation.items.deals", href: "/deals", icon: Handshake },
      ],
    },
    {
      labelKey: "navigation.groups.legalServices",
      items: [
        { labelKey: "navigation.items.consultationRequests", href: "/legal/consultations", icon: FileText },
        { labelKey: "navigation.items.contractReviews", href: "/legal/contracts", icon: Scale },
        { labelKey: "navigation.items.transactionDocuments", href: "/legal/documents", icon: FileText },
      ],
    },
    {
      items: [
        { labelKey: "navigation.items.clients", href: "/clients", icon: Users },
        { labelKey: "navigation.items.feed", href: "/feed", icon: Rss },
        { labelKey: "navigation.items.chat", href: "/chat", icon: MessageSquare },
        { labelKey: "navigation.items.profile", href: "/profile/provider", icon: UserCircle },
        { labelKey: "navigation.items.settings", href: "/settings", icon: Settings },
      ],
    },
  ],
};

// Accountant Navigation
const accountantNavigation: RoleNavigation = {
  groups: [
    {
      items: [
        { labelKey: "navigation.items.dashboard", href: "/dashboard", icon: Home },
        { labelKey: "navigation.items.analytics", href: "/analytics", icon: BarChart3 },
      ],
    },
    {
      labelKey: "navigation.groups.marketplace",
      items: [
        { labelKey: "navigation.items.browseProperties", href: "/properties", icon: Building2 },
        { labelKey: "navigation.items.savedProperties", href: "/properties/saved", icon: Heart },
        { labelKey: "navigation.items.deals", href: "/deals", icon: Handshake },
      ],
    },
    {
      labelKey: "navigation.groups.accountingServices",
      items: [
        { labelKey: "navigation.items.consultationRequests", href: "/accounting/consultations", icon: FileText },
        { labelKey: "navigation.items.financialAnalysis", href: "/accounting/analysis", icon: Calculator },
        { labelKey: "navigation.items.taxPlanning", href: "/accounting/tax-planning", icon: Receipt },
      ],
    },
    {
      items: [
        { labelKey: "navigation.items.clients", href: "/clients", icon: Users },
        { labelKey: "navigation.items.feed", href: "/feed", icon: Rss },
        { labelKey: "navigation.items.chat", href: "/chat", icon: MessageSquare },
        { labelKey: "navigation.items.profile", href: "/profile/provider", icon: UserCircle },
        { labelKey: "navigation.items.settings", href: "/settings", icon: Settings },
      ],
    },
  ],
};

// Notary Navigation
const notaryNavigation: RoleNavigation = {
  groups: [
    {
      items: [
        { labelKey: "navigation.items.dashboard", href: "/dashboard", icon: Home },
        { labelKey: "navigation.items.analytics", href: "/analytics", icon: BarChart3 },
      ],
    },
    {
      labelKey: "navigation.groups.marketplace",
      items: [
        { labelKey: "navigation.items.browseProperties", href: "/properties", icon: Building2 },
        { labelKey: "navigation.items.savedProperties", href: "/properties/saved", icon: Heart },
        { labelKey: "navigation.items.deals", href: "/deals", icon: Handshake },
      ],
    },
    {
      labelKey: "navigation.groups.notarizationServices",
      items: [
        { labelKey: "navigation.items.notarizationRequests", href: "/notary/requests", icon: FileText },
        { labelKey: "navigation.items.documentSignings", href: "/notary/signings", icon: Stamp },
        { labelKey: "navigation.items.transactionNotarizations", href: "/notary/transactions", icon: FileText },
      ],
    },
    {
      items: [
        { labelKey: "navigation.items.clients", href: "/clients", icon: Users },
        { labelKey: "navigation.items.feed", href: "/feed", icon: Rss },
        { labelKey: "navigation.items.chat", href: "/chat", icon: MessageSquare },
        { labelKey: "navigation.items.profile", href: "/profile/provider", icon: UserCircle },
        { labelKey: "navigation.items.settings", href: "/settings", icon: Settings },
      ],
    },
  ],
};

// Tax Consultant Navigation
const taxConsultantNavigation: RoleNavigation = {
  groups: [
    {
      items: [
        { labelKey: "navigation.items.dashboard", href: "/dashboard", icon: Home },
        { labelKey: "navigation.items.analytics", href: "/analytics", icon: BarChart3 },
      ],
    },
    {
      labelKey: "navigation.groups.marketplace",
      items: [
        { labelKey: "navigation.items.browseProperties", href: "/properties", icon: Building2 },
        { labelKey: "navigation.items.savedProperties", href: "/properties/saved", icon: Heart },
        { labelKey: "navigation.items.deals", href: "/deals", icon: Handshake },
      ],
    },
    {
      labelKey: "navigation.groups.taxServices",
      items: [
        { labelKey: "navigation.items.consultationRequests", href: "/tax/consultations", icon: FileText },
        { labelKey: "navigation.items.taxFilingRequests", href: "/tax/filings", icon: Receipt },
        { labelKey: "navigation.items.taxPlanning", href: "/tax/planning", icon: Calculator },
      ],
    },
    {
      items: [
        { labelKey: "navigation.items.clients", href: "/clients", icon: Users },
        { labelKey: "navigation.items.feed", href: "/feed", icon: Rss },
        { labelKey: "navigation.items.chat", href: "/chat", icon: MessageSquare },
        { labelKey: "navigation.items.profile", href: "/profile/provider", icon: UserCircle },
        { labelKey: "navigation.items.settings", href: "/settings", icon: Settings },
      ],
    },
  ],
};

// Appraiser Navigation
const appraiserNavigation: RoleNavigation = {
  groups: [
    {
      items: [
        { labelKey: "navigation.items.dashboard", href: "/dashboard", icon: Home },
        { labelKey: "navigation.items.analytics", href: "/analytics", icon: BarChart3 },
      ],
    },
    {
      labelKey: "navigation.groups.marketplace",
      items: [
        { labelKey: "navigation.items.browseProperties", href: "/properties", icon: Building2 },
        { labelKey: "navigation.items.savedProperties", href: "/properties/saved", icon: Heart },
        { labelKey: "navigation.items.deals", href: "/deals", icon: Handshake },
      ],
    },
    {
      labelKey: "navigation.groups.appraisalServices",
      items: [
        { labelKey: "navigation.items.appraisalRequests", href: "/appraisal/requests", icon: FileText },
        { labelKey: "navigation.items.propertyValuations", href: "/appraisal/valuations", icon: ClipboardCheck },
        { labelKey: "navigation.items.valuationReports", href: "/appraisal/reports", icon: FileText },
      ],
    },
    {
      items: [
        { labelKey: "navigation.items.clients", href: "/clients", icon: Users },
        { labelKey: "navigation.items.feed", href: "/feed", icon: Rss },
        { labelKey: "navigation.items.chat", href: "/chat", icon: MessageSquare },
        { labelKey: "navigation.items.profile", href: "/profile/provider", icon: UserCircle },
        { labelKey: "navigation.items.settings", href: "/settings", icon: Settings },
      ],
    },
  ],
};

// Admin Navigation (same as broker plus admin-only items)
const adminNavigation: RoleNavigation = {
  groups: [
    {
      items: [
        { labelKey: "navigation.items.dashboard", href: "/dashboard", icon: Home },
        { labelKey: "navigation.items.analytics", href: "/analytics", icon: BarChart3 },
      ],
    },
    {
      labelKey: "navigation.groups.marketplace",
      items: [
        { labelKey: "navigation.items.browseProperties", href: "/properties", icon: Building2 },
        { labelKey: "navigation.items.savedProperties", href: "/properties/saved", icon: Heart },
        { labelKey: "navigation.items.yourListings", href: "/properties/listings", icon: Building },
        { labelKey: "navigation.items.deals", href: "/deals", icon: Handshake },
      ],
    },
    {
      labelKey: "navigation.groups.propertyManagement",
      items: [
        { labelKey: "navigation.items.propertyTours", href: "/properties/tours", icon: CalendarDays },
        { labelKey: "navigation.items.leadManagement", href: "/leads", icon: Users },
      ],
    },
    {
      items: [
        { labelKey: "navigation.items.clients", href: "/clients", icon: Users },
        { labelKey: "navigation.items.feed", href: "/feed", icon: Rss },
        { labelKey: "navigation.items.chat", href: "/chat", icon: MessageSquare },
        { labelKey: "navigation.items.profile", href: "/profile/provider", icon: UserCircle },
        { labelKey: "navigation.items.settings", href: "/settings", icon: Settings },
      ],
    },
  ],
};

// Full navigation configuration mapping roles to their navigation
const navigationConfig: NavigationConfig = {
  investor: investorNavigation,
  broker: brokerNavigation,
  mortgage_advisor: mortgageAdvisorNavigation,
  lawyer: lawyerNavigation,
  accountant: accountantNavigation,
  notary: notaryNavigation,
  tax_consultant: taxConsultantNavigation,
  appraiser: appraiserNavigation,
  admin: adminNavigation,
};

/**
 * Get navigation configuration for a specific role
 * @param role - The user's role
 * @returns Navigation configuration for that role
 */
export function getNavigationForRole(role: UserRole): RoleNavigation {
  return navigationConfig[role] ?? investorNavigation;
}

/**
 * Check if a path is active (matches exactly or is a parent route)
 * @param pathname - Current pathname (without query string)
 * @param href - Link href to check
 * @returns Whether the link should be shown as active
 */
export function isActivePath(pathname: string, href: string): boolean {
  // Exact match
  if (pathname === href) {
    return true;
  }

  // Check if pathname starts with href (for nested routes)
  // But not for root paths like "/" to avoid false positives
  // Also exclude /properties from matching /properties/saved
  if (href !== "/" && href !== "/properties" && pathname.startsWith(href + "/")) {
    return true;
  }

  return false;
}

/**
 * Get mobile bottom tab items for a role (exactly 5 tabs)
 *
 * Investor tabs: Properties, Feed, Chat, Deals, Profile
 * Provider tabs: Dashboard, Clients, Chat, Feed, Profile
 *
 * @param role - The user's effective role
 * @returns Array of 5 MobileTabItem for bottom navigation
 */
export function getMobileTabsForRole(role: UserRole): MobileTabItem[] {
  if (role === "investor") {
    return [
      { labelKey: "navigation.items.browseProperties", href: "/properties", icon: Building2, hugeIcon: Building02Icon },
      { labelKey: "navigation.items.feed", href: "/feed", icon: Rss, hugeIcon: News01Icon },
      { labelKey: "navigation.items.chat", href: "/chat", icon: MessageSquare, hugeIcon: Message02Icon, showBadge: "chat" },
      { labelKey: "navigation.items.deals", href: "/deals", icon: Handshake, hugeIcon: Agreement01Icon },
      { labelKey: "navigation.items.profile", href: "/profile/investor", icon: UserCircle, hugeIcon: UserIcon },
    ];
  }

  // All provider roles (broker, mortgage_advisor, lawyer, accountant, notary, tax_consultant, appraiser, admin)
  return [
    { labelKey: "navigation.items.dashboard", href: "/dashboard", icon: Home, hugeIcon: Home01Icon },
    { labelKey: "navigation.items.clients", href: "/clients", icon: Users, hugeIcon: UserMultiple02Icon },
    { labelKey: "navigation.items.chat", href: "/chat", icon: MessageSquare, hugeIcon: Message02Icon, showBadge: "chat" },
    { labelKey: "navigation.items.feed", href: "/feed", icon: Rss, hugeIcon: News01Icon },
    { labelKey: "navigation.items.profile", href: "/profile/provider", icon: UserCircle, hugeIcon: UserIcon },
  ];
}
