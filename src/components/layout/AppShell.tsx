"use client";

import { useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { effectiveRole } = useCurrentUser();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  // Investor gets top nav layout (no sidebar)
  const isInvestorLayout = effectiveRole === "investor";

  if (isInvestorLayout) {
    return (
      <div className="min-h-screen bg-background">
        <Header
          isSidebarOpen={false}
          onToggleSidebar={() => {}}
          showTopNav={true}
          showSidebarToggle={false}
        />

        {/* Main content area - no sidebar offset */}
        <main className="pt-16 pb-16 md:pb-0">
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
