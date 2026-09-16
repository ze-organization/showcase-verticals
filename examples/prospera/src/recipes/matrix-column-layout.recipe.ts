import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `ColumnLayout` rendering parameter on
 * `matrix@1`. Controls how the matrix allocates column widths.
 *
 * Lands at `<enumerationsRoot>/Components/Matrix/MatrixColumnLayout`
 * per-site.
 */
export const matrixColumnLayoutEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "matrix-column-layout@1",
  name: "MatrixColumnLayout",
  displayName: "Matrix Column Layout",
  description:
    "How a matrix's column widths are allocated. `even` splits evenly; `expand-one` makes one column twice as wide (pick which one with ExpandedColumn).",
  location: { scope: "site", folder: ["Components", "Matrix"] },
  default: "even",
  values: [
    { name: "even", displayName: "Even" },
    { name: "expand-one", displayName: "Expand One" },
  ],
} satisfies EnumerationRecipe;

export default matrixColumnLayoutEnumRecipe;
