import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Social-links datasource of the `footer-brand-social@1` stock footer —
 * conforms to `link-list-content@1` (Title + Items of link-list-item@1
 * entries whose Links point at social profile URLs).
 *
 * Rendered by link-list@1 Horizontal. Note the runtime renders these as
 * quiet text links; the icon treatment (`itemStyle: "social-icon"`) is
 * a programmatic displayOption today — see the showcase mirror
 * (footer-brand-social.tsx), which composes the icon row.
 */
export const footerSocialContentRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-social-content@1",
  name: "footer-social",
  displayName: "Footer Social Links",
  description:
    "Social profile links for the footer-brand-social stock footer. Tenants swap the profile URLs per environment.",
  templateType: "link-list-content@1",
  fields: {
    Title: { shape: "text", value: "Follow us" },
    Items: {
      shape: "reference",
      refs: [
        "social-link-facebook@1",
        "social-link-instagram@1",
        "social-link-youtube@1",
      ],
    },
  },
} satisfies ContentItemRecipe;

export default footerSocialContentRecipe;
