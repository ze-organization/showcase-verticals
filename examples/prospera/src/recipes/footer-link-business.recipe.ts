import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const footerLinkBusinessRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-business@1",
  name: "footer-link-business",
  displayName: "Business",
  description: "Footer Business column link: Business.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Business" },
    Link: { shape: "link-external", href: "/Business", text: "Business" },
  },
} satisfies ContentItemRecipe;

export default footerLinkBusinessRecipe;
