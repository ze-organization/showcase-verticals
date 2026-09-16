import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `ColumnCount` rendering parameter on
 * `column-splitter@1`. Lands at `<enumerationsRoot>/Layout/ColumnCount`
 * per-site with one child item per value.
 *
 * Why shared enum (not inline `values: ["2","3"]` + `type:"droplist"`):
 * SXA Headless's Pages rendering-parameter dialog reliably surfaces
 * Droplink + folder-of-enum-values, but pipe-delimited Droplist Source
 * picked up nothing in chrome — the splitter's ColumnCount dropdown
 * rendered empty. Same pattern as `size@1` and the other shared
 * scales; converting to a shared enum unblocks chrome's picker.
 */
export const columnCountEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "column-count@1",
  name: "ColumnCount",
  displayName: "Column Count",
  description:
    "Number of column slots a Column Splitter exposes. Drives both the React component's `count` and the per-distribution width matrix.",
  location: { scope: "site", folder: ["Layout"] },
  default: "2",
  values: [
    // `auto` defers to the consuming variant's own layout — link-list
    // MultiColumn distributes across 3, Horizontal stays a wrap row.
    // Without it the shared numeric default ("3") means "three columns"
    // to every variant that reads the param, so connecting a new one
    // re-lays out every placement already out there.
    { name: "auto", displayName: "Auto" },
    { name: "2", displayName: "Two" },
    { name: "3", displayName: "Three" },
    { name: "4", displayName: "Four" },
    { name: "5", displayName: "Five" },
    { name: "6", displayName: "Six" },
  ],
} satisfies EnumerationRecipe;

export default columnCountEnumRecipe;
