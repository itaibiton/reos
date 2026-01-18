"use client";

import { QuestionBubble } from "../QuestionBubble";
import { AnswerArea } from "../AnswerArea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PropertySizeStepProps {
  minBedrooms: number | undefined;
  maxBedrooms: number | undefined;
  minArea: number | undefined;
  maxArea: number | undefined;
  onMinBedroomsChange: (value: number | undefined) => void;
  onMaxBedroomsChange: (value: number | undefined) => void;
  onMinAreaChange: (value: number | undefined) => void;
  onMaxAreaChange: (value: number | undefined) => void;
}

export function PropertySizeStep({
  minBedrooms,
  maxBedrooms,
  minArea,
  maxArea,
  onMinBedroomsChange,
  onMaxBedroomsChange,
  onMinAreaChange,
  onMaxAreaChange,
}: PropertySizeStepProps) {
  const parseNumber = (value: string): number | undefined => {
    const cleaned = value.replace(/[^0-9]/g, "");
    if (cleaned === "") return undefined;
    return parseInt(cleaned, 10);
  };

  const formatNumber = (value: number | undefined): string => {
    if (value === undefined) return "";
    return value.toLocaleString("en-US");
  };

  return (
    <div className="space-y-6">
      <QuestionBubble
        question="What size property are you looking for?"
        description="This helps us filter properties that match your space requirements."
      />
      <AnswerArea>
        <div className="space-y-6">
          {/* Bedrooms section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Bedrooms</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <Label htmlFor="minBedrooms" className="text-sm font-medium">
                  Minimum
                </Label>
                <Input
                  id="minBedrooms"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g., 2"
                  value={minBedrooms ?? ""}
                  onChange={(e) => onMinBedroomsChange(parseNumber(e.target.value))}
                  className="mt-2"
                />
              </div>
              <div className="rounded-lg border p-4">
                <Label htmlFor="maxBedrooms" className="text-sm font-medium">
                  Maximum
                </Label>
                <Input
                  id="maxBedrooms"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g., 5"
                  value={maxBedrooms ?? ""}
                  onChange={(e) => onMaxBedroomsChange(parseNumber(e.target.value))}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Area section */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Area (sqm)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border p-4">
                <Label htmlFor="minArea" className="text-sm font-medium">
                  Minimum
                </Label>
                <Input
                  id="minArea"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g., 80"
                  value={formatNumber(minArea)}
                  onChange={(e) => onMinAreaChange(parseNumber(e.target.value))}
                  className="mt-2"
                />
              </div>
              <div className="rounded-lg border p-4">
                <Label htmlFor="maxArea" className="text-sm font-medium">
                  Maximum
                </Label>
                <Input
                  id="maxArea"
                  type="text"
                  inputMode="numeric"
                  placeholder="e.g., 200"
                  value={formatNumber(maxArea)}
                  onChange={(e) => onMaxAreaChange(parseNumber(e.target.value))}
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      </AnswerArea>
    </div>
  );
}
