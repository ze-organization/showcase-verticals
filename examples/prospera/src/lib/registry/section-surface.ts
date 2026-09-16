/**
 * Shared section-surface vocabulary — the single mapping from the
 * `color-scheme@1` + `background-intensity@1` + `padding-y@1` +
 * `max-width@1` enumerations to Tailwind classes.
 *
 * Consumed by BOTH section shells so they can't drift:
 *   - `components/layout/section-wrapper.tsx` (BackgroundColor axis)
 *   - `blocks/listing-section.tsx` (ColorScheme axis on every
 *     cards-and-lists `*-list-grid` / `*-carousel` rendering)
 *
 * Dark surfaces additionally get the `surface-invert` utility (defined
 * once in `src/app/globals.css`): a scoped CSS-variable remap that
 * re-tones interior components (muted text, card slabs, borders,
 * surface fills) against the dark fill without touching each component.
 * The remap derives every value from `--surface-invert-on` — the
 * scheme's own on-color token — so it stays correct across themes.
 */

export type SectionColorScheme =
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
  | "tertiary-gradient"
  | "accent"
  | "accent-gradient"
  | "accent-2"
  | "accent-2-gradient"
  | "accent-3"
  | "accent-3-gradient"
  | "info"
  | "success"
  | "warning"
  | "destructive";

export type SectionBackgroundIntensity = "subtle" | "bold";

export type SectionPaddingY =
  | "auto"
  | "none"
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl";

export type SectionMaxWidth = "auto" | "narrow" | "standard" | "wide" | "full";

/**
 * `overlap-top@1` — how far the section's content floats up over the
 * previous section. `half` is the "cards overlapping the hero's bottom
 * edge" pattern (emirates / ketelone): negative top margin + `relative
 * z-10` on the inner wrapper so the card row paints above whatever
 * section precedes it, with no coupling to that section's component.
 * `quarter` is a shallower lift (a card row that just clips the hero's
 * edge); `full` pulls the row a full card-height up (the diageo
 * careers pattern where cards sit mostly over the hero image).
 */
export type SectionOverlapTop = "none" | "quarter" | "half" | "full";

/**
 * Subtle (default) intensity — the soft `-background` tint per scheme.
 * `default` = inherit the parent surface (no class emitted); `none` =
 * explicit transparent surface, same output, different author intent.
 */
export const SECTION_BACKGROUND_BY_SCHEME: Record<SectionColorScheme, string> =
  {
    default: "",
    none: "",
    // White / black map to the theme's white / black tokens so they
    // honour theme overrides instead of forcing pure #fff / #000.
    white: "bg-theme-white text-theme-black",
    black: "bg-theme-black text-theme-white",
    neutral: "bg-muted",
    primary: "bg-primary-background",
    // Gradients use the Tailwind gradient utility form (not a CSS
    // variable) so they always render — per-theme tokens drive stops.
    "primary-gradient":
      "bg-gradient-to-br from-primary to-secondary text-primary-foreground",
    secondary: "bg-secondary-background",
    "secondary-gradient":
      "bg-gradient-to-br from-secondary to-accent text-secondary-foreground",
    tertiary: "bg-tertiary-background",
    "tertiary-gradient":
      "bg-gradient-to-br from-tertiary to-primary text-tertiary-foreground",
    accent: "bg-accent-background",
    "accent-gradient":
      "bg-gradient-to-br from-accent to-accent-2 text-accent-foreground",
    "accent-2": "bg-accent-2-background",
    "accent-2-gradient":
      "bg-gradient-to-br from-accent-2 to-accent-3 text-accent-2-foreground",
    "accent-3": "bg-accent-3-background",
    "accent-3-gradient":
      "bg-gradient-to-br from-accent-3 to-tertiary text-accent-3-foreground",
    info: "bg-info-background",
    success: "bg-success-background",
    warning: "bg-warning-background",
    destructive: "bg-destructive-background",
  };

/**
 * Bold treatment: pure brand color + inverted foreground. White / black
 * already paint the strongest version of themselves and the gradients
 * are saturated by definition, so bold = subtle for those. Neutral
 * lands on `foreground` + `background` (the bone-stock inversion).
 */
export const SECTION_BOLD_BACKGROUND_BY_SCHEME: Partial<
  Record<SectionColorScheme, string>
> = {
  white: "bg-theme-white text-theme-black",
  black: "bg-theme-black text-theme-white",
  neutral: "bg-foreground text-background",
  primary: "bg-primary text-primary-foreground",
  "primary-gradient":
    "bg-gradient-to-br from-primary to-secondary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  "secondary-gradient":
    "bg-gradient-to-br from-secondary to-accent text-secondary-foreground",
  tertiary: "bg-tertiary text-tertiary-foreground",
  "tertiary-gradient":
    "bg-gradient-to-br from-tertiary to-primary text-tertiary-foreground",
  accent: "bg-accent text-accent-foreground",
  "accent-gradient":
    "bg-gradient-to-br from-accent to-accent-2 text-accent-foreground",
  "accent-2": "bg-accent-2 text-accent-2-foreground",
  "accent-2-gradient":
    "bg-gradient-to-br from-accent-2 to-accent-3 text-accent-2-foreground",
  "accent-3": "bg-accent-3 text-accent-3-foreground",
  "accent-3-gradient":
    "bg-gradient-to-br from-accent-3 to-tertiary text-accent-3-foreground",
  info: "bg-info text-info-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
  destructive: "bg-destructive text-destructive-foreground",
};

/**
 * `padding-y@1` → `py-*`. `auto` = the shell's natural padding (no
 * class emitted here — the shell applies its own bespoke responsive
 * ramp inline and special-cases that value). It is the recipe-default
 * for shells whose natural padding is responsive and so not
 * representable by a single `py-*` token, and falls through to `""`
 * for any consumer that doesn't special-case it.
 */
export const SECTION_PADDING_Y_CLASSES: Record<SectionPaddingY, string> = {
  auto: "",
  none: "py-0",
  sm: "py-4",
  md: "py-8",
  lg: "py-12",
  xl: "py-20",
  "2xl": "py-32",
};

/**
 * `max-width@1` → `max-w-*`. Tailwind v4 dropped `max-w-screen-*`;
 * pixel caps so standard / wide actually constrain. `auto` emits no
 * `max-w-*` class — it means "the shell's natural width", which for
 * consent-banner / footer is the Tailwind `container` cap
 * (deliberately NOT `full`/`max-w-none`, which would strip that cap),
 * and is the recipe-default for those shells.
 */
export const SECTION_MAX_WIDTH_CLASSES: Record<SectionMaxWidth, string> = {
  auto: "",
  narrow: "max-w-[640px]",
  standard: "max-w-[896px]",
  wide: "max-w-[1280px]",
  full: "max-w-none",
};

/**
 * `overlap-top@1` → classes on the section's INNER content wrapper.
 * `half` pulls the wrapper up over the previous section and elevates
 * it (`relative z-10`) so the floating cards paint above that
 * section's content. The section shell pairs this with `pt-0` on its
 * padding wrapper so the overlap distance is predictable regardless
 * of the `PaddingY` pick.
 */
export const SECTION_OVERLAP_TOP_CLASSES: Record<SectionOverlapTop, string> = {
  none: "",
  quarter: "relative z-10 -mt-8 md:-mt-12",
  half: "relative z-10 -mt-16 md:-mt-24",
  full: "relative z-10 -mt-32 md:-mt-48",
};

/**
 * Resolve the surface (background + top-level text) classes for a
 * scheme + intensity pair.
 */
export function resolveSectionBackgroundClass(
  scheme: SectionColorScheme,
  intensity: SectionBackgroundIntensity,
): string {
  if (intensity === "bold") {
    return (
      SECTION_BOLD_BACKGROUND_BY_SCHEME[scheme] ??
      SECTION_BACKGROUND_BY_SCHEME[scheme]
    );
  }
  return SECTION_BACKGROUND_BY_SCHEME[scheme];
}

/**
 * Per-scheme on-color token for the `surface-invert` remap. The remap
 * derives muted text / card slabs / borders from this color, so it
 * stays contrast-correct even when a theme's "bold" fill is light
 * (e.g. a pale warning yellow whose foreground is near-black).
 */
const SURFACE_INVERT_ON_BY_SCHEME: Partial<Record<SectionColorScheme, string>> =
  {
    black: "[--surface-invert-on:var(--color-theme-white)]",
    neutral: "[--surface-invert-on:var(--color-background)]",
    primary: "[--surface-invert-on:var(--color-primary-foreground)]",
    "primary-gradient": "[--surface-invert-on:var(--color-primary-foreground)]",
    secondary: "[--surface-invert-on:var(--color-secondary-foreground)]",
    "secondary-gradient":
      "[--surface-invert-on:var(--color-secondary-foreground)]",
    tertiary: "[--surface-invert-on:var(--color-tertiary-foreground)]",
    "tertiary-gradient":
      "[--surface-invert-on:var(--color-tertiary-foreground)]",
    accent: "[--surface-invert-on:var(--color-accent-foreground)]",
    "accent-gradient": "[--surface-invert-on:var(--color-accent-foreground)]",
    "accent-2": "[--surface-invert-on:var(--color-accent-2-foreground)]",
    "accent-2-gradient":
      "[--surface-invert-on:var(--color-accent-2-foreground)]",
    "accent-3": "[--surface-invert-on:var(--color-accent-3-foreground)]",
    "accent-3-gradient":
      "[--surface-invert-on:var(--color-accent-3-foreground)]",
    info: "[--surface-invert-on:var(--color-info-foreground)]",
    success: "[--surface-invert-on:var(--color-success-foreground)]",
    warning: "[--surface-invert-on:var(--color-warning-foreground)]",
    destructive: "[--surface-invert-on:var(--color-destructive-foreground)]",
  };

/**
 * Whether the surface re-tones its interior via `surface-invert`:
 * `black` at any intensity, plus every bold solid fill (whose top-level
 * text already flips to the scheme's `-foreground` token — the remap
 * extends that flip to interior muted text / cards / borders). Subtle
 * tints, white, `none`, and `default` keep the page's own tokens; the
 * gradients count as bold-by-definition.
 */
export function isInvertedSurface(
  scheme: SectionColorScheme,
  intensity: SectionBackgroundIntensity,
): boolean {
  if (scheme === "black") return true;
  if (scheme.endsWith("-gradient")) return true;
  return intensity === "bold" && SURFACE_INVERT_ON_BY_SCHEME[scheme] != null;
}

/**
 * Full surface class string: background/text classes plus, on dark /
 * bold fills, the `surface-invert` token remap (with its per-scheme
 * on-color). Empty string when the scheme inherits the parent surface.
 */
export function resolveSectionSurfaceClass(
  scheme: SectionColorScheme,
  intensity: SectionBackgroundIntensity,
): string {
  const background = resolveSectionBackgroundClass(scheme, intensity);
  if (!background || !isInvertedSurface(scheme, intensity)) return background;
  return [
    background,
    "surface-invert",
    SURFACE_INVERT_ON_BY_SCHEME[scheme] ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * An exact chrome-bar surface color (header/footer `SurfaceColor` param).
 *
 * Why inline, not a class: the shared section-surface vocabulary quantizes
 * a fill to one of a handful of theme-token schemes (`bg-primary`,
 * `bg-foreground`, …). That is right for authored sections, but a
 * chrome-generation pass samples the source site's REAL header/footer bar
 * color (e.g. a brand teal `#0b5c5c`) and must reproduce it EXACTLY. A
 * Tailwind arbitrary value (`bg-[#0b5c5c]`) built from runtime data is
 * never seen by the JIT at build time, so it compiles to nothing and the
 * bar falls back to the token surface. An inline `backgroundColor` always
 * paints, losslessly.
 *
 * The descendants still need to re-tone: nav links, dividers, and quiet
 * panels read `text-foreground` / `bg-background` / `border-border`, which
 * do NOT follow an inline background. So a DARK sampled bar also carries
 * the `surface-invert` token remap (same mechanism the dark section
 * schemes use) so the whole subtree flips to a light-on-dark family. A
 * LIGHT sampled bar keeps the default (dark-on-light) tokens, which
 * already suit it.
 *
 * Returns `null` for an absent / malformed hex so callers fall back to the
 * enum-derived surface (fail-open — never renders worse than today).
 */
export interface ChromeSurfaceOverride {
  /** Inline style to paint the bar exactly. */
  style: { backgroundColor: string };
  /** Descendant token-remap class: `surface-invert` for a dark bar, else `""`. */
  className: string;
}

const HEX_RE = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i;

const parseHexRgb = (
  hex: string,
): { r: number; g: number; b: number } | null => {
  const m = HEX_RE.exec(hex.trim());
  const raw = m?.[1];
  if (!raw) return null;
  const body =
    raw.length === 3
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  const n = Number.parseInt(body, 16);
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
};

const srgbToLinear = (c: number): number => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

/** WCAG relative luminance (0 = black … 1 = white). */
const relativeLuminance = (rgb: { r: number; g: number; b: number }): number =>
  0.2126 * srgbToLinear(rgb.r) +
  0.7152 * srgbToLinear(rgb.g) +
  0.0722 * srgbToLinear(rgb.b);

export function resolveChromeSurfaceColor(
  hex: string | undefined | null,
): ChromeSurfaceOverride | null {
  if (!hex) return null;
  const rgb = parseHexRgb(hex);
  if (!rgb) return null;
  const backgroundColor = `#${[rgb.r, rgb.g, rgb.b]
    .map((c) => c.toString(16).padStart(2, "0"))
    .join("")}`;
  // Crossover ≈ 0.179, where black/white text contrast against the surface
  // is equal; below it the bar is "dark" and its subtree inverts.
  const isDark = relativeLuminance(rgb) <= 0.179;
  return {
    style: { backgroundColor },
    className: isDark ? "surface-invert" : "",
  };
}

const SECTION_COLOR_SCHEMES = Object.keys(
  SECTION_BACKGROUND_BY_SCHEME,
) as SectionColorScheme[];
const SECTION_PADDING_Y_VALUES = Object.keys(
  SECTION_PADDING_Y_CLASSES,
) as SectionPaddingY[];
const SECTION_MAX_WIDTH_VALUES = Object.keys(
  SECTION_MAX_WIDTH_CLASSES,
) as SectionMaxWidth[];

const parseOneOf = <T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T => {
  const normalized = value?.trim().toLowerCase() as T | undefined;
  return normalized && allowed.includes(normalized) ? normalized : fallback;
};

export function parseSectionColorScheme(
  value: string | undefined,
  fallback: SectionColorScheme = "default",
): SectionColorScheme {
  return parseOneOf(value, SECTION_COLOR_SCHEMES, fallback);
}

export function parseSectionBackgroundIntensity(
  value: string | undefined,
  fallback: SectionBackgroundIntensity = "subtle",
): SectionBackgroundIntensity {
  return parseOneOf(value, ["subtle", "bold"] as const, fallback);
}

export function parseSectionPaddingY(
  value: string | undefined,
  fallback: SectionPaddingY = "auto",
): SectionPaddingY {
  return parseOneOf(value, SECTION_PADDING_Y_VALUES, fallback);
}

const SECTION_OVERLAP_TOP_VALUES = Object.keys(
  SECTION_OVERLAP_TOP_CLASSES,
) as SectionOverlapTop[];

export function parseSectionOverlapTop(
  value: string | undefined,
  fallback: SectionOverlapTop = "none",
): SectionOverlapTop {
  return parseOneOf(value, SECTION_OVERLAP_TOP_VALUES, fallback);
}

export function parseSectionMaxWidth(
  value: string | undefined,
  fallback: SectionMaxWidth = "auto",
): SectionMaxWidth {
  return parseOneOf(value, SECTION_MAX_WIDTH_VALUES, fallback);
}

/**
 * Flat props the section-surface axes travel as, from a Sitecore
 * adapter into a `*-list-grid` / `*-carousel` rendering and on into
 * `ListingSection`. Component prop interfaces extend this.
 */
export interface SectionSurfaceProps {
  /** `ColorScheme` param — section background scheme. */
  colorScheme?: SectionColorScheme;
  /** `BackgroundIntensity` param — subtle tint vs. bold solid fill. */
  backgroundIntensity?: SectionBackgroundIntensity;
  /** `PaddingY` param — vertical padding token around the section. */
  paddingY?: SectionPaddingY;
  /** `MaxWidth` param — inner content width cap. */
  maxWidth?: SectionMaxWidth;
  /**
   * `OverlapTop` param — float the card row up over the previous
   * section (`half` = the cards-over-hero pattern).
   */
  overlapTop?: SectionOverlapTop;
}

/**
 * Raw rendering-parameter names (`card-list-grid-params@1` /
 * `card-carousel-params@1` base set) as Sitecore delivers them.
 */
export interface SectionSurfaceParams {
  ColorScheme?: string;
  BackgroundIntensity?: string;
  PaddingY?: string;
  MaxWidth?: string;
  OverlapTop?: string;
}

/**
 * Map the shared section-surface rendering params to the flat props
 * `ListingSection` consumes. Spread into every cards-and-lists
 * adapter's return value:
 *
 *   return { ...adaptSectionSurfaceParams(params), title, items, … };
 */
export function adaptSectionSurfaceParams(
  params: SectionSurfaceParams | undefined,
): Required<Pick<SectionSurfaceProps, keyof SectionSurfaceProps>> {
  return {
    colorScheme: parseSectionColorScheme(params?.ColorScheme),
    backgroundIntensity: parseSectionBackgroundIntensity(
      params?.BackgroundIntensity,
    ),
    paddingY: parseSectionPaddingY(params?.PaddingY),
    maxWidth: parseSectionMaxWidth(params?.MaxWidth),
    overlapTop: parseSectionOverlapTop(params?.OverlapTop),
  };
}
