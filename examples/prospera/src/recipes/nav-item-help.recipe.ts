import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Top-level Help nav item → /Support. Patch the live primary-nav
 * Treelist after push; do not re-push `primary-nav-content@1`.
 */
export const navItemHelpRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-item-help@1",
  name: "nav-item-help",
  displayName: "Help",
  description: "Top-level nav item: Help → /Support. Flat link, no mega-menu.",
  templateType: "nav-item@1",
  fields: {
    Title: { shape: "text", value: "Help" },
    Link: { shape: "link-external", href: "/Support", text: "Help" },
    HasPanel: { shape: "boolean", value: false },
  },
} satisfies ContentItemRecipe;

export default navItemHelpRecipe;
