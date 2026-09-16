import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Root datasource of the `footer-link-columns@1` stock footer —
 * conforms to `link-list-content@1`. Its `Items` reference OTHER Link
 * Lists (`footer-column-*@1`), which puts link-list MultiColumn into
 * grouped mode: each referenced list renders as one headed column
 * (its Title as the heading, its Items as the links).
 *
 * Tenants add/remove columns by editing this item's Items Treelist;
 * they edit a column's links on the referenced column item.
 */
export const footerColumnsContentRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-columns-content@1",
  name: "footer-columns",
  displayName: "Footer Link Columns",
  description:
    "Grouped link-list datasource for the footer-link-columns stock footer — one referenced Link List per headed column.",
  templateType: "link-list-content@1",
  fields: {
    Items: {
      shape: "reference",
      refs: [
        "footer-column-product@1",
        "footer-column-company@1",
        "footer-column-resources@1",
      ],
    },
  },
} satisfies ContentItemRecipe;

export default footerColumnsContentRecipe;
