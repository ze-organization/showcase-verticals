import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Canonical legal-links datasource referenced by the stock footer
 * partial designs (`footer-link-columns@1`, `footer-legal-strip@1`).
 * Conforms to `link-list-content@1`'s shape (Title? + Items Treelist
 * of `link-list-item@1` records).
 *
 * Ships Privacy, Terms, Accessibility — cookies are covered on
 * `/Privacy`. Items is CreateOnly after first apply; patch live.
 */
export const footerLegalContentRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-legal-content@1",
  name: "footer-legal",
  displayName: "Footer Legal Links",
  description:
    "Legal/utility links shown in the footer bottom row — Privacy, Terms, Accessibility. Used by the stock footer partials.",
  templateType: "link-list-content@1",
  fields: {
    Items: {
      shape: "reference",
      refs: [
        "link-item-privacy@1",
        "link-item-terms@1",
        "link-item-accessibility@1",
      ],
    },
  },
} satisfies ContentItemRecipe;

export default footerLegalContentRecipe;
