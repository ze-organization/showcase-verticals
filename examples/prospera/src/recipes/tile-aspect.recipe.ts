import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the grids' `TileAspect` rendering
 * parameter — the measured-signature vocabulary for tile shape. Lands
 * at `<enumerationsRoot>/Layout/TileAspect` per-site.
 *
 * The page-composition pipeline MEASURES each source grid's tile
 * aspect (median tile width / height) as part of the grid signature;
 * this enum is the binding target for that measurement:
 *
 *   - `tileAspect` ~1.0 (0.8–1.3)  → `square`
 *   - `tileAspect` > 1.3           → `landscape`
 *   - `tileAspect` < 0.8           → `portrait`
 *   - no measurement / mixed tiles → `auto` (variant default)
 *
 * Components map each bucket onto the concrete `media-aspect@1`
 * value applied to the tile's MEDIA box (square → 1x1, landscape →
 * 16x9, portrait → 3x4); text-only tiles are unaffected. An explicit
 * `MediaAspect` param wins over `TileAspect` when both are set — see
 * `adaptCardChromeParams` in `cards-and-lists/_card-chrome-adapter.ts`.
 */
export const tileAspectEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "tile-aspect@1",
  name: "TileAspect",
  displayName: "Tile Aspect",
  description:
    "Measured tile shape for card grids — media boxes get the aspect, text tiles are unaffected. Bind from the measured grid signature's tileAspect: ~1.0 → square, >1.3 → landscape, <0.8 → portrait; `auto` keeps each card variant's default sizing.",
  location: { scope: "site", folder: ["Layout"] },
  default: "auto",
  values: [
    { name: "auto", displayName: "Auto (variant default)" },
    { name: "square", displayName: "Square (~1:1 tiles)" },
    { name: "landscape", displayName: "Landscape (wide tiles)" },
    { name: "portrait", displayName: "Portrait (tall tiles)" },
  ],
} satisfies EnumerationRecipe;

export default tileAspectEnumRecipe;
