import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the `MediaShape` rendering parameter —
 * how a card's / promo's media box is framed, orthogonal to
 * `media-aspect@1`. Lands at `<enumerationsRoot>/Card/MediaShape`.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "media-shape@1"`. Components map each value to literal classes —
 * see `MEDIA_SHAPE_CLASSES` in `cards-and-lists/_media-aspect.ts`.
 *
 * `circle` is the circle-framed-image treatment seen across the brand
 * benchmark (resmed's circular split-promo image, fifa's story
 * thumbnails, headshot cards): a full-round clip with a forced square
 * box. Bind it when the source shows photographic media cropped to a
 * circle. `rounded` opts a bare media box into the theme's card
 * radius; `default` keeps the variant's own chrome.
 */
export const mediaShapeEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "media-shape@1",
  name: "MediaShape",
  displayName: "Media Shape",
  description:
    "Framing of the media box, orthogonal to aspect. `default` keeps the variant's own chrome; `rounded` applies the theme card radius; `circle` clips the media to a full circle (forces a square box) — bind when the source shows circle-framed imagery.",
  location: { scope: "site", folder: ["Card"] },
  default: "default",
  values: [
    { name: "default", displayName: "Default (variant chrome)" },
    { name: "rounded", displayName: "Rounded (theme card radius)" },
    { name: "circle", displayName: "Circle (full-round clip)" },
  ],
} satisfies EnumerationRecipe;

export default mediaShapeEnumRecipe;
