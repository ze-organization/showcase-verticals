import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the stats `Emphasis` rendering parameter —
 * which slot dominates a flanked stat: the number or the label. Lands
 * at `<enumerationsRoot>/Stats/Emphasis` per-site.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "stat-emphasis@1"`. Only the FlankedLabel/FlankedLabels variants
 * honor it: `value` (default) renders the big number with the label
 * rotated on the flank (the Diageo / ONEOK stat-band read); `label`
 * inverts the pairing — the label text is the large element and the
 * number rides the flank (the Allstate "emphasis inverted" read).
 */
export const statEmphasisEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "stat-emphasis@1",
  name: "Emphasis",
  displayName: "Stat Emphasis",
  description:
    "Which slot dominates a flanked stat: `value` (big number, rotated label on the flank — default) or `label` (big label text, number on the flank).",
  location: { scope: "site", folder: ["Stats"] },
  values: [
    { name: "value", displayName: "Value (big number)" },
    { name: "label", displayName: "Label (big text)" },
  ],
} satisfies EnumerationRecipe;

export default statEmphasisEnumRecipe;
