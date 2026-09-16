import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Top-level Business nav item → /Business. Patch the live primary-nav
 * Treelist after push; do not re-push `primary-nav-content@1`.
 */
export const navItemBusinessRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-item-business@1",
  name: "nav-item-business",
  displayName: "Business",
  description: "Top-level nav item: Business → /Business. Flat link, no mega-menu.",
  templateType: "nav-item@1",
  fields: {
    Title: { shape: "text", value: "Business" },
    Link: { shape: "link-external", href: "/Business", text: "Business" },
    HasPanel: { shape: "boolean", value: false },
  },
} satisfies ContentItemRecipe;

export default navItemBusinessRecipe;
