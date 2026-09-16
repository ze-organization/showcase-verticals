import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const navItemArticlesRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-item-articles@1",
  name: "nav-item-articles",
  displayName: "Articles",
  description: "Top-level nav item: Articles — flat link, no mega-menu panel.",
  templateType: "nav-item@1",
  fields: {
    Title: { shape: "text", value: "Articles" },
    Link: { shape: "link-external", href: "/Articles", text: "Articles" },
    HasPanel: { shape: "boolean", value: false },
  },
} satisfies ContentItemRecipe;

export default navItemArticlesRecipe;
