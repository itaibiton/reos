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
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems: { icon: IconSvgElement; label: string; href: string }[] = [
  { icon: Home01Icon, label: "Dashboard", href: "/dashboard" },
  { icon: Building02Icon, label: "Marketplace", href: "/properties" },
  { icon: FavouriteIcon, label: "Saved Properties", href: "/properties/saved" },
  { icon: Agreement01Icon, label: "Deals", href: "/deals" },
  { icon: Settings01Icon, label: "Settings", href: "/settings" },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
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
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
              onClick={onClose}
            >
              <HugeiconsIcon icon={item.icon} size={20} strokeWidth={1.5} />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
}
