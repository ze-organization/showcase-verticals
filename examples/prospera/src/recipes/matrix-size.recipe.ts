import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `Size` rendering parameter on `matrix@1`.
 * Drives the matrix's overall scale — title size, body text size,
 * minimum table width.
 *
 * Lands at `<enumerationsRoot>/Components/Matrix/MatrixSize` per-site.
 */
export const matrixSizeEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "matrix-size@1",
  name: "MatrixSize",
  displayName: "Matrix Size",
  description:
    "Overall typographic scale of the matrix — `sm` is data-dense, `lg` is presentation-grade.",
  location: { scope: "site", folder: ["Components", "Matrix"] },
  default: "md",
  values: [
    { name: "sm", displayName: "Small" },
    { name: "md", displayName: "Medium" },
    { name: "lg", displayName: "Large" },
  ],
} satisfies EnumerationRecipe;

export default matrixSizeEnumRecipe;
