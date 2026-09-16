import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration for the `HighlightTopTone` / `HighlightBottomTone` rendering parameters on ranking-table.
 *
 * Reference via `sitecore.enumHandle: "highlight-tone@1"`. Lands at
 * `<enumerationsRoot>/Card/HighlightTone` per-site.
 */
export const highlightToneEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "highlight-tone@1",
  name: "HighlightTone",
  displayName: "Highlight Tone",
  description:
    "Semantic tint for highlighted table zones: none, primary, success, info, warning, or destructive.",
  location: { scope: "site", folder: ["Card"] },
  default: "none",
  values: [
    { name: "none", displayName: "None" },
    { name: "primary", displayName: "Primary" },
    { name: "success", displayName: "Success" },
    { name: "info", displayName: "Info" },
    { name: "warning", displayName: "Warning" },
    { name: "destructive", displayName: "Destructive" },
  ],
} satisfies EnumerationRecipe;

export default highlightToneEnumRecipe;
