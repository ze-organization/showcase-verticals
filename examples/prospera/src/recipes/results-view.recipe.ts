import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration for the `DefaultView` rendering parameter on the search-experience wrapper parameters template.
 *
 * Reference via `sitecore.enumHandle: "results-view@1"`. Lands at
 * `<enumerationsRoot>/Search/ResultsView` per-site.
 */
export const resultsViewEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "results-view@1",
  name: "ResultsView",
  displayName: "Results View",
  description: "Initial results view shape: grid or list.",
  location: { scope: "site", folder: ["Search"] },
  default: "grid",
  values: [
    { name: "grid", displayName: "Grid" },
    { name: "list", displayName: "List" },
  ],
} satisfies EnumerationRecipe;

export default resultsViewEnumRecipe;
