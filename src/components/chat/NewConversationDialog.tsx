"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface NewConversationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConversationCreated: (conversationId: Id<"conversations">) => void;
  mode?: "direct" | "group";
}

// Format role for display
function formatRole(role?: string | null) {
  if (!role) return null;
  const labels: Record<string, string> = {
    investor: "Investor",
    broker: "Broker",
    mortgage_advisor: "Mortgage",
    lawyer: "Lawyer",
    admin: "Admin",
  };
  return labels[role] || role;
}

// Get initials from name
function getInitials(name?: string | null) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function NewConversationDialog({
  open,
  onOpenChange,
  onConversationCreated,
  mode = "direct",
}: NewConversationDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Id<"users">[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const isGroupMode = mode === "group";

  // Fetch all users
  const users = useQuery(api.users.listAll, { searchQuery });

  // Mutations
  const getOrCreateDirect = useMutation(api.conversations.getOrCreateDirect);
  const createGroup = useMutation(api.conversations.createGroup);

  // Filter to show only unselected users
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((user) => !selectedUserIds.includes(user._id));
  }, [users, selectedUserIds]);

  // Get selected user objects
  const selectedUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((user) => selectedUserIds.includes(user._id));
  }, [users, selectedUserIds]);

  const isGroup = isGroupMode || selectedUserIds.length > 1;

  const handleSelectUser = (userId: Id<"users">) => {
    // In direct mode (non-group), only allow one selection
    if (!isGroupMode && selectedUserIds.length >= 1) {
      setSelectedUserIds([userId]);
    } else {
      setSelectedUserIds((prev) => [...prev, userId]);
    }
  };

  const handleDeselectUser = (userId: Id<"users">) => {
    setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
  };

  const handleCreate = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    // In group mode, require at least 2 users for a meaningful group
    if (isGroupMode && selectedUserIds.length < 2) {
      toast.error("Please select at least 2 users for a group");
      return;
    }

    setIsCreating(true);
    try {
      let conversationId: Id<"conversations">;

      if (selectedUserIds.length === 1) {
        // Create or get direct conversation
        conversationId = await getOrCreateDirect({
          otherUserId: selectedUserIds[0],
        });
      } else {
        // Create group conversation
        conversationId = await createGroup({
          name: groupName.trim() || undefined,
          participantIds: selectedUserIds,
        });
      }

      // Reset state
      setSearchQuery("");
      setSelectedUserIds([]);
      setGroupName("");

      onConversationCreated(conversationId);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      toast.error("Failed to create conversation");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedUserIds([]);
    setGroupName("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isGroupMode ? "New Group" : "New Conversation"}
          </DialogTitle>
          <DialogDescription>
            {isGroupMode
              ? "Select users to create a new group"
              : "Select a user to start a conversation"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selected users */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedUsers.map((user) => (
                <Badge
                  key={user._id}
                  variant="secondary"
                  className="flex items-center gap-1 pr-1"
                >
                  <span>{user.name}</span>
                  <button
                    onClick={() => handleDeselectUser(user._id)}
                    className="p-0.5 rounded-full hover:bg-background/50"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={12} />
                  </button>
                </Badge>
              ))}
            </div>
          )}

          {/* Group name input (shown for 2+ users) */}
          {isGroup && (
            <div className="space-y-2">
              <Label htmlFor="groupName">Group Name (optional)</Label>
              <Input
                id="groupName"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name..."
                className="h-9"
              />
            </div>
          )}

          {/* Search input */}
          <div className="relative">
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-9"
            />
          </div>

          {/* Users list */}
          <ScrollArea className="h-[200px] border rounded-md">
            <div className="p-2 space-y-1">
              {users === undefined ? (
                // Loading
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-muted/50 rounded-md animate-pulse" />
                ))
              ) : filteredUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {searchQuery ? "No users match your search" : "No users available"}
                </p>
              ) : (
                filteredUsers.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => handleSelectUser(user._id)}
                    className="w-full flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.imageUrl} alt={user.name} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-sm font-medium truncate">{user.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    {user.role && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        {formatRole(user.role)}
                      </Badge>
                    )}
                  </button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={
              selectedUserIds.length === 0 ||
              (isGroupMode && selectedUserIds.length < 2) ||
              isCreating
            }
          >
            {isCreating
              ? "Creating..."
              : isGroup
              ? "Create Group"
              : "Start Chat"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
