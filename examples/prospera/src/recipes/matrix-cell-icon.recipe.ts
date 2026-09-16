import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Per-cell record for an icon column. Carries a Droplink back to its
 * owning row plus a discrete IconType ("check" | "cross" | "dash" |
 * "none") that drives what's rendered in the matrix cell.
 *
 * Replaces the old `matrix-cell-bool@1` (which encoded check/cross
 * implicitly via the parent column's template). The icon column +
 * icon cell pair lets a single column show different icons per row,
 * which the old per-column-kind model couldn't express.
 */
export const matrixCellIconRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "matrix-cell-icon@1",
  name: "matrix-cell-icon",
  displayName: "Matrix Cell — Icon",
  description:
    "One cell in an icon column. Carries a Row droplink and the icon (check / cross / dash / none) to render.",

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
      name: "IconType",
      shape: "enum",
      values: ["check", "cross", "dash", "none"],
      default: "check",
      sitecore: {
        type: "droplist",
        required: true,
        hint: "Which icon to render in this cell.",
        sortOrder: 200,
      },
    },
  ],
} satisfies ContentTemplateRecipe;

export default matrixCellIconRecipe;
