import type { LucideIcon } from "lucide-react";
import {
  Home,
  Building2,
  Heart,
  Building,
  Handshake,
  CalendarDays,
  Users,
  FileText,
  Calculator,
  Scale,
  Stamp,
  Receipt,
  ClipboardCheck,
  MessageSquare,
  UserCircle,
  Settings,
} from "lucide-react";

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
  label: string;
  href: string;
  icon: LucideIcon;
  items?: NavItem[]; // For sub-items in collapsible groups
};

// Navigation group type
export type NavGroup = {
  label?: string; // Optional group label (e.g., "Marketplace", "Property Management")
  items: NavItem[];
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
      label: "Marketplace",
      items: [
        { label: "Browse Properties", href: "/properties", icon: Building2 },
        { label: "Saved Properties", href: "/properties?favorites=true", icon: Heart },
        { label: "Deals", href: "/deals", icon: Handshake },
      ],
    },
    {
      items: [
        { label: "Chat", href: "/chat", icon: MessageSquare },
        { label: "Profile", href: "/profile/investor", icon: UserCircle },
        { label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ],
};

// Broker Navigation
const brokerNavigation: RoleNavigation = {
  groups: [
    {
      items: [
        { label: "Dashboard", href: "/dashboard", icon: Home },
      ],
    },
    {
      label: "Marketplace",
      items: [
        { label: "Browse Properties", href: "/properties", icon: Building2 },
        { label: "Saved Properties", href: "/properties?favorites=true", icon: Heart },
        { label: "Your Listings", href: "/properties/listings", icon: Building },
        { label: "Deals", href: "/deals", icon: Handshake },
      ],
    },
    {
      label: "Property Management",
      items: [
        { label: "Listings", href: "/properties/listings", icon: Building },
        { label: "Property Tours", href: "/properties/tours", icon: CalendarDays },
        { label: "Lead Management", href: "/leads", icon: Users },
      ],
    },
    {
      items: [
        { label: "Clients", href: "/clients", icon: Users },
        { label: "Chat", href: "/chat", icon: MessageSquare },
        { label: "Profile", href: "/profile/provider", icon: UserCircle },
        { label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ],
};

// Mortgage Advisor Navigation
const mortgageAdvisorNavigation: RoleNavigation = {
  groups: [
    {
      items: [
        { label: "Dashboard", href: "/dashboard", icon: Home },
      ],
    },
    {
      label: "Marketplace",
      items: [
        { label: "Browse Properties", href: "/properties", icon: Building2 },
        { label: "Saved Properties", href: "/properties?favorites=true", icon: Heart },
        { label: "Deals", href: "/deals", icon: Handshake },
      ],
    },
    {
      label: "Mortgage Requests",
      items: [
        { label: "New Applications", href: "/mortgage/applications", icon: FileText },
        { label: "Pre-approvals", href: "/mortgage/pre-approvals", icon: ClipboardCheck },
        { label: "Financing Deals", href: "/mortgage/deals", icon: Calculator },
      ],
    },
    {
      items: [
        { label: "Clients", href: "/clients", icon: Users },
        { label: "Chat", href: "/chat", icon: MessageSquare },
        { label: "Profile", href: "/profile/provider", icon: UserCircle },
        { label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ],
};

// Lawyer Navigation
const lawyerNavigation: RoleNavigation = {
  groups: [
    {
      items: [
        { label: "Dashboard", href: "/dashboard", icon: Home },
      ],
    },
    {
      label: "Marketplace",
      items: [
        { label: "Browse Properties", href: "/properties", icon: Building2 },
        { label: "Saved Properties", href: "/properties?favorites=true", icon: Heart },
        { label: "Deals", href: "/deals", icon: Handshake },
      ],
    },
    {
      label: "Legal Services",
      items: [
        { label: "Consultation Requests", href: "/legal/consultations", icon: FileText },
        { label: "Contract Reviews", href: "/legal/contracts", icon: Scale },
        { label: "Transaction Documents", href: "/legal/documents", icon: FileText },
      ],
    },
    {
      items: [
        { label: "Clients", href: "/clients", icon: Users },
        { label: "Chat", href: "/chat", icon: MessageSquare },
        { label: "Profile", href: "/profile/provider", icon: UserCircle },
        { label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ],
};

// Accountant Navigation
const accountantNavigation: RoleNavigation = {
  groups: [
    {
      items: [
        { label: "Dashboard", href: "/dashboard", icon: Home },
      ],
    },
    {
      label: "Marketplace",
      items: [
        { label: "Browse Properties", href: "/properties", icon: Building2 },
        { label: "Saved Properties", href: "/properties?favorites=true", icon: Heart },
        { label: "Deals", href: "/deals", icon: Handshake },
      ],
    },
    {
      label: "Accounting Services",
      items: [
        { label: "Consultation Requests", href: "/accounting/consultations", icon: FileText },
        { label: "Financial Analysis", href: "/accounting/analysis", icon: Calculator },
        { label: "Tax Planning", href: "/accounting/tax-planning", icon: Receipt },
      ],
    },
    {
      items: [
        { label: "Clients", href: "/clients", icon: Users },
        { label: "Chat", href: "/chat", icon: MessageSquare },
        { label: "Profile", href: "/profile/provider", icon: UserCircle },
        { label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ],
};

// Notary Navigation
const notaryNavigation: RoleNavigation = {
  groups: [
    {
      items: [
        { label: "Dashboard", href: "/dashboard", icon: Home },
      ],
    },
    {
      label: "Marketplace",
      items: [
        { label: "Browse Properties", href: "/properties", icon: Building2 },
        { label: "Saved Properties", href: "/properties?favorites=true", icon: Heart },
        { label: "Deals", href: "/deals", icon: Handshake },
      ],
    },
    {
      label: "Notarization Services",
      items: [
        { label: "Notarization Requests", href: "/notary/requests", icon: FileText },
        { label: "Document Signings", href: "/notary/signings", icon: Stamp },
        { label: "Transaction Notarizations", href: "/notary/transactions", icon: FileText },
      ],
    },
    {
      items: [
        { label: "Clients", href: "/clients", icon: Users },
        { label: "Chat", href: "/chat", icon: MessageSquare },
        { label: "Profile", href: "/profile/provider", icon: UserCircle },
        { label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ],
};

// Tax Consultant Navigation
const taxConsultantNavigation: RoleNavigation = {
  groups: [
    {
      items: [
        { label: "Dashboard", href: "/dashboard", icon: Home },
      ],
    },
    {
      label: "Marketplace",
      items: [
        { label: "Browse Properties", href: "/properties", icon: Building2 },
        { label: "Saved Properties", href: "/properties?favorites=true", icon: Heart },
        { label: "Deals", href: "/deals", icon: Handshake },
      ],
    },
    {
      label: "Tax Services",
      items: [
        { label: "Consultation Requests", href: "/tax/consultations", icon: FileText },
        { label: "Tax Filing Requests", href: "/tax/filings", icon: Receipt },
        { label: "Tax Planning", href: "/tax/planning", icon: Calculator },
      ],
    },
    {
      items: [
        { label: "Clients", href: "/clients", icon: Users },
        { label: "Chat", href: "/chat", icon: MessageSquare },
        { label: "Profile", href: "/profile/provider", icon: UserCircle },
        { label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ],
};

// Appraiser Navigation
const appraiserNavigation: RoleNavigation = {
  groups: [
    {
      items: [
        { label: "Dashboard", href: "/dashboard", icon: Home },
      ],
    },
    {
      label: "Marketplace",
      items: [
        { label: "Browse Properties", href: "/properties", icon: Building2 },
        { label: "Saved Properties", href: "/properties?favorites=true", icon: Heart },
        { label: "Deals", href: "/deals", icon: Handshake },
      ],
    },
    {
      label: "Appraisal Services",
      items: [
        { label: "Appraisal Requests", href: "/appraisal/requests", icon: FileText },
        { label: "Property Valuations", href: "/appraisal/valuations", icon: ClipboardCheck },
        { label: "Valuation Reports", href: "/appraisal/reports", icon: FileText },
      ],
    },
    {
      items: [
        { label: "Clients", href: "/clients", icon: Users },
        { label: "Chat", href: "/chat", icon: MessageSquare },
        { label: "Profile", href: "/profile/provider", icon: UserCircle },
        { label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ],
};

// Admin Navigation (same as broker plus admin-only items)
const adminNavigation: RoleNavigation = {
  groups: [
    {
      items: [
        { label: "Dashboard", href: "/dashboard", icon: Home },
      ],
    },
    {
      label: "Marketplace",
      items: [
        { label: "Browse Properties", href: "/properties", icon: Building2 },
        { label: "Saved Properties", href: "/properties?favorites=true", icon: Heart },
        { label: "Your Listings", href: "/properties/listings", icon: Building },
        { label: "Deals", href: "/deals", icon: Handshake },
      ],
    },
    {
      label: "Property Management",
      items: [
        { label: "Listings", href: "/properties/listings", icon: Building },
        { label: "Property Tours", href: "/properties/tours", icon: CalendarDays },
        { label: "Lead Management", href: "/leads", icon: Users },
      ],
    },
    {
      items: [
        { label: "Clients", href: "/clients", icon: Users },
        { label: "Chat", href: "/chat", icon: MessageSquare },
        { label: "Profile", href: "/profile/provider", icon: UserCircle },
        { label: "Settings", href: "/settings", icon: Settings },
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
 * @param pathname - Current pathname
 * @param href - Link href to check
 * @returns Whether the link should be shown as active
 */
export function isActivePath(pathname: string, href: string): boolean {
  // Handle query parameters - compare base paths
  const hrefBase = href.split("?")[0];
  const pathnameBase = pathname.split("?")[0];

  // Exact match
  if (pathnameBase === hrefBase) return true;

  // Check if pathname starts with href (for nested routes)
  // But not for root paths like "/" to avoid false positives
  if (hrefBase !== "/" && pathnameBase.startsWith(hrefBase + "/")) return true;

  return false;
}
