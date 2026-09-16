/**
 * `media-shape@1` — how a media box is framed, orthogonal to aspect.
 * `circle` is the circle-framed-image treatment (resmed split promos,
 * fifa story thumbnails, headshot cards): it carries its own
 * `aspect-square` + clip so it composes onto any media wrapper —
 * placed AFTER the aspect class in `cn()`, the square wins via
 * tailwind-merge. `rounded` opts a bare media box into the theme's
 * card radius. `default` (empty) keeps the variant's own chrome.
 * Literal strings only — Tailwind's scanner must see every class.
 *
 * Lives in leaf `lib/` (not `cards-and-lists/_media-aspect.ts`, which
 * the article-card registry item owns) so non-card consumers — promo,
 * heros — can depend on it without pulling a card item into their
 * install payload. The card side re-exports it from `_media-aspect.ts`.
 */

export const MEDIA_SHAPE_CLASSES = {
  default: "",
  rounded: "overflow-hidden rounded-(--card-radius,var(--radius-xl))",
  circle: "aspect-square overflow-hidden rounded-full",
} as const;

export type MediaShape = keyof typeof MEDIA_SHAPE_CLASSES;

/** All legal `media-shape@1` values, for adapter `oneOf` parsing. */
export const MEDIA_SHAPE_VALUES = Object.keys(
  MEDIA_SHAPE_CLASSES,
) as readonly MediaShape[];

/**
 * Parse-or-undefined for the `MediaShape` param: `default` / empty /
 * unknown collapse to `undefined` so the variant's own media chrome
 * keeps driving unless an explicit shape is picked.
 */
export function parseOptionalMediaShape(
  value: string | undefined,
): MediaShape | undefined {
  const normalized = value?.trim().toLowerCase() as MediaShape | undefined;
  return normalized &&
    normalized !== "default" &&
    normalized in MEDIA_SHAPE_CLASSES
    ? normalized
    : undefined;
}
