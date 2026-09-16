import type { DesignParametersTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import {
  CARD_CTA_ICON_TRAILING_PARAM,
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
  CARD_LIST_GRID_PARAMS,
  CARD_MEDIA_ASPECT_PARAMS,
  CARD_STYLING_PARAMS,
} from "../lib/registry/card-list-shared-params";

/**
 * Shared rendering-parameters template for every list-grid rendering
 * in the cards-and-lists family (`<family>-list-grid` renderings — see
 * the offers/products/articles/destinations/etc. families).
 *
 * Covers: heading layout, color scheme, grid breakpoint columns, gap,
 * card surface/elevation/padding, filter mode, empty-state, and
 * analytics. Family-specific choices (CardVariant, Action) live on each
 * family's datasource template, NOT here — that's how the same template
 * can be shared across families without forcing a per-family extension
 * chain (which the recipe schema doesn't support).
 */
export const cardListGridParamsRecipe = {
  kind: "design-parameters-template",
  schemaVersion: "1",
  handle: "card-list-grid-params@1",
  name: "card-list-grid-params",
  displayName: "Card List / Grid Parameters",
  description:
    "Shared rendering-parameters template for every list-grid rendering across the cards-and-lists family — heading layout, columns, card styling, filter mode, analytics. Layout axes bind directly from the measured grid signature: ColumnsLg/Md/Sm from the measured columns, Gap from gapPx, FeaturedFirst (featured-first@1) `wide`/`tall` when the source's first tile spans two columns/rows, TileAspect (tile-aspect@1) from the measured tileAspect (~1.0 square, >1.3 landscape, <0.8 portrait). Includes OverlapTop (overlap-top@1): set `quarter`/`half`/`full` to float the card row up over the previous section — use when the source shows cards overlapping the hero's bottom edge.",
  section: { handle: "cards-and-lists-section@1" },
  params: [
    ...CARD_LIST_BASE_PARAMS,
    ...CARD_LIST_GRID_PARAMS,
    ...CARD_STYLING_PARAMS,
    ...CARD_MEDIA_ASPECT_PARAMS,
    CARD_CTA_ICON_TRAILING_PARAM,
    ...CARD_EMPTY_STATE_PARAMS,
  ],
} satisfies DesignParametersTemplateRecipe;

export default cardListGridParamsRecipe;
