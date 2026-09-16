import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Text-typed column. Each row in this column shows a plain string
 * (numbers go here as plain text too — see `Matrix.renderCellValue`).
 *
 * Cells live as children (`matrix-cell-text@1`). Sitecore's
 * `insertOptions` forces the right cell type so authors can't drop
 * a boolean cell into a text column.
 *
 * Renders alongside `matrix-column-check@1`, `matrix-column-cross@1`,
 * and `matrix-column-dash@1` in the same matrix. The matrix's
 * `Columns` Treelist accepts all four — column type is what drives
 * the per-column rendering.
 */
export const matrixColumnTextRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "matrix-column-text@1",
  name: "matrix-column-text",
  displayName: "Matrix Column — Text",
  description:
    "Column carrying free-text values. Each row in this column shows a string. Cells live as children of this item.",

  fields: [
    {
      name: "Heading",
      shape: "text",
      default: {
        en: "Column",
        ar: "عمود",
        es: "Columna",
        fr: "Colonne",
        de: "Spalte",
        da: "Kolonne",
        ja: "列",
        "zh-CN": "列",
        "zh-TW": "欄",
        it: "Colonna",
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
        hint: "Optional inline badge rendered next to the heading (e.g. 'Popular', 'New').",
        sortOrder: 500,
      },
    },
    {
      // Treelist drives the layout-service projection. Authors typically
      // create cells via `insertOptions` (as children of this column),
      // then pick them into this field. The filter keeps non-text cell
      // types out so a boolean cell can't sneak into a text column.
      name: "Cells",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        source: { kind: "filter", types: ["matrix-cell-text@1"] },
        hint: "Cells in this column, one per row. Create them as children (via Insert) and pick them here.",
        sortOrder: 600,
      },
    },
  ],

  // Child-items pattern paired with the Treelist above: cells live as
  // direct children of this column's datasource. Column owns its cells.
  insertOptions: ["matrix-cell-text@1"],
} satisfies ContentTemplateRecipe;

export default matrixColumnTextRecipe;
