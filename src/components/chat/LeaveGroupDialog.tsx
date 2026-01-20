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
  const t = useTranslations("chat");
  const tCommon = useTranslations("common");
  const [isLeaving, setIsLeaving] = useState(false);

  const leaveGroup = useMutation(api.conversations.leave);

  const handleLeave = async () => {
    setIsLeaving(true);
    try {
      await leaveGroup({ conversationId });
      toast.success(t("group.leftSuccess"));
      onLeft();
    } catch (error) {
      console.error("Failed to leave group:", error);
      toast.error(t("group.leftError"));
    } finally {
      setIsLeaving(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("group.leaveTitle", { groupName })}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("group.leaveConfirm")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLeaving}>{tCommon("actions.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleLeave}
            disabled={isLeaving}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLeaving ? t("group.leaving") : t("group.leave")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
