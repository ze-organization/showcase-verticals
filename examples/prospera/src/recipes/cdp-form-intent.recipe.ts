import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the `CdpFormIntent` rendering parameter
 * on every form-builder placement. Stamps a `data-cdp-form-intent`
 * attribute on the rendered `<form>` element so Sitecore CDP's OOTB
 * FORM_SUBMIT auto-capture can distinguish "this submission is from
 * a Download form" vs "a Contact form" vs "a Subscribe form" — the
 * same form-builder template renders all three depending on the
 * author's per-placement intent.
 *
 * Values mirror the journey-stage hint axis from CdpEventIntent in
 * `src/lib/registry/sitecore-recipes.ts` — Sitecore Personalize can
 * score affinity against either equally.
 *
 * Reference via `sitecore.enumHandle: "cdp-form-intent@1"`.
 */
export const cdpFormIntentEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "cdp-form-intent@1",
  name: "CdpFormIntent",
  displayName: "CDP Form Intent",
  description:
    "Journey-stage hint stamped on a form for OOTB Sitecore CDP FORM_SUBMIT classification.",
  location: { scope: "site", folder: ["Analytics", "CDP"] },
  default: "decision",
  values: [
    { name: "research", displayName: "Research (e.g. asset download)" },
    {
      name: "consideration",
      displayName: "Consideration (e.g. quote / demo request)",
    },
    { name: "decision", displayName: "Decision (e.g. contact / lead form)" },
    {
      name: "loyalty",
      displayName: "Loyalty (e.g. newsletter / account registration)",
    },
  ],
} satisfies EnumerationRecipe;

export default cdpFormIntentEnumRecipe;
