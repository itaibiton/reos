"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { X } from "lucide-react";
import { toast } from "sonner";

export function AvailabilitySettings() {
  const availability = useQuery(api.providerAvailability.getMyAvailability);
  const setAccepting = useMutation(api.providerAvailability.setAcceptingNewClients);
  const addDate = useMutation(api.providerAvailability.addUnavailableDate);
  const removeDate = useMutation(api.providerAvailability.removeUnavailableDate);

  if (!availability) {
    return (
      <div className="flex justify-center py-8">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  // Convert unavailable dates from timestamps to Date objects for calendar
  const blockedDates = availability.unavailableDates.map((d) => new Date(d.date));

  const handleAcceptingChange = async (checked: boolean) => {
    try {
      await setAccepting({ accepting: checked });
      toast.success(checked ? "Now accepting new clients" : "Not accepting new clients");
    } catch (error) {
      toast.error("Failed to update availability");
    }
  };

  const handleDateSelect = async (dates: Date[] | undefined) => {
    if (!dates) return;

    // Find which dates were added or removed
    const currentTimestamps = new Set(availability.unavailableDates.map((d) => d.date));
    const newTimestamps = new Set(dates.map((d) => startOfDay(d).getTime()));

    // Add new dates
    for (const timestamp of newTimestamps) {
      if (!currentTimestamps.has(timestamp)) {
        try {
          await addDate({ date: timestamp });
        } catch (error) {
          toast.error("Failed to block date");
        }
      }
    }

    // Remove dates that were deselected
    for (const unavailable of availability.unavailableDates) {
      if (!newTimestamps.has(unavailable.date)) {
        try {
          await removeDate({ dateId: unavailable._id as Id<"providerUnavailableDates"> });
        } catch (error) {
          toast.error("Failed to unblock date");
        }
      }
    }
  };

  const handleRemoveDate = async (dateId: Id<"providerUnavailableDates">) => {
    try {
      await removeDate({ dateId });
      toast.success("Date unblocked");
    } catch (error) {
      toast.error("Failed to unblock date");
    }
  };

  return (
    <div className="space-y-6">
      {/* Accepting New Clients Toggle */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Accepting New Clients</CardTitle>
              <CardDescription>
                Visible to investors on your profile
              </CardDescription>
            </div>
            <Switch
              checked={availability.acceptingNewClients}
              onCheckedChange={handleAcceptingChange}
            />
          </div>
        </CardHeader>
      </Card>

      {/* Blocked Dates Section */}
      <Card>
        <CardHeader>
          <CardTitle>Blocked Dates</CardTitle>
          <CardDescription>
            Mark dates when you&apos;re unavailable. Click on a date to toggle.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Calendar */}
            <div className="flex justify-center lg:justify-start">
              <Calendar
                mode="multiple"
                selected={blockedDates}
                onSelect={handleDateSelect}
                className="rounded-md border"
                disabled={{ before: new Date() }}
              />
            </div>

            {/* Blocked Dates List */}
            <div>
              <h4 className="text-sm font-medium mb-3">
                Blocked Dates ({availability.unavailableDates.length})
              </h4>
              {availability.unavailableDates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No blocked dates. Click on the calendar to block dates.
                </p>
              ) : (
                <div className="space-y-2 max-h-[280px] overflow-y-auto">
                  {availability.unavailableDates
                    .sort((a, b) => a.date - b.date)
                    .map((unavailable) => (
                      <div
                        key={unavailable._id}
                        className="flex items-center justify-between rounded-md border px-3 py-2"
                      >
                        <span className="text-sm">
                          {formatDate(new Date(unavailable.date))}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => handleRemoveDate(unavailable._id as Id<"providerUnavailableDates">)}
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper to get start of day in UTC
function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

// Helper to format date for display
function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
