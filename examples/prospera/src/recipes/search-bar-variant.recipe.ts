import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration for the `Variant` rendering parameter on search-bar.
 *
 * Reference via `sitecore.enumHandle: "search-bar-variant@1"`. Lands at
 * `<enumerationsRoot>/Search/SearchBarVariant` per-site.
 */
export const searchBarVariantEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "search-bar-variant@1",
  name: "SearchBarVariant",
  displayName: "Search Bar Variant",
  description:
    "Search bar visual treatment: default, medium, large, or input-only (no button row).",
  location: { scope: "site", folder: ["Search"] },
  default: "default",
  values: [
    { name: "default", displayName: "Default" },
    { name: "medium", displayName: "Medium" },
    { name: "large", displayName: "Large" },
    { name: "input-only", displayName: "Input Only" },
  ],
} satisfies EnumerationRecipe;

export default searchBarVariantEnumRecipe;
