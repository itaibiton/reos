"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  ResponsiveDialog,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FollowButton } from "./FollowButton";
import { Users } from "lucide-react";

// Role labels
const ROLE_LABELS: Record<string, string> = {
  investor: "Investor",
  broker: "Broker",
  mortgage_advisor: "Mortgage Advisor",
  lawyer: "Lawyer",
  accountant: "Accountant",
  notary: "Notary",
  tax_consultant: "Tax Consultant",
  appraiser: "Appraiser",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface FollowListDialogProps {
  userId: Id<"users">;
  type: "followers" | "following" | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FollowListDialog({
  userId,
  type,
  open,
  onOpenChange,
}: FollowListDialogProps) {
  // Query based on type
  const followers = useQuery(
    api.userFollows.getFollowers,
    type === "followers" ? { userId } : "skip"
  );
  const following = useQuery(
    api.userFollows.getFollowing,
    type === "following" ? { userId } : "skip"
  );

  // Get current user to determine if viewing own list
  const currentUser = useQuery(api.users.getCurrentUser);

  const users = type === "followers" ? followers : following;
  const title = type === "followers" ? "Followers" : "Following";
  const emptyMessage = type === "followers"
    ? "No followers yet"
    : "Not following anyone yet";

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>{title}</ResponsiveDialogTitle>
      </ResponsiveDialogHeader>

        {users === undefined ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
          </div>
        ) : users.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>{emptyMessage}</p>
          </div>
        ) : (
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-3 pe-4">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center gap-3"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.imageUrl} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{user.name}</p>
                    {user.role && (
                      <Badge variant="secondary" className="text-xs">
                        {ROLE_LABELS[user.role] || user.role}
                      </Badge>
                    )}
                  </div>
                  <FollowButton
                    userId={user._id}
                    isOwnPost={currentUser?._id === user._id}
                  />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
    </ResponsiveDialog>
  );
}
