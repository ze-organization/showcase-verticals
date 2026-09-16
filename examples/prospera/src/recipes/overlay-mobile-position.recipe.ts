import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing a hero's `OverlayMobilePosition` rendering
 * parameter — block-axis placement of the overlay panel on mobile
 * widths (below `md`). Pairs with `OverlayPosition` (desktop
 * inline-axis placement) so authors can pick combinations like
 * "left on desktop, top on mobile" or "left on desktop, bottom on
 * mobile".
 *
 *   - `top`    — overlay anchors to the top of the hero band.
 *   - `bottom` — overlay anchors to the bottom of the hero band.
 *
 * On mobile, full-height overlays become partial-height (a strip) so
 * the background image stays visible above or below the panel; card
 * overlays sit flush at the chosen edge with their content padding.
 */
export const overlayMobilePositionEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "overlay-mobile-position@1",
  name: "OverlayMobilePosition",
  displayName: "Overlay Mobile Position",
  description:
    "Block-axis placement of the hero overlay on mobile widths — `top` or `bottom`. Pairs with OverlayPosition (desktop inline axis).",
  location: { scope: "site", folder: ["Hero"] },
  default: "top",
  values: [
    { name: "top", displayName: "Top" },
    { name: "bottom", displayName: "Bottom" },
  ],
} satisfies EnumerationRecipe;

export default overlayMobilePositionEnumRecipe;
