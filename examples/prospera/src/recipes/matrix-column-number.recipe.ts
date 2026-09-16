import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Number-typed column. Each row renders a numeric value.
 *
 * Authors choose this when the matrix is comparing quantities — counts,
 * prices, percentages, capacities — rather than free-text or icon
 * marks. The React component formats per-locale (toLocaleString) and
 * the editor offers a numeric input so non-number characters can't
 * sneak in.
 *
 * Cells live as `matrix-cell-number@1` children.
 */
export const matrixColumnNumberRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "matrix-column-number@1",
  name: "matrix-column-number",
  displayName: "Matrix Column — Number",
  description:
    "Column carrying numeric values. Each row in this column shows a number, locale-formatted at render time.",

  fields: [
    {
      name: "Heading",
      shape: "text",
      default: {
        en: "Value",
        ar: "القيمة",
        es: "Valor",
        fr: "Valeur",
        de: "Wert",
        da: "Værdi",
        ja: "値",
        "zh-CN": "数值",
        "zh-TW": "數值",
        it: "Valore",
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
        hint: "Optional inline badge rendered next to the heading.",
        sortOrder: 500,
      },
    },
    {
      name: "Cells",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        source: { kind: "filter", types: ["matrix-cell-number@1"] },
        hint: "Cells in this column, one per row.",
        sortOrder: 600,
      },
    },
  ],

  insertOptions: ["matrix-cell-number@1"],
} satisfies ContentTemplateRecipe;

export default matrixColumnNumberRecipe;
