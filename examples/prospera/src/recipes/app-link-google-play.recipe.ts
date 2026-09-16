import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** App-download row link for the `footer-brand-social@1` stock footer. */
export const appLinkGooglePlayRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "app-link-google-play@1",
  name: "app-link-google-play",
  displayName: "Google Play",
  description:
    "Footer brand-social item: Google Play listing link. The badge treatment is resolved from the URL host, so the href must stay on a Play domain (play.google.com / market.android.com) to render as a badge rather than a text link.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Get it on Google Play" },
    Link: {
      shape: "link-external",
      href: "https://play.google.com/store/apps/details?id=com.acme",
      text: "Get it on Google Play",
    },
  },
} satisfies ContentItemRecipe;

export default appLinkGooglePlayRecipe;
