import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const navItemAboutRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-item-about@1",
  name: "nav-item-about",
  displayName: "About",
  description: "Top-level nav item: About — flat link, no mega-menu panel.",
  templateType: "nav-item@1",
  fields: {
    Title: { shape: "text", value: "About" },
    Link: { shape: "link-external", href: "/About", text: "About" },
    HasPanel: { shape: "boolean", value: false },
  },
} satisfies ContentItemRecipe;

export default navItemAboutRecipe;
