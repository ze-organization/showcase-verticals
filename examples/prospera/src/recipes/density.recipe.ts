import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration for `Density` rendering parameters (ranking-table, search-controls-bar).
 *
 * Reference via `sitecore.enumHandle: "density@1"`. Lands at
 * `<enumerationsRoot>/Layout/Density` per-site.
 */
export const densityEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "density@1",
  name: "Density",
  displayName: "Density",
  description:
    "Row/control density: comfortable (default spacing) or compact (tightened paddings).",
  location: { scope: "site", folder: ["Layout"] },
  default: "comfortable",
  values: [
    { name: "comfortable", displayName: "Comfortable" },
    { name: "compact", displayName: "Compact" },
  ],
} satisfies EnumerationRecipe;

export default densityEnumRecipe;
