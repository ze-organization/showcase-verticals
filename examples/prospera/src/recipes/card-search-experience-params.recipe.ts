import type { DesignParametersTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import {
  CARD_LIST_BASE_PARAMS,
  CARD_SEARCH_EXPERIENCE_PARAMS,
} from "../lib/registry/card-list-shared-params";

/**
 * Shared rendering-parameters template for every `<family>-search-experience`
 * wrapper container in the cards-and-lists family.
 *
 * The wrapper owns the search controller (via `useSearchResults`) and
 * provides controller state to descendant bar renderings + the inner
 * list-grid or carousel rendering via React context. Params drive the
 * default layout (facet placement, sticky controls), the initial
 * controller state (results per page, initial sort, default view), and
 * analytics.
 *
 * Carousel/grid styling params are absent here — the wrapper doesn't
 * render items itself; the inner list-grid/carousel rendering does and
 * carries its own styling params.
 */
export const cardSearchExperienceParamsRecipe = {
  kind: "design-parameters-template",
  schemaVersion: "1",
  handle: "card-search-experience-params@1",
  name: "card-search-experience-params",
  displayName: "Card Search Experience Parameters",
  description:
    "Shared rendering-parameters template for every search-experience wrapper container in the cards-and-lists family — facet placement, sticky controls, default view, initial sort, results per page, analytics.",
  section: { handle: "cards-and-lists-section@1" },
  params: [...CARD_LIST_BASE_PARAMS, ...CARD_SEARCH_EXPERIENCE_PARAMS],
} satisfies DesignParametersTemplateRecipe;

export default cardSearchExperienceParamsRecipe;
