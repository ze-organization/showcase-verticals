import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the list-grids' `GridPattern` rendering
 * parameter — the overall tile rhythm of the grid. Lands at
 * `<enumerationsRoot>/Layout/GridPattern` per-site.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "grid-pattern@1"`. Components map each value to literal nth-child
 * span classes — see `GRID_PATTERN_CLASSES` in
 * `cards-and-lists/_grid-classname.ts`.
 *
 * `bento` is the asymmetric content-card mosaic (repeating 2×2 hero +
 * wide tile + 1×1 fillers, dense-packed): the emirates cabin-class /
 * yas-island attractions / whitecube exhibition-tiles "one large tile
 * among smalls" look. It supersedes `featured-first@1` (the mosaic
 * already defines the lead tile). Bind `bento` when the measured
 * source grid shows a repeating mix of large and small tiles rather
 * than a single promoted lead; reads best at 3–4 columns.
 */
export const gridPatternEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "grid-pattern@1",
  name: "GridPattern",
  displayName: "Grid Pattern",
  description:
    "Tile rhythm for card grids. `uniform` (default) keeps every tile 1×1; `bento` renders a repeating asymmetric mosaic — a 2×2 hero tile and a double-width tile among 1×1 fillers, dense-packed. Bind `bento` when the source grid mixes large and small content tiles; it supersedes FeaturedFirst.",
  location: { scope: "site", folder: ["Layout"] },
  default: "uniform",
  values: [
    { name: "uniform", displayName: "Uniform (every tile 1×1)" },
    { name: "bento", displayName: "Bento (repeating hero + fillers mosaic)" },
  ],
} satisfies EnumerationRecipe;

export default gridPatternEnumRecipe;
