import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * App-download datasource of the `footer-brand-social@1` stock footer —
 * conforms to `link-list-content@1` (Title + Items of link-list-item@1
 * entries whose Links point at app-store listing URLs).
 *
 * Sits beneath the social row as its own labelled block rather than
 * merging into it: store links are a different call to action, and the
 * badge is a fixed-height mark that would fight the icon row's rhythm.
 *
 * Rendered by link-list@1 Horizontal. Same caveat as the social row —
 * the runtime renders these as quiet text links; the badge treatment
 * (`itemStyle: "app-badge"`) is a programmatic displayOption today, so
 * see the showcase mirror (footer-brand-social.tsx) for the badge row.
 */
export const footerAppLinksContentRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-app-links-content@1",
  name: "footer-app-links",
  displayName: "Footer App Links",
  description:
    "App-store listing links for the footer-brand-social stock footer. Tenants swap the listing URLs per app; hosts must stay on a known store domain for the badge treatment to resolve.",
  templateType: "link-list-content@1",
  fields: {
    Title: { shape: "text", value: "Get the app" },
    Items: {
      shape: "reference",
      refs: ["app-link-app-store@1", "app-link-google-play@1"],
    },
  },
} satisfies ContentItemRecipe;

export default footerAppLinksContentRecipe;
