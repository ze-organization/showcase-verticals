import type { EnumerationRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";

/**
 * Shared enumeration backing the `MediaFit` rendering parameter — how the
 * image fills its media box, orthogonal to `media-aspect@1` (the box's
 * shape) and `media-shape@1` (the box's framing). Lands at
 * `<enumerationsRoot>/Card/MediaFit`.
 *
 * Reference from a component recipe via `sitecore.enumHandle:
 * "media-fit@1"`. Components map each value to literal classes — see
 * `MEDIA_FIT_CLASSES` in `@/lib/registry/media-fit`.
 *
 * `cover` is the default and the pre-existing behaviour: scale up to fill
 * the box, crop the overflow. Right for photography. `contain` fits the
 * image whole inside the box with its aspect preserved — bind it when the
 * media's EDGES CARRY MEANING and cropping destroys it: brand marks and
 * logos, partner/sponsor/analyst/award badges, certification seals,
 * product cut-outs, UI screenshots.
 */
export const mediaFitEnumRecipe = {
  kind: "enumeration",
  schemaVersion: "1",
  handle: "media-fit@1",
  name: "MediaFit",
  displayName: "Media Fit",
  description:
    "How the image fills its media box. `cover` (default) scales up to fill and crops the overflow — right for photography. `contain` fits the whole image inside the box, preserving its aspect and leaving space around it — bind for logos, brand marks, badges, seals, product cut-outs and screenshots, whose edges carry meaning.",
  location: { scope: "site", folder: ["Card"] },
  default: "cover",
  values: [
    { name: "cover", displayName: "Cover (fill and crop)" },
    { name: "contain", displayName: "Contain (fit whole, never crop)" },
  ],
} satisfies EnumerationRecipe;

export default mediaFitEnumRecipe;
