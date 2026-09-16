import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Per-cell record for a number column. Carries a Droplink back to its
 * owning row plus a single numeric Value.
 *
 * The value is stored as a Sitecore Number field; the React component
 * is responsible for locale formatting (toLocaleString). Stored as the
 * raw number so transformations (sum, average, sort) can run server-
 * side without re-parsing.
 */
export const matrixCellNumberRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "matrix-cell-number@1",
  name: "matrix-cell-number",
  displayName: "Matrix Cell — Number",
  description:
    "One cell in a number column. Carries a Row droplink and the numeric Value to render.",

  fields: [
    {
      name: "Row",
      shape: "reference",
      sitecore: {
        type: "droplink",
        source: { kind: "filter", types: ["matrix-row@1"] },
        required: true,
        hint: "The row this cell belongs to.",
        sortOrder: 100,
      },
    },
    {
      name: "Value",
      shape: "number",
      sitecore: {
        type: "number",
        hint: "The numeric value rendered in this cell.",
        sortOrder: 200,
      },
    },
  ],
} satisfies ContentTemplateRecipe;

export default matrixCellNumberRecipe;
