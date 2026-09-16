import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const navItemPeopleRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-item-people@1",
  name: "nav-item-people",
  displayName: "People",
  description: "Top-level nav item: People — flat link, no mega-menu panel.",
  templateType: "nav-item@1",
  fields: {
    Title: { shape: "text", value: "People" },
    Link: { shape: "link-external", href: "/People", text: "People" },
    HasPanel: { shape: "boolean", value: false },
  },
} satisfies ContentItemRecipe;

export default navItemPeopleRecipe;
