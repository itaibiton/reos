"use client";

import { useState, useRef } from "react";
import { useMutation } from "convex/react";
import { useTranslations } from "next-intl";
import { api } from "../../../convex/_generated/api";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ProfilePhotoUploadProps {
  currentPhotoUrl?: string | null;
  onPhotoSaved?: (url: string, storageId: string) => void;
  className?: string;
}

export function ProfilePhotoUpload({
  currentPhotoUrl,
  onPhotoSaved,
  className,
}: ProfilePhotoUploadProps) {
  const t = useTranslations("vendorOnboarding");
  const [photoUrl, setPhotoUrl] = useState<string | null>(
    currentPhotoUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.users.generateProfilePhotoUploadUrl);
  const saveProfilePhoto = useMutation(api.users.saveProfilePhoto);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error(t("photoUpload.invalidFormat"));
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      toast.error(t("photoUpload.tooLarge"));
      return;
    }

    setIsUploading(true);
    toast.loading(t("photoUpload.uploading"));

    try {
      // Step 1: Get upload URL
      const uploadUrl = await generateUploadUrl();

      // Step 2: Upload file
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = await uploadResponse.json();

      // Step 3: Save to user profile
      const result = await saveProfilePhoto({ storageId });

      // Update UI
      setPhotoUrl(result.url ?? null);
      toast.dismiss();
      toast.success(t("photoUpload.success"));

      // Notify parent
      if (result.url) {
        onPhotoSaved?.(result.url, result.storageId);
      }
    } catch (error) {
      console.error("Photo upload error:", error);
      toast.dismiss();
      toast.error(t("photoUpload.error"));
    } finally {
      setIsUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn("flex flex-col items-center space-y-3", className)}>
      <div className="relative group">
        {/* Photo display */}
        <div
          className={cn(
            "w-32 h-32 rounded-full border-4 border-border overflow-hidden bg-muted flex items-center justify-center cursor-pointer transition-all",
            "group-hover:border-primary",
            isUploading && "opacity-50"
          )}
          onClick={handleClick}
        >
          {photoUrl ? (
            <Image
              src={photoUrl}
              alt={t("photoUpload.alt")}
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera className="w-12 h-12 text-muted-foreground" />
          )}
        </div>

        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 rounded-full bg-background/80 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* Hover overlay */}
        {!isUploading && (
          <div
            className={cn(
              "absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
            )}
            onClick={handleClick}
          >
            <p className="text-white text-sm font-medium">
              {photoUrl ? t("photoUpload.change") : t("photoUpload.add")}
            </p>
          </div>
        )}
      </div>

      {/* Upload button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleClick}
        disabled={isUploading}
      >
        {photoUrl ? t("photoUpload.change") : t("photoUpload.add")}
      </Button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Helper text */}
      <p className="text-xs text-muted-foreground text-center">
        {t("photoUpload.helper")}
      </p>
    </div>
  );
}
