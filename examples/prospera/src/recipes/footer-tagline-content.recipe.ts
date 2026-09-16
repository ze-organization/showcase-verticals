import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Tagline datasource of the `footer-bands@1` stock footer — the slim
 * brand-promise strip that sits above everything else.
 *
 * Its own band on purpose: a one-line brand statement wants a much
 * shallower band than the link columns below it, which is the whole
 * point the Bands shell exists to express.
 */
export const footerTaglineContentRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "footer-tagline-content@1",
  name: "footer-tagline",
  displayName: "Footer Tagline",
  description:
    "One-line brand promise for the footer-bands stock footer's top strip. Tenants replace the copy per brand.",
  templateType: "content-block@1",
  fields: {
    Body: {
      shape: "richText",
      value: "<p>National banking. Deposits, advice, and a branch when you need one.</p>",
    },
  },
} satisfies ContentItemRecipe;

export default footerTaglineContentRecipe;
