"use client";

import { useState, ReactNode } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";

interface InlineFieldEditorProps {
  label: string;
  value: string | number | string[] | boolean | undefined;
  onSave: (value: any) => Promise<void>;
  renderInput: (value: any, onChange: (val: any) => void) => ReactNode;
  formatValue?: (value: any) => string;
}

export function InlineFieldEditor({
  label,
  value,
  onSave,
  renderInput,
  formatValue,
}: InlineFieldEditorProps) {
  const [open, setOpen] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(editValue);
      setOpen(false);
    } catch (error) {
      console.error("Failed to save field:", error);
      toast.error("Failed to save. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value); // Reset to original
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancel();
    }
  };

  const displayValue = formatValue
    ? formatValue(value)
    : Array.isArray(value)
      ? value.join(", ")
      : typeof value === "boolean"
        ? value
          ? "Yes"
          : "No"
        : value || "Not set";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="text-left hover:bg-muted px-3 py-2 rounded transition-colors w-full"
          type="button"
        >
          <Label className="text-xs text-muted-foreground block mb-1">
            {label}
          </Label>
          <p className="font-medium text-sm">
            {displayValue}
          </p>
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80"
        align="start"
        onKeyDown={handleKeyDown}
      >
        <div className="space-y-3">
          <h4 className="font-semibold text-sm">{label}</h4>

          {renderInput(editValue, setEditValue)}

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              size="sm"
              className="flex-1"
            >
              {isSaving ? (
                <>
                  <Spinner className="h-3 w-3 mr-2" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              size="sm"
              disabled={isSaving}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
