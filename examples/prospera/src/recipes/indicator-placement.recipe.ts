import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `IndicatorPlacement` rendering parameter on
 * carousel-like surfaces (hero-carousel and future rotating bands).
 * Lands at `<enumerationsRoot>/Layout/IndicatorPlacement`.
 *
 *   - `inside` (default) — the dot rail and prev/next arrows overlay
 *     the slides (the classic full-bleed carousel chrome).
 *   - `below` — dots AND arrows render on the page background under
 *     the band (the dots-below look that pairs with inset hero media).
 */
export const indicatorPlacementEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "indicator-placement@1",
  name: "IndicatorPlacement",
  displayName: "Indicator Placement",
  description:
    "Where a carousel's indicator dots and prev/next arrows render. `inside` (default) overlays the chrome on the slides; `below` places the dot rail and arrows on the page background under the band — pairs with inset (contained/card) hero media.",
  location: { scope: "site", folder: ["Layout"] },
  default: "inside",
  values: [
    { name: "inside", displayName: "Inside (over the slides)" },
    { name: "below", displayName: "Below (under the band)" },
  ],
} satisfies EnumerationRecipe;

export default indicatorPlacementEnumRecipe;
