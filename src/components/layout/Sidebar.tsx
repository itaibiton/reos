"use client";

import Link from "next/link";
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
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { useCurrentUser, type UserRole } from "@/hooks/useCurrentUser";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
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

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { effectiveRole, isLoading } = useCurrentUser();

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
          "fixed left-0 top-16 bottom-0 z-40 w-64 border-r bg-background transition-transform duration-200",
          "lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <nav className="flex flex-col gap-1 p-4">
          {isLoading ? (
            // Show skeleton while loading
            <>
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-10 rounded-lg bg-muted animate-pulse"
                />
              ))}
            </>
          ) : (
            visibleNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={onClose}
              >
                <HugeiconsIcon icon={item.icon} size={20} strokeWidth={1.5} />
                <span>{item.label}</span>
              </Link>
            ))
          )}
        </nav>
      </aside>
    </>
  );
}
