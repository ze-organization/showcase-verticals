import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration for the `TrendDisplay` rendering parameter on stats-card.
 *
 * Reference via `sitecore.enumHandle: "trend-display@1"`. Lands at
 * `<enumerationsRoot>/Stats/TrendDisplay` per-site.
 */
export const trendDisplayEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "trend-display@1",
  name: "TrendDisplay",
  displayName: "Trend Display",
  description:
    "How the trend delta renders on a stat: badge (pill), text (inline), or none.",
  location: { scope: "site", folder: ["Stats"] },
  default: "badge",
  values: [
    { name: "badge", displayName: "Badge" },
    { name: "text", displayName: "Text" },
    { name: "none", displayName: "None" },
  ],
} satisfies EnumerationRecipe;

export default trendDisplayEnumRecipe;
