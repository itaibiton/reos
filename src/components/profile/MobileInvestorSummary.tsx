"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import * as Tabs from "@radix-ui/react-tabs";
import { HugeiconsIcon } from "@hugeicons/react";
import { UserCircle02Icon, AiChat02Icon } from "@hugeicons/core-free-icons";
import { ProfileSummaryPanel } from "./ProfileSummaryPanel";
import { AIChatPanel } from "@/components/ai/AIChatPanel";
import { QuickReplyButtons } from "./QuickReplyButtons";
import { cn } from "@/lib/utils";

interface MobileInvestorSummaryProps {
  profileComplete: boolean;
}

type TabValue = "profile" | "chat";

export function MobileInvestorSummary({
  profileComplete,
}: MobileInvestorSummaryProps) {
  const [activeTab, setActiveTab] = useState<TabValue>("profile");
  const [prevTab, setPrevTab] = useState<TabValue>("profile");

  // Calculate animation direction based on tab order
  const handleTabChange = (value: string) => {
    const newTab = value as TabValue;
    setPrevTab(activeTab);
    setActiveTab(newTab);
  };

  // Compute direction: 1 = forward (left to right), -1 = backward (right to left)
  const direction = activeTab === "chat" && prevTab === "profile" ? 1 : -1;

  return (
    <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
      {/* Content area - fills viewport minus header and tab bar */}
      <div className="h-[calc(100dvh-var(--header-height)-var(--tab-bar-height))] overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <Tabs.Content
            value="profile"
            key="profile-content"
            className="h-full data-[state=inactive]:hidden"
            forceMount
          >
            {activeTab === "profile" && (
              <motion.div
                initial={{ x: direction * 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction * -100, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="h-full overflow-y-auto"
              >
                <ProfileSummaryPanel />
              </motion.div>
            )}
          </Tabs.Content>

          <Tabs.Content
            value="chat"
            key="chat-content"
            className="h-full data-[state=inactive]:hidden"
            forceMount
          >
            {activeTab === "chat" && (
              <motion.div
                initial={{ x: direction * 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: direction * -100, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="h-full"
              >
                <AIChatPanel
                  renderQuickReplies={(sendMessage) => (
                    <QuickReplyButtons
                      onPromptSelect={sendMessage}
                      profileComplete={profileComplete}
                    />
                  )}
                />
              </motion.div>
            )}
          </Tabs.Content>
        </AnimatePresence>
      </div>

      {/* Bottom tab bar - fixed at bottom with safe area padding */}
      <Tabs.List className="fixed bottom-0 inset-x-0 h-[var(--tab-bar-height)] border-t bg-background flex items-center justify-around safe-area-bottom">
        <Tabs.Trigger
          value="profile"
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1",
            "min-h-11 py-2",
            "text-muted-foreground data-[state=active]:text-foreground",
            "transition-colors",
            "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        >
          <HugeiconsIcon icon={UserCircle02Icon} size={20} />
          <span className="text-xs font-medium">Profile</span>
        </Tabs.Trigger>

        <Tabs.Trigger
          value="chat"
          className={cn(
            "flex-1 flex flex-col items-center justify-center gap-1",
            "min-h-11 py-2",
            "text-muted-foreground data-[state=active]:text-foreground",
            "transition-colors",
            "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          )}
        >
          <HugeiconsIcon icon={AiChat02Icon} size={20} />
          <span className="text-xs font-medium">AI Assistant</span>
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  );
}
