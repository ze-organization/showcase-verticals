import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration for the `Columns` rendering parameter on logo-wall. Narrower than column-count@1 - the component implements 3-6 only.
 *
 * Reference via `sitecore.enumHandle: "logo-wall-columns@1"`. Lands at
 * `<enumerationsRoot>/Card/LogoWallColumns` per-site.
 */
export const logoWallColumnsEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "logo-wall-columns@1",
  name: "LogoWallColumns",
  displayName: "Logo Wall Columns",
  description: "Logo columns at the lg breakpoint for logo-wall: 3-6.",
  location: { scope: "site", folder: ["Card"] },
  default: "5",
  values: [
    { name: "3", displayName: "Three" },
    { name: "4", displayName: "Four" },
    { name: "5", displayName: "Five" },
    { name: "6", displayName: "Six" },
  ],
} satisfies EnumerationRecipe;

export default logoWallColumnsEnumRecipe;
