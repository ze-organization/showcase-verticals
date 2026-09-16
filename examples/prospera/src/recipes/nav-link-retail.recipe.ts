import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const navLinkRetailRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-retail@1",
  name: "nav-link-retail",
  displayName: "Checking & Savings",
  description: "Leftover Retail nav link retargeted to Checking & Savings.",
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

export default navLinkRetailRecipe;
