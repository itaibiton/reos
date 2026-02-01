"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { getMobileTabsForRole, type UserRole } from "@/lib/navigation";
import { Badge } from "@/components/ui/badge";
import { useAIAssistant } from "@/providers/AIAssistantProvider";

export function MobileBottomNav() {
  const pathname = usePathname();
  const t = useTranslations();
  const { effectiveRole } = useCurrentUser();
  const { isOpen: isAIPanelOpen } = useAIAssistant();

  // Fetch chat unread count for badge
  const chatUnread = useQuery(api.directMessages.getTotalUnreadCount);

  // Get role-based tabs (defaults to investor if role not yet loaded)
  const tabs = getMobileTabsForRole((effectiveRole as UserRole) ?? "investor");

  // Hide when AI panel is open
  if (isAIPanelOpen) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 border-t bg-background md:hidden safe-area-bottom">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const isActive =
            pathname === tab.href || pathname.startsWith(tab.href + "/");
          const unreadCount = tab.showBadge === "chat" ? (chatUnread ?? 0) : 0;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "relative flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 min-w-[60px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 h-0.5 w-6 bg-primary rounded-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}

              <div className="relative">
                <HugeiconsIcon
                  icon={tab.hugeIcon}
                  size={22}
                  strokeWidth={isActive ? 2 : 1.5}
                />
                {/* Unread badge */}
                {unreadCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1.5 -end-2 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
                  >
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </Badge>
                )}
              </div>

              <span className="text-[10px] font-medium">{t(tab.labelKey)}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
