import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const navLinkHealthcareRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-healthcare@1",
  name: "nav-link-healthcare",
  displayName: "Cards",
  description: "Leftover Healthcare nav link retargeted to Cards.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Cards" },
    Link: {
      shape: "link-external",
      href: "/Products/Cards",
      text: "Cards",
    },
  },
} satisfies ContentItemRecipe;

export default navLinkHealthcareRecipe;
