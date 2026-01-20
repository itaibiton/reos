"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("chat");
  const tCommon = useTranslations("common");
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteGroup = useMutation(api.conversations.deleteGroup);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteGroup({ conversationId });
      toast.success(t("group.deletedSuccess"));
      onDeleted();
    } catch (error) {
      console.error("Failed to delete group:", error);
      toast.error(t("group.deletedError"));
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("group.deleteTitle", { groupName })}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("group.deleteConfirm")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>{tCommon("actions.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? t("group.deleting") : t("group.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
