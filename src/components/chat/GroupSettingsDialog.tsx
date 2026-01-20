"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  PencilEdit01Icon,
  Delete01Icon,
  Add01Icon,
  UserMultipleIcon,
  Tick01Icon,
  Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { AddMembersDialog } from "./AddMembersDialog";
import { LeaveGroupDialog } from "./LeaveGroupDialog";
import { DeleteGroupDialog } from "./DeleteGroupDialog";
import { useCurrentUser } from "@/hooks/useCurrentUser";

interface Participant {
  _id: Id<"users">;
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  role?: string | null;
}

interface GroupSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: Id<"conversations">;
  name?: string | null;
  participants: Participant[];
  createdBy: Id<"users">;
  onLeft: () => void;
  onDeleted: () => void;
}

// Role key map for translations
const roleKeyMap: Record<string, string> = {
  investor: "investor",
  broker: "broker",
  mortgage_advisor: "mortgageAdvisor",
  lawyer: "lawyer",
  admin: "admin",
};

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

export function GroupSettingsDialog({
  open,
  onOpenChange,
  conversationId,
  name,
  participants,
  createdBy,
  onLeft,
  onDeleted,
}: GroupSettingsDialogProps) {
  const { user } = useCurrentUser();
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(name || "");
  const [isSaving, setIsSaving] = useState(false);
  const [addMembersOpen, setAddMembersOpen] = useState(false);
  const [leaveOpen, setLeaveOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<Id<"users"> | null>(null);

  const t = useTranslations("chat");
  const tRoles = useTranslations("common.roles");
  const tActions = useTranslations("common.actions");

  const updateGroup = useMutation(api.conversations.updateGroup);

  const isCreator = user?._id === createdBy;

  const handleStartEditName = () => {
    setEditedName(name || "");
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!editedName.trim()) {
      toast.error("Group name cannot be empty");
      return;
    }

    setIsSaving(true);
    try {
      await updateGroup({
        conversationId,
        name: editedName.trim(),
      });
      setIsEditingName(false);
      toast.success(t("groupSettings.groupNameUpdated"));
    } catch (error) {
      console.error("Failed to update group name:", error);
      toast.error("Failed to update group name");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEditName = () => {
    setIsEditingName(false);
    setEditedName(name || "");
  };

  const handleRemoveMember = async (memberId: Id<"users">) => {
    setRemovingMemberId(memberId);
    try {
      await updateGroup({
        conversationId,
        removeParticipants: [memberId],
      });
      toast.success(t("groupSettings.memberRemoved"));
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast.error("Failed to remove member");
    } finally {
      setRemovingMemberId(null);
    }
  };

  const handleMembersAdded = () => {
    toast.success(t("groupSettings.membersAdded"));
  };

  const displayName = name || `Group (${participants.length})`;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("groupSettings.title")}</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Group Icon */}
            <div className="flex justify-center">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                <HugeiconsIcon
                  icon={UserMultipleIcon}
                  size={32}
                  className="text-muted-foreground"
                />
              </div>
            </div>

            {/* Group Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t("groupSettings.groupName")}
              </label>
              {isEditingName ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="flex-1"
                    placeholder={t("newConversation.groupNamePlaceholder")}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSaveName();
                      } else if (e.key === "Escape") {
                        handleCancelEditName();
                      }
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSaveName}
                    disabled={isSaving}
                  >
                    <HugeiconsIcon icon={Tick01Icon} size={18} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancelEditName}
                    disabled={isSaving}
                  >
                    <HugeiconsIcon icon={Cancel01Icon} size={18} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-base font-medium">{displayName}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleStartEditName}
                  >
                    <HugeiconsIcon icon={PencilEdit01Icon} size={18} />
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Members */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  {t("groupSettings.members", { count: participants.length })}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setAddMembersOpen(true)}
                  className="gap-1"
                >
                  <HugeiconsIcon icon={Add01Icon} size={14} />
                  {t("groupSettings.add")}
                </Button>
              </div>

              <ScrollArea className="h-[200px]">
                <div className="space-y-2">
                  {participants.map((participant) => {
                    const isCurrentUser = participant._id === user?._id;
                    const isParticipantCreator = participant._id === createdBy;
                    const canRemove = !isCurrentUser && !isParticipantCreator;

                    return (
                      <div
                        key={participant._id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50"
                      >
                        <Avatar className="h-9 w-9">
                          <AvatarImage
                            src={participant.imageUrl || undefined}
                            alt={participant.name || ""}
                          />
                          <AvatarFallback>
                            {getInitials(participant.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium truncate">
                              {participant.name}
                            </span>
                            {isCurrentUser && (
                              <span className="text-xs text-muted-foreground">
                                {t("groupSettings.you")}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {participant.role && (
                              <Badge
                                variant="secondary"
                                className="text-[10px] px-1.5 py-0"
                              >
                                {tRoles(roleKeyMap[participant.role] || participant.role)}
                              </Badge>
                            )}
                            {isParticipantCreator && (
                              <span className="text-[10px] text-muted-foreground">
                                {t("groupSettings.creator")}
                              </span>
                            )}
                          </div>
                        </div>
                        {canRemove && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleRemoveMember(participant._id)}
                            disabled={removingMemberId === participant._id}
                          >
                            <HugeiconsIcon icon={Cancel01Icon} size={16} />
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>

            <Separator />

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-destructive hover:text-destructive"
                onClick={() => setLeaveOpen(true)}
              >
                {t("groupSettings.leaveGroup")}
              </Button>
              {isCreator && (
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => setDeleteOpen(true)}
                >
                  <HugeiconsIcon icon={Delete01Icon} size={16} className="me-1" />
                  {tActions("delete")}
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Members Dialog */}
      <AddMembersDialog
        open={addMembersOpen}
        onOpenChange={setAddMembersOpen}
        conversationId={conversationId}
        existingParticipantIds={participants.map((p) => p._id)}
        onMembersAdded={handleMembersAdded}
      />

      {/* Leave Group Dialog */}
      <LeaveGroupDialog
        open={leaveOpen}
        onOpenChange={setLeaveOpen}
        conversationId={conversationId}
        groupName={displayName}
        onLeft={() => {
          onOpenChange(false);
          onLeft();
        }}
      />

      {/* Delete Group Dialog */}
      <DeleteGroupDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        conversationId={conversationId}
        groupName={displayName}
        onDeleted={() => {
          onOpenChange(false);
          onDeleted();
        }}
      />
    </>
  );
}
