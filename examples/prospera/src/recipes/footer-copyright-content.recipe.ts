import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Canonical footer copyright line referenced by the stock footer
 * partial designs (`footer-link-columns@1`, `footer-legal-strip@1`,
 * `footer-brand-social@1`). Conforms to `content-block@1`'s shape —
 * Body is the RichText slot.
 *
 * Tenants override the company name + year per-tenant; the seed ships
 * a placeholder Acme line so authors see something on first install.
 */
export const footerCopyrightContentRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-copyright-content@1",
  name: "footer-copyright",
  displayName: "Footer Copyright",
  description:
    "Copyright line shown in the footer bottom row. Used by the stock footer partials.",
  templateType: "content-block@1",
  fields: {
    Body: {
      shape: "richText",
      value:
        "<p>&copy; 2026 Prospera Bank, N.A. Member FDIC. Equal Housing Lender. All rights reserved.</p>",
    },
  },
} satisfies ContentItemRecipe;

export default footerCopyrightContentRecipe;
