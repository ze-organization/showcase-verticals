import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration for the `Tone` rendering parameter on stats-card.
 *
 * Reference via `sitecore.enumHandle: "stat-tone@1"`. Lands at
 * `<enumerationsRoot>/Stats/StatTone` per-site.
 */
export const statToneEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "stat-tone@1",
  name: "StatTone",
  displayName: "Stat Tone",
  description:
    "Value tint on a stat: default (foreground), neutral, primary, success, or warning.",
  location: { scope: "site", folder: ["Stats"] },
  default: "default",
  values: [
    { name: "default", displayName: "Default" },
    { name: "neutral", displayName: "Neutral" },
    { name: "primary", displayName: "Primary" },
    { name: "success", displayName: "Success" },
    { name: "warning", displayName: "Warning" },
  ],
} satisfies EnumerationRecipe;

export default statToneEnumRecipe;
