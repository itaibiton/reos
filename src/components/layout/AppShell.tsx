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

  if (isInvestorLayout) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          isSidebarOpen={false}
          onToggleSidebar={() => {}}
          showTopNav={true}
          showSidebarToggle={false}
        />

        {/* Search bar for marketplace pages */}
        {showSearchBar && (
          <div className="fixed top-16 left-0 right-0 z-40">
            <InvestorSearchBar />
          </div>
        )}

        {/* Main content area - no sidebar offset */}
        <main className={`pt-16 pb-16 md:pb-0 ${showSearchBar ? "pt-[140px]" : ""}`}>
          <div className="p-6">{children}</div>
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
