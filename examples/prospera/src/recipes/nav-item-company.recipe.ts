import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Top-level Company nav item. Patch the live primary-nav Treelist after
 * push; do not re-push `primary-nav-content@1`.
 */
export const navItemCompanyRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-item-company@1",
  name: "nav-item-company",
  displayName: "Company",
  description:
    "Top-level nav item: Company — dropdown to /About. Patch live primary-nav-content@1; do not re-push that treelist.",
  templateType: "nav-item@1",
  fields: {
    Title: { shape: "text", value: "Company" },
    Link: { shape: "link-external", href: "/About", text: "Company" },
    HasPanel: { shape: "boolean", value: false },
    Groups: { shape: "reference", refs: ["nav-group-company@1"] },
  },
} satisfies ContentItemRecipe;

export default navItemCompanyRecipe;
