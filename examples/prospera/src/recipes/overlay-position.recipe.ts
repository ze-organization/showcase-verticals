import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing a hero's `OverlayPosition` rendering parameter —
 * inline-axis placement of the overlay panel inside the hero band.
 * RTL-aware: `start` flips to the visual right under `dir="rtl"`; same
 * for `end`. The gap from the edge is controlled by `OverlayPadding`
 * (`default` = flush; `xs`…`xl` push the panel inward).
 *
 *   - `start`   — panel at the inline-start edge, offset by `OverlayPadding`.
 *   - `center`  — panel centered horizontally.
 *   - `end`     — panel at the inline-end edge, offset by `OverlayPadding`.
 */
export const overlayPositionEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "overlay-position@1",
  name: "OverlayPosition",
  displayName: "Overlay Position",
  description:
    "Inline-axis placement of the hero overlay panel — `start` / `center` / `end`. The gap from the edge is set by `OverlayPadding` (`default` = flush). RTL flips start/end visually.",
  location: { scope: "site", folder: ["Hero"] },
  default: "start",
  values: [
    { name: "start", displayName: "Start" },
    { name: "center", displayName: "Center" },
    { name: "end", displayName: "End" },
  ],
} satisfies EnumerationRecipe;

export default overlayPositionEnumRecipe;
