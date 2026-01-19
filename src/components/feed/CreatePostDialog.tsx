"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Home01Icon,
  UserMultiple02Icon,
  Comment01Icon,
  Globe02Icon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";

type PostType = "property_listing" | "service_request" | "discussion";
type Visibility = "public" | "followers_only";
type ServiceType = "broker" | "mortgage_advisor" | "lawyer";

interface CreatePostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: PostType;
}

interface ValidationErrors {
  content?: string;
  serviceType?: string;
}

const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  broker: "Broker",
  mortgage_advisor: "Mortgage Advisor",
  lawyer: "Lawyer",
};

export function CreatePostDialog({
  open,
  onOpenChange,
  defaultType = "discussion",
}: CreatePostDialogProps) {
  // Form state
  const [postType, setPostType] = useState<PostType>(defaultType);
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [serviceType, setServiceType] = useState<ServiceType>("broker");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Mutations
  const createDiscussionPost = useMutation(api.posts.createDiscussionPost);
  const createServiceRequestPost = useMutation(api.posts.createServiceRequestPost);

  function resetForm() {
    setPostType(defaultType);
    setContent("");
    setVisibility("public");
    setServiceType("broker");
    setErrors({});
  }

  function handleClose() {
    if (!isSubmitting) {
      onOpenChange(false);
      resetForm();
    }
  }

  function validate(): boolean {
    const newErrors: ValidationErrors = {};

    // Content validation
    if (!content.trim()) {
      newErrors.content = "Post content is required";
    }

    // Service type validation for service requests
    if (postType === "service_request" && !serviceType) {
      newErrors.serviceType = "Please select a service type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) {
      return;
    }

    // Property listing is not yet implemented
    if (postType === "property_listing") {
      toast.error("Property listings will be available in the next update");
      return;
    }

    setIsSubmitting(true);
    try {
      if (postType === "discussion") {
        await createDiscussionPost({
          content: content.trim(),
          visibility,
        });
        toast.success("Discussion post created!");
      } else if (postType === "service_request") {
        await createServiceRequestPost({
          content: content.trim(),
          serviceType,
          visibility,
        });
        toast.success("Service request posted!");
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Post Type Tabs */}
          <Tabs
            value={postType}
            onValueChange={(value) => setPostType(value as PostType)}
          >
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="property_listing" className="gap-2">
                <HugeiconsIcon icon={Home01Icon} size={16} />
                <span className="hidden sm:inline">Property</span>
              </TabsTrigger>
              <TabsTrigger value="service_request" className="gap-2">
                <HugeiconsIcon icon={UserMultiple02Icon} size={16} />
                <span className="hidden sm:inline">Service</span>
              </TabsTrigger>
              <TabsTrigger value="discussion" className="gap-2">
                <HugeiconsIcon icon={Comment01Icon} size={16} />
                <span className="hidden sm:inline">Discussion</span>
              </TabsTrigger>
            </TabsList>

            {/* Property Listing Content - Placeholder */}
            <TabsContent value="property_listing" className="space-y-4 mt-4">
              <div className="rounded-lg border border-dashed border-muted-foreground/25 p-8 text-center">
                <HugeiconsIcon
                  icon={Home01Icon}
                  size={40}
                  className="mx-auto text-muted-foreground mb-3"
                />
                <p className="text-muted-foreground text-sm">
                  Property selector coming in next update
                </p>
                <p className="text-muted-foreground/75 text-xs mt-1">
                  You&apos;ll be able to share properties from your listings
                </p>
              </div>
            </TabsContent>

            {/* Service Request Content */}
            <TabsContent value="service_request" className="space-y-4 mt-4">
              {/* Service Type Selection */}
              <div className="space-y-2">
                <Label>What type of service do you need?</Label>
                <RadioGroup
                  value={serviceType}
                  onValueChange={(value) => setServiceType(value as ServiceType)}
                  className="grid grid-cols-3 gap-2"
                >
                  {(Object.entries(SERVICE_TYPE_LABELS) as [ServiceType, string][]).map(
                    ([value, label]) => (
                      <Label
                        key={value}
                        htmlFor={`service-${value}`}
                        className={cn(
                          "flex items-center justify-center rounded-md border-2 border-muted bg-transparent p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                          serviceType === value && "border-primary"
                        )}
                      >
                        <RadioGroupItem
                          value={value}
                          id={`service-${value}`}
                          className="sr-only"
                        />
                        <span className="text-sm font-medium">{label}</span>
                      </Label>
                    )
                  )}
                </RadioGroup>
                {errors.serviceType && (
                  <p className="text-sm text-destructive">{errors.serviceType}</p>
                )}
              </div>

              {/* Content Input */}
              <div className="space-y-2">
                <Label htmlFor="service-content">Describe what you&apos;re looking for</Label>
                <Textarea
                  id="service-content"
                  placeholder="I'm looking for a broker who specializes in..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] resize-none"
                  disabled={isSubmitting}
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content}</p>
                )}
              </div>
            </TabsContent>

            {/* Discussion Content */}
            <TabsContent value="discussion" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="discussion-content">What&apos;s on your mind?</Label>
                <Textarea
                  id="discussion-content"
                  placeholder="Share your thoughts, ask questions, or start a conversation..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[120px] resize-none"
                  disabled={isSubmitting}
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content}</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          {/* Visibility Selector - shown for all active post types */}
          {postType !== "property_listing" && (
            <div className="space-y-2">
              <Label>Who can see this post?</Label>
              <RadioGroup
                value={visibility}
                onValueChange={(value) => setVisibility(value as Visibility)}
                className="flex gap-4"
              >
                <Label
                  htmlFor="visibility-public"
                  className={cn(
                    "flex flex-1 items-center gap-3 rounded-md border-2 border-muted bg-transparent p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                    visibility === "public" && "border-primary"
                  )}
                >
                  <RadioGroupItem
                    value="public"
                    id="visibility-public"
                    className="sr-only"
                  />
                  <HugeiconsIcon
                    icon={Globe02Icon}
                    size={20}
                    className="text-muted-foreground"
                  />
                  <div>
                    <p className="text-sm font-medium">Public</p>
                    <p className="text-xs text-muted-foreground">Everyone can see</p>
                  </div>
                </Label>

                <Label
                  htmlFor="visibility-followers"
                  className={cn(
                    "flex flex-1 items-center gap-3 rounded-md border-2 border-muted bg-transparent p-3 hover:bg-accent hover:text-accent-foreground cursor-pointer transition-colors",
                    visibility === "followers_only" && "border-primary"
                  )}
                >
                  <RadioGroupItem
                    value="followers_only"
                    id="visibility-followers"
                    className="sr-only"
                  />
                  <HugeiconsIcon
                    icon={UserGroupIcon}
                    size={20}
                    className="text-muted-foreground"
                  />
                  <div>
                    <p className="text-sm font-medium">Followers</p>
                    <p className="text-xs text-muted-foreground">Only followers</p>
                  </div>
                </Label>
              </RadioGroup>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || postType === "property_listing"}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
