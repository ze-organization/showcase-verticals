import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Help & About column of the footer. Items is CreateOnly after first
 * apply — patch the live treelist; do not re-push this recipe.
 */
export const footerColumnResourcesRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-column-resources@1",
  name: "footer-column-resources",
  displayName: "Footer Column — Help & About",
  description: "Help & About column of the footer-link-columns stock footer.",
  templateType: "link-list-content@1",
  fields: {
    Title: { shape: "text", value: "Help & About" },
    Items: {
      shape: "reference",
      refs: [
        "footer-link-support@1",
        "footer-link-locations@1",
        "footer-link-contact@1",
        "footer-link-about@1",
      ],
    },
  },
} satisfies ContentItemRecipe;

export default footerColumnResourcesRecipe;
