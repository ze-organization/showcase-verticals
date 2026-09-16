import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Enumeration backing the `Framing` rendering parameter on `image@1` —
 * the chrome of the whole image figure.
 *
 * Deliberately NOT `media-shape@1`: that enum frames a card's inner
 * media *box* (default / rounded / circle) and has no chrome
 * vocabulary. Framing here is figure-level chrome — `card` is
 * Card-primitive chrome (theme border + elevation + `--card-radius`)
 * and `full-bleed` strips all chrome — neither of which media-shape
 * can express without overloading its "default = variant's own
 * chrome" sentinel. The one overlapping value (`circle`) uses the
 * same visual treatment as media-shape's circle (square box,
 * full-round clip) so authors learn one circle.
 *
 *   - `rounded`    — (default) theme card radius on the media box; the
 *                    component's historical look, so stored placements
 *                    without the param don't shift.
 *   - `full-bleed` — edge-to-edge, no radius, no chrome.
 *   - `card`       — Card-primitive chrome: theme radius, border,
 *                    elevation; the caption joins the image inside.
 *   - `circle`     — full-round clip on a forced square box; captions
 *                    render below the circle, never clipped inside it.
 */
export const imageFramingEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "image-framing@1",
  name: "ImageFraming",
  displayName: "Image Framing",
  description:
    "Chrome of the image figure — `rounded` (default, theme card radius), `full-bleed` (edge-to-edge), `card` (Card border/elevation chrome), or `circle` (full-round clip).",
  location: { scope: "site", folder: ["Media"] },
  default: "rounded",
  values: [
    { name: "rounded", displayName: "Rounded (theme card radius)" },
    { name: "full-bleed", displayName: "Full Bleed (edge-to-edge)" },
    { name: "card", displayName: "Card (border + elevation)" },
    { name: "circle", displayName: "Circle (full-round clip)" },
  ],
} satisfies EnumerationRecipe;

export default imageFramingEnumRecipe;
