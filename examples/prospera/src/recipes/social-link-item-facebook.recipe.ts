import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Stock `social-link-item@1` content for `social-links@1`.
 *
 * SocialLinks is DATASOURCE-driven: its `Links` Treelist is filtered to
 * `social-link-item@1` CONTENT items, which — unlike SocialShare's
 * `Platforms` param, whose Treelist targets enum VALUE items that always
 * exist — have to be authored before there is anything to select. With
 * none shipped, a fresh placement resolved to zero rows and painted an
 * empty div, which is indistinguishable from the component being broken.
 *
 * These give every tenant a ready-made row to point the Treelist at. The
 * URLs are placeholders on purpose: an author repoints them at the
 * brand's real profiles, and the Platform token is what actually drives
 * the icon and its brand colour.
 */
export const socialLinkItemFacebookRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "social-link-item-facebook@1",
  name: "social-link-item-facebook",
  displayName: "Facebook",
  description:
    "Stock SocialLinks item: Facebook profile link. Repoint the URL at the brand's own profile.",
  templateType: "social-link-item@1",
  fields: {
    Platform: { shape: "enum", value: "facebook" },
    Link: {
      shape: "link-external",
      href: "https://facebook.com/acme",
      text: "Facebook",
    },
  },
} satisfies ContentItemRecipe;

export default socialLinkItemFacebookRecipe;
