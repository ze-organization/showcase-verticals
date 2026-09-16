import type React from "react";
import { cn } from "@/lib/registry/cn";

import type {
  HeroOverlayColorScheme,
  HeroOverlayMobilePosition,
  HeroOverlayOptions,
  HeroOverlayPadding,
  HeroOverlayPosition,
  HeroOverlayShape,
  HeroOverlayStyle,
  HeroOverlayWidth,
} from "./hero.types";

interface HeroOverlayPanelProps {
  overlay: HeroOverlayOptions;
  children: React.ReactNode;
  /**
   * Extra classes merged LAST onto the panel root — used by the frame
   * for the `OverlayBreach` negative-margin shift (must win over the
   * position/padding margin classes via tailwind-merge).
   */
  className?: string;
}

// ─── Overlay breach ─────────────────────────────────────────────────

/**
 * Which media edge an `OverlayBreach` card straddles. `none` = breach
 * off or no-op'd.
 */
export type HeroOverlayBreachEdge = "none" | "start" | "end" | "bottom";

/**
 * Derive the breach edge from the overlay options. The breach only
 * applies to the card shape — the band shapes (`full-height`,
 * `lower-third`) span the frame flush, so shifting them would render a
 * broken half-scrim; they no-op instead. The edge follows the card's
 * inline anchor (`position`): start/end breach that inline edge; a
 * centered (or full-width) card has no inline edge to straddle and
 * breaches the bottom edge downward instead.
 */
export function resolveOverlayBreachEdge(
  overlay: HeroOverlayOptions,
): HeroOverlayBreachEdge {
  if (!overlay.breach) return "none";
  if ((overlay.shape ?? "card") !== "card") return "none";
  const position = overlay.position ?? "start";
  if ((overlay.width ?? "half") === "full" || position === "center") {
    return "bottom";
  }
  if (position === "end" || position === "end-padded") return "end";
  return "start";
}

// ─── Color maps ─────────────────────────────────────────────────────
//
// Background-only fill class. Goes on the absolute-positioned fill
// layer beneath the content so `opacity` can be scaled without
// dimming the text. Text tone is in OVERLAY_TEXT_TONE and goes on
// the panel root so descendants inherit it at full opacity.

const OVERLAY_BG_CLASS: Record<HeroOverlayColorScheme, string> = {
  none: "",
  // `--color-theme-white` / `--color-theme-black` are registered in the app's
  // `@theme` (globals.css) but are NOT part of a theme's own token sheet — so a
  // registry-consumer surface that loads only `<theme>.css` (the Sitecore head)
  // has no value to paint and the panel reads as transparent at any opacity.
  // Carry a literal fallback so white/black resolve everywhere; a theme that
  // overrides the token still wins.
  white: "bg-[var(--color-theme-white,#fff)]",
  black: "bg-[var(--color-theme-black,#000)]",
  neutral: "bg-neutral",
  primary: "bg-primary",
  "primary-gradient": "bg-gradient-to-br from-primary to-secondary",
  secondary: "bg-secondary",
  "secondary-gradient": "bg-gradient-to-br from-secondary to-accent",
  tertiary: "bg-tertiary",
  accent: "bg-accent",
  "accent-2": "bg-accent-2",
  "accent-3": "bg-accent-3",
  info: "bg-info",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
};

// `from-*` token for gradient-style overlay surfaces.
const OVERLAY_GRADIENT_FROM: Record<HeroOverlayColorScheme, string> = {
  none: "from-transparent",
  white: "from-[var(--color-theme-white,#fff)]",
  black: "from-[var(--color-theme-black,#000)]",
  neutral: "from-neutral",
  primary: "from-primary",
  "primary-gradient": "from-primary",
  secondary: "from-secondary",
  "secondary-gradient": "from-secondary",
  tertiary: "from-tertiary",
  accent: "from-accent",
  "accent-2": "from-accent-2",
  "accent-3": "from-accent-3",
  info: "from-info",
  success: "from-success",
  warning: "from-warning",
  destructive: "from-destructive",
};

// Text-only class. Pairs with the matching solid `bg-*` on the fill
// layer (so `text-*-foreground` is still backed by `bg-*` per the
// color-role contract — the bg just lives on a sibling).
const OVERLAY_TEXT_TONE: Record<HeroOverlayColorScheme, string> = {
  none: "",
  white: "text-[var(--color-theme-black,#000)]",
  black: "text-[var(--color-theme-white,#fff)]",
  neutral: "text-neutral-foreground",
  primary: "text-primary-foreground",
  "primary-gradient": "text-primary-foreground",
  secondary: "text-secondary-foreground",
  "secondary-gradient": "text-secondary-foreground",
  tertiary: "text-tertiary-foreground",
  accent: "text-accent-foreground",
  "accent-2": "text-accent-2-foreground",
  "accent-3": "text-accent-3-foreground",
  info: "text-info-foreground",
  success: "text-success-foreground",
  warning: "text-warning-foreground",
  destructive: "text-destructive-foreground",
};

// ─── Width / position / padding maps ───────────────────────────────

const WIDTH_CLASS: Record<HeroOverlayWidth, string> = {
  quarter: "md:w-1/4",
  third: "md:w-1/3",
  half: "md:w-1/2",
  "two-thirds": "md:w-2/3",
  "three-quarters": "md:w-3/4",
  full: "md:w-full",
};

// Translate to `ms-*` / `me-*` (logical inline-axis margins) so
// padding flips correctly under RTL.
const PADDING_INLINE_CLASS: Record<
  HeroOverlayPadding,
  { start: string; end: string }
> = {
  default: { start: "", end: "" },
  xs: { start: "md:ms-4", end: "md:me-4" },
  sm: { start: "md:ms-8", end: "md:me-8" },
  md: { start: "md:ms-16", end: "md:me-16" },
  lg: { start: "md:ms-24", end: "md:me-24" },
  xl: { start: "md:ms-32", end: "md:me-32" },
};

function paddingInlineClasses(
  padding: string | undefined,
): { start: string; end: string } {
  if (padding && padding in PADDING_INLINE_CLASS) {
    return PADDING_INLINE_CLASS[padding as HeroOverlayPadding];
  }
  return PADDING_INLINE_CLASS.default;
}

function widthClassFor(width: string | undefined): string {
  if (width && width in WIDTH_CLASS) {
    return WIDTH_CLASS[width as HeroOverlayWidth];
  }
  return WIDTH_CLASS.half;
}

// `start` / `end` place the panel at the edge and honor `OverlayPadding`
// as an inset (`default` = flush). `start-padded` / `end-padded` are kept
// as aliases for existing content — they resolve identically now.
// Unknown position (empty string, Droplink GUID) falls back to start.
function resolvePositionClasses(
  position: HeroOverlayPosition | string | undefined,
  padding: HeroOverlayPadding | string | undefined,
): string {
  const inset = paddingInlineClasses(padding);
  switch (position) {
    case "start":
    case "start-padded":
      return cn("md:me-auto", inset.start);
    case "center":
      return "md:mx-auto";
    case "end":
    case "end-padded":
      return cn("md:ms-auto", inset.end);
    default:
      return cn("md:me-auto", inset.start);
  }
}

// ─── Style helpers ─────────────────────────────────────────────────

/**
 * Gradient direction class, RTL-aware. Inline-axis gradients have to
 * flip between LTR and RTL because the panel itself flips via
 * `ms-auto`/`me-auto`. Without the flip, the readable color sits OFF
 * the panel under RTL and the panel reads as transparent.
 *
 * Tailwind v4 doesn't expose logical inline-axis gradient utilities
 * yet, so we apply both physical direction classes gated by
 * `ltr:` / `rtl:` variants. Center uses block-axis which is
 * direction-neutral.
 */
function gradientDirectionForPosition(
  position: HeroOverlayPosition,
  shape: HeroOverlayShape,
): string {
  if (shape === "lower-third") {
    // Band anchored at the bottom — fade upward into the image.
    return "bg-gradient-to-t";
  }
  if (position === "end" || position === "end-padded") {
    // Panel anchored at inline-end — fade goes end → start.
    return "ltr:bg-gradient-to-l rtl:bg-gradient-to-r";
  }
  if (position === "center") {
    return "bg-gradient-to-t";
  }
  // start / start-padded — fade goes start → end.
  return "ltr:bg-gradient-to-r rtl:bg-gradient-to-l";
}

/**
 * Returns the bg-only class for the fill layer. Text tone is applied
 * separately to the panel root so opacity doesn't cascade into it.
 *
 * `blur` intentionally returns the same solid fill as `solid` — the
 * backdrop-blur itself lives on a SEPARATE sibling layer (see
 * `HeroOverlayPanel`). Putting `backdrop-blur-*` on this layer is the
 * classic invisible-frost bug: the filtered backdrop is painted FIRST
 * and the layer's own opaque `bg-*` paints on top of it, so the only
 * thing the inline `opacity` reveals is the sharp image behind — net
 * result pixel-identical to `solid`.
 */
function resolveFillBgClass(
  style: HeroOverlayStyle,
  colorScheme: HeroOverlayColorScheme,
  position: HeroOverlayPosition,
  shape: HeroOverlayShape,
): string {
  if (style === "none") return "";
  if (style === "gradient") {
    return cn(
      gradientDirectionForPosition(position, shape),
      OVERLAY_GRADIENT_FROM[colorScheme],
      "to-transparent",
    );
  }
  return OVERLAY_BG_CLASS[colorScheme];
}

/**
 * Shape-driven panel classes, extracted from `HeroOverlayPanel` to keep
 * its cognitive complexity under the lint ceiling.
 *
 * - `panelLayout` — the flex centering must live on the panel root
 *   (the flex item inside the parent overlay row) so `self-stretch`
 *   resolves against the parent's `items-stretch` row.
 * - `contentPadding` — mobile (375px) panel inner width is tight, so
 *   the inline padding steps down; lower-third pads like a band with
 *   wide inline gutters at md+.
 * - `outerChrome` / `fillRounded` — radius/shadow only on the card
 *   shape; band shapes (full-height, lower-third) stay flush. The
 *   card's hairline border uses `border-current/15` so it derives from
 *   the overlay ColorScheme's text tone (the panel root carries
 *   `OVERLAY_TEXT_TONE`): black scheme → white hairline, white scheme
 *   → black hairline, role schemes → their `-foreground` tone. A
 *   hardcoded `border-white/15` was invisible on light schemes.
 */
function resolveShapeClasses(
  shape: HeroOverlayShape,
  style: HeroOverlayStyle,
): {
  panelLayout: string;
  contentPadding: string;
  outerChrome: string;
  fillRounded: string;
} {
  if (shape === "lower-third") {
    return {
      panelLayout: "",
      contentPadding: "px-5 py-8 sm:px-8 md:px-12 md:py-10",
      outerChrome: "",
      fillRounded: "",
    };
  }
  if (shape === "full-height") {
    return {
      panelLayout:
        "flex flex-col justify-center md:min-h-[540px] lg:min-h-0 lg:self-stretch",
      contentPadding: "px-5 py-6 sm:p-8 md:p-12",
      outerChrome: "",
      fillRounded: "",
    };
  }
  return {
    panelLayout: "",
    contentPadding: "px-5 py-6 md:p-8",
    outerChrome: cn(
      "rounded-(--card-radius,var(--radius-xl)) shadow-2xl",
      // No fill → no chrome frame; every painted style (solid /
      // gradient / blur) gets the scheme-derived hairline.
      style !== "none" && "border border-current/15",
    ),
    fillRounded: "rounded-(--card-radius,var(--radius-xl))",
  };
}

/**
 * Renders the overlay panel container used by full-bleed hero layouts.
 *
 * Layered so `opacity` only scales the fill — text stays at 100%
 * and contrast holds. The fill layer is `absolute inset-0` and
 * the content layer is `relative z-10` on top of it.
 */
export function HeroOverlayPanel({
  overlay,
  children,
  className,
}: HeroOverlayPanelProps) {
  const style: HeroOverlayStyle = overlay.style ?? "solid";
  const colorScheme: HeroOverlayColorScheme = overlay.colorScheme ?? "black";
  const shape: HeroOverlayShape = overlay.shape ?? "card";
  const width: HeroOverlayWidth = overlay.width ?? "half";
  const position: HeroOverlayPosition = overlay.position ?? "start";
  const mobilePosition: HeroOverlayMobilePosition =
    overlay.mobilePosition ?? "top";
  const padding: HeroOverlayPadding = overlay.padding ?? "default";
  const rawOpacity =
    typeof overlay.opacity === "number" && Number.isFinite(overlay.opacity)
      ? overlay.opacity
      : 100;
  const clampedOpacity = Math.max(0, Math.min(100, rawOpacity));
  // Blur reads as "frosted glass" only while the color fill stays
  // translucent — cap it so an author cranking OverlayOpacity to 100
  // can't silently turn blur back into solid.
  const fillOpacity =
    (overlay.style ?? "solid") === "blur"
      ? Math.min(clampedOpacity, 85)
      : clampedOpacity;

  const fillBgClass = resolveFillBgClass(style, colorScheme, position, shape);
  const textToneClass = style === "none" ? "" : OVERLAY_TEXT_TONE[colorScheme];

  // Every shape honors the OverlayWidth / OverlayPosition axes — the
  // lower-third band caps and places like the other shapes (its
  // wrapper is a flex column, so the panel's inline auto-margins
  // position a sub-full band the same way they do a card).
  const widthClass = widthClassFor(width);
  const positionClass = resolvePositionClasses(position, padding);
  const isFullWidth = width === "full";
  const isBlur = style === "blur";

  const {
    panelLayout: panelLayoutClass,
    contentPadding: contentPaddingClass,
    outerChrome: outerChromeClass,
    fillRounded: fillRoundedClass,
  } = resolveShapeClasses(shape, style);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden",
        widthClass,
        !isFullWidth && positionClass,
        outerChromeClass,
        panelLayoutClass,
        textToneClass,
        // Breach shift last so its negative margins win the
        // tailwind-merge conflict against position/padding margins.
        className,
      )}
      data-overlay-style={style}
      data-overlay-shape={shape}
      data-overlay-position={position}
      data-overlay-mobile-position={mobilePosition}
    >
      {isBlur ? (
        // Dedicated frost layer at FULL opacity beneath the tinted
        // fill. backdrop-filter must live on its own translucent
        // element: on the fill layer the opaque `bg-*` paints over the
        // filtered backdrop and the frost never shows (see
        // resolveFillBgClass).
        <div
          aria-hidden="true"
          data-overlay-blur-layer=""
          className={cn("absolute inset-0 backdrop-blur-md", fillRoundedClass)}
        />
      ) : null}
      {style !== "none" ? (
        <div
          aria-hidden="true"
          className={cn("absolute inset-0", fillRoundedClass, fillBgClass)}
          style={fillOpacity < 100 ? { opacity: fillOpacity / 100 } : undefined}
        />
      ) : null}
      <div className={cn("relative z-10", contentPaddingClass)}>{children}</div>
    </div>
  );
}

/**
 * Color-scheme background for the hero band when no image / video is
 * set. Returns a `bg-* text-*-foreground` class pair so foreground
 * stays legible against the solid color.
 */
export function backgroundColorClass(
  scheme: HeroOverlayColorScheme | undefined,
): string {
  if (!scheme || scheme === "none") return "";
  return cn(OVERLAY_BG_CLASS[scheme], OVERLAY_TEXT_TONE[scheme]);
}
