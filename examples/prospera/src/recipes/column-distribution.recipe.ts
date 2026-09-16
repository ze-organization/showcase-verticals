import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `Distribution` rendering parameter on
 * `column-splitter@1`. Pairs with `column-count@1` — the React
 * component's `DISTRIBUTION_WIDTHS` matrix maps each (count,
 * distribution) pair to a twelfths-grid split.
 *
 * Lands at `<enumerationsRoot>/Layout/ColumnDistribution` per-site.
 *
 * Shared enum (not inline `values: [...]` + `type:"droplist"`) for
 * the same reason as `column-count@1` — SXA Headless Pages dialog
 * doesn't reliably render pipe-delimited Droplist Source.
 */
export const columnDistributionEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "column-distribution@1",
  name: "ColumnDistribution",
  displayName: "Column Distribution",
  description:
    "Named width pattern for a Column Splitter. `even` divides evenly (default); `sidebar-*` narrows the start or end column; `primary-*` makes the matching column dominant (start, center, or end). `primary-center` is only meaningful with `ColumnCount=3`; for 2-column splits it falls back to even.",
  location: { scope: "site", folder: ["Layout"] },
  default: "even",
  values: [
    { name: "even", displayName: "Even" },
    { name: "sidebar-start", displayName: "Sidebar Start" },
    { name: "sidebar-end", displayName: "Sidebar End" },
    { name: "primary-start", displayName: "Primary Start" },
    { name: "primary-center", displayName: "Primary Center" },
    { name: "primary-end", displayName: "Primary End" },
  ],
} satisfies EnumerationRecipe;

export default columnDistributionEnumRecipe;
