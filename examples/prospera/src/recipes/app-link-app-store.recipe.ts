import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/** App-download row link for the `footer-brand-social@1` stock footer. */
export const appLinkAppStoreRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "app-link-app-store@1",
  name: "app-link-app-store",
  displayName: "App Store",
  description:
    "Footer brand-social item: iOS App Store listing link. The badge treatment is resolved from the URL host, so the href must stay on an Apple store domain (apps.apple.com / itunes.apple.com) to render as a badge rather than a text link.",
  templateType: "link-list-item@1",
  fields: {
    Title: { shape: "text", value: "Download on the App Store" },
    Link: {
      shape: "link-external",
      href: "https://apps.apple.com/app/id0",
      text: "Download on the App Store",
    },
  },
} satisfies ContentItemRecipe;

export default appLinkAppStoreRecipe;
