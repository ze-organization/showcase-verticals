import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const footerLinkCardsRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-cards@1",
  name: "footer-link-cards",
  displayName: "Cards",
  description: "Footer Personal column link: Cards.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Cards" },
    Link: { shape: "link-external", href: "/Products/Cards", text: "Cards" },
  },
} satisfies ContentItemRecipe;

export default footerLinkCardsRecipe;
