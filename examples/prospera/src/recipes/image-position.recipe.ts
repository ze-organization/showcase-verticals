import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `ImagePosition` rendering parameter on
 * components that render an editorial / lead image alongside title +
 * meta copy (article-header today, future heros / promos).
 *
 *   - `above`  (default) — image above the heading region.
 *                          Matches the Article-Header / editorial-hero
 *                          conventional shape.
 *   - `below`            — image rendered after the title, subtitle,
 *                          byline, and logo strip. Mirrors the Hero
 *                          Centered / Editorial shape where copy
 *                          leads and media settles beneath.
 *   - `hidden`           — image is suppressed even when the field is
 *                          populated. Useful when the same datasource
 *                          is reused across pages where some need the
 *                          image and others don't.
 */
export const imagePositionEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "image-position@1",
  name: "ImagePosition",
  displayName: "Image Position",
  description:
    "Where the lead image renders relative to the heading region. `above` (default), `below`, or `hidden`.",
  location: { scope: "site", folder: ["Layout"] },
  default: "above",
  values: [
    { name: "above", displayName: "Above" },
    { name: "below", displayName: "Below" },
    { name: "hidden", displayName: "Hidden" },
  ],
} satisfies EnumerationRecipe;

export default imagePositionEnumRecipe;
