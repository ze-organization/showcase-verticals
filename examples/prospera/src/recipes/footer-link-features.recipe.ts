import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const footerLinkFeaturesRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-features@1",
  name: "footer-link-features",
  displayName: "Virtual cards",
  description: "Leftover footer Features item retargeted to virtual cards landing.",
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

export default footerLinkFeaturesRecipe;
