import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Icon-typed column. Each row renders one of four icons selected
 * per-cell: check (✓), cross (✗), dash (—), or none (empty).
 *
 * Replaces the older `matrix-column-check@1` / `matrix-column-cross@1`
 * / `matrix-column-dash@1` family. Authors now pick ONE column type
 * ("Icon") and choose the icon for each cell individually via the
 * cell's `IconType` field. Fewer column templates to install + author,
 * and a single column can mix icon shapes across rows.
 *
 * Cells live as `matrix-cell-icon@1` children. The cell carries:
 *   - `Row` (Droplink back to the row)
 *   - `IconType` (enum: check / cross / dash / none)
 */
export const matrixColumnIconRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "matrix-column-icon@1",
  name: "matrix-column-icon",
  displayName: "Matrix Column — Icon",
  description:
    "Column whose cells render check / cross / dash / none icons. Each cell carries its own icon choice.",

  fields: [
    {
      name: "Heading",
      shape: "text",
      default: {
        en: "Included",
        ar: "مشمول",
        es: "Incluido",
        fr: "Inclus",
        de: "Enthalten",
        da: "Inkluderet",
        ja: "含まれる",
        "zh-CN": "包含",
        "zh-TW": "包含",
        it: "Incluso",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "Column heading shown at the top of the column.",
        sortOrder: 100,
      },
    },
    {
      name: "Subtitle",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Short supporting line shown directly under the column heading.",
        sortOrder: 300,
      },
    },
    {
      name: "Description",
      shape: "text",
      sitecore: {
        type: "multi-line-text",
        hint: "Longer supporting copy. Only rendered when Subtitle is empty.",
        sortOrder: 400,
      },
    },
    {
      name: "Badge",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional inline badge rendered next to the heading (e.g. 'New').",
        sortOrder: 500,
      },
    },
    {
      name: "Cells",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        source: { kind: "filter", types: ["matrix-cell-icon@1"] },
        hint: "Cells in this column, one per row. Create them as children and pick them here.",
        sortOrder: 600,
      },
    },
  ],

  // Child-items pattern: cells live as direct children of this
  // column's datasource.
  insertOptions: ["matrix-cell-icon@1"],
} satisfies ContentTemplateRecipe;

export default matrixColumnIconRecipe;
