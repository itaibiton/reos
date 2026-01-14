"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { InvestorSearchBar } from "./InvestorSearchBar";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { effectiveRole } = useCurrentUser();
  const pathname = usePathname();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Investor gets top nav layout (no sidebar)
  const isInvestorLayout = effectiveRole === "investor";

  // Show search bar on marketplace pages for investor
  const showSearchBar =
    isInvestorLayout &&
    (pathname === "/properties" ||
      pathname === "/properties/saved" ||
      pathname === "/dashboard");

  // Full-bleed pages (no padding wrapper)
  const isFullBleedPage = pathname === "/properties";

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
          {isFullBleedPage ? children : <div className="h-full overflow-auto p-6">{children}</div>}
        </main>

        {/* Mobile bottom navigation */}
        <MobileBottomNav />
      </div>
    );
  }

  // Provider layout (sidebar)
  return (
    <div className="min-h-screen bg-background">
      <Header isSidebarOpen={isSidebarOpen} onToggleSidebar={toggleSidebar} />
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* Main content area */}
      <main className="pt-16 lg:ml-64">
        <div className="p-6">{children}</div>
      </main>
    </div>
  );
}
