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

interface DeleteGroupDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: Id<"conversations">;
  groupName: string;
  onDeleted: () => void;
}

export function DeleteGroupDialog({
  open,
  onOpenChange,
  conversationId,
  groupName,
  onDeleted,
}: DeleteGroupDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteGroup = useMutation(api.conversations.deleteGroup);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteGroup({ conversationId });
      toast.success("Group deleted");
      onDeleted();
    } catch (error) {
      console.error("Failed to delete group:", error);
      toast.error("Failed to delete group");
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete "{groupName}"?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently delete the group and all messages for all
            members. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete Group"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
