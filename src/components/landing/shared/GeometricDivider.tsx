"use client";

import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

type DividerVariant =
  | "diagonal-down"
  | "diagonal-up"
  | "chevron-down"
  | "chevron-up"
  | "stepped"
  | "wave";

interface GeometricDividerProps {
  variant?: DividerVariant;
  className?: string;
  fillClassName?: string;
  height?: number;
  flip?: boolean;
  /** For accessibility - describes the decorative nature */
  ariaHidden?: boolean;
}

// ============================================================================
// SVG Paths for each variant
// ============================================================================

function getDividerPath(variant: DividerVariant, height: number, flip: boolean): string {
  const h = height;

  switch (variant) {
    case "diagonal-down":
      return flip
        ? `M0,0 L1440,${h} L1440,${h} L0,${h} Z`
        : `M0,${h} L1440,0 L1440,${h} L0,${h} Z`;

    case "diagonal-up":
      return flip
        ? `M0,${h} L1440,0 L1440,${h} L0,${h} Z`
        : `M0,0 L1440,${h} L1440,${h} L0,${h} Z`;

    case "chevron-down":
      return flip
        ? `M0,${h} L720,0 L1440,${h} Z`
        : `M0,0 L720,${h} L1440,0 L1440,${h} L0,${h} Z`;

    case "chevron-up":
      return flip
        ? `M0,0 L720,${h} L1440,0 L1440,${h} L0,${h} Z`
        : `M0,${h} L720,0 L1440,${h} Z`;

    case "stepped":
      // Creates a stepped/staircase pattern
      const step = h / 4;
      return flip
        ? `M0,0 L360,0 L360,${step} L720,${step} L720,${step * 2} L1080,${step * 2} L1080,${step * 3} L1440,${step * 3} L1440,${h} L0,${h} Z`
        : `M0,${step * 3} L360,${step * 3} L360,${step * 2} L720,${step * 2} L720,${step} L1080,${step} L1080,0 L1440,0 L1440,${h} L0,${h} Z`;

    case "wave":
      // Smooth wave curve
      return flip
        ? `M0,${h} C360,${h} 360,0 720,0 C1080,0 1080,${h} 1440,${h} L1440,${h} L0,${h} Z`
        : `M0,0 C360,0 360,${h} 720,${h} C1080,${h} 1080,0 1440,0 L1440,${h} L0,${h} Z`;

    default:
      return `M0,0 L1440,${h} L1440,${h} L0,${h} Z`;
  }
}

// ============================================================================
// GeometricDivider Component
// ============================================================================

export function GeometricDivider({
  variant = "diagonal-down",
  className,
  fillClassName = "fill-background",
  height = 80,
  flip = false,
  ariaHidden = true,
}: GeometricDividerProps) {
  const path = getDividerPath(variant, height, flip);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden pointer-events-none",
        className
      )}
      style={{ height: `${height}px`, marginTop: `-${height}px` }}
      aria-hidden={ariaHidden}
      role="presentation"
    >
      <svg
        className="absolute bottom-0 left-0 w-full h-full"
        viewBox={`0 0 1440 ${height}`}
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d={path} className={fillClassName} />
      </svg>
    </div>
  );
}

// ============================================================================
// Preset Dividers for common use cases
// ============================================================================

export function DiagonalDividerDown({
  className,
  fillClassName,
}: Pick<GeometricDividerProps, "className" | "fillClassName">) {
  return (
    <GeometricDivider
      variant="diagonal-down"
      height={80}
      className={className}
      fillClassName={fillClassName}
    />
  );
}

export function DiagonalDividerUp({
  className,
  fillClassName,
}: Pick<GeometricDividerProps, "className" | "fillClassName">) {
  return (
    <GeometricDivider
      variant="diagonal-up"
      height={80}
      className={className}
      fillClassName={fillClassName}
    />
  );
}

export function ChevronDivider({
  className,
  fillClassName,
  flip = false,
}: Pick<GeometricDividerProps, "className" | "fillClassName" | "flip">) {
  return (
    <GeometricDivider
      variant="chevron-down"
      height={60}
      flip={flip}
      className={className}
      fillClassName={fillClassName}
    />
  );
}

export function SteppedDivider({
  className,
  fillClassName,
  flip = false,
}: Pick<GeometricDividerProps, "className" | "fillClassName" | "flip">) {
  return (
    <GeometricDivider
      variant="stepped"
      height={40}
      flip={flip}
      className={className}
      fillClassName={fillClassName}
    />
  );
}

export default GeometricDivider;
