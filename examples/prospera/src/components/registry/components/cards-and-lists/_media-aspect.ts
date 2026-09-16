/**
 * Shared `MediaAspect` axis for image-dominant card variants
 * (article-card / person-card `Overlay`). Mirrors the
 * `media-aspect@1` enumeration — the aspect ratio the absolute-fill
 * media paints inside.
 */

export type CardMediaAspect = "16x9" | "4x5" | "3x4" | "1x1";

export const MEDIA_ASPECT_CLASSES: Record<CardMediaAspect, string> = {
  "16x9": "aspect-video",
  "4x5": "aspect-[4/5]",
  "3x4": "aspect-[3/4]",
  "1x1": "aspect-square",
};

const MEDIA_ASPECT_VALUES = Object.keys(
  MEDIA_ASPECT_CLASSES,
) as CardMediaAspect[];

/**
 * Parse a raw Sitecore enum string (`media-aspect@1`) into the typed
 * aspect, falling back per-variant (portrait families default 3x4,
 * editorial families 4x5, etc.). The enum's `auto` value is not a
 * concrete aspect — it collapses to the fallback, i.e. the variant's
 * own default sizing.
 */
export function parseCardMediaAspect(
  value: string | undefined,
  fallback: CardMediaAspect,
): CardMediaAspect {
  const normalized = value?.trim().toLowerCase() as CardMediaAspect | undefined;
  return normalized && MEDIA_ASPECT_VALUES.includes(normalized)
    ? normalized
    : fallback;
}

/**
 * Parse-or-undefined variant of {@link parseCardMediaAspect}:
 * `auto` / empty / unknown collapse to `undefined` so the card
 * variant's own default sizing (fixed media height, `aspect-video`,
 * etc.) keeps driving when no explicit aspect is picked.
 */
export function parseOptionalCardMediaAspect(
  value: string | undefined,
): CardMediaAspect | undefined {
  const normalized = value?.trim().toLowerCase() as CardMediaAspect | undefined;
  return normalized && MEDIA_ASPECT_VALUES.includes(normalized)
    ? normalized
    : undefined;
}

/**
 * `media-shape@1` — the framing vocabulary lives in leaf
 * `@/lib/registry/media-shape` so non-card consumers (promo) can use
 * it without pulling this card-owned file into their registry
 * dependency graph. Re-exported here so the card side keeps one
 * import site for all media-box axes.
 */
export {
  MEDIA_SHAPE_CLASSES,
  MEDIA_SHAPE_VALUES,
  type MediaShape,
  parseOptionalMediaShape,
} from "@/lib/registry/media-shape";

/**
 * `tile-aspect@1` — the measured-signature vocabulary for tile shape.
 * The orchestrator's grid-signature measurement reports each source
 * grid's `tileAspect` as a width/height ratio; the composer buckets it
 * into this enum (~1.0 → `square`, >1.3 → `landscape`, <0.8 →
 * `portrait`) and binds the grid's TileAspect param. Components map
 * each bucket onto the concrete `media-aspect@1` value below —
 * `auto` keeps the variant default.
 */
export const TILE_ASPECT_TO_MEDIA_ASPECT = {
  auto: undefined,
  square: "1x1",
  landscape: "16x9",
  portrait: "3x4",
} as const satisfies Record<string, CardMediaAspect | undefined>;

export type TileAspect = keyof typeof TILE_ASPECT_TO_MEDIA_ASPECT;

/** All legal `tile-aspect@1` values, for adapter `oneOf` parsing. */
export const TILE_ASPECT_VALUES = Object.keys(
  TILE_ASPECT_TO_MEDIA_ASPECT,
) as readonly TileAspect[];

/**
 * Map a raw Sitecore `TileAspect` param (`tile-aspect@1`) onto the
 * concrete card media aspect. `auto` / empty / unknown → `undefined`
 * (variant default).
 */
export function tileAspectToCardMediaAspect(
  value: string | undefined,
): CardMediaAspect | undefined {
  const normalized = value?.trim().toLowerCase() as TileAspect | undefined;
  if (!normalized || !(normalized in TILE_ASPECT_TO_MEDIA_ASPECT)) {
    return undefined;
  }
  return TILE_ASPECT_TO_MEDIA_ASPECT[normalized];
}
