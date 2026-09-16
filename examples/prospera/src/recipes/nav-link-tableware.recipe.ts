import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Mega-menu column link for the shared primary nav. */
export const navLinkTablewareRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-tableware@1",
  name: "nav-link-tableware",
  displayName: "Lending",
  description: "Primary-nav Products dropdown link: Lending. Patch live treelist; do not re-push.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Lending" },
    Link: { shape: "link-external", href: "/Products/Lending", text: "Lending" },
  },
} satisfies ContentItemRecipe;

export default navLinkTablewareRecipe;
