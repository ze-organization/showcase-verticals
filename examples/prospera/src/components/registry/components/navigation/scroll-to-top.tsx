"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/registry/primitives/core/button";
import { cn } from "@/lib/registry/cn";
import { resolveEditingMode } from "@/lib/registry/editing-mode";
import type { CmsProps, ComponentParams } from "@/lib/registry/sitecore";
import { useReducedMotion } from "@/lib/registry/use-reduced-motion";

/**
 * Programmatic + datasourceless scroll-back-to-top affordance (see
 * breadcrumb for the pattern) — drop it on a page or a shared partial
 * design; authors control presentation via rendering parameters only.
 *
 * Two variants:
 *
 *   - `Default` (sticky) — a floating circular button pinned to the
 *     viewport's bottom-end corner. Hidden until the page has scrolled
 *     past roughly one viewport, then fades in; always visible in
 *     editing mode so authors can find it.
 *   - `Inline` — renders in flow, for placement at a section seam
 *     (typically the last item before the footer). With `Overlap`
 *     checked the row collapses to ZERO height and the button centers
 *     itself on the boundary — half over the preceding surface, half
 *     over the next band (the straddle treatment), same negative-offset
 *     idea as the card OverlapTop axis.
 *
 * Scrolling respects `prefers-reduced-motion` (instant jump instead of
 * smooth). The button is a real `<button>` with an explicit
 * aria-label, so the icon-only default stays accessible; an authored
 * `Label` renders as visible text beside the arrow.
 */

/** Sticky mode shows the button after this much scroll (~1 viewport). */
const STICKY_SHOW_AFTER_PX = 600;

export interface ScrollToTopProps extends CmsProps {
  /**
   * `params.ButtonVariant` — button-variant@1. `link` and `pill` fold
   * onto `default`: the button is already a filled circle, so neither
   * adds anything here.
   */
  buttonVariant?: string;
  /** `params.ButtonColorScheme` — color-scheme@1 (`none` = theme default fill). Default `primary`. */
  buttonColorScheme?: string;
  /** `params.Label` — optional visible label beside the arrow; also becomes the accessible name. */
  label?: string;
  /** `params.Alignment` — alignment@1, Inline variant only. Default `end`. */
  alignment?: string;
  /** `params.Overlap` — Inline only: straddle the container boundary. Sitecore string boolean. */
  overlap?: string | boolean;
  /**
   * Render the sticky button visible without scrolling. Preview seam
   * only — the `Default` variant reveals itself past a scroll
   * threshold, and a preview frame never scrolls, so the component
   * paints at opacity-0 and reads as blank.
   */
  defaultVisible?: boolean;
  isEditing?: boolean;
  params?: ComponentParams;
  id?: string;
  className?: string;
}

type ResolvedButtonVariant = "default" | "outline" | "ghost";

const resolveButtonVariant = (value?: string): ResolvedButtonVariant => {
  const normalized = value?.trim().toLowerCase();
  return normalized === "outline" || normalized === "ghost"
    ? normalized
    : "default";
};

type ResolvedButtonColorScheme =
  | "none"
  | "white"
  | "black"
  | "neutral"
  | "primary"
  | "secondary"
  | "tertiary"
  | "accent"
  | "accent-2"
  | "accent-3";

const BUTTON_COLOR_SCHEMES: readonly ResolvedButtonColorScheme[] = [
  "none",
  "white",
  "black",
  "neutral",
  "primary",
  "secondary",
  "tertiary",
  "accent",
  "accent-2",
  "accent-3",
];

const resolveButtonColorScheme = (
  value?: string,
): ResolvedButtonColorScheme => {
  const normalized = value?.trim().toLowerCase() as
    | ResolvedButtonColorScheme
    | undefined;
  return normalized && BUTTON_COLOR_SCHEMES.includes(normalized)
    ? normalized
    : "primary";
};

const ALIGNMENT_CLASSES: Record<string, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
};

const parseBool = (value: string | boolean | undefined): boolean => {
  if (typeof value === "boolean") return value;
  const normalized = value?.trim().toLowerCase();
  return normalized === "1" || normalized === "true";
};

function ScrollTopButton({
  buttonVariant,
  buttonColorScheme,
  label,
}: Pick<ScrollToTopProps, "buttonVariant" | "buttonColorScheme" | "label">) {
  const reducedMotion = useReducedMotion();
  const visibleLabel = label?.trim();
  return (
    <Button
      type="button"
      variant={resolveButtonVariant(buttonVariant)}
      colorScheme={resolveButtonColorScheme(buttonColorScheme)}
      size={visibleLabel ? "lg" : "icon-lg"}
      aria-label={visibleLabel || "Back to top"}
      className="shadow-lg"
      onClick={() =>
        window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" })
      }
    >
      <ArrowUp aria-hidden="true" />
      {visibleLabel ? <span>{visibleLabel}</span> : null}
    </Button>
  );
}

/**
 * Sticky (floating) mode — the `Default` variant. Fixed to the
 * viewport's bottom-end corner, revealed after the page scrolls past
 * `STICKY_SHOW_AFTER_PX`. Editing mode keeps it visible so authors can
 * see and select the rendering.
 */
export function Default(props: ScrollToTopProps) {
  const [pastThreshold, setPastThreshold] = useState(false);
  const isEditing = resolveEditingMode(props);

  useEffect(() => {
    const onScroll = () => {
      setPastThreshold(window.scrollY > STICKY_SHOW_AFTER_PX);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const visible = pastThreshold || isEditing || props.defaultVisible === true;
  return (
    <div
      id={props.id}
      data-slot="scroll-to-top"
      className={cn(
        "component scroll-to-top fixed end-6 bottom-6 z-40",
        "transition-[opacity,translate] duration-300 motion-reduce:transition-none",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0",
        props.className?.trimEnd(),
      )}
    >
      <ScrollTopButton
        buttonVariant={props.buttonVariant}
        buttonColorScheme={props.buttonColorScheme}
        label={props.label}
      />
    </div>
  );
}

/** Alias so the variant reads by its behavior in previews/docs. */
export const Sticky = Default;

/**
 * Inline (in-flow) mode. Place it at a section seam; with `Overlap`
 * the row is a zero-height band and the button straddles the boundary
 * between the surfaces above and below it.
 */
export function Inline(props: ScrollToTopProps) {
  const overlap = parseBool(props.overlap);
  const alignmentClass =
    ALIGNMENT_CLASSES[props.alignment?.trim().toLowerCase() ?? ""] ??
    ALIGNMENT_CLASSES.end;
  return (
    <div
      id={props.id}
      data-slot="scroll-to-top"
      data-overlap={overlap ? "true" : undefined}
      className={cn(
        "component scroll-to-top w-full",
        overlap ? "relative z-10 h-0 overflow-visible" : "py-4",
        props.className?.trimEnd(),
      )}
    >
      <div
        className={cn("container mx-auto flex px-6 md:px-8", alignmentClass)}
      >
        <div className={cn(overlap && "-translate-y-1/2")}>
          <ScrollTopButton
            buttonVariant={props.buttonVariant}
            buttonColorScheme={props.buttonColorScheme}
            label={props.label}
          />
        </div>
      </div>
    </div>
  );
}

export default Default;

export const componentType = "universal";
