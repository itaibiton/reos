"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface LeaveGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: Id<"conversations">;
  groupName: string;
  onLeft: () => void;
}

export function LeaveGroupDialog({
  open,
  onOpenChange,
  conversationId,
  groupName,
  onLeft,
}: LeaveGroupDialogProps) {
  const [isLeaving, setIsLeaving] = useState(false);

  const leaveGroup = useMutation(api.conversations.leave);

  const handleLeave = async () => {
    setIsLeaving(true);
    try {
      await leaveGroup({ conversationId });
      toast.success("Left group");
      onLeft();
    } catch (error) {
      console.error("Failed to leave group:", error);
      toast.error("Failed to leave group");
    } finally {
      setIsLeaving(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Leave "{groupName}"?</AlertDialogTitle>
          <AlertDialogDescription>
            You won't be able to see messages from this group anymore. You can
            be added back by another member.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLeaving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLeave}
            disabled={isLeaving}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLeaving ? "Leaving..." : "Leave Group"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
