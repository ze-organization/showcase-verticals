import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Company column link for the `footer-link-columns@1` stock footer. */
export const footerLinkAboutRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-about@1",
  name: "footer-link-about",
  displayName: "About",
  description: "Footer link-columns item: About (Company column).",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "About" },
    Link: { shape: "link-external", href: "/About", text: "About" },
  },
} satisfies ContentItemRecipe;

export default footerLinkAboutRecipe;
