"use client";

import { useClerk } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { useTranslations, useLocale } from "next-intl";
import { api } from "../../../convex/_generated/api";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification01Icon,
  Settings01Icon,
  Logout01Icon,
} from "@hugeicons/core-free-icons";
import { NotificationsTab } from "./NotificationsTab";
import { SettingsTab } from "./SettingsTab";

// Get initials from name
function getInitials(name: string | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function AvatarDropdown() {
  const { signOut } = useClerk();
  const locale = useLocale();
  const t = useTranslations("header");
  const tNotifications = useTranslations("header.notifications");
  const tSettings = useTranslations("header.settings");

  // Queries
  const user = useQuery(api.users.getCurrentUser);
  const unreadCount = useQuery(api.notifications.getUnreadCount);

  const handleSignOut = () => {
    signOut({ redirectUrl: `/${locale}` });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Avatar className="h-8 w-8">
            {user?.imageUrl && (
              <AvatarImage src={user.imageUrl} alt={user.name || "User"} />
            )}
            <AvatarFallback className="text-xs">
              {getInitials(user?.name)}
            </AvatarFallback>
          </Avatar>
          {/* Unread badge */}
          {unreadCount !== undefined && unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -end-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">{tNotifications("title")}</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <Tabs defaultValue="notifications" className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none rounded-t-md">
            <TabsTrigger value="notifications" className="gap-1.5">
              <HugeiconsIcon
                icon={Notification01Icon}
                size={16}
                strokeWidth={1.5}
              />
              {tNotifications("title")}
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5">
              <HugeiconsIcon
                icon={Settings01Icon}
                size={16}
                strokeWidth={1.5}
              />
              {tSettings("title")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="mt-0">
            <NotificationsTab />
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <SettingsTab />
          </TabsContent>
        </Tabs>

        <Separator />

        {/* Sign out button */}
        <div className="p-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={handleSignOut}
          >
            <HugeiconsIcon icon={Logout01Icon} size={16} strokeWidth={1.5} />
            {t("signOut")}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
