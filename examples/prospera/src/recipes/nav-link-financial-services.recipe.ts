import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const navLinkFinancialServicesRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-financial-services@1",
  name: "nav-link-financial-services",
  displayName: "Lending",
  description: "Leftover Financial Services nav link retargeted to Lending.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Lending" },
    Link: {
      shape: "link-external",
      href: "/Products/Lending",
      text: "Lending",
    },
  },
} satisfies ContentItemRecipe;

export default navLinkFinancialServicesRecipe;
