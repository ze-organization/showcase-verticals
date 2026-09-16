import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Company column link for the `footer-link-columns@1` stock footer. */
export const footerLinkContactRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-link-contact@1",
  name: "footer-link-contact",
  displayName: "Contact",
  description: "Footer link-columns item: Contact (Company column).",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Contact" },
    Link: { shape: "link-external", href: "/Contact", text: "Contact" },
  },
} satisfies ContentItemRecipe;

export default footerLinkContactRecipe;
