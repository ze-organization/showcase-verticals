import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing a hero's `OverlayShape` rendering parameter.
 * Picks the macro form of the overlay panel.
 *
 *   - `card`        — floating rounded panel sized by `OverlayWidth`
 *                     and anchored by `OverlayPosition`. Heights fit
 *                     the panel content with a sensible min height.
 *   - `full-height` — overlay stretches floor-to-ceiling of the hero
 *                     band. Width still respects `OverlayWidth`;
 *                     edges run flush with the band's top + bottom.
 *   - `lower-third` — flush text band anchored to the bottom of the
 *                     hero (editorial full-bleed image with copy in
 *                     the lower third). Width still respects
 *                     `OverlayWidth`; inline placement still respects
 *                     `OverlayPosition`. Pairs well with
 *                     `OverlayStyle: gradient`.
 */
export const overlayShapeEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "overlay-shape@1",
  name: "OverlayShape",
  displayName: "Overlay Shape",
  description:
    "Hero overlay panel shape — `card` (floating rounded panel), `full-height` (full band height), or `lower-third` (flush band anchored to the bottom of the hero). All three respect OverlayWidth and OverlayPosition.",
  location: { scope: "site", folder: ["Hero"] },
  default: "card",
  values: [
    { name: "card", displayName: "Card (floating)" },
    { name: "full-height", displayName: "Full Height" },
    { name: "lower-third", displayName: "Lower Third" },
  ],
} satisfies EnumerationRecipe;

export default overlayShapeEnumRecipe;
