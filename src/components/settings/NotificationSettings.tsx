"use client";

import { useQuery, useMutation } from "convex/react";
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
      toast.error("Failed to update notification preferences");
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Channels</CardTitle>
          <CardDescription>
            Choose how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            id="email-notifications"
            label="Email Notifications"
            description="Receive notifications via email"
            checked={preferences.emailNotifications}
            onCheckedChange={(checked) => handleToggle("emailNotifications", checked)}
          />
          <ToggleRow
            id="inapp-notifications"
            label="In-App Notifications"
            description="Receive notifications within the app"
            checked={preferences.inAppNotifications}
            onCheckedChange={(checked) => handleToggle("inAppNotifications", checked)}
          />
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
          <CardDescription>
            Choose which events trigger notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Messages Group */}
          <div>
            <h4 className="text-sm font-medium mb-3">Messages</h4>
            <div className="space-y-4 pl-4 border-l-2 border-muted">
              <ToggleRow
                id="new-message"
                label="New Messages"
                description="When you receive a new message"
                checked={preferences.newMessageNotify}
                onCheckedChange={(checked) => handleToggle("newMessageNotify", checked)}
              />
            </div>
          </div>

          {/* Deals Group */}
          <div>
            <h4 className="text-sm font-medium mb-3">Deals</h4>
            <div className="space-y-4 pl-4 border-l-2 border-muted">
              <ToggleRow
                id="deal-stage"
                label="Deal Stage Changes"
                description="When a deal moves to a new stage"
                checked={preferences.dealStageNotify}
                onCheckedChange={(checked) => handleToggle("dealStageNotify", checked)}
              />
              <ToggleRow
                id="file-uploaded"
                label="Files Uploaded"
                description="When files are uploaded to your deals"
                checked={preferences.fileUploadedNotify}
                onCheckedChange={(checked) => handleToggle("fileUploadedNotify", checked)}
              />
            </div>
          </div>

          {/* Service Requests Group */}
          <div>
            <h4 className="text-sm font-medium mb-3">Service Requests</h4>
            <div className="space-y-4 pl-4 border-l-2 border-muted">
              <ToggleRow
                id="request-received"
                label="New Requests Received"
                description="When investors request your services"
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
