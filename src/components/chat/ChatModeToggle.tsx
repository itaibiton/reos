"use client";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { HugeiconsIcon } from "@hugeicons/react";
import { Home01Icon, Message02Icon } from "@hugeicons/core-free-icons";

export type ChatMode = "deals" | "direct";

interface ChatModeToggleProps {
  mode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  directUnreadCount?: number;
}

export function ChatModeToggle({
  mode,
  onModeChange,
  directUnreadCount = 0,
}: ChatModeToggleProps) {
  return (
    <ToggleGroup
      type="single"
      value={mode}
      onValueChange={(value) => {
        if (value) onModeChange(value as ChatMode);
      }}
      variant="outline"
      className="w-full"
    >
      <ToggleGroupItem value="deals" className="flex-1 gap-1.5">
        <HugeiconsIcon icon={Home01Icon} size={16} />
        <span>Deals</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="direct" className="flex-1 gap-1.5 relative">
        <HugeiconsIcon icon={Message02Icon} size={16} />
        <span>Direct</span>
        {directUnreadCount > 0 && (
          <span className="absolute -top-1 -end-1 h-4 min-w-4 px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium flex items-center justify-center">
            {directUnreadCount > 99 ? "99+" : directUnreadCount}
          </span>
        )}
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
