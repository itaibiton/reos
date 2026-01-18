"use client";

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

// Route label mappings for breadcrumbs
const routeLabels: Record<string, string> = {
  properties: "Properties",
  deals: "Deals",
  chat: "Chat",
  profile: "Profile",
  settings: "Settings",
  dashboard: "Dashboard",
  clients: "Clients",
  investor: "Investor Profile",
  provider: "Provider Profile",
  new: "New Property",
  edit: "Edit",
  listings: "Your Listings",
  tours: "Property Tours",
  leads: "Lead Management",
  mortgage: "Mortgage",
  applications: "Applications",
  "pre-approvals": "Pre-approvals",
  legal: "Legal",
  consultations: "Consultations",
  contracts: "Contracts",
  documents: "Documents",
  accounting: "Accounting",
  analysis: "Financial Analysis",
  "tax-planning": "Tax Planning",
  notary: "Notary",
  requests: "Requests",
  signings: "Document Signings",
  transactions: "Transactions",
  tax: "Tax",
  filings: "Tax Filings",
  planning: "Tax Planning",
  appraisal: "Appraisal",
  valuations: "Property Valuations",
  reports: "Valuation Reports",
  onboarding: "Onboarding",
  questionnaire: "Questionnaire",
  "design-system": "Design System",
};

interface AppShellProps {
  children: React.ReactNode;
}

// Generate breadcrumb items from pathname
function generateBreadcrumbs(pathname: string, searchParams: string) {
  const segments = pathname.split("/").filter(Boolean);
  const breadcrumbs: { label: string; href: string; isLast: boolean }[] = [];

  // Special case for favorites
  if (pathname === "/properties" && searchParams.includes("favorites=true")) {
    breadcrumbs.push({
      label: "Properties",
      href: "/properties",
      isLast: false,
    });
    breadcrumbs.push({
      label: "Saved",
      href: "/properties?favorites=true",
      isLast: true,
    });
    return breadcrumbs;
  }

  let currentPath = "";
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;

    // Skip dynamic segments that look like IDs
    const isId = /^[a-z0-9]{20,}$/i.test(segment);

    // Get label from mappings or format the segment
    let label = routeLabels[segment];
    if (!label) {
      if (isId) {
        label = "Details";
      } else {
        // Capitalize and replace dashes with spaces
        label = segment
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
      }
    }

    breadcrumbs.push({
      label,
      href: currentPath,
      isLast,
    });
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
                {breadcrumbs.map((crumb, index) => (
                  <BreadcrumbItem key={crumb.href}>
                    {crumb.isLast ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <>
                        <BreadcrumbLink asChild>
                          <Link href={crumb.href}>{crumb.label}</Link>
                        </BreadcrumbLink>
                        <BreadcrumbSeparator />
                      </>
                    )}
                  </BreadcrumbItem>
                ))}
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
