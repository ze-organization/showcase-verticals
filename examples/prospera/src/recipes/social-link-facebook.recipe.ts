import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Social row link for the `footer-brand-social@1` stock footer. */
export const socialLinkFacebookRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "social-link-facebook@1",
  name: "social-link-facebook",
  displayName: "Facebook",
  description: "Footer brand-social item: Facebook profile link.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Facebook" },
    Link: {
      shape: "link-external",
      href: "https://facebook.com/acme",
      text: "Facebook",
    },
  },
} satisfies ContentItemRecipe;

export default socialLinkFacebookRecipe;
