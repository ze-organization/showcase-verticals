import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * The canonical site logo image — the SAME shared item every stock
 * chrome partial references (the stock header experiences place it in
 * the header shell's `header-start` slot via `image@1`;
 * `footer-brand-social@1` places it in the footer's main tier). One
 * logo asset, every chrome placement.
 *
 * Conforms to `image@1`'s auto-template. Seeds a placeholder media
 * path — authors swap the asset per tenant by uploading their logo
 * to the Sitecore Media Library and pointing this item's Image field
 * at it.
 */
export const siteLogoContentRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "site-logo-content@1",
  name: "site-logo",
  displayName: "Site Logo",
  description:
    "Canonical site logo shared by the stock header and footer partials.",
  templateType: "image@1",
  fields: {
    Image: {
      shape: "image",
      mediaPath: "/sitecore/media library/Project/Default/Logo",
      alt: "Prospera",
    },
    Link: {
      shape: "link-external",
      href: "/",
      text: "Home",
    },
  },
} satisfies ContentItemRecipe;

export default siteLogoContentRecipe;
