/**
 * `media-fit@1` — how the image fills its media box, orthogonal to both
 * aspect (`media-aspect@1`) and framing (`media-shape@1`).
 *
 * Every generic card/tile media slot in this registry hardcodes
 * `object-cover`: the image is scaled up until it fills the box and the
 * overflow is cropped away. That is right for photography and wrong for
 * anything whose EDGES CARRY MEANING — a brand mark, a logo, a product
 * cut-out, a UI screenshot, a certification seal. In the 2026-08-04
 * benchmark, sitecore's Gartner/Forrester analyst row rendered as huge
 * zoomed, cropped text ("rtn", "RES") filling a grey tile, because a
 * wordmark had been dropped into a cover-fit slot and there was no way
 * to say "show this whole."
 *
 * `contain` fits the image inside the box with its own aspect preserved,
 * leaving empty space around it. `cover` is the existing behaviour and
 * stays the default, so an unset param renders exactly as before.
 *
 * Lives in leaf `lib/` (not `cards-and-lists/_media-aspect.ts`, which the
 * article-card registry item owns) so non-card consumers — promo, heros,
 * media bands — can depend on it without pulling a card item into their
 * install payload, exactly like `media-shape@1`. Literal strings only —
 * Tailwind's scanner must see every class.
 */

export const MEDIA_FIT_CLASSES = {
  cover: "object-cover",
  contain: "object-contain",
} as const;

export type MediaFit = keyof typeof MEDIA_FIT_CLASSES;

/** All legal `media-fit@1` values, for adapter `oneOf` parsing. */
export const MEDIA_FIT_VALUES = Object.keys(
  MEDIA_FIT_CLASSES,
) as readonly MediaFit[];

/**
 * Parse the `MediaFit` param, defaulting to `cover`.
 *
 * Deliberately NOT parse-or-undefined like `parseOptionalMediaShape`:
 * every call site this replaces had a literal `object-cover`, so the
 * fallback has to reproduce it byte-for-byte or unset params would
 * silently change how existing pages render.
 */
export function parseMediaFit(value: string | undefined): MediaFit {
  const normalized = value?.trim().toLowerCase() as MediaFit | undefined;
  return normalized && normalized in MEDIA_FIT_CLASSES ? normalized : "cover";
}

/**
 * The object-fit class for a media box.
 *
 * `contain` also drops any background tint the slot would paint behind a
 * cropped photo: a contained logo shows the box's own surface around it,
 * and a grey plate behind a transparent PNG is the second half of the
 * "logo in a tile" defect.
 */
export function mediaFitClass(value: string | undefined): string {
  return MEDIA_FIT_CLASSES[parseMediaFit(value)];
}
