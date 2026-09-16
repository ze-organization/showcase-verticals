import type { ContentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Content template for one row in a matrix. No rendering — rows exist
 * only as content referenced by `matrix@1` (via its `Rows` Treelist or
 * as Sitecore children of its datasource) and as the Droplink target
 * of every cell item's `Row` field.
 *
 * Rows carry no values themselves — values live on the cells that
 * belong to each column. The row is just the labeled aspect being
 * compared across columns ("Pricing", "Storage limits", "Automation",
 * etc.). Renamed from the previous "criterion" framing; the matrix
 * recipe's `AspectsLabel` field controls how this leftmost column is
 * titled in the rendered table.
 */
export const matrixRowRecipe = {
  kind: "content-template",
  schemaVersion: "1",
  handle: "matrix-row@1",
  name: "matrix-row",
  displayName: "Matrix Row",
  description:
    "One labeled aspect compared across the matrix's columns. Just a label — cell values live under each column.",

  fields: [
    {
      name: "Label",
      shape: "text",
      default: {
        en: "Row label",
        ar: "تسمية الصف",
        es: "Etiqueta de fila",
        fr: "Libellé de ligne",
        de: "Zeilenbeschriftung",
        da: "Rækkeetiket",
        ja: "行ラベル",
        "zh-CN": "行标签",
        "zh-TW": "列標籤",
        it: "Etichetta di riga",
      },
      sitecore: {
        type: "single-line-text",
        required: true,
        hint: "The row's left-column heading (e.g. 'Pricing', 'Storage limits', 'Automation').",
        sortOrder: 100,
      },
    },
  ],
} satisfies ContentTemplateRecipe;

export default matrixRowRecipe;
