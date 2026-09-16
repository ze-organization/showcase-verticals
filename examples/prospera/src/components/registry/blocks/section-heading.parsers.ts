/**
 * Pure heading-related types and parsers, free of any React or client
 * runtime dependency. Lives in its own file (NOT `'use client'`) so
 * server components can use them without crossing the RSC boundary —
 * calling these from a `'use client'` module would otherwise turn each
 * parser into a client reference, and invoking a client reference from
 * a server component throws:
 *
 *   "Attempted to call parseHeadingLayout() from the server but
 *    parseHeadingLayout is on the client."
 *
 * The sibling `section-heading.helpers.tsx` is `'use client'` because
 * it defines a stateful `SectionWrapper` component (`useState` /
 * `useEffect`); leaving the parsers there made every server-side
 * caller (`section-wrapper`, `content-block`, `accordion-block`,
 * `tabs-block`, etc.) trip the boundary guard at prerender time.
 *
 * Server components: import from this file.
 * Client components that also need the `SectionWrapper` React
 * component: import the component from `section-heading.helpers`,
 * the parsers + types from here.
 *
 * **Directional values are logical (`start`/`end`), not physical
 * (`left`/`right`).** The codebase is RTL-friendly end-to-end —
 * see the `feedback_logical_props_not_physical` memory.
 */

/**
 * Canonical heading-layout vocabulary (the `heading-layout@1` enum):
 *
 *   start                       start-aligned, no chrome
 *   start-with-accent           start-aligned, accent scribble under the title
 *   start-with-section-divider  start-aligned, full-width hairline rule
 *                               under the heading block
 *   center                      centered, no chrome
 *   center-with-accent          centered, accent scribble under the title
 *   center-with-section-divider centered, full-width hairline rule under
 *                               the heading block
 *
 * Split layouts are programmatic-only (listing families) and are not
 * offered on the enum.
 */
export type HeadingLayout =
  | "start"
  | "start-with-accent"
  | "start-with-section-divider"
  | "center"
  | "center-with-accent"
  | "center-with-section-divider"
  | "split-start"
  | "split-end"
  | "split-start-separator"
  | "split-end-separator"
  | "split-start-accent-line"
  | "split-end-accent-line";

export type HeadingAnimation =
  | "none"
  | "banner-start"
  | "banner-end"
  | "banner-center";

export type HeadingSize = "small" | "default" | "large" | "xl" | "text-banner";

export type HeadingLevel = "h1" | "h2" | "h3" | "h4";

export type SplitFooterAlignment = "start" | "center" | "end";

const HEADING_LAYOUT_VALUES: ReadonlySet<HeadingLayout> = new Set([
  "start",
  "start-with-accent",
  "start-with-section-divider",
  "center",
  "center-with-accent",
  "center-with-section-divider",
  "split-start",
  "split-end",
  "split-start-separator",
  "split-end-separator",
  "split-start-accent-line",
  "split-end-accent-line",
]);

export function parseHeadingLayout(
  value: string | undefined,
  fallback: HeadingLayout,
): HeadingLayout {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (HEADING_LAYOUT_VALUES.has(normalized as HeadingLayout)) {
    return normalized as HeadingLayout;
  }
  return fallback;
}

/**
 * `band-heading-placement@1` — where a band-shaped listing renders its
 * section heading relative to the items:
 *
 *   `above`   heading on its own row above the items (the default —
 *             today's behavior everywhere).
 *   `inline`  heading occupies the band's LEADING column/cell and the
 *             items flow beside it in the same row (the Allstate
 *             resources-slider / milestones-band read).
 *
 * Consumed by `ItemCarousel` (`headingPlacement` prop, fed by the
 * carousel families' `HeadingPlacement` param) and by the stats
 * `Milestones` band. Orthogonal to `heading-layout@1`, which keeps
 * owning the heading's alignment/chrome inside whichever slot this
 * places it in.
 */
export type BandHeadingPlacement = "above" | "inline";

/**
 * Inline-placement grid (`band-heading-placement@1: inline`): the
 * heading occupies a narrower leading column and the items flow beside
 * it in the same band. Vertically centered so the heading reads against
 * the middle of the tiles (the Allstate resources-slider look).
 */
export const BAND_INLINE_HEADING_GRID_CLASS =
  "grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:items-center lg:gap-10";

export function parseBandHeadingPlacement(
  value: string | undefined,
  fallback: BandHeadingPlacement = "above",
): BandHeadingPlacement {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "inline") return "inline";
  if (normalized === "above") return "above";
  return fallback;
}

export function parseHeadingAnimation(
  value: string | undefined,
  fallback: HeadingAnimation = "none",
): HeadingAnimation {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "banner-start") return "banner-start";
  if (normalized === "banner-end") return "banner-end";
  if (normalized === "banner-center") return "banner-center";
  if (normalized === "none") return "none";
  return fallback;
}

export function parseHeadingSize(
  value: string | undefined,
  fallback: HeadingSize = "default",
): HeadingSize {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "small") return "small";
  if (normalized === "default") return "default";
  if (normalized === "large") return "large";
  if (normalized === "xl") return "xl";
  if (normalized === "text-banner") return "text-banner";
  return fallback;
}

/**
 * `AccentLineColor` (color-scheme@1) — recolors the heading's accent
 * scribble AND the section-divider hairline on the layouts that render
 * them. `default` emits no classes: the scribble keeps its inherited
 * `currentColor` chain and the divider keeps `border-border`. Explicit
 * roles pin `text-<role>` on the scribble + `border-<role>` on the
 * divider. (The section-wrapper and content-block recipes both default
 * this param to `accent`; the standalone section-wrapper also folds
 * its retired DecorativeColorScheme param into this value.)
 */
export type AccentLineColorValue =
  | "default"
  | "none"
  | "white"
  | "black"
  | "neutral"
  | "primary"
  | "primary-gradient"
  | "secondary"
  | "secondary-gradient"
  | "tertiary"
  | "accent"
  | "accent-2"
  | "accent-3"
  | "info"
  | "success"
  | "warning"
  | "destructive";

// Role → { scribble text class, divider border class }. Gradients fall
// back to their base solid (no gradient stroke/border token exists) —
// same convention as SectionWrapper's DECORATIVE_TEXT_BY_SCHEME.
// `none` inherits (an explicit transparent decoration would just hide
// the treatment the author picked).
const ACCENT_LINE_COLOR_CLASSES: Record<
  AccentLineColorValue,
  { line: string; divider: string }
> = {
  default: { line: "", divider: "" },
  none: { line: "", divider: "" },
  white: { line: "text-theme-white", divider: "border-theme-white" },
  black: { line: "text-theme-black", divider: "border-theme-black" },
  neutral: { line: "text-foreground", divider: "border-foreground" },
  primary: { line: "text-primary", divider: "border-primary" },
  "primary-gradient": { line: "text-primary", divider: "border-primary" },
  secondary: { line: "text-secondary", divider: "border-secondary" },
  "secondary-gradient": {
    line: "text-secondary",
    divider: "border-secondary",
  },
  tertiary: { line: "text-tertiary", divider: "border-tertiary" },
  accent: { line: "text-accent", divider: "border-accent" },
  "accent-2": { line: "text-accent-2", divider: "border-accent-2" },
  "accent-3": { line: "text-accent-3", divider: "border-accent-3" },
  info: { line: "text-info", divider: "border-info" },
  success: { line: "text-success", divider: "border-success" },
  warning: { line: "text-warning", divider: "border-warning" },
  destructive: { line: "text-destructive", divider: "border-destructive" },
};

/**
 * Parse the `AccentLineColor` rendering param (color-scheme@1).
 * Empty/unknown values collapse to the fallback (`default` = inherit
 * today's colors).
 */
export function parseAccentLineColor(
  value: string | undefined,
  fallback: AccentLineColorValue = "default",
): AccentLineColorValue {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return normalized in ACCENT_LINE_COLOR_CLASSES
    ? (normalized as AccentLineColorValue)
    : fallback;
}

/** Class pair for a parsed `AccentLineColor` value. */
export function accentLineColorClasses(value: AccentLineColorValue): {
  line: string;
  divider: string;
} {
  return ACCENT_LINE_COLOR_CLASSES[value];
}

/**
 * Raw Sitecore rendering-param names for the shared section-heading
 * axis, as they arrive on `props.params` (or a family's `SitecoreXParams`
 * shape). Mirrors `SectionSurfaceParams` in `section-surface.ts`.
 */
export interface SectionHeadingParams {
  HeadingLayout?: string;
  HeadingSize?: string;
}

/** Flat-prop names the heading axis travels under between the Sitecore
 * adapter and a listing component. Mirrors `SectionSurfaceProps`. */
export interface SectionHeadingAxisProps {
  headingLayout?: string;
  headingSize?: string;
}

/**
 * Adapter bridge for the heading axis — spread into a family's
 * `adaptListGridProps` / `adaptCarouselProps` result exactly like
 * `adaptSectionSurfaceParams`. Values stay raw strings; parsing
 * happens component-side via `resolveListingHeading`.
 */
export function adaptSectionHeadingParams(
  params: SectionHeadingParams | undefined,
): SectionHeadingAxisProps {
  return {
    headingLayout: params?.HeadingLayout,
    headingSize: params?.HeadingSize,
  };
}

/**
 * Content sources accepted by the listing-heading resolver. Kept
 * structural (`unknown`-friendly) so the pure parser module doesn't
 * import editable-primitive types; the concrete `TextSource` typing is
 * re-imposed by `SectionHeadingProps` at the consuming call site.
 */
export interface ListingHeadingInput<TSource> {
  title?: TSource;
  lead?: TSource;
  /** Optional kicker line above the title (renders only when the
   * family's content shape carries an `Eyebrow` field). */
  eyebrow?: TSource;
  /** Raw `HeadingLayout` param (`heading-layout@1`). */
  headingLayout?: string;
  /** Raw `HeadingSize` param (`heading-size@1`). */
  headingSize?: string;
  /** Family default when the layout param is unset. */
  defaultLayout?: HeadingLayout;
}

/**
 * One shared construction path for the `heading` config every
 * cards-and-lists grid/carousel passes to `ItemListing` /
 * `ItemCarousel`. Centralised so the layout/size/eyebrow vocabulary
 * can't drift between the ~20 listing renderings: defaults resolve to
 * `layout: "start-with-section-divider"` + `size: "default"`, which
 * renders byte-identical to the pre-axis hardcoded heading.
 */
export function resolveListingHeading<TSource>({
  title,
  lead,
  eyebrow,
  headingLayout,
  headingSize,
  defaultLayout = "start-with-section-divider",
}: ListingHeadingInput<TSource>): {
  title?: TSource;
  lead?: TSource;
  eyebrow?: TSource;
  layout: HeadingLayout;
  headingOptions: { size: HeadingSize };
} {
  return {
    title,
    lead,
    eyebrow,
    layout: parseHeadingLayout(headingLayout, defaultLayout),
    headingOptions: { size: parseHeadingSize(headingSize, "default") },
  };
}

/**
 * Parse the semantic heading tag for the title slot. Independent of
 * `HeadingSize` — level controls the document outline (`h1`–`h4`),
 * size controls the typographic scale. Defaults to `h2`, matching the
 * historical hardcoded tag in SectionWrapper.
 */
export function parseHeadingLevel(
  value: string | undefined,
  fallback: HeadingLevel = "h2",
): HeadingLevel {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === "h1") return "h1";
  if (normalized === "h2") return "h2";
  if (normalized === "h3") return "h3";
  if (normalized === "h4") return "h4";
  return fallback;
}
