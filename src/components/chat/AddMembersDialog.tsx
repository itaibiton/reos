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
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { toast } from "sonner";

interface AddMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: Id<"conversations">;
  existingParticipantIds: Id<"users">[];
  onMembersAdded: () => void;
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

export function AddMembersDialog({
  open,
  onOpenChange,
  conversationId,
  existingParticipantIds,
  onMembersAdded,
}: AddMembersDialogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<Id<"users">[]>([]);
  const [isAdding, setIsAdding] = useState(false);

  // Fetch all users
  const users = useQuery(api.users.listAll, { searchQuery });

  const updateGroup = useMutation(api.conversations.updateGroup);

  // Filter to show only users who aren't already in the group and not selected
  const availableUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(
      (user) =>
        !existingParticipantIds.includes(user._id) &&
        !selectedUserIds.includes(user._id)
    );
  }, [users, existingParticipantIds, selectedUserIds]);

  // Get selected user objects
  const selectedUsers = useMemo(() => {
    if (!users) return [];
    return users.filter((user) => selectedUserIds.includes(user._id));
  }, [users, selectedUserIds]);

  const handleSelectUser = (userId: Id<"users">) => {
    setSelectedUserIds((prev) => [...prev, userId]);
  };

  const handleDeselectUser = (userId: Id<"users">) => {
    setSelectedUserIds((prev) => prev.filter((id) => id !== userId));
  };

  const handleAdd = async () => {
    if (selectedUserIds.length === 0) {
      toast.error("Please select at least one user");
      return;
    }

    setIsAdding(true);
    try {
      await updateGroup({
        conversationId,
        addParticipants: selectedUserIds,
      });

      // Reset state
      setSearchQuery("");
      setSelectedUserIds([]);

      onMembersAdded();
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to add members:", error);
      toast.error("Failed to add members");
    } finally {
      setIsAdding(false);
    }
  };

  const handleClose = () => {
    setSearchQuery("");
    setSelectedUserIds([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Members</DialogTitle>
          <DialogDescription>
            Select users to add to this group
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
                  <div
                    key={i}
                    className="h-12 bg-muted/50 rounded-md animate-pulse"
                  />
                ))
              ) : availableUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {searchQuery
                    ? "No users match your search"
                    : "No users available to add"}
                </p>
              ) : (
                availableUsers.map((user) => (
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
            onClick={handleAdd}
            disabled={selectedUserIds.length === 0 || isAdding}
          >
            {isAdding
              ? "Adding..."
              : `Add ${selectedUserIds.length > 0 ? `(${selectedUserIds.length})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
