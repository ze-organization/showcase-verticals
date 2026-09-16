import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the Promo `ImagePosition` rendering parameter —
 * where the media sits relative to the text block. Distinct from the
 * shared `image-position@1` enum (which article-header uses and only
 * offers `above` / `below` / `hidden`); Promo needs the two-column and
 * background placements too.
 *
 *   - `background` (default) — media painted full-bleed behind the
 *                              text. Falls back to the SurfaceTone band
 *                              when no image is set, so it doubles as
 *                              the classic text-led promo.
 *   - `start` / `end`        — two-column split; media inline-start /
 *                              inline-end (logical, RTL-safe).
 *   - `above` / `below`      — single column; media stacked over /
 *                              under the text.
 *   - `hidden`               — media suppressed even when populated.
 *
 * On the Media / Placeholders variants `background` falls back to
 * `above` since a Sitecore placeholder can't paint as a background.
 */
export const promoImagePositionEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "promo-image-position@1",
  name: "PromoImagePosition",
  displayName: "Promo Image Position",
  description:
    "Where the Promo media sits relative to the text. `background` (default), `start` / `end` (two-column), `above` / `below` (stacked), or `hidden`.",
  location: { scope: "site", folder: ["Layout"] },
  default: "background",
  values: [
    { name: "background", displayName: "Background (full-bleed)" },
    { name: "start", displayName: "Start (two-column)" },
    { name: "end", displayName: "End (two-column)" },
    { name: "above", displayName: "Above" },
    { name: "below", displayName: "Below" },
    { name: "hidden", displayName: "Hidden" },
  ],
} satisfies EnumerationRecipe;

export default promoImagePositionEnumRecipe;
