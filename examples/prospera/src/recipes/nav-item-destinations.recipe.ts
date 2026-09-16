import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const navItemDestinationsRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-item-destinations@1",
  name: "nav-item-destinations",
  displayName: "Locations",
  description:
    "Unused leftover nav item retargeted to Locations. Not in primary nav; patch recipes only.",
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

export default navItemDestinationsRecipe;
