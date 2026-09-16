import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration for the `Columns` rendering parameter on quick-links-tiles. Deliberately narrower than column-count@1 - the component only implements 3/4 and its adapter clamps everything else.
 *
 * Reference via `sitecore.enumHandle: "quick-links-columns@1"`. Lands at
 * `<enumerationsRoot>/Navigation/QuickLinksColumns` per-site.
 */
export const quickLinksColumnsEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "quick-links-columns@1",
  name: "QuickLinksColumns",
  displayName: "Quick Links Columns",
  description:
    "Tile columns at the lg breakpoint for quick-links-tiles: 3 or 4.",
  location: { scope: "site", folder: ["Navigation"] },
  default: "4",
  values: [
    { name: "3", displayName: "Three" },
    { name: "4", displayName: "Four" },
  ],
} satisfies EnumerationRecipe;

export default quickLinksColumnsEnumRecipe;
