import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing a card's `MediaAspect` rendering
 * parameter — the aspect ratio the card's media box paints inside.
 * Lands at `<enumerationsRoot>/Card/MediaAspect` per-site.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "media-aspect@1"`. Components map each concrete value to a Tailwind
 * `aspect-*` utility — see `MEDIA_ASPECT_CLASSES` in
 * `cards-and-lists/_media-aspect.ts`. `auto` is not a concrete
 * ratio — it keeps the variant's own default sizing (Overlay falls
 * back to 4x5; article-card vertical variants keep their fixed media
 * height; feature-card image variants keep 16x9).
 */
export const mediaAspectEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "media-aspect@1",
  name: "MediaAspect",
  displayName: "Media Aspect",
  description:
    "Aspect ratio for card media boxes: auto keeps the variant default; 16x9 wide, 4x5 editorial portrait, 3x4 portrait, 1x1 square.",
  location: { scope: "site", folder: ["Card"] },
  default: "4x5",
  values: [
    { name: "auto", displayName: "Auto (variant default)" },
    { name: "16x9", displayName: "16:9 (Wide)" },
    { name: "4x5", displayName: "4:5 (Editorial portrait)" },
    { name: "3x4", displayName: "3:4 (Portrait)" },
    { name: "1x1", displayName: "1:1 (Square)" },
  ],
} satisfies EnumerationRecipe;

export default mediaAspectEnumRecipe;
