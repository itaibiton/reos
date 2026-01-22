"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

interface SaveAllButtonProps {
  propertyIds: Id<"properties">[];
}

export function SaveAllButton({ propertyIds }: SaveAllButtonProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const toggleMutation = useMutation(api.favorites.toggle);

  const handleSaveAll = async () => {
    if (propertyIds.length === 0) {
      toast.error("No properties to save");
      return;
    }

    setIsSaving(true);
    try {
      // Save all properties, ignoring duplicates
      await Promise.all(
        propertyIds.map((propertyId) =>
          toggleMutation({ propertyId }).catch(() => {
            // Silently ignore errors (e.g., already saved)
          })
        )
      );

      setSaved(true);
      toast.success(`Saved ${propertyIds.length} properties`);

      // Reset "saved" state after 3 seconds
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      toast.error("Failed to save properties");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      onClick={handleSaveAll}
      disabled={isSaving || saved}
      variant={saved ? "secondary" : "default"}
      size="sm"
    >
      {isSaving ? (
        "Saving..."
      ) : saved ? (
        <>
          <HugeiconsIcon icon={Tick01Icon} size={16} strokeWidth={1.5} className="mr-2" />
          Saved
        </>
      ) : (
        "Save All"
      )}
    </Button>
  );
}
