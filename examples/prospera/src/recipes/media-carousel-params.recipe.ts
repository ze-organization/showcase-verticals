import type { DesignParametersTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import {
  CARD_CAPTION_PARAMS,
  CARD_CAROUSEL_PARAMS,
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
} from "../lib/registry/card-list-shared-params";

/**
 * Rendering-parameters template for `media-carousel@1`. Same shared
 * carousel set as `card-carousel-params@1`, plus the media-only
 * `CaptionStyle` axis — kept on its own template so the caption knob
 * doesn't leak onto the other carousel families that share the base
 * template but don't render media captions.
 */
export const mediaCarouselParamsRecipe = {
  kind: "design-parameters-template",
  schemaVersion: "1",
  handle: "media-carousel-params@1",
  name: "media-carousel-params",
  displayName: "Media Carousel Parameters",
  description:
    "Rendering-parameters template for the media-carousel — the shared carousel params plus the media-only CaptionStyle axis.",
  section: { handle: "cards-and-lists-section@1" },
  params: [
    ...CARD_LIST_BASE_PARAMS,
    ...CARD_CAROUSEL_PARAMS,
    // Card chrome (CARD_STYLING_PARAMS) intentionally NOT spread here:
    // media tiles render through `MediaItemFigure` (a bare <figure>),
    // not the ItemCard shell, so Appearance/Elevation/Padding/Style/
    // CardColorScheme/ColorBand/MediaBleed would be dead params. The
    // one applicable axis is the media aspect ratio, declared below.
    {
      name: "MediaAspect",
      shape: "enum" as const,
      sitecore: {
        enumHandle: "media-aspect@1",
        hint: "Aspect ratio for each media frame (16x9 / 4x5 / 3x4 / 1x1). Unset keeps the layout's own preset.",
        section: "Card",
        sortOrder: 120,
      },
    },
    ...CARD_CAPTION_PARAMS,
    ...CARD_EMPTY_STATE_PARAMS,
  ],
} satisfies DesignParametersTemplateRecipe;

export default mediaCarouselParamsRecipe;
