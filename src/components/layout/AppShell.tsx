"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import { usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  useQuery,
  useMutation,
} from "convex/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import { api } from "../../../convex/_generated/api";
import { USER_ROLES } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { AppSidebar } from "./Sidebar";
import { InvestorSearchBar } from "./InvestorSearchBar";
import { MobileBottomNav } from "./MobileBottomNav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { IncompleteProfileReminder } from "@/components/IncompleteProfileReminder";
import { GlobalSearchBar } from "@/components/search";
import { AvatarDropdown, MobileSearchExpander } from "@/components/header";

// Breadcrumb config: maps paths to their group and label translation keys
// Format: { groupKey?: string, labelKey: string }
type BreadcrumbConfig = {
  groupKey?: string;
  labelKey: string;
};

const breadcrumbConfig: Record<string, BreadcrumbConfig> = {
  // Marketplace items
  "/properties": { groupKey: "breadcrumbs.groups.marketplace", labelKey: "breadcrumbs.browse" },
  "/properties?favorites=true": { groupKey: "breadcrumbs.groups.marketplace", labelKey: "breadcrumbs.saved" },
  "/deals": { groupKey: "breadcrumbs.groups.marketplace", labelKey: "breadcrumbs.deals" },
  "/properties/listings": { groupKey: "breadcrumbs.groups.marketplace", labelKey: "breadcrumbs.yourListings" },

  // Property Management
  "/properties/tours": { groupKey: "breadcrumbs.groups.propertyManagement", labelKey: "breadcrumbs.propertyTours" },
  "/leads": { groupKey: "breadcrumbs.groups.propertyManagement", labelKey: "breadcrumbs.leadManagement" },

  // Mortgage Requests
  "/mortgage/applications": { groupKey: "breadcrumbs.groups.mortgageRequests", labelKey: "breadcrumbs.newApplications" },
  "/mortgage/pre-approvals": { groupKey: "breadcrumbs.groups.mortgageRequests", labelKey: "breadcrumbs.preApprovals" },
  "/mortgage/deals": { groupKey: "breadcrumbs.groups.mortgageRequests", labelKey: "breadcrumbs.financingDeals" },

  // Legal Services
  "/legal/consultations": { groupKey: "breadcrumbs.groups.legalServices", labelKey: "breadcrumbs.consultations" },
  "/legal/contracts": { groupKey: "breadcrumbs.groups.legalServices", labelKey: "breadcrumbs.contractReviews" },
  "/legal/documents": { groupKey: "breadcrumbs.groups.legalServices", labelKey: "breadcrumbs.documents" },

  // Accounting Services
  "/accounting/consultations": { groupKey: "breadcrumbs.groups.accountingServices", labelKey: "breadcrumbs.consultations" },
  "/accounting/analysis": { groupKey: "breadcrumbs.groups.accountingServices", labelKey: "breadcrumbs.financialAnalysis" },
  "/accounting/tax-planning": { groupKey: "breadcrumbs.groups.accountingServices", labelKey: "breadcrumbs.taxPlanning" },

  // Notarization Services
  "/notary/requests": { groupKey: "breadcrumbs.groups.notarizationServices", labelKey: "breadcrumbs.requests" },
  "/notary/signings": { groupKey: "breadcrumbs.groups.notarizationServices", labelKey: "breadcrumbs.documentSignings" },
  "/notary/transactions": { groupKey: "breadcrumbs.groups.notarizationServices", labelKey: "breadcrumbs.transactions" },

  // Tax Services
  "/tax/consultations": { groupKey: "breadcrumbs.groups.taxServices", labelKey: "breadcrumbs.consultations" },
  "/tax/filings": { groupKey: "breadcrumbs.groups.taxServices", labelKey: "breadcrumbs.taxFilings" },
  "/tax/planning": { groupKey: "breadcrumbs.groups.taxServices", labelKey: "breadcrumbs.taxPlanning" },

  // Appraisal Services
  "/appraisal/requests": { groupKey: "breadcrumbs.groups.appraisalServices", labelKey: "breadcrumbs.requests" },
  "/appraisal/valuations": { groupKey: "breadcrumbs.groups.appraisalServices", labelKey: "breadcrumbs.propertyValuations" },
  "/appraisal/reports": { groupKey: "breadcrumbs.groups.appraisalServices", labelKey: "breadcrumbs.valuationReports" },

  // Single items (no group)
  "/dashboard": { labelKey: "breadcrumbs.dashboard" },
  "/chat": { labelKey: "breadcrumbs.chat" },
  "/clients": { labelKey: "breadcrumbs.clients" },
  "/settings": { labelKey: "breadcrumbs.settings" },
  "/profile/investor": { labelKey: "breadcrumbs.profile" },
  "/profile/provider": { labelKey: "breadcrumbs.profile" },
  "/properties/new": { groupKey: "breadcrumbs.groups.marketplace", labelKey: "breadcrumbs.newProperty" },
  "/onboarding": { labelKey: "breadcrumbs.onboarding" },
  "/onboarding/questionnaire": { labelKey: "breadcrumbs.questionnaire" },
  "/onboarding/vendor-profile": { labelKey: "breadcrumbs.vendorProfile" },
  "/design-system": { labelKey: "breadcrumbs.designSystem" },
  "/search": { labelKey: "breadcrumbs.search" },
  "/feed": { labelKey: "breadcrumbs.feed" },
  "/providers": { labelKey: "breadcrumbs.providers" },
  "/analytics": { labelKey: "breadcrumbs.analytics" },
  "/admin/vendors/pending": { labelKey: "breadcrumbs.pendingVendors" },
};

interface AppShellProps {
  children: React.ReactNode;
}

// Generate breadcrumb items from pathname (returns translation keys)
function generateBreadcrumbs(pathname: string, searchParams: string) {
  const breadcrumbs: { labelKey: string; href?: string }[] = [];

  // Build full path with query params if present
  const fullPath = searchParams ? `${pathname}?${searchParams}` : pathname;

  // Check for exact match first (including query params)
  let config = breadcrumbConfig[fullPath];

  // If no exact match with query, try without query params
  if (!config) {
    config = breadcrumbConfig[pathname];
  }

  // If we have a config, use it
  if (config) {
    // Add group as first breadcrumb (non-clickable)
    if (config.groupKey) {
      breadcrumbs.push({ labelKey: config.groupKey });
    }
    // Add the page label as the last breadcrumb
    breadcrumbs.push({ labelKey: config.labelKey });
    return breadcrumbs;
  }

  // Handle dynamic routes (e.g., /properties/[id], /properties/[id]/edit, /deals/[id])
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length >= 2) {
    const baseRoute = `/${segments[0]}`;
    const baseConfig = breadcrumbConfig[baseRoute];

    if (baseConfig) {
      // Add group if present
      if (baseConfig.groupKey) {
        breadcrumbs.push({ labelKey: baseConfig.groupKey });
      }

      // Add base route as clickable link
      breadcrumbs.push({ labelKey: baseConfig.labelKey, href: baseRoute });

      // Check if second segment is an ID (dynamic route)
      const isId = /^[a-z0-9]{10,}$/i.test(segments[1]);
      if (isId) {
        // Check for /edit suffix
        if (segments[2] === "edit") {
          breadcrumbs.push({ labelKey: "breadcrumbs.edit" });
        } else {
          breadcrumbs.push({ labelKey: "breadcrumbs.details" });
        }
      } else {
        // Not an ID, try to find config for the full path
        const subConfig = breadcrumbConfig[pathname];
        if (subConfig) {
          breadcrumbs.push({ labelKey: subConfig.labelKey });
        } else {
          // Fallback: use segment as key (will show key if no translation)
          breadcrumbs.push({ labelKey: `breadcrumbs.${segments[segments.length - 1]}` });
        }
      }
      return breadcrumbs;
    }
  }

  // Fallback: use path segments as keys
  segments.forEach((segment) => {
    breadcrumbs.push({ labelKey: `breadcrumbs.${segment}` });
  });

  return breadcrumbs;
}

// Inline authenticated content for provider header
function ProviderHeaderContent() {
  const tRoles = useTranslations("common.roles");
  const tHeader = useTranslations("header");
  const currentUser = useQuery(api.users.getCurrentUser);
  const setViewingAsRole = useMutation(api.users.setViewingAsRole);

  // Admin check is based on actual role, not viewingAsRole
  const isAdmin = currentUser?.role === "admin";

  // The effective role being viewed (viewingAsRole if set, otherwise actual role)
  const effectiveRole = currentUser?.viewingAsRole ?? currentUser?.role;

  // Get translated role label
  const getRoleLabel = (roleValue: string) => {
    const labelMap: Record<string, string> = {
      investor: tRoles("investor"),
      broker: tRoles("broker"),
      mortgage_advisor: tRoles("mortgageAdvisor"),
      lawyer: tRoles("lawyer"),
      admin: tRoles("admin"),
    };
    return labelMap[roleValue] || roleValue;
  };

  const handleRoleChange = (role: string) => {
    setViewingAsRole({
      viewingAsRole: role as
        | "investor"
        | "broker"
        | "mortgage_advisor"
        | "lawyer"
        | "admin",
    });
  };

  return (
    <div className="flex items-center gap-3">
      {/* Role-switching dropdown - admin only */}
      {isAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <span className="text-muted-foreground">{tHeader("viewAs")}</span>
              <span className="font-medium">
                {effectiveRole ? getRoleLabel(effectiveRole) : tRoles("admin")}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{tHeader("switchView")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {USER_ROLES.map((role) => (
              <DropdownMenuItem
                key={role.value}
                onClick={() => handleRoleChange(role.value)}
                className="flex items-center justify-between cursor-pointer"
              >
                {getRoleLabel(role.value)}
                {effectiveRole === role.value && (
                  <HugeiconsIcon
                    icon={CheckmarkCircle01Icon}
                    size={16}
                    className="text-primary"
                  />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Avatar dropdown (replaces UserButton + NotificationCenter + LocaleSwitcher) */}
      <AvatarDropdown />
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  const { effectiveRole } = useCurrentUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const t = useTranslations();
  const isMobile = useIsMobile();

  // Generate breadcrumbs
  const breadcrumbs = generateBreadcrumbs(pathname, searchParamsString);

  // Show search bar on marketplace/browse properties pages for all roles
  const showSearchBar =
    pathname === "/properties" || pathname === "/properties/saved";

  // Full-bleed pages (no padding wrapper)
  const isFullBleedPage = pathname === "/properties" || pathname === "/chat";

  // Unified sidebar layout for all roles
  return (
    <SidebarProvider>
      <IncompleteProfileReminder />
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4">
          {/* Left: Sidebar trigger + breadcrumbs */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ms-1" />
            <Separator orientation="vertical" className="me-2 h-4 hidden md:block" />
            {/* Breadcrumbs - hidden on mobile (HDR-07) */}
            <Breadcrumb className="hidden md:block">
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  const label = t(crumb.labelKey);
                  return (
                    <React.Fragment key={`${crumb.labelKey}-${index}`}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{label}</BreadcrumbPage>
                        ) : crumb.href ? (
                          <BreadcrumbLink asChild>
                            <Link href={crumb.href}>{label}</Link>
                          </BreadcrumbLink>
                        ) : (
                          <span className="text-muted-foreground">{label}</span>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Center: Global search (authenticated only) */}
          <Authenticated>
            <div className="flex items-center gap-2 flex-1 justify-end px-4">
              {/* Mobile search trigger (HDR-01) */}
              <MobileSearchExpander
                onOpenSearch={() => {
                  // Dispatch keyboard event to open GlobalSearchBar dialog
                  document.dispatchEvent(
                    new KeyboardEvent("keydown", {
                      key: "k",
                      metaKey: true,
                      bubbles: true,
                    })
                  );
                }}
              />
              {/* Desktop search bar */}
              <div className="hidden md:block">
                <GlobalSearchBar />
              </div>
            </div>
          </Authenticated>

          {/* Right: Auth section */}
          <div className="flex items-center">
            <AuthLoading>
              <Skeleton className="h-8 w-8 rounded-full" />
            </AuthLoading>

            <Authenticated>
              <ProviderHeaderContent />
            </Authenticated>

            <Unauthenticated>
              <Button asChild variant="outline" size="sm">
                <Link href="/sign-in">{t("header.signIn")}</Link>
              </Button>
            </Unauthenticated>
          </div>
        </header>

        {/* Search bar for investor marketplace pages */}
        {showSearchBar && <InvestorSearchBar />}

        {/* Main content area */}
        <main className={cn(
          isFullBleedPage ? "" : "",
          isMobile && "pb-20" // Space for bottom tab bar (~80px)
        )}>
          {isFullBleedPage ? (
            <div className={cn(
              "h-[calc(100dvh-4rem)]",
              isMobile && "h-[calc(100dvh-4rem-5rem)]" // Subtract tab bar height
            )}>
              {children}
            </div>
          ) : (
            children
          )}
        </main>
      </SidebarInset>
      <MobileBottomNav />
    </SidebarProvider>
  );
}
