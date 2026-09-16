import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration for the `Columns` rendering parameter on versus-list. Narrower than column-count@1 - the component implements 2-4 only.
 *
 * Reference via `sitecore.enumHandle: "versus-list-columns@1"`. Lands at
 * `<enumerationsRoot>/Card/VersusListColumns` per-site.
 */
export const versusListColumnsEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "versus-list-columns@1",
  name: "VersusListColumns",
  displayName: "Versus List Columns",
  description: "Card columns at the lg breakpoint for versus-list: 2, 3, or 4.",
  location: { scope: "site", folder: ["Card"] },
  default: "3",
  values: [
    { name: "2", displayName: "Two" },
    { name: "3", displayName: "Three" },
    { name: "4", displayName: "Four" },
  ],
} satisfies EnumerationRecipe;

export default versusListColumnsEnumRecipe;
