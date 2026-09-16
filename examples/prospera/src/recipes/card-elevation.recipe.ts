import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `Elevation` rendering parameter on
 * `card-block@1`. The `theme` value defers to the active theme's
 * default elevation; the rest are explicit shadow scales.
 *
 * Distinct from `size@1` — this is a shadow-depth scale, not a
 * component-size scale. The `none` value and the `theme` defer
 * sentinel make a generic size enum a poor fit.
 *
 * Lands at `<enumerationsRoot>/Components/Card/CardElevation` per-site.
 */
export const cardElevationEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "card-elevation@1",
  name: "CardElevation",
  displayName: "Card Elevation",
  description:
    "Shadow depth applied to a card surface. `theme` defers to the active theme's default; `none` disables the shadow entirely.",
  location: { scope: "site", folder: ["Components", "Card"] },
  default: "theme",
  // `theme` (defer to the theme's `--card-shadow`) is the default; the
  // explicit scale is none/xs/sm/md/lg.
  values: [
    { name: "theme", displayName: "Theme Default" },
    { name: "none", displayName: "None" },
    { name: "xs", displayName: "Extra Small" },
    { name: "sm", displayName: "Small" },
    { name: "md", displayName: "Medium" },
    { name: "lg", displayName: "Large" },
  ],
} satisfies EnumerationRecipe;

export default cardElevationEnumRecipe;
