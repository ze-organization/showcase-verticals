import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Business column of the footer. Items is CreateOnly after first apply
 * — patch the live treelist; do not re-push this recipe.
 */
export const footerColumnCompanyRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-column-company@1",
  name: "footer-column-company",
  displayName: "Footer Column — Business",
  description: "Business column of the footer-link-columns stock footer.",
  templateType: "link-list-content@1",
  fields: {
    Title: { shape: "text", value: "Business" },
    Items: {
      shape: "reference",
      refs: [
        "footer-link-business@1",
        "footer-link-treasury@1",
        "footer-link-case-studies@1",
      ],
    },
  },
} satisfies ContentItemRecipe;

export default footerColumnCompanyRecipe;
