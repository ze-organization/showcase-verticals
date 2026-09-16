import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const footerLinkTreasuryRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-treasury@1",
  name: "footer-link-treasury",
  displayName: "Treasury",
  description: "Footer Business column link: Treasury.",
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

export default footerLinkTreasuryRecipe;
