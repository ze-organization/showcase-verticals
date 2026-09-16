import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Personal column of the footer. Items is CreateOnly after first apply
 * — patch the live treelist; do not re-push this recipe.
 */
export const footerColumnProductRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-column-product@1",
  name: "footer-column-product",
  displayName: "Footer Column — Personal",
  description: "Personal column of the footer-link-columns stock footer.",
  templateType: "link-list-content@1",
  fields: {
    Title: { shape: "text", value: "Personal" },
    Items: {
      shape: "reference",
      refs: [
        "footer-link-personal@1",
        "footer-link-checking@1",
        "footer-link-cards@1",
        "footer-link-lending@1",
      ],
    },
  },
} satisfies ContentItemRecipe;

export default footerColumnProductRecipe;
