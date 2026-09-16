import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Top-level Personal nav item → /Products. Patch the live primary-nav
 * Treelist after push; do not re-push `primary-nav-content@1`.
 */
export const navItemProductsRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-item-products@1",
  name: "nav-item-products",
  displayName: "Personal",
  description: "Top-level nav item: Personal → /Products. Flat link, no mega-menu.",
  templateType: "nav-item@1",
  fields: {
    Title: { shape: "text", value: "Personal" },
    Link: { shape: "link-external", href: "/Products", text: "Personal" },
    HasPanel: { shape: "boolean", value: false },
  },
} satisfies ContentItemRecipe;

export default navItemProductsRecipe;
