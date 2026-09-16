import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const navItemLocationsRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-item-locations@1",
  name: "nav-item-locations",
  displayName: "Locations",
  description:
    "Top-level nav item: Locations — flat link, no mega-menu panel. Patch the live primary-nav Treelist after push; do not re-push primary-nav-content@1.",
  templateType: "nav-item@1",
  fields: {
    Title: { shape: "text", value: "Locations" },
    Link: {
      shape: "link-external",
      href: "/Locations",
      text: "Locations",
    },
    HasPanel: { shape: "boolean", value: false },
  },
} satisfies ContentItemRecipe;

export default navItemLocationsRecipe;
