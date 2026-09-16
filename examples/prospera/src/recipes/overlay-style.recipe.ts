import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing a hero's `OverlayStyle` rendering parameter.
 * Picks the visual treatment of the overlay surface — drawn on top of
 * the hero's background (image or color).
 *
 *   - `none`     — no overlay panel.
 *   - `solid`    — `OverlayColorScheme` at `OverlayOpacity`.
 *   - `gradient` — linear gradient that fades from the color (anchored
 *                  to the overlay's start edge) to transparent in the
 *                  opposite direction.
 *   - `blur`     — color at low opacity + `backdrop-blur-md`. Good for
 *                  light copy on busy imagery.
 */
export const overlayStyleEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "overlay-style@1",
  name: "OverlayStyle",
  displayName: "Overlay Style",
  description:
    "Visual treatment for the hero overlay surface — `none` / `solid` / `gradient` / `blur`.",
  location: { scope: "site", folder: ["Hero"] },
  default: "solid",
  values: [
    { name: "none", displayName: "None" },
    { name: "solid", displayName: "Solid" },
    { name: "gradient", displayName: "Gradient" },
    { name: "blur", displayName: "Blur" },
  ],
} satisfies EnumerationRecipe;

export default overlayStyleEnumRecipe;
