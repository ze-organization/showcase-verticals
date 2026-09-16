/**
 * Shared surface-tone tailwind class map used by `heros-and-promos`
 * shells (hero, promo, tagline-banner, article-header). Each tone pairs
 * a background utility with the matching `*-foreground` so prose stays
 * legible without per-section CSS variables.
 *
 * `none` defaults to the page's neutral surface so an unset tone still
 * renders a complete background — sections that intentionally inherit
 * their parent's surface (e.g. article-header overlays) should opt out
 * via `{ overrides: { none: "" } }`.
 */
export type SurfaceTone =
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

// Every tone here is a SOLID fill (the "bold" treatment in the
// section-surface vocabulary), so the dark/solid ones also carry the
// `surface-invert` token remap (defined once in globals.css) with the
// scheme's own on-color — interiors (muted text, bg-card slabs,
// borders) re-tone against the band without per-component changes.
// `none` / `white` keep the page's own tokens; `neutral` is the subtle
// bg-muted tint and stays un-inverted.
export const SURFACE_TONE_CLASS: Record<SurfaceTone, string> = {
  // `default` = INHERIT the parent surface — emit nothing. Distinct from
  // `none`, which is an explicit "paint the page surface" pick. This is
  // the contract the shared `color-scheme@1` enum documents for the two
  // values, and section shells default their axis to `default`.
  default: "",
  none: "bg-background text-foreground",
  white: "bg-theme-white text-theme-black",
  black:
    "bg-theme-black text-theme-white surface-invert [--surface-invert-on:var(--color-theme-white)]",
  neutral: "bg-muted text-muted-foreground",
  primary:
    "bg-primary text-primary-foreground surface-invert [--surface-invert-on:var(--color-primary-foreground)]",
  "primary-gradient":
    "bg-gradient-to-br from-primary to-secondary text-primary-foreground surface-invert [--surface-invert-on:var(--color-primary-foreground)]",
  secondary:
    "bg-secondary text-secondary-foreground surface-invert [--surface-invert-on:var(--color-secondary-foreground)]",
  "secondary-gradient":
    "bg-gradient-to-br from-secondary to-accent text-secondary-foreground surface-invert [--surface-invert-on:var(--color-secondary-foreground)]",
  tertiary:
    "bg-tertiary text-tertiary-foreground surface-invert [--surface-invert-on:var(--color-tertiary-foreground)]",
  // Neighbouring-role gradient pairings. Same role sequence card-block's
  // local map already uses, so a scheme reads the same whether it lands
  // on a card strip or a full section band; the direction follows this
  // map's own `to-br` convention rather than card-block's `to-r`, since
  // these paint a whole band instead of a thin strip.
  "tertiary-gradient":
    "bg-gradient-to-br from-tertiary to-primary text-tertiary-foreground surface-invert [--surface-invert-on:var(--color-tertiary-foreground)]",
  accent:
    "bg-accent text-accent-foreground surface-invert [--surface-invert-on:var(--color-accent-foreground)]",
  "accent-gradient":
    "bg-gradient-to-br from-accent to-accent-2 text-accent-foreground surface-invert [--surface-invert-on:var(--color-accent-foreground)]",
  "accent-2":
    "bg-accent-2 text-accent-2-foreground surface-invert [--surface-invert-on:var(--color-accent-2-foreground)]",
  "accent-2-gradient":
    "bg-gradient-to-br from-accent-2 to-accent-3 text-accent-2-foreground surface-invert [--surface-invert-on:var(--color-accent-2-foreground)]",
  "accent-3":
    "bg-accent-3 text-accent-3-foreground surface-invert [--surface-invert-on:var(--color-accent-3-foreground)]",
  "accent-3-gradient":
    "bg-gradient-to-br from-accent-3 to-tertiary text-accent-3-foreground surface-invert [--surface-invert-on:var(--color-accent-3-foreground)]",
  info: "bg-info text-info-foreground surface-invert [--surface-invert-on:var(--color-info-foreground)]",
  success:
    "bg-success text-success-foreground surface-invert [--surface-invert-on:var(--color-success-foreground)]",
  warning:
    "bg-warning text-warning-foreground surface-invert [--surface-invert-on:var(--color-warning-foreground)]",
  destructive:
    "bg-destructive text-destructive-foreground surface-invert [--surface-invert-on:var(--color-destructive-foreground)]",
};

/**
 * Resolve the tailwind classes for a surface tone, with optional
 * per-key overrides for sections that need to diverge from the default
 * map. Returns the `none` mapping when `tone` is `undefined`.
 *
 * @example
 *   surfaceToneClass(props.surfaceTone)
 *
 * @example // article-header opts out of the default `none` background
 *   surfaceToneClass(tone, { none: "" })
 */
export function surfaceToneClass(
  tone: SurfaceTone | undefined,
  overrides?: Partial<Record<SurfaceTone, string>>,
): string {
  const map = overrides
    ? { ...SURFACE_TONE_CLASS, ...overrides }
    : SURFACE_TONE_CLASS;
  return tone ? map[tone] : map.none;
}

/**
 * Guard for runtime-derived tone strings (e.g. parsed from a Sitecore
 * single-line text param). Useful for adapters that need to fall back
 * to a default when the author types an invalid value.
 */
export function isSurfaceTone(value: string): value is SurfaceTone {
  return value in SURFACE_TONE_CLASS;
}

// Role-TEXT classes for a `color-scheme@1` pick — the "role text on
// page" composition (`text-<role>`, never `text-<role>-foreground`;
// see the color-roles skill). Gradients fall back to their base solid
// (no gradient text token exists), `default` / `none` inherit, and
// `neutral` pins the page foreground. Same convention as
// section-heading's ACCENT_LINE_COLOR_CLASSES.
const SCHEME_TEXT_CLASS: Record<SurfaceTone, string> = {
  default: "",
  none: "",
  white: "text-theme-white",
  black: "text-theme-black",
  neutral: "text-foreground",
  primary: "text-primary",
  "primary-gradient": "text-primary",
  "tertiary-gradient": "text-tertiary",
  "accent-gradient": "text-accent",
  "accent-2-gradient": "text-accent-2",
  "accent-3-gradient": "text-accent-3",
  secondary: "text-secondary",
  "secondary-gradient": "text-secondary",
  tertiary: "text-tertiary",
  accent: "text-accent",
  "accent-2": "text-accent-2",
  "accent-3": "text-accent-3",
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

/**
 * Descendant-anchor form of {@link SCHEME_TEXT_CLASS} — recolors every
 * `<a>` inside the element rather than the element itself.
 *
 * Why this exists: a link list's variants each bake their own link
 * colour into the anchor (`text-muted-foreground` on a Horizontal row,
 * the quiet UtilityBar tone, …). A plain `text-<role>` on the wrapper
 * loses to those, because the anchor's own class wins over an inherited
 * colour. `[&_a]:text-<role>` compiles to `.wrapper a { … }`, which
 * out-specifies the anchor's single class, so one insertion at the
 * variant root recolors all of its links without touching 17 render
 * sites individually.
 *
 * Written out as full literal strings — Tailwind's JIT only picks up
 * complete class names, so a runtime `"[&_a]:" + cls` produces no CSS.
 * Same rule as the `[&_p]:text-center` alignment tables in
 * `content-block`.
 */
const SCHEME_ANCHOR_TEXT_CLASS: Record<SurfaceTone, string> = {
  default: "",
  none: "",
  white: "[&_a]:text-theme-white",
  black: "[&_a]:text-theme-black",
  neutral: "[&_a]:text-foreground",
  primary: "[&_a]:text-primary",
  "primary-gradient": "[&_a]:text-primary",
  secondary: "[&_a]:text-secondary",
  "secondary-gradient": "[&_a]:text-secondary",
  tertiary: "[&_a]:text-tertiary",
  // Gradients fall back to their START role — no gradient text token
  // exists, same rule SCHEME_TEXT_CLASS follows.
  "tertiary-gradient": "[&_a]:text-tertiary",
  accent: "[&_a]:text-accent",
  "accent-gradient": "[&_a]:text-accent",
  "accent-2": "[&_a]:text-accent-2",
  "accent-2-gradient": "[&_a]:text-accent-2",
  "accent-3": "[&_a]:text-accent-3",
  "accent-3-gradient": "[&_a]:text-accent-3",
  info: "[&_a]:text-info",
  success: "[&_a]:text-success",
  warning: "[&_a]:text-warning",
  destructive: "[&_a]:text-destructive",
};

/**
 * Resolve a raw `color-scheme@1` param to a class that recolors every
 * descendant anchor. Empty/unknown collapse to `fallback` (default =
 * no class, so the variant keeps its own link colours).
 */
export function colorSchemeAnchorTextClass(
  value: string | undefined,
  fallback: SurfaceTone = "default",
): string {
  const normalized = value?.trim().toLowerCase();
  return normalized && normalized in SCHEME_ANCHOR_TEXT_CLASS
    ? SCHEME_ANCHOR_TEXT_CLASS[normalized as SurfaceTone]
    : SCHEME_ANCHOR_TEXT_CLASS[fallback];
}

/**
 * Resolve a raw `color-scheme@1` param string to its role-text class
 * (`text-<role>`). Empty/unknown values collapse to `fallback`. Use for
 * params that tint TEXT with a scheme pick (e.g. tagline-banner's
 * `AccentColor`) rather than painting a surface.
 */
export function colorSchemeTextClass(
  value: string | undefined,
  fallback: SurfaceTone = "default",
): string {
  const normalized = value?.trim().toLowerCase();
  return normalized && normalized in SCHEME_TEXT_CLASS
    ? SCHEME_TEXT_CLASS[normalized as SurfaceTone]
    : SCHEME_TEXT_CLASS[fallback];
}

/**
 * The subset of `SurfaceTone` the Button primitive actually paints —
 * everything except `default`.
 *
 * The four neighbouring-role gradients used to be excluded too and were
 * collapsed to their start role on the way in. The Button CVA now
 * carries real compound variants for all six gradients across its four
 * variants (default/outline/ghost/link), so they paint as themselves
 * and no longer need narrowing.
 *
 * `default` stays out on purpose: it means "inherit — no opinion", which
 * is an ABSENT colorScheme rather than a paintable one. {@link
 * buttonColorScheme} maps it to `undefined` so the call site's own
 * default wins, which is the behaviour the enum documents.
 */
export type ButtonColorScheme = Exclude<SurfaceTone, "default">;

const BUTTON_SCHEME_FALLBACK: Record<
  Exclude<SurfaceTone, ButtonColorScheme>,
  ButtonColorScheme | undefined
> = {
  // `default` means "inherit" — hand back nothing so the call site's own
  // default colorScheme applies rather than forcing a role.
  default: undefined,
};

/**
 * Narrow a section `SurfaceTone` to something the Button primitive can
 * paint. Pass the result to any `colorScheme` prop that bottoms out in
 * the Button CVA (CtaGroup, CtaButton, card actions); `undefined` means
 * "no opinion — keep the caller's default".
 */
export function buttonColorScheme(
  tone: SurfaceTone | undefined,
): ButtonColorScheme | undefined {
  if (tone === undefined) return undefined;
  return tone in BUTTON_SCHEME_FALLBACK
    ? BUTTON_SCHEME_FALLBACK[tone as Exclude<SurfaceTone, ButtonColorScheme>]
    : (tone as ButtonColorScheme);
}
