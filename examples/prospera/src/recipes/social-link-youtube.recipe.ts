import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** Social row link for the `footer-brand-social@1` stock footer. */
export const socialLinkYoutubeRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "social-link-youtube@1",
  name: "social-link-youtube",
  displayName: "YouTube",
  description: "Footer brand-social item: YouTube profile link.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "YouTube" },
    Link: {
      shape: "link-external",
      href: "https://youtube.com/@acme",
      text: "YouTube",
    },
  },
} satisfies ContentItemRecipe;

export default socialLinkYoutubeRecipe;
