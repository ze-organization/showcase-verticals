import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const navItemServicesRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-item-services@1",
  name: "nav-item-services",
  displayName: "Services",
  description: "Top-level nav item: Services — flat link, no mega-menu panel.",
  templateType: "nav-item@1",
  fields: {
    Title: { shape: "text", value: "Services" },
    Link: { shape: "link-external", href: "/Services", text: "Services" },
    HasPanel: { shape: "boolean", value: false },
  },
} satisfies ContentItemRecipe;

export default navItemServicesRecipe;
