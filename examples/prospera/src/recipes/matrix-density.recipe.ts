import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `Density` rendering parameter on `matrix@1`.
 * Controls vertical padding on cells + the heading band.
 *
 * Lands at `<enumerationsRoot>/Components/Matrix/MatrixDensity` per-site.
 */
export const matrixDensityEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "matrix-density@1",
  name: "MatrixDensity",
  displayName: "Matrix Density",
  description:
    "Cell padding density. `compact` packs rows tightly, `spacious` opens them up for easier scanning.",
  location: { scope: "site", folder: ["Components", "Matrix"] },
  default: "default",
  values: [
    { name: "compact", displayName: "Compact" },
    { name: "default", displayName: "Default" },
    { name: "comfortable", displayName: "Comfortable" },
    { name: "spacious", displayName: "Spacious" },
  ],
} satisfies EnumerationRecipe;

export default matrixDensityEnumRecipe;
