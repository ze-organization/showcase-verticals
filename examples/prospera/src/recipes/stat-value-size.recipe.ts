import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration for the `ValueSize` rendering parameter on stats-card.
 *
 * Reference via `sitecore.enumHandle: "stat-value-size@1"`. Lands at
 * `<enumerationsRoot>/Stats/StatValueSize` per-site.
 */
export const statValueSizeEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "stat-value-size@1",
  name: "StatValueSize",
  displayName: "Stat Value Size",
  description: "Type scale for the stat value: default, large, or xlarge.",
  location: { scope: "site", folder: ["Stats"] },
  default: "default",
  values: [
    { name: "default", displayName: "Default" },
    { name: "large", displayName: "Large" },
    { name: "xlarge", displayName: "Extra Large" },
  ],
} satisfies EnumerationRecipe;

export default statValueSizeEnumRecipe;
