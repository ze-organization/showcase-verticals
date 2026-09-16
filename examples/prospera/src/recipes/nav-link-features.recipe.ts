import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const navLinkFeaturesRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-features@1",
  name: "nav-link-features",
  displayName: "Virtual cards",
  description: "Leftover Features nav link retargeted to virtual cards landing.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Virtual cards" },
    Link: {
      shape: "link-external",
      href: "/Products/virtual-cards",
      text: "Virtual cards",
    },
  },
} satisfies ContentItemRecipe;

export default navLinkFeaturesRecipe;
