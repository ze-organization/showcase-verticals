import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Company mega-menu column. New on this tenant — first push is OK.
 * After apply, Items is CreateOnly; patch the live treelist instead of
 * re-pushing this recipe.
 */
export const navGroupCompanyRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-group-company@1",
  name: "nav-group-company",
  displayName: "Nav Group — Company",
  description: "Company mega-menu column of the shared primary nav.",
  templateType: "link-list-content@1",
  fields: {
    Title: { shape: "text", value: "Company" },
    Items: {
      shape: "reference",
      refs: [
        "nav-link-about@1",
        "nav-link-leadership@1",
        "nav-link-people@1",
        "nav-link-careers@1",
        "nav-link-partners@1",
        "nav-link-locations@1",
      ],
    },
  },
} satisfies ContentItemRecipe;

export default navGroupCompanyRecipe;
