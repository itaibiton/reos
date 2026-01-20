"use client";

import { useTranslations } from "next-intl";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export type LayoutMode = "single" | "split" | "quad";

interface LayoutModeSelectorProps {
  mode: LayoutMode;
  onModeChange: (mode: LayoutMode) => void;
}

// Single layout icon - one rectangle
function SingleLayoutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="2"
        y="2"
        width="12"
        height="12"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

// Split layout icon - two vertical rectangles
function SplitLayoutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="2"
        y="2"
        width="5"
        height="12"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <rect
        x="9"
        y="2"
        width="5"
        height="12"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

// Quad layout icon - four squares
function QuadLayoutIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="2"
        y="2"
        width="5"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <rect
        x="9"
        y="2"
        width="5"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <rect
        x="2"
        y="9"
        width="5"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
      <rect
        x="9"
        y="9"
        width="5"
        height="5"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
      />
    </svg>
  );
}

export function LayoutModeSelector({
  mode,
  onModeChange,
}: LayoutModeSelectorProps) {
  const t = useTranslations("chat");

  const handleValueChange = (value: string) => {
    if (value) {
      onModeChange(value as LayoutMode);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <ToggleGroup
        type="single"
        value={mode}
        onValueChange={handleValueChange}
        variant="outline"
        size="sm"
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value="single" aria-label={t("layout.single")}>
              <SingleLayoutIcon />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{t("layout.single")}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value="split" aria-label={t("layout.split")}>
              <SplitLayoutIcon />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{t("layout.split")}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <ToggleGroupItem value="quad" aria-label={t("layout.quad")}>
              <QuadLayoutIcon />
            </ToggleGroupItem>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            <p>{t("layout.quad")}</p>
          </TooltipContent>
        </Tooltip>
      </ToggleGroup>
    </TooltipProvider>
  );
}
