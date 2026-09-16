import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const footerLinkLendingRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-lending@1",
  name: "footer-link-lending",
  displayName: "Lending",
  description: "Footer Personal column link: Lending.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Lending" },
    Link: { shape: "link-external", href: "/Products/Lending", text: "Lending" },
  },
} satisfies ContentItemRecipe;

export default footerLinkLendingRecipe;
