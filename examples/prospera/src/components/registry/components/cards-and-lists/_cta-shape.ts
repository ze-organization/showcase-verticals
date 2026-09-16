/**
 * LEGACY `CtaShape` axis (now fully INERT) plus the (still-authorable)
 * `CtaIconTrailing` toggle for card variants that render a button-style
 * call-to-action.
 *
 * The `CtaShape` rendering parameter and its `cta-shape@1` enum were
 * REMOVED from every authoring surface, and button corner radius is now
 * owned SOLELY by the theme's `--button-radius` token — one radius per
 * brand, no per-instance shape override (per-placement shape fragments a
 * brand's button language). `ctaShapeClassName` therefore returns
 * `undefined` for EVERY value now: a stored `CtaShape` (pill/rounded/
 * square) no longer paints a `--button-radius` override; the CTA renders
 * on the theme radius. The parser + class map stay only so the
 * accepted-but-inert legacy prop keeps its types. Do not bind new recipe
 * params to this axis, and do not re-enable the override.
 *
 * `CtaIconTrailing` appends a trailing right-arrow adornment after the
 * CTA label. It rides the CtaButton's `showArrow` seam, which routes
 * the arrow into the Link primitive's `after` slot rather than passing
 * it as children — the same children-drop-safe path NavList / IconLed
 * use. Passing an adornment as `children` would be swallowed the moment
 * the link carries its own authored text; the `after` slot survives
 * that resolution.
 */

import { isEnabled } from "@/lib/registry/param-parsers";

export const CTA_SHAPES = ["pill", "rounded", "square"] as const;

export type CardCtaShape = (typeof CTA_SHAPES)[number];

/**
 * `--button-radius` (and the icon-button counterpart) override per
 * shape. The tokens win over the button primitive's own
 * `rounded-[var(--button-radius,999px)]` because a matching CSS var is
 * set on an ancestor of the button, so a themed default still applies
 * whenever the author leaves the shape unset.
 */
export const CTA_SHAPE_CLASSES: Record<CardCtaShape, string> = {
  pill: "[--button-radius:9999px] [--button-icon-radius:9999px]",
  rounded:
    "[--button-radius:var(--radius-md)] [--button-icon-radius:var(--radius-md)]",
  square:
    "[--button-radius:var(--radius-sm)] [--button-icon-radius:var(--radius-sm)]",
};

/** Parse-or-undefined: empty / unknown keeps the theme-radius default. */
export function parseCardCtaShape(
  value: string | undefined,
): CardCtaShape | undefined {
  const normalized = value?.trim().toLowerCase() as CardCtaShape | undefined;
  return normalized && CTA_SHAPES.includes(normalized) ? normalized : undefined;
}

/**
 * INERT. Button corner radius is theme-token-only now (`--button-radius`,
 * one radius per brand), so this always returns `undefined` — no
 * per-instance override for any shape value. Kept (rather than deleted at
 * every call site) so the legacy `ctaShape` prop stays accepted while
 * painting nothing. `parseCardCtaShape` / `CTA_SHAPE_CLASSES` are retained
 * only for type-compat and are no longer consulted here.
 */
export function ctaShapeClassName(
  _value: CardCtaShape | string | undefined,
): string | undefined {
  return undefined;
}

/**
 * Parse the `CtaIconTrailing` toggle, preserving `undefined` for the
 * empty / missing case so Sitecore Standard Values keep driving the
 * initial state (per project convention — no React-side default for
 * Sitecore boolean params). A concrete value resolves through
 * `isEnabled`, tolerating the JSS string-booleans (`"1"`, `"true"`).
 */
export function parseCtaIconTrailing(
  value: string | boolean | undefined,
): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "string" && value.trim() === "") return undefined;
  return isEnabled(value);
}
