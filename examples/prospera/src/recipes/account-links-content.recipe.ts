import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * The account dropdown's link list for the `header-utility-bar@1`
 * stock header — conforms to `link-list-content@1` and backs the
 * `link-list@1` NavList composed into the account trigger's
 * `trigger-panel` placeholder. Shipping REAL panel content is what
 * makes the utility trigger's dropdown actually open with something
 * in it (a `HasPanel` trigger with an empty panel reads as "the
 * trigger does nothing").
 */
export const accountLinksContentRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "account-links-content@1",
  name: "account-links",
  displayName: "Account Links",
  description:
    "Account dropdown links for the header-utility-bar stock header.",
  templateType: "link-list-content@1",
  fields: {
    Title: { shape: "text", value: "Your account" },
    Items: {
      shape: "reference",
      refs: [
        "account-link-sign-in@1",
        "account-link-register@1",
        "account-link-orders@1",
      ],
    },
  },
} satisfies ContentItemRecipe;

export default accountLinksContentRecipe;
