import type { ContentItemRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Utility-strip links datasource of the `header-two-tier@1` stock
 * header — conforms to `link-list-content@1` (Title + Items of
 * link-list-item@1 entries).
 *
 * Rendered by link-list@1 UtilityBar in the header shell's
 * `header-utility-end` slot. Shared (not scoped) on purpose — the
 * footer-social-content precedent — so tenants edit the strip once
 * and every header placement follows.
 */
export const headerUtilityContentRecipe = {
  kind: "content-item",
  schemaVersion: "1",
  handle: "header-utility-content@1",
  name: "header-utility",
  displayName: "Header Utility Links",
  description:
    "Quiet utility-strip links for the header-two-tier stock header. Tenants swap the targets per environment.",
  templateType: "link-list-content@1",
  fields: {
    Title: { shape: "text", value: "Utility" },
    Items: {
      shape: "reference",
      refs: ["utility-link-support@1", "utility-link-contact@1"],
    },
  },
} satisfies ContentItemRecipe;

export default headerUtilityContentRecipe;
