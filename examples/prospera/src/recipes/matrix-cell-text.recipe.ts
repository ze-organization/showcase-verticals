import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Content template for a text cell. Lives as a child of a
 * `matrix-column-text@1` item; one cell per row that the column
 * carries a value for.
 *
 * Each cell Droplinks the row it belongs to, plus the string value
 * shown in the rendered table. No `Display` field — the cell's
 * template IS its type. The column's `insertOptions` enforces that
 * authors can only create `matrix-cell-text@1` items under
 * `matrix-column-text@1` columns, so there's no way to mismatch a
 * boolean cell into a text column.
 */
export const matrixCellTextRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "matrix-cell-text@1",
  name: "matrix-cell-text",
  displayName: "Matrix Cell — Text",
  description:
    "One text cell in a text column. References a row and carries the string shown in that column for that row.",

  fields: [
    {
      name: "Row",
      shape: "reference",
      sitecore: {
        // `reference` + no `multiple` → droplink (single).
        source: { kind: "filter", types: ["matrix-row@1"] },
        required: true,
        hint: "Which row this cell belongs to. Pick a row from the same matrix.",
        sortOrder: 100,
      },
    },
    {
      name: "Value",
      shape: "text",
      default: {
        en: "Yes",
        ar: "نعم",
        es: "Sí",
        fr: "Oui",
        de: "Ja",
        da: "Ja",
        ja: "はい",
        "zh-CN": "是",
        "zh-TW": "是",
        it: "Sì",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "The displayed cell value (e.g., 'Cross-functional', '$2.5M', 'Quarterly'). Numeric values go here as plain strings.",
        sortOrder: 200,
      },
    },
  ],
} satisfies ContentTemplateRecipe;

export default matrixCellTextRecipe;
