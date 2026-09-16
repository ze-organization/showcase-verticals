import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Mega-menu column link for the shared primary nav. */
export const navLinkLightingRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-lighting@1",
  name: "nav-link-lighting",
  displayName: "Checking & Savings",
  description: "Primary-nav Products dropdown link: Checking & Savings. Patch live treelist; do not re-push.",
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

export default navLinkLightingRecipe;
