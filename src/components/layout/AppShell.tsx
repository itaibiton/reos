"use client";

import React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
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
import { AppSidebar } from "./Sidebar";
import { InvestorSearchBar } from "./InvestorSearchBar";
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
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

// Breadcrumb config: maps paths to their group and label
// Format: { group?: string, label: string }
type BreadcrumbConfig = {
  group?: string;
  label: string;
};

const breadcrumbConfig: Record<string, BreadcrumbConfig> = {
  // Marketplace items
  "/properties": { group: "Marketplace", label: "Browse" },
  "/properties?favorites=true": { group: "Marketplace", label: "Saved" },
  "/deals": { group: "Marketplace", label: "Deals" },
  "/properties/listings": { group: "Marketplace", label: "Your Listings" },

  // Property Management
  "/properties/tours": { group: "Property Management", label: "Property Tours" },
  "/leads": { group: "Property Management", label: "Lead Management" },

  // Mortgage Requests
  "/mortgage/applications": { group: "Mortgage Requests", label: "New Applications" },
  "/mortgage/pre-approvals": { group: "Mortgage Requests", label: "Pre-approvals" },
  "/mortgage/deals": { group: "Mortgage Requests", label: "Financing Deals" },

  // Legal Services
  "/legal/consultations": { group: "Legal Services", label: "Consultations" },
  "/legal/contracts": { group: "Legal Services", label: "Contract Reviews" },
  "/legal/documents": { group: "Legal Services", label: "Documents" },

  // Accounting Services
  "/accounting/consultations": { group: "Accounting Services", label: "Consultations" },
  "/accounting/analysis": { group: "Accounting Services", label: "Financial Analysis" },
  "/accounting/tax-planning": { group: "Accounting Services", label: "Tax Planning" },

  // Notarization Services
  "/notary/requests": { group: "Notarization Services", label: "Requests" },
  "/notary/signings": { group: "Notarization Services", label: "Document Signings" },
  "/notary/transactions": { group: "Notarization Services", label: "Transactions" },

  // Tax Services
  "/tax/consultations": { group: "Tax Services", label: "Consultations" },
  "/tax/filings": { group: "Tax Services", label: "Tax Filings" },
  "/tax/planning": { group: "Tax Services", label: "Tax Planning" },

  // Appraisal Services
  "/appraisal/requests": { group: "Appraisal Services", label: "Requests" },
  "/appraisal/valuations": { group: "Appraisal Services", label: "Property Valuations" },
  "/appraisal/reports": { group: "Appraisal Services", label: "Valuation Reports" },

  // Single items (no group)
  "/dashboard": { label: "Dashboard" },
  "/chat": { label: "Chat" },
  "/clients": { label: "Clients" },
  "/settings": { label: "Settings" },
  "/profile/investor": { label: "Profile" },
  "/profile/provider": { label: "Profile" },
  "/profile/investor/questionnaire": { label: "Edit Questionnaire" },
  "/properties/new": { group: "Marketplace", label: "New Property" },
  "/onboarding": { label: "Onboarding" },
  "/onboarding/questionnaire": { label: "Questionnaire" },
  "/design-system": { label: "Design System" },
};

interface AppShellProps {
  children: React.ReactNode;
}

// Generate breadcrumb items from pathname
function generateBreadcrumbs(pathname: string, searchParams: string) {
  const breadcrumbs: { label: string; href?: string }[] = [];

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
    if (config.group) {
      breadcrumbs.push({ label: config.group });
    }
    // Add the page label as the last breadcrumb
    breadcrumbs.push({ label: config.label });
    return breadcrumbs;
  }

  // Handle dynamic routes (e.g., /properties/[id], /properties/[id]/edit, /deals/[id])
  const segments = pathname.split("/").filter(Boolean);

  if (segments.length >= 2) {
    const baseRoute = `/${segments[0]}`;
    const baseConfig = breadcrumbConfig[baseRoute];

    if (baseConfig) {
      // Add group if present
      if (baseConfig.group) {
        breadcrumbs.push({ label: baseConfig.group });
      }

      // Add base route as clickable link
      breadcrumbs.push({ label: baseConfig.label, href: baseRoute });

      // Check if second segment is an ID (dynamic route)
      const isId = /^[a-z0-9]{10,}$/i.test(segments[1]);
      if (isId) {
        // Check for /edit suffix
        if (segments[2] === "edit") {
          breadcrumbs.push({ label: "Edit" });
        } else {
          breadcrumbs.push({ label: "Details" });
        }
      } else {
        // Not an ID, try to find config for the full path
        const subConfig = breadcrumbConfig[pathname];
        if (subConfig) {
          breadcrumbs.push({ label: subConfig.label });
        } else {
          // Fallback: format the segment
          const label = segments[segments.length - 1]
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
          breadcrumbs.push({ label });
        }
      }
      return breadcrumbs;
    }
  }

  // Fallback: just show the path segments
  segments.forEach((segment) => {
    const label = segment
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    breadcrumbs.push({ label });
  });

  return breadcrumbs;
}

// Inline authenticated content for provider header
function ProviderHeaderContent() {
  const currentUser = useQuery(api.users.getCurrentUser);
  const setViewingAsRole = useMutation(api.users.setViewingAsRole);

  // Admin check is based on actual role, not viewingAsRole
  const isAdmin = currentUser?.role === "admin";

  // The effective role being viewed (viewingAsRole if set, otherwise actual role)
  const effectiveRole = currentUser?.viewingAsRole ?? currentUser?.role;

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
      {/* Notification center */}
      <NotificationCenter />

      {/* Role-switching dropdown - admin only */}
      {isAdmin && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
              <span className="text-muted-foreground">View as:</span>
              <span className="font-medium">
                {USER_ROLES.find((r) => r.value === effectiveRole)?.label ||
                  "Admin"}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Switch View</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {USER_ROLES.map((role) => (
              <DropdownMenuItem
                key={role.value}
                onClick={() => handleRoleChange(role.value)}
                className="flex items-center justify-between cursor-pointer"
              >
                {role.label}
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

      <UserButton
        afterSignOutUrl="/"
        appearance={{
          elements: {
            avatarBox: "h-8 w-8",
          },
        }}
      />
    </div>
  );
}

export function AppShell({ children }: AppShellProps) {
  const { effectiveRole } = useCurrentUser();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();

  // Generate breadcrumbs
  const breadcrumbs = generateBreadcrumbs(pathname, searchParamsString);

  // Show search bar on marketplace pages for investor
  const isInvestorLayout = effectiveRole === "investor";
  const showSearchBar =
    isInvestorLayout &&
    (pathname === "/properties" || pathname === "/properties/saved");

  // Full-bleed pages (no padding wrapper)
  const isFullBleedPage = pathname === "/properties" || pathname === "/chat";

  // Unified sidebar layout for all roles
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            {/* Breadcrumbs */}
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={`${crumb.label}-${index}`}>
                      <BreadcrumbItem>
                        {isLast ? (
                          <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                        ) : crumb.href ? (
                          <BreadcrumbLink asChild>
                            <Link href={crumb.href}>{crumb.label}</Link>
                          </BreadcrumbLink>
                        ) : (
                          <span className="text-muted-foreground">{crumb.label}</span>
                        )}
                      </BreadcrumbItem>
                      {!isLast && <BreadcrumbSeparator />}
                    </React.Fragment>
                  );
                })}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* Auth section */}
          <div className="flex items-center">
            <AuthLoading>
              <Skeleton className="h-8 w-8 rounded-full" />
            </AuthLoading>

            <Authenticated>
              <ProviderHeaderContent />
            </Authenticated>

            <Unauthenticated>
              <Button asChild variant="outline" size="sm">
                <Link href="/sign-in">Sign In</Link>
              </Button>
            </Unauthenticated>
          </div>
        </header>

        {/* Search bar for investor marketplace pages */}
        {showSearchBar && <InvestorSearchBar />}

        {/* Main content area */}
        <main className={isFullBleedPage ? "" : "p-6"}>
          {isFullBleedPage ? (
            <div className="h-[calc(100vh-4rem)]">{children}</div>
          ) : (
            children
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
