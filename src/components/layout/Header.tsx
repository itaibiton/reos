"use client";

import { UserButton } from "@clerk/nextjs";
import {
  Authenticated,
  Unauthenticated,
  AuthLoading,
  useQuery,
  useMutation,
} from "convex/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Menu01Icon,
  Cancel01Icon,
  CheckmarkCircle01Icon,
  BlackHoleIcon
} from "@hugeicons/core-free-icons";
import { api } from "../../../convex/_generated/api";
import { USER_ROLES } from "@/lib/constants";
import { TopNav } from "./TopNav";
import { NotificationCenter } from "@/components/notifications/NotificationCenter";

// Separate component to use hooks inside Authenticated block
function AuthenticatedContent() {
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

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  showTopNav?: boolean;
  showSidebarToggle?: boolean;
  isInline?: boolean;
}

export function Header({
  isSidebarOpen,
  onToggleSidebar,
  showTopNav = false,
  showSidebarToggle = true,
  isInline = false,
}: HeaderProps) {
  return (
    <header
      className={`h-16 border-b bg-background px-6 flex items-center justify-between flex-shrink-0 ${
        isInline ? "" : "fixed top-0 left-0 right-0 z-50"
      }`}
    >
      <div className="flex items-center gap-4">
        {/* Mobile hamburger menu - only for sidebar layout */}
        {showSidebarToggle && (
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={onToggleSidebar}
            aria-label={isSidebarOpen ? "Close menu" : "Open menu"}
          >
            <HugeiconsIcon
              icon={isSidebarOpen ? Cancel01Icon : Menu01Icon}
              size={20}
              strokeWidth={1.5}
            />
          </Button>
        )}

        {/* Logo */}
        <Link href="/" className="text-xl font-bold flex items-center gap-3">
        <HugeiconsIcon icon={BlackHoleIcon} size={24} strokeWidth={1.5} /> 
          REOS
        </Link>

        {/* Top navigation for investor layout */}
        {showTopNav && (
          <div className="hidden md:block ml-4">
            <TopNav />
          </div>
        )}
      </div>

      {/* Auth section */}
      <div className="flex items-center">
        <AuthLoading>
          <Skeleton className="h-8 w-8 rounded-full" />
        </AuthLoading>

        <Authenticated>
          <AuthenticatedContent />
        </Authenticated>

        <Unauthenticated>
          <Button asChild variant="outline" size="sm">
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </Unauthenticated>
      </div>
    </header>
  );
}
