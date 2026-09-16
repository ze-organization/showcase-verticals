import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Resources column link for the `footer-link-columns@1` stock footer. */
export const footerLinkDocsRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-docs@1",
  name: "footer-link-docs",
  displayName: "Documentation",
  description: "Footer link-columns item: Documentation (Resources column).",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Documentation" },
    Link: { shape: "link-external", href: "/Documentation", text: "Documentation" },
  },
} satisfies ContentItemRecipe;

export default footerLinkDocsRecipe;
