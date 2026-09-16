import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const footerLinkCheckingRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-checking@1",
  name: "footer-link-checking",
  displayName: "Checking & Savings",
  description: "Footer Personal column link: Checking & Savings.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Checking & Savings" },
    Link: {
      shape: "link-external",
      href: "/Products/Checking-and-Savings",
      text: "Checking & Savings",
    },
  },
} satisfies ContentItemRecipe;

export default footerLinkCheckingRecipe;
