import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration for the `Surface` rendering parameter on search-controls-bar.
 *
 * Reference via `sitecore.enumHandle: "search-controls-surface@1"`. Lands at
 * `<enumerationsRoot>/Search/SearchControlsSurface` per-site.
 */
export const searchControlsSurfaceEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "search-controls-surface@1",
  name: "SearchControlsSurface",
  displayName: "Search Controls Surface",
  description:
    "Controls-bar surface treatment: card (default), muted tint, inner inset, or none (bare).",
  location: { scope: "site", folder: ["Search"] },
  default: "card",
  values: [
    { name: "card", displayName: "Card" },
    { name: "muted", displayName: "Muted" },
    { name: "inner", displayName: "Inner" },
    { name: "none", displayName: "None" },
  ],
} satisfies EnumerationRecipe;

export default searchControlsSurfaceEnumRecipe;
