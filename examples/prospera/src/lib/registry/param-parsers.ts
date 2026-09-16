/**
 * Sitecore rendering-param string parsers. Each parser takes the raw
 * `string | undefined` value the layout-service envelope hands React
 * and validates / coerces it to a usable shape.
 *
 * Centralised here so every component shares the same vocabulary —
 * an unchecked checkbox, an empty enum, an unknown enum value all
 * coerce to the same fallback across the design system, and a future
 * change to how we recognise Sitecore string-booleans (e.g. localised
 * "yes" / "no") happens in exactly one place.
 */

import type { SurfaceTone } from "./color-scheme-classes";
import { isSurfaceTone } from "./color-scheme-classes";

/**
 * A JSS checkbox field arrives from the layout service (and from the
 * recipe compositor's `recipeFieldsToJss`) wrapped as `{ value: … }` —
 * unwrap that shape so boolean parsers accept a field object directly.
 * Anything without a `value` key passes through untouched.
 */
function unwrapJssValue(value: unknown): unknown {
  if (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    "value" in (value as Record<string, unknown>)
  ) {
    return (value as { value: unknown }).value;
  }
  return value;
}

/**
 * The raw value a Sitecore boolean can arrive as: a real boolean, the
 * string-boolean a rendering param serialises to, or the JSS checkbox
 * field wrapper (`{ value: boolean | string }`) a datasource field
 * carries. Anything else coerces to the parser's fallback — never a
 * crash (a `.trim()` on a field object was exactly the SSR 500 in the
 * design-composed page-render path).
 */
export type SitecoreBoolInput =
  | string
  | boolean
  | { value?: string | boolean }
  | null
  | undefined;

/**
 * Strict allow-list for Sitecore string-boolean params. Empty / missing
 * / unknown all coerce to `false` so an unchecked Sitecore rendering-
 * param checkbox reliably turns the affordance off, regardless of the
 * exact `"0"` / `"false"` shape Sitecore happens to serialise.
 *
 * Use this for any "is this param truthy?" check on a Sitecore string
 * value. Also accepts the JSS checkbox FIELD shape (`{ value: … }`) so
 * components can pass `fields.HasPanel` straight through without
 * unwrapping — a datasource checkbox keeps its JSS wrapper all the way
 * into the component.
 */
export function isEnabled(value: SitecoreBoolInput): boolean {
  const raw = unwrapJssValue(value);
  if (typeof raw === "boolean") return raw;
  if (typeof raw !== "string" || !raw) return false;
  const normalized = raw.trim().toLowerCase();
  return ["1", "true", "yes", "on", "enabled"].includes(normalized);
}

/**
 * Parse a Sitecore string-boolean with an explicit fallback for the
 * empty / missing case. Useful when the default for an unset value is
 * `true` (e.g. video autoplay defaulting on for the full-bleed hero).
 *
 * Distinct from `isEnabled` (which defaults to `false`); pick the one
 * that matches your default.
 */
export function parseBoolParam(
  value: SitecoreBoolInput,
  fallback: boolean,
): boolean {
  const raw = unwrapJssValue(value);
  if (typeof raw === "boolean") return raw;
  if (typeof raw !== "string" || !raw) return fallback;
  const normalized = raw.trim().toLowerCase();
  if (["1", "true", "yes", "on", "enabled"].includes(normalized)) return true;
  if (["0", "false", "no", "off", "disabled"].includes(normalized))
    return false;
  return fallback;
}

/**
 * Parse a Sitecore CHECKBOX param that defaults ON, distinguishing the
 * two empty cases that `isEnabled` and `parseBoolParam` collapse:
 *
 *   - `undefined` — the param was never delivered (a placement older
 *     than the param, a preview, a test). Takes `fallback`.
 *   - `""`        — the param WAS delivered and the author unchecked
 *     the box. Sitecore serialises an unchecked checkbox as empty, so
 *     this MUST read false.
 *
 * Why it matters: a recipe with `default: "true"` compiles to a CHECKED
 * Standard Value, so a checked box arrives as `"1"` and an unchecked one
 * as `""`. Reading that with `parseBoolParam(value, true)` returns the
 * fallback for `""` — i.e. `true` — and the axis can never be turned
 * off. That silently broke `link-list`'s RowSeparators, `video`'s
 * MediaControls, and `hero`'s OverlayEnabled.
 *
 * Rule of thumb: `default: "true"` in the recipe ⇒ read it with this,
 * not with `parseBoolParam(..., true)`.
 */
export function parseDefaultOnCheckbox(
  value: SitecoreBoolInput,
  fallback = true,
): boolean {
  if (value === undefined || value === null) return fallback;
  const raw = unwrapJssValue(value);
  if (typeof raw === "boolean") return raw;
  if (typeof raw !== "string") return fallback;
  const normalized = raw.trim().toLowerCase();
  if (!normalized) return false;
  if (["1", "true", "yes", "on", "enabled"].includes(normalized)) return true;
  if (["0", "false", "no", "off", "disabled"].includes(normalized)) {
    return false;
  }
  return fallback;
}

/**
 * Parse a value as the shared `color-scheme@1` enum (the `SurfaceTone`
 * set), falling back to an explicit default when the value is empty,
 * unknown, or out of the allowed set. Mirrors `isSurfaceTone` but
 * returns the typed value instead of a guard.
 */
export function parseColorScheme(
  value: string | undefined,
  fallback: SurfaceTone,
): SurfaceTone {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return isSurfaceTone(normalized) ? (normalized as SurfaceTone) : fallback;
}

/**
 * Allowed values on the shared `button-variant@1` Sitecore enum.
 *
 * The trailing arrow is NOT a variant — it is the orthogonal `ShowArrow`
 * param, so it composes with any of these four.
 */
export type ButtonVariantValue = "default" | "outline" | "ghost" | "link";

const BUTTON_VARIANT_VALUES: ReadonlySet<ButtonVariantValue> = new Set([
  "default",
  "outline",
  "ghost",
  "link",
]);

/** Parse a value as the shared `button-variant@1` enum. */
export function parseButtonVariant(
  value: string | undefined,
  fallback: ButtonVariantValue = "default",
): ButtonVariantValue {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return BUTTON_VARIANT_VALUES.has(normalized as ButtonVariantValue)
    ? (normalized as ButtonVariantValue)
    : fallback;
}

/**
 * The variant vocabulary the Button PRIMITIVE understands. Identical to
 * {@link ButtonVariantValue} — the authored `button-variant@1` set and the
 * primitive's set are the same.
 */
export type PrimitiveButtonVariantValue = ButtonVariantValue;

/** Allowed values on the shared `size@1` Sitecore enum. */
export type ButtonSizeValue = "default" | "xs" | "sm" | "md" | "lg" | "xl";

const BUTTON_SIZE_VALUES: ReadonlySet<ButtonSizeValue> = new Set([
  "default",
  "xs",
  "sm",
  "md",
  "lg",
  "xl",
]);

/**
 * Parse a value as the shared `size@1` enum. Defaults to `"default"`
 * which the CTA Button maps to the primitive button's natural size.
 */
export function parseButtonSize(
  value: string | undefined,
  fallback: ButtonSizeValue = "default",
): ButtonSizeValue {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return BUTTON_SIZE_VALUES.has(normalized as ButtonSizeValue)
    ? (normalized as ButtonSizeValue)
    : fallback;
}

/** Allowed values on the shared `title-weight@1` Sitecore enum. */
export type TitleWeightValue =
  | "default"
  | "light"
  | "regular"
  | "semibold"
  | "bold"
  | "heavy";

const TITLE_WEIGHT_VALUES: ReadonlySet<TitleWeightValue> = new Set([
  "default",
  "light",
  "regular",
  "semibold",
  "bold",
  "heavy",
]);

/**
 * Parse a value as the shared `title-weight@1` enum. `default` defers
 * to the component's theme-token fallback (`--heading-weight`).
 */
export function parseTitleWeight(
  value: string | undefined,
  fallback: TitleWeightValue = "default",
): TitleWeightValue {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return TITLE_WEIGHT_VALUES.has(normalized as TitleWeightValue)
    ? (normalized as TitleWeightValue)
    : fallback;
}

/** Allowed values on the shared `caption-style@1` Sitecore enum. */
export type CaptionStyleValue = "none" | "below" | "overlay" | "card";

const CAPTION_STYLE_VALUES: ReadonlySet<CaptionStyleValue> = new Set([
  "none",
  "below",
  "overlay",
  "card",
]);

/**
 * Parse the media `caption-style@1` enum — how a media tile's caption
 * renders relative to its image. Defaults to `below` (plain prose under
 * the image), matching the historical behavior.
 */
export function parseCaptionStyle(
  value: string | undefined,
  fallback: CaptionStyleValue = "below",
): CaptionStyleValue {
  if (!value) return fallback;
  const raw = value.trim();
  // Droplists sometimes serialize as `guid|name`.
  const name = raw.includes("|") ? raw.slice(raw.lastIndexOf("|") + 1) : raw;
  const normalized = name.trim().toLowerCase();
  return CAPTION_STYLE_VALUES.has(normalized as CaptionStyleValue)
    ? (normalized as CaptionStyleValue)
    : fallback;
}

/** Allowed values on the shared `alignment@1` Sitecore enum. */
export type AlignmentValue = "start" | "center" | "end";

const ALIGNMENT_VALUES: ReadonlySet<AlignmentValue> = new Set([
  "start",
  "center",
  "end",
]);

/**
 * Parse a value as the shared `alignment@1` enum. Defaults to `start`
 * per the registry's family convention — every alignment-carrying
 * surface treats the unset case as inline-start.
 */
export function parseAlignment(
  value: string | undefined,
  fallback: AlignmentValue = "start",
): AlignmentValue {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return ALIGNMENT_VALUES.has(normalized as AlignmentValue)
    ? (normalized as AlignmentValue)
    : fallback;
}

/** Allowed values on the hero `overlay-position@1` enum. */
export type OverlayPositionValue =
  | "start"
  | "start-padded"
  | "center"
  | "end-padded"
  | "end";

const OVERLAY_POSITION_VALUES: ReadonlySet<OverlayPositionValue> = new Set([
  "start",
  "start-padded",
  "center",
  "end-padded",
  "end",
]);

/**
 * Parse `overlay-position@1`. Empty strings and unresolved Droplink
 * GUIDs (the layout-service envelope when the enum manifest misses)
 * coerce to `fallback` instead of leaking through as dictionary keys.
 */
export function parseOverlayPosition(
  value: string | undefined,
  fallback: OverlayPositionValue = "start",
): OverlayPositionValue {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return OVERLAY_POSITION_VALUES.has(normalized as OverlayPositionValue)
    ? (normalized as OverlayPositionValue)
    : fallback;
}

/** Allowed values on the hero `overlay-style@1` enum. */
export type OverlayStyleValue = "none" | "solid" | "gradient" | "blur";

const OVERLAY_STYLE_VALUES: ReadonlySet<OverlayStyleValue> = new Set([
  "none",
  "solid",
  "gradient",
  "blur",
]);

/** Parse `overlay-style@1`. Unknown / GUID → `fallback`. */
export function parseOverlayStyle(
  value: string | undefined,
  fallback: OverlayStyleValue = "solid",
): OverlayStyleValue {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return OVERLAY_STYLE_VALUES.has(normalized as OverlayStyleValue)
    ? (normalized as OverlayStyleValue)
    : fallback;
}

/** Allowed values on the hero `overlay-shape@1` enum. */
export type OverlayShapeValue = "card" | "full-height" | "lower-third";

const OVERLAY_SHAPE_VALUES: ReadonlySet<OverlayShapeValue> = new Set([
  "card",
  "full-height",
  "lower-third",
]);

/** Parse `overlay-shape@1`. Unknown / GUID → `fallback`. */
export function parseOverlayShape(
  value: string | undefined,
  fallback: OverlayShapeValue = "card",
): OverlayShapeValue {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return OVERLAY_SHAPE_VALUES.has(normalized as OverlayShapeValue)
    ? (normalized as OverlayShapeValue)
    : fallback;
}

/** Allowed values on the hero `overlay-width@1` enum. */
export type OverlayWidthValue =
  | "quarter"
  | "third"
  | "half"
  | "two-thirds"
  | "three-quarters"
  | "full";

const OVERLAY_WIDTH_VALUES: ReadonlySet<OverlayWidthValue> = new Set([
  "quarter",
  "third",
  "half",
  "two-thirds",
  "three-quarters",
  "full",
]);

/** Parse `overlay-width@1`. Unknown / GUID → `fallback`. */
export function parseOverlayWidth(
  value: string | undefined,
  fallback: OverlayWidthValue = "half",
): OverlayWidthValue {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return OVERLAY_WIDTH_VALUES.has(normalized as OverlayWidthValue)
    ? (normalized as OverlayWidthValue)
    : fallback;
}

/** Allowed values on the hero `overlay-mobile-position@1` enum. */
export type OverlayMobilePositionValue = "top" | "bottom";

const OVERLAY_MOBILE_POSITION_VALUES: ReadonlySet<OverlayMobilePositionValue> =
  new Set(["top", "bottom"]);

/** Parse `overlay-mobile-position@1`. Unknown / GUID → `fallback`. */
export function parseOverlayMobilePosition(
  value: string | undefined,
  fallback: OverlayMobilePositionValue = "top",
): OverlayMobilePositionValue {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return OVERLAY_MOBILE_POSITION_VALUES.has(
    normalized as OverlayMobilePositionValue,
  )
    ? (normalized as OverlayMobilePositionValue)
    : fallback;
}

/**
 * Overlay color-scheme allow-list — the subset of `color-scheme@1`
 * `HeroOverlayPanel` has fill/text maps for. Wider `SurfaceTone` values
 * (e.g. `default`, `accent-gradient`) coerce to `fallback`.
 */
export type OverlayColorSchemeValue =
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

const OVERLAY_COLOR_SCHEME_VALUES: ReadonlySet<OverlayColorSchemeValue> =
  new Set([
    "none",
    "white",
    "black",
    "neutral",
    "primary",
    "primary-gradient",
    "secondary",
    "secondary-gradient",
    "tertiary",
    "accent",
    "accent-2",
    "accent-3",
    "info",
    "success",
    "warning",
    "destructive",
  ]);

/** Parse overlay `color-scheme@1`. Unknown / GUID → `fallback`. */
export function parseOverlayColorScheme(
  value: string | undefined,
  fallback: OverlayColorSchemeValue = "black",
): OverlayColorSchemeValue {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return OVERLAY_COLOR_SCHEME_VALUES.has(
    normalized as OverlayColorSchemeValue,
  )
    ? (normalized as OverlayColorSchemeValue)
    : fallback;
}

/** Allowed values on the shared `heading-color@1` Sitecore enum. */
export type HeadingColorValue =
  | "default"
  | "none"
  | "white"
  | "black"
  | "primary"
  | "secondary"
  | "tertiary"
  | "accent"
  | "accent-2"
  | "accent-3"
  | "muted"
  | "success"
  | "warning"
  | "info"
  | "destructive";

const HEADING_COLOR_VALUES: ReadonlySet<HeadingColorValue> = new Set([
  "default",
  "none",
  "white",
  "black",
  "primary",
  "secondary",
  "tertiary",
  "accent",
  "accent-2",
  "accent-3",
  "muted",
  "success",
  "warning",
  "info",
  "destructive",
]);

/**
 * Parse the shared `heading-color@1` enum used by SectionWrapper and any
 * surface that exposes an authorable heading-text color. `default` keeps
 * the inherited `text-foreground`; every other token resolves to the
 * "role text on page" composition (`text-<role>`) — never the
 * `text-<role>-foreground` variant, which is reserved for text inside a
 * matching solid surface (see the `color-roles` skill).
 */
export function parseHeadingColor(
  value: string | undefined,
  fallback: HeadingColorValue = "default",
): HeadingColorValue {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return HEADING_COLOR_VALUES.has(normalized as HeadingColorValue)
    ? (normalized as HeadingColorValue)
    : fallback;
}

const HEADING_COLOR_CLASS: Record<HeadingColorValue, string> = {
  default: "",
  // `none` explicitly takes the SURROUNDING surface's color, where
  // `default` leaves the cascade untouched. The two render the same
  // today (heading typography bakes in no color, and there is no global
  // h1-h6 color rule), but they are not the same instruction: `none`
  // keeps working if a theme ever colors headings globally.
  none: "text-inherit",
  // Fixed theme literals, NOT role tokens — the same policy the overlay
  // header and app-store badge use. A heading that must stay
  // white-on-dark should not shift when a brand reweights `primary`.
  white: "text-theme-white",
  black: "text-theme-black",
  primary: "text-primary",
  secondary: "text-secondary",
  tertiary: "text-tertiary",
  accent: "text-accent",
  "accent-2": "text-accent-2",
  "accent-3": "text-accent-3",
  muted: "text-muted-foreground",
  success: "text-success",
  warning: "text-warning",
  info: "text-info",
  destructive: "text-destructive",
};

/**
 * Tailwind class for a parsed `heading-color@1` value. Returns `""` for
 * `default` so callers can `cn(...)` it without colliding with the
 * inherited `text-foreground`.
 */
export function headingColorClass(value: HeadingColorValue): string {
  return HEADING_COLOR_CLASS[value];
}

/** Allowed values on the shared `prose-leading@1` Sitecore enum. */
export type ProseLeadingValue =
  | "default"
  | "tight"
  | "snug"
  | "normal"
  | "relaxed"
  | "loose";

const PROSE_LEADING_VALUES: ReadonlySet<ProseLeadingValue> = new Set([
  "default",
  "tight",
  "snug",
  "normal",
  "relaxed",
  "loose",
]);

/**
 * Parse the shared `prose-leading@1` enum (line-height for the prose
 * body). `default` collapses to the Prose primitive's inherited
 * line-height; every other value maps directly to Tailwind's
 * `leading-<token>` utility.
 */
export function parseProseLeading(
  value: string | undefined,
  fallback: ProseLeadingValue = "default",
): ProseLeadingValue {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return PROSE_LEADING_VALUES.has(normalized as ProseLeadingValue)
    ? (normalized as ProseLeadingValue)
    : fallback;
}

const PROSE_LEADING_CLASS: Record<ProseLeadingValue, string> = {
  default: "",
  tight: "leading-tight",
  snug: "leading-snug",
  normal: "leading-normal",
  relaxed: "leading-relaxed",
  loose: "leading-loose",
};

/** Tailwind class for a parsed `prose-leading@1` value. */
export function proseLeadingClass(value: ProseLeadingValue): string {
  return PROSE_LEADING_CLASS[value];
}

/** Allowed values on the shared `prose-size@1` Sitecore enum. */
export type ProseSizeValue = "default" | "sm" | "base" | "lg" | "xl";

const PROSE_SIZE_VALUES: ReadonlySet<ProseSizeValue> = new Set([
  "default",
  "sm",
  "base",
  "lg",
  "xl",
]);

/**
 * Parse the shared `prose-size@1` enum (body text size override).
 * `default` keeps the inherited body size; other values map to
 * Tailwind's `text-<size>` utilities applied to the Prose container so
 * the cascade carries them to paragraphs, lists, and quotes.
 */
export function parseProseSize(
  value: string | undefined,
  fallback: ProseSizeValue = "default",
): ProseSizeValue {
  if (!value) return fallback;
  const normalized = value.trim().toLowerCase();
  return PROSE_SIZE_VALUES.has(normalized as ProseSizeValue)
    ? (normalized as ProseSizeValue)
    : fallback;
}

const PROSE_SIZE_CLASS: Record<ProseSizeValue, string> = {
  default: "",
  sm: "text-sm",
  base: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

/** Tailwind class for a parsed `prose-size@1` value. */
export function proseSizeClass(value: ProseSizeValue): string {
  return PROSE_SIZE_CLASS[value];
}

/**
 * Re-export of the `SurfaceTone` → Button-scheme narrowing (defined in
 * `color-scheme-classes`). Surfaced here so callers that already parse
 * params through this module can narrow without taking a second
 * registry dependency on the class-map module for one helper.
 */
export {
  type ButtonColorScheme,
  buttonColorScheme,
} from "./color-scheme-classes";
