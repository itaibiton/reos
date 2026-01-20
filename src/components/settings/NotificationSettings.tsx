"use client";

import { useQuery, useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

type NotificationPreferences = {
  emailNotifications: boolean;
  inAppNotifications: boolean;
  newMessageNotify: boolean;
  dealStageNotify: boolean;
  fileUploadedNotify: boolean;
  requestReceivedNotify: boolean;
};

export function NotificationSettings() {
  const t = useTranslations("settings.notifications");
  const preferences = useQuery(api.notificationPreferences.getMyNotificationPreferences);
  const updatePreferences = useMutation(api.notificationPreferences.updateNotificationPreferences);

  if (!preferences) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  const handleToggle = async (
    key: keyof NotificationPreferences,
    value: boolean
  ) => {
    try {
      await updatePreferences({
        preferences: { [key]: value },
      });
    } catch (error) {
      toast.error(t("failedToUpdate"));
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>{t("channels")}</CardTitle>
          <CardDescription>
            {t("channelsDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            id="email-notifications"
            label={t("emailNotifications")}
            description={t("emailNotificationsDesc")}
            checked={preferences.emailNotifications}
            onCheckedChange={(checked) => handleToggle("emailNotifications", checked)}
          />
          <ToggleRow
            id="inapp-notifications"
            label={t("inAppNotifications")}
            description={t("inAppNotificationsDesc")}
            checked={preferences.inAppNotifications}
            onCheckedChange={(checked) => handleToggle("inAppNotifications", checked)}
          />
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>{t("types")}</CardTitle>
          <CardDescription>
            {t("typesDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Messages Group */}
          <div>
            <h4 className="text-sm font-medium mb-3">{t("categories.messages")}</h4>
            <div className="space-y-4 ps-4 border-s-2 border-muted">
              <ToggleRow
                id="new-message"
                label={t("options.newMessage")}
                description={t("options.newMessageDesc")}
                checked={preferences.newMessageNotify}
                onCheckedChange={(checked) => handleToggle("newMessageNotify", checked)}
              />
            </div>
          </div>

          {/* Deals Group */}
          <div>
            <h4 className="text-sm font-medium mb-3">{t("categories.deals")}</h4>
            <div className="space-y-4 ps-4 border-s-2 border-muted">
              <ToggleRow
                id="deal-stage"
                label={t("options.dealStage")}
                description={t("options.dealStageDesc")}
                checked={preferences.dealStageNotify}
                onCheckedChange={(checked) => handleToggle("dealStageNotify", checked)}
              />
              <ToggleRow
                id="file-uploaded"
                label={t("options.fileUploaded")}
                description={t("options.fileUploadedDesc")}
                checked={preferences.fileUploadedNotify}
                onCheckedChange={(checked) => handleToggle("fileUploadedNotify", checked)}
              />
            </div>
          </div>

          {/* Service Requests Group */}
          <div>
            <h4 className="text-sm font-medium mb-3">{t("categories.requests")}</h4>
            <div className="space-y-4 ps-4 border-s-2 border-muted">
              <ToggleRow
                id="request-received"
                label={t("options.requestReceived")}
                description={t("options.requestReceivedDesc")}
                checked={preferences.requestReceivedNotify}
                onCheckedChange={(checked) => handleToggle("requestReceivedNotify", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

interface ToggleRowProps {
  id: string;
  label: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}

function ToggleRow({ id, label, description, checked, onCheckedChange }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label htmlFor={id} className="text-sm font-medium">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
    </div>
  );
}
