"use client";

import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

interface HeaderProps {
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Header({ isSidebarOpen, onToggleSidebar }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b bg-background px-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {/* Mobile hamburger menu */}
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

        {/* Logo */}
        <span className="text-xl font-bold">REOS</span>
      </div>

      {/* User menu placeholder */}
      <Button variant="outline" size="sm">
        Sign In
      </Button>
    </header>
  );
}
