import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

export const navLinkServicesRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-services@1",
  name: "nav-link-services",
  displayName: "Advice",
  description:
    "Leftover Services nav link labeled Advice → /Services. Not in locked header.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Advice" },
    Link: { shape: "link-external", href: "/Services", text: "Advice" },
  },
} satisfies ContentItemRecipe;

export default navLinkServicesRecipe;
