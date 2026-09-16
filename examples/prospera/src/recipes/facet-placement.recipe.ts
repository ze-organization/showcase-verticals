import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration for the `FacetPlacement` rendering parameter on the search-experience wrapper parameters template.
 *
 * Reference via `sitecore.enumHandle: "facet-placement@1"`. Lands at
 * `<enumerationsRoot>/Search/FacetPlacement` per-site.
 */
export const facetPlacementEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "facet-placement@1",
  name: "FacetPlacement",
  displayName: "Facet Placement",
  description:
    "Default facet panel placement in a search experience: sidebar, horizontal, drawer, or none.",
  location: { scope: "site", folder: ["Search"] },
  default: "sidebar",
  values: [
    { name: "sidebar", displayName: "Sidebar" },
    { name: "horizontal", displayName: "Horizontal" },
    { name: "drawer", displayName: "Drawer" },
    { name: "none", displayName: "None" },
  ],
} satisfies EnumerationRecipe;

export default facetPlacementEnumRecipe;
