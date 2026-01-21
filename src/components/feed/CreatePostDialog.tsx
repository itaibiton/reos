"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import {
  ResponsiveDialog,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/ui/responsive-dialog";
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
import { PropertySelector } from "./PropertySelector";

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
  propertyId?: string;
}

export function CreatePostDialog({
  open,
  onOpenChange,
  defaultType = "discussion",
}: CreatePostDialogProps) {
  const t = useTranslations("feed");
  const tCommon = useTranslations("common");
  // Form state
  const [postType, setPostType] = useState<PostType>(defaultType);
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<Visibility>("public");
  const [serviceType, setServiceType] = useState<ServiceType>("broker");
  const [selectedPropertyId, setSelectedPropertyId] = useState<Id<"properties"> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Mutations
  const createDiscussionPost = useMutation(api.posts.createDiscussionPost);
  const createServiceRequestPost = useMutation(api.posts.createServiceRequestPost);
  const createPropertyPost = useMutation(api.posts.createPropertyPost);

  function resetForm() {
    setPostType(defaultType);
    setContent("");
    setVisibility("public");
    setServiceType("broker");
    setSelectedPropertyId(null);
    setErrors({});
  }

  // Reset property selection when switching tabs
  function handlePostTypeChange(value: string) {
    setPostType(value as PostType);
    setSelectedPropertyId(null);
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
      newErrors.content = t("post.contentRequired");
    }

    // Property selection validation for property listings
    if (postType === "property_listing" && !selectedPropertyId) {
      newErrors.propertyId = t("post.propertyRequired");
    }

    // Service type validation for service requests
    if (postType === "service_request" && !serviceType) {
      newErrors.serviceType = t("post.serviceTypeRequired");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (postType === "property_listing" && selectedPropertyId) {
        await createPropertyPost({
          propertyId: selectedPropertyId,
          content: content.trim(),
          visibility,
        });
        toast.success(t("post.propertyPostCreated"));
      } else if (postType === "discussion") {
        await createDiscussionPost({
          content: content.trim(),
          visibility,
        });
        toast.success(t("post.discussionPostCreated"));
      } else if (postType === "service_request") {
        await createServiceRequestPost({
          content: content.trim(),
          serviceType,
          visibility,
        });
        toast.success(t("post.serviceRequestPosted"));
      }

      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error instanceof Error ? error.message : t("post.createError"));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Service type labels using translations
  const serviceTypes: { value: ServiceType; labelKey: "broker" | "mortgageAdvisor" | "lawyer" }[] = [
    { value: "broker", labelKey: "broker" },
    { value: "mortgage_advisor", labelKey: "mortgageAdvisor" },
    { value: "lawyer", labelKey: "lawyer" },
  ];

  return (
    <ResponsiveDialog open={open} onOpenChange={handleClose}>
      <ResponsiveDialogHeader>
        <ResponsiveDialogTitle>{t("createPost")}</ResponsiveDialogTitle>
      </ResponsiveDialogHeader>

        <div className="space-y-4 py-4">
          {/* Post Type Tabs */}
          <Tabs
            value={postType}
            onValueChange={handlePostTypeChange}
          >
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="property_listing" className="gap-2">
                <HugeiconsIcon icon={Home01Icon} size={16} />
                <span className="hidden sm:inline">{t("post.types.property")}</span>
              </TabsTrigger>
              <TabsTrigger value="service_request" className="gap-2">
                <HugeiconsIcon icon={UserMultiple02Icon} size={16} />
                <span className="hidden sm:inline">{t("post.types.serviceRequest")}</span>
              </TabsTrigger>
              <TabsTrigger value="discussion" className="gap-2">
                <HugeiconsIcon icon={Comment01Icon} size={16} />
                <span className="hidden sm:inline">{t("post.types.discussion")}</span>
              </TabsTrigger>
            </TabsList>

            {/* Property Listing Content */}
            <TabsContent value="property_listing" className="space-y-4 mt-4">
              {/* Property Selector */}
              <div className="space-y-2">
                <Label>{t("post.selectProperty")}</Label>
                <PropertySelector
                  selectedPropertyId={selectedPropertyId}
                  onSelect={setSelectedPropertyId}
                />
                {errors.propertyId && (
                  <p className="text-sm text-destructive">{errors.propertyId}</p>
                )}
              </div>

              {/* Caption Input */}
              <div className="space-y-2">
                <Label htmlFor="property-content">{t("post.propertyCaption")}</Label>
                <Textarea
                  id="property-content"
                  placeholder={t("post.propertyCaptionPlaceholder")}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[100px] resize-none"
                  disabled={isSubmitting}
                />
                {errors.content && (
                  <p className="text-sm text-destructive">{errors.content}</p>
                )}
              </div>
            </TabsContent>

            {/* Service Request Content */}
            <TabsContent value="service_request" className="space-y-4 mt-4">
              {/* Service Type Selection */}
              <div className="space-y-2">
                <Label>{t("post.serviceType")}</Label>
                <RadioGroup
                  value={serviceType}
                  onValueChange={(value) => setServiceType(value as ServiceType)}
                  className="grid grid-cols-3 gap-2"
                >
                  {serviceTypes.map(({ value, labelKey }) => (
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
                        <span className="text-sm font-medium">{tCommon(`roles.${labelKey}`)}</span>
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
                <Label htmlFor="service-content">{t("post.serviceDescription")}</Label>
                <Textarea
                  id="service-content"
                  placeholder={t("post.serviceDescriptionPlaceholder")}
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
                <Label htmlFor="discussion-content">{t("post.contentPlaceholder")}</Label>
                <Textarea
                  id="discussion-content"
                  placeholder={t("post.discussionPlaceholder")}
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

          {/* Visibility Selector - shown for all post types */}
          <div className="space-y-2">
              <Label>{t("post.visibility")}</Label>
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
                    <p className="text-sm font-medium">{t("post.visibilityOptions.public")}</p>
                    <p className="text-xs text-muted-foreground">{t("post.visibilityOptions.publicDescription")}</p>
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
                    <p className="text-sm font-medium">{t("post.visibilityOptions.followersOnly")}</p>
                    <p className="text-xs text-muted-foreground">{t("post.visibilityOptions.followersOnlyDescription")}</p>
                  </div>
                </Label>
              </RadioGroup>
          </div>
        </div>

        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            {tCommon("actions.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? t("post.posting") : t("post.post")}
          </Button>
        </ResponsiveDialogFooter>
    </ResponsiveDialog>
  );
}
