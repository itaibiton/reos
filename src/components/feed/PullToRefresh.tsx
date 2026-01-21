"use client";

import PullToRefresh from "react-simple-pull-to-refresh";
import { useIsMobile } from "@/hooks/use-mobile";

interface PullToRefreshWrapperProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
}

export function PullToRefreshWrapper({
  onRefresh,
  children,
}: PullToRefreshWrapperProps) {
  const isMobile = useIsMobile();

  // Only enable on mobile
  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <PullToRefresh
      onRefresh={onRefresh}
      resistance={2.5}
      maxPullDownDistance={95}
      pullDownThreshold={67}
      refreshingContent={
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
      pullingContent={
        <div className="flex justify-center py-4">
          <div className="h-6 w-6 rounded-full border-2 border-muted-foreground border-t-transparent" />
        </div>
      }
    >
      {children}
    </PullToRefresh>
  );
}
