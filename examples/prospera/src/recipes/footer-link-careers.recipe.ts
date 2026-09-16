import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Company column link for the `footer-link-columns@1` stock footer. */
export const footerLinkCareersRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-careers@1",
  name: "footer-link-careers",
  displayName: "Careers",
  description: "Footer link-columns item: Careers (Company column).",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Careers" },
    Link: { shape: "link-external", href: "/Careers", text: "Careers" },
  },
} satisfies ContentItemRecipe;

export default footerLinkCareersRecipe;
