import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `RowCount` rendering parameter on
 * `row-splitter@1`. Lands at `<enumerationsRoot>/Layout/RowCount`
 * per-site.
 *
 * A plain count picker rather than a free-text list of slot indices:
 * the React component treats the count as "rows 1..N enabled", so a
 * typo can't silently disable a row.
 */
export const rowCountEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "row-count@1",
  name: "RowCount",
  displayName: "Row Count",
  description:
    "Number of row slots a Row Splitter exposes. The React component enables rows 1..N at runtime.",
  location: { scope: "site", folder: ["Layout"] },
  default: "2",
  values: [
    { name: "1", displayName: "1" },
    { name: "2", displayName: "2" },
    { name: "3", displayName: "3" },
    { name: "4", displayName: "4" },
    { name: "5", displayName: "5" },
    { name: "6", displayName: "6" },
    { name: "7", displayName: "7" },
    { name: "8", displayName: "8" },
  ],
} satisfies EnumerationRecipe;

export default rowCountEnumRecipe;
