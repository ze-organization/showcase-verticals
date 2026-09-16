import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `CaptionStyle` rendering parameter on the
 * media-gallery + media-carousel renderings — how a media tile's
 * title/caption renders relative to its image.
 *
 *   - `none`    — caption hidden; the tile is a pure image.
 *   - `below`   — (default) caption sits under the image in plain prose.
 *   - `overlay` — caption floats over the bottom of the image on a
 *                 gradient scrim (light text).
 *   - `card`    — image + caption sit together in a bordered card panel.
 */
export const captionStyleEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "caption-style@1",
  name: "CaptionStyle",
  displayName: "Caption Style",
  description:
    "How a media tile's caption renders — `none`, `below` (default), `overlay`, or `card`.",
  location: { scope: "site", folder: ["Media"] },
  default: "below",
  values: [
    { name: "none", displayName: "None" },
    { name: "below", displayName: "Below" },
    { name: "overlay", displayName: "Overlay" },
    { name: "card", displayName: "Card" },
  ],
} satisfies EnumerationRecipe;

export default captionStyleEnumRecipe;
