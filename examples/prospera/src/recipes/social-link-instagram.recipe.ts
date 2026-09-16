import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Social row link for the `footer-brand-social@1` stock footer. */
export const socialLinkInstagramRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "social-link-instagram@1",
  name: "social-link-instagram",
  displayName: "Instagram",
  description: "Footer brand-social item: Instagram profile link.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Instagram" },
    Link: {
      shape: "link-external",
      href: "https://instagram.com/acme",
      text: "Instagram",
    },
  },
} satisfies ContentItemRecipe;

export default socialLinkInstagramRecipe;
