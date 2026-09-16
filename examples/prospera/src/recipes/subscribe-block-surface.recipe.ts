import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Surface enum backing the `Surface` rendering parameter on
 * `subscribe-section`. Absorbs the visual treatment that used to live
 * on the standalone `newsletter-lead-capture@1` recipe.
 *
 *   - `plain` — no chrome around the form. Right for full-width
 *     section banners (footer, hero strip).
 *   - `card` — wrap the form in an elevated, rounded Card. Right for
 *     sidebars, article rails, and content-island placements.
 *
 * Reference via `sitecore.enumHandle: "subscribe-block-surface@1"`.
 * Lands at `<enumerationsRoot>/Subscribe Block Surface` per-site.
 */
export const subscribeBlockSurfaceEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "subscribe-block-surface@1",
  name: "Subscribe Block Surface",
  displayName: "Subscribe Block Surface",
  description:
    "Surface chrome around the subscribe form. Plain (default) or elevated card.",
  location: { scope: "site", folder: ["Forms"] },
  default: "plain",
  values: [
    { name: "plain", displayName: "Plain" },
    { name: "card", displayName: "Card" },
  ],
} satisfies EnumerationRecipe;

export default subscribeBlockSurfaceEnumRecipe;
