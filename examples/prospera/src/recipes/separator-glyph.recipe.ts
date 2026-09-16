import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `SeparatorGlyph` rendering parameter on
 * `link-list@1`'s three horizontal variants — InlineSeparated (the
 * legal-links treatment, built around the glyph), Horizontal and
 * UtilityBar. Lands at `<enumerationsRoot>/Navigation/SeparatorGlyph`
 * per-site with one child item per value.
 *
 * Shared enum (not inline droplist) for the same reason as
 * `column-count@1`: SXA Headless's Pages rendering-parameter dialog
 * reliably surfaces Droplink + folder-of-enum-values only.
 */
export const separatorGlyphEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "separator-glyph@1",
  name: "SeparatorGlyph",
  displayName: "Separator Glyph",
  description:
    "Glyph rendered between entries of an inline link row: `none` (nothing between entries — the horizontal strips' historic look), dot (·), pipe (|), or slash (/).",
  location: { scope: "site", folder: ["Navigation"] },
  default: "none",
  values: [
    // `none` (the default) is what lets the axis reach the horizontal
    // strips: Horizontal and UtilityBar render inline item rows that a
    // glyph can slot between, but they have never drawn one, so a
    // glyph-bearing default would sprinkle separators across every
    // existing placement.
    { name: "none", displayName: "None" },
    { name: "dot", displayName: "Dot (·)" },
    { name: "pipe", displayName: "Pipe (|)" },
    { name: "slash", displayName: "Slash (/)" },
  ],
} satisfies EnumerationRecipe;

export default separatorGlyphEnumRecipe;
