"use client";

import type { ReactNode } from "react";
import { Eyebrow } from "@/components/registry/blocks/eyebrow";
import { AnimatedSection } from "@/components/registry/primitives/animations/animated-section";
import {
  Text,
  type TextSource,
} from "@/components/registry/primitives/editables/text";
import { cn } from "@/lib/registry/cn";
import {
  detailsAnimationDirection,
  detailsAnimationEnabled,
  detailsColumnAlignmentClass,
  detailsMaxWidthClass,
  detailsPaddingYClass,
  detailsSurfaceClass,
  detailsTextAlignClass,
  detailsTitleClass,
  type DetailsShellParams,
  type DetailsTextAlign,
} from "@/lib/registry/details-shell";
import { useReducedMotion } from "@/lib/registry/use-reduced-motion";

/**
 * Outer page-details chrome: section surface, vertical padding, max-width
 * column. Replaces the hardcoded `container mx-auto px-4` + `py-11` wrap.
 * Inner 12-col grids stay in each details component.
 */
export function DetailsShell({
  params,
  className,
  id,
  children,
  fullWidth,
  maxWidthFallback = "standard",
}: {
  params?: DetailsShellParams;
  className?: string;
  id?: string;
  children: ReactNode;
  /** Renders outside the max-width column (full-bleed nested slots). */
  fullWidth?: ReactNode;
  maxWidthFallback?: "standard" | "wide";
}) {
  return (
    <article
      className={cn(
        "component @container",
        detailsSurfaceClass(params),
        params?.styles,
        className,
      )}
      id={id}
    >
      <div className={cn("w-full", detailsPaddingYClass(params))}>
        <div
          className={cn(
            "w-full px-4",
            detailsMaxWidthClass(params, maxWidthFallback),
            detailsColumnAlignmentClass(params),
          )}
        >
          {children}
        </div>
      </div>
      {fullWidth}
    </article>
  );
}

export function DetailsTitle({
  params,
  value,
  isEditing,
  tag = "h1",
  placeholder = "Title",
}: {
  params?: DetailsShellParams;
  value: TextSource | undefined;
  isEditing?: boolean;
  tag?: "h1" | "h2";
  placeholder?: string;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <AnimatedSection
      direction={detailsAnimationDirection(params)}
      distanceInRem={12}
      delay={0}
      duration={1000}
      reducedMotion={reducedMotion || !detailsAnimationEnabled(params)}
    >
      <Text
        tag={tag}
        className={detailsTitleClass(params)}
        value={value}
        isEditing={isEditing}
        placeholder={placeholder}
      />
    </AnimatedSection>
  );
}

export function DetailsEyebrow({
  params,
  value,
  isEditing,
  placeholder = "Eyebrow",
}: {
  params?: DetailsShellParams;
  value: TextSource | undefined;
  isEditing?: boolean;
  placeholder?: string;
}) {
  const align = detailsTextAlignClass(params).includes("center")
    ? "center"
    : detailsTextAlignClass(params).includes("end")
      ? "end"
      : "start";
  return (
    <Eyebrow
      value={value}
      colorScheme={params?.EyebrowColorScheme}
      style={params?.EyebrowStyle}
      size={params?.EyebrowSize}
      align={align as DetailsTextAlign}
      isEditing={isEditing}
      placeholder={placeholder}
      className="mb-3"
    />
  );
}

