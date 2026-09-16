import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const footerLinkSolutionsRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-solutions@1",
  name: "footer-link-solutions",
  displayName: "Advice",
  description: "Leftover footer item retargeted to Advice (/Services).",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Advice" },
    Link: { shape: "link-external", href: "/Services", text: "Advice" },
  },
} satisfies ContentItemRecipe;

export default footerLinkSolutionsRecipe;
