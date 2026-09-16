import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Mega-menu column link for the shared primary nav (`nav-group-resources@1`). */
export const navLinkDocumentationRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "nav-link-documentation@1",
  name: "nav-link-documentation",
  displayName: "Documentation",
  description: "Primary-nav dropdown link: Documentation.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Documentation" },
    Link: { shape: "link-external", href: "/Documentation", text: "Documentation" },
  },
} satisfies ContentItemRecipe;

export default navLinkDocumentationRecipe;
