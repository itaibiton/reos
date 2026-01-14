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
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

type NavItem = {
  icon: IconSvgElement;
  label: string;
  href: string;
};

const investorNavItems: NavItem[] = [
  { icon: Home01Icon, label: "Dashboard", href: "/dashboard" },
  { icon: Building02Icon, label: "Marketplace", href: "/properties" },
  { icon: FavouriteIcon, label: "Saved", href: "/properties/saved" },
  { icon: Agreement01Icon, label: "Deals", href: "/deals" },
  { icon: Settings01Icon, label: "Settings", href: "/settings" },
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {investorNavItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive
                ? "bg-accent text-accent-foreground font-medium"
                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
            )}
          >
            <HugeiconsIcon icon={item.icon} size={18} strokeWidth={1.5} />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
