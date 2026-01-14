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

const navItems: NavItem[] = [
  { icon: Home01Icon, label: "Home", href: "/dashboard" },
  { icon: Building02Icon, label: "Properties", href: "/properties" },
  { icon: FavouriteIcon, label: "Saved", href: "/properties/saved" },
  { icon: Agreement01Icon, label: "Deals", href: "/deals" },
  { icon: Settings01Icon, label: "Settings", href: "/settings" },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[60px]",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              <HugeiconsIcon
                icon={item.icon}
                size={20}
                strokeWidth={isActive ? 2 : 1.5}
              />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
