import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Canonical primary navigation — Treelist of nav items, shared by the
 * stock header experiences. Items is CreateOnly after first apply:
 * do not re-push this recipe; patch the live treelist to Personal /
 * Business / About / Help.
 */
export const primaryNavContentRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "primary-nav-content@1",
  name: "primary-nav",
  displayName: "Primary Nav",
  description:
    "Canonical primary navigation — Personal, Business, About, Help. Do not re-push after first apply.",
  templateType: "main-nav@1",
  fields: {
    Items: {
      shape: "reference",
      refs: [
        "nav-item-products@1",
        "nav-item-business@1",
        "nav-item-about@1",
        "nav-item-help@1",
      ],
    },
  },
} satisfies ContentItemRecipe;

export default primaryNavContentRecipe;
