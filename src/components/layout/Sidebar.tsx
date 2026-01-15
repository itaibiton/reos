"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  Building02Icon,
  FavouriteIcon,
  Agreement01Icon,
  Settings01Icon,
  Add01Icon,
  UserMultiple02Icon,
  Message02Icon,
  SidebarLeft01Icon,
  SidebarRight01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { useCurrentUser, type UserRole } from "@/hooks/useCurrentUser";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

type NavItem = {
  icon: IconSvgElement;
  label: string;
  href: string;
  // Which roles can see this item (empty = all roles)
  roles?: UserRole[];
};

const navItems: NavItem[] = [
  // Dashboard - all roles
  { icon: Home01Icon, label: "Dashboard", href: "/dashboard" },

  // Marketplace - all roles
  { icon: Building02Icon, label: "Marketplace", href: "/properties" },

  // Saved Properties - investors only
  {
    icon: FavouriteIcon,
    label: "Saved Properties",
    href: "/properties/saved",
    roles: ["investor", "admin"],
  },

  // Add Property - admin only
  {
    icon: Add01Icon,
    label: "Add Property",
    href: "/properties/new",
    roles: ["admin"],
  },

  // Deals - investors (future: also service providers)
  {
    icon: Agreement01Icon,
    label: "Deals",
    href: "/deals",
    roles: ["investor", "admin"],
  },

  // Chat - all authenticated users with deals
  {
    icon: Message02Icon,
    label: "Chat",
    href: "/chat",
  },

  // Clients - service providers only (future feature)
  {
    icon: UserMultiple02Icon,
    label: "Clients",
    href: "/clients",
    roles: ["broker", "mortgage_advisor", "lawyer", "admin"],
  },

  // Settings - all roles
  { icon: Settings01Icon, label: "Settings", href: "/settings" },
];

export function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const { effectiveRole, isLoading } = useCurrentUser();
  const pathname = usePathname();

  // Filter nav items based on user's effective role
  const visibleNavItems = navItems.filter((item) => {
    // If no roles specified, show to everyone
    if (!item.roles || item.roles.length === 0) return true;
    // If user has no role yet (onboarding), show basic items
    if (!effectiveRole) return !item.roles;
    // Check if user's effective role is in the allowed roles
    return item.roles.includes(effectiveRole);
  });

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 bottom-0 z-40 border-r bg-background transition-all duration-200",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        <div className="flex flex-col h-full">
          <nav className={cn("flex flex-col gap-1 flex-1", isCollapsed ? "p-2" : "p-4")}>
            {isLoading ? (
              // Show skeleton while loading
              <>
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-lg bg-muted animate-pulse",
                      isCollapsed ? "h-10 w-10" : "h-10"
                    )}
                  />
                ))}
              </>
            ) : (
              visibleNavItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");

                const linkContent = (
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center rounded-lg transition-colors",
                      isCollapsed
                        ? "h-10 w-10 justify-center"
                        : "gap-3 px-3 py-2",
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                    onClick={onClose}
                  >
                    <HugeiconsIcon
                      icon={item.icon}
                      size={20}
                      strokeWidth={1.5}
                    />
                    {!isCollapsed && <span>{item.label}</span>}
                  </Link>
                );

                if (isCollapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right" sideOffset={8}>
                        {item.label}
                      </TooltipContent>
                    </Tooltip>
                  );
                }

                return (
                  <div key={item.href}>{linkContent}</div>
                );
              })
            )}
          </nav>

          {/* Collapse toggle button */}
          <div
            className={cn(
              "border-t flex-shrink-0",
              isCollapsed ? "p-2" : "p-4"
            )}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size={isCollapsed ? "icon" : "default"}
                  onClick={onToggleCollapse}
                  className={cn(
                    "text-muted-foreground hover:text-foreground",
                    isCollapsed ? "h-10 w-10" : "w-full justify-start gap-3"
                  )}
                >
                  <HugeiconsIcon
                    icon={isCollapsed ? SidebarRight01Icon : SidebarLeft01Icon}
                    size={20}
                    strokeWidth={1.5}
                  />
                  {!isCollapsed && <span>Collapse</span>}
                </Button>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right" sideOffset={8}>
                  Expand sidebar
                </TooltipContent>
              )}
            </Tooltip>
          </div>
        </div>
      </aside>
    </>
  );
}
