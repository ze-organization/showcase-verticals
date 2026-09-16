import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const footerLinkSupportRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-support@1",
  name: "footer-link-support",
  displayName: "Help",
  description: "Footer Help & About column link: Help.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Help" },
    Link: { shape: "link-external", href: "/Support", text: "Help" },
  },
} satisfies ContentItemRecipe;

export default footerLinkSupportRecipe;
