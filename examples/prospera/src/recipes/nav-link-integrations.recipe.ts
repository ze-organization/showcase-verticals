import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const navLinkIntegrationsRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-integrations@1",
  name: "nav-link-integrations",
  displayName: "Treasury",
  description: "Leftover Integrations nav link retargeted to Treasury.",
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

export default navLinkIntegrationsRecipe;
