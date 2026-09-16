import type { DesignParametersTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import {
  CARD_CAROUSEL_PARAMS,
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
  CARD_MEDIA_ASPECT_PARAMS,
  CARD_STYLING_PARAMS,
} from "../lib/registry/card-list-shared-params";

/**
 * Shared rendering-parameters template for every carousel rendering in
 * the cards-and-lists family (`<family>-carousel` renderings).
 *
 * Same base set as `card-list-grid-params@1` but swaps the grid
 * breakpoint columns for carousel viewport + behavior params (slides
 * per view, autoplay, loop, navigation, pagination style). The
 * list-grid and carousel renderings of the same family are marked as
 * compatible renderings — authors swap layout without re-binding the
 * datasource because both renderings share the family's datasource
 * template shape.
 */
export const cardCarouselParamsRecipe = {
  kind: "design-parameters-template",
  schemaVersion: "1",
  handle: "card-carousel-params@1",
  name: "card-carousel-params",
  displayName: "Card Carousel Parameters",
  description:
    "Shared rendering-parameters template for every carousel rendering across the cards-and-lists family — heading layout, slides per view, autoplay, navigation, pagination, card styling, analytics. Includes OverlapTop (overlap-top@1): set `quarter`/`half`/`full` to float the card row up over the previous section — use when the source shows cards overlapping the hero's bottom edge.",
  section: { handle: "cards-and-lists-section@1" },
  params: [
    ...CARD_LIST_BASE_PARAMS,
    ...CARD_CAROUSEL_PARAMS,
    ...CARD_STYLING_PARAMS,
    ...CARD_MEDIA_ASPECT_PARAMS,
    ...CARD_EMPTY_STATE_PARAMS,
  ],
} satisfies DesignParametersTemplateRecipe;

export default cardCarouselParamsRecipe;
