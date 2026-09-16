import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration for the `FiltersPlacement` rendering parameter on search-controls-bar.
 *
 * Reference via `sitecore.enumHandle: "filters-placement@1"`. Lands at
 * `<enumerationsRoot>/Search/FiltersPlacement` per-site.
 */
export const filtersPlacementEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "filters-placement@1",
  name: "FiltersPlacement",
  displayName: "Filters Placement",
  description:
    "Where the filter affordance renders on the controls bar: inline chips row or sidebar toggle.",
  location: { scope: "site", folder: ["Search"] },
  default: "inline",
  values: [
    { name: "inline", displayName: "Inline" },
    { name: "sidebar", displayName: "Sidebar" },
  ],
} satisfies EnumerationRecipe;

export default filtersPlacementEnumRecipe;
