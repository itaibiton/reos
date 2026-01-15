"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { InvestorSearchBar } from "./InvestorSearchBar";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface AppShellProps {
  children: React.ReactNode;
}

const SIDEBAR_COLLAPSED_KEY = "sidebar-collapsed";

export function AppShell({ children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const { effectiveRole } = useCurrentUser();
  const pathname = usePathname();

  // Load collapsed state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    if (stored !== null) {
      setIsSidebarCollapsed(stored === "true");
    }
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const toggleSidebarCollapse = () => {
    const newValue = !isSidebarCollapsed;
    setIsSidebarCollapsed(newValue);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(newValue));
  };

  // Investor gets top nav layout (no sidebar)
  const isInvestorLayout = effectiveRole === "investor";

  // Show search bar on marketplace pages for investor
  const showSearchBar =
    isInvestorLayout &&
    (pathname === "/properties" ||
      pathname === "/properties/saved" ||
      pathname === "/dashboard");

  // Full-bleed pages (no padding wrapper)
  const isFullBleedPage = pathname === "/properties" || pathname === "/chat";

  if (isInvestorLayout) {
    return (
      <div className="h-screen flex flex-col bg-background">
        <Header
          isSidebarOpen={false}
          onToggleSidebar={() => {}}
          showTopNav={true}
          showSidebarToggle={false}
        />

        {/* Spacer for fixed header */}
        <div className="h-16 flex-shrink-0" />

        {/* Search bar for marketplace pages */}
        {showSearchBar && <InvestorSearchBar />}

        {/* Main content area - fills remaining space */}
        <main className="flex-1 overflow-hidden pb-16 md:pb-0">
          {isFullBleedPage ? children : <div className="h-full overflow-auto">{children}</div>}
        </main>

        {/* Mobile bottom navigation */}
        <MobileBottomNav />
      </div>
    );
  }

  // Provider layout (sidebar)
  const sidebarWidth = isSidebarCollapsed ? "lg:ml-16" : "lg:ml-64";

  return (
    <div className="min-h-screen bg-background">
      <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebarCollapse}
      />

      {/* Main content area */}
      <main
        className={`pt-16 transition-all duration-200 ${sidebarWidth} ${isFullBleedPage ? "h-screen" : ""}`}
      >
        {isFullBleedPage ? (
          <div className="h-[calc(100vh-4rem)]">{children}</div>
        ) : (
          <div className="p-6">{children}</div>
        )}
      </main>
    </div>
  );
}
