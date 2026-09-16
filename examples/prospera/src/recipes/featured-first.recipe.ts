import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the list-grids' `FeaturedFirst` rendering
 * parameter — the editorial "lead tile" treatment where the first tile
 * spans two grid tracks. Lands at
 * `<enumerationsRoot>/Layout/FeaturedFirst` per-site.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "featured-first@1"`. Components map each value to literal
 * first-child span classes — see `FEATURED_FIRST_CLASSES` in
 * `cards-and-lists/_grid-classname.ts`.
 *
 * Bind from the measured grid signature: pick `wide` when the source's
 * first tile spans two columns (a lead story twice the width of its
 * siblings), `tall` when it spans two rows (a lead tile the full
 * height of a 2-row rail). `none` (default) keeps the uniform grid.
 */
export const featuredFirstEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "featured-first@1",
  name: "FeaturedFirst",
  displayName: "Featured First",
  description:
    "Lead-tile treatment for card grids. `none` (default) keeps a uniform grid; `wide` spans the first tile across two columns (lead-story pattern); `tall` spans it across two rows. Bind `wide` when the measured source grid shows its first tile spanning two columns.",
  location: { scope: "site", folder: ["Layout"] },
  default: "none",
  values: [
    { name: "none", displayName: "None (uniform grid)" },
    { name: "wide", displayName: "Wide (first tile spans 2 columns)" },
    { name: "tall", displayName: "Tall (first tile spans 2 rows)" },
  ],
} satisfies EnumerationRecipe;

export default featuredFirstEnumRecipe;
