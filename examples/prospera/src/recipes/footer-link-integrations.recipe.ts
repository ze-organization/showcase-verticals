import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const footerLinkIntegrationsRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-integrations@1",
  name: "footer-link-integrations",
  displayName: "Treasury",
  description: "Leftover footer Integrations item retargeted to Treasury.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Treasury" },
    Link: {
      shape: "link-external",
      href: "/Services/treasury",
      text: "Treasury",
    },
  },
} satisfies ContentItemRecipe;

export default footerLinkIntegrationsRecipe;
