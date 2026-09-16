import type { DesignParametersTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import {
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
  CARD_LIST_GRID_PARAMS,
} from "../lib/registry/card-list-shared-params";

/**
 * Rendering-parameters template for `status-list@1`.
 *
 * Status tiles/rows are bespoke bordered panels, NOT ItemCard leaves —
 * the shared `card-list-grid-params@1` template it previously
 * referenced declared the whole CARD_STYLING_PARAMS chrome family
 * (Appearance / Elevation / Padding / Style / CardColorScheme /
 * ColorBand / MediaBleed / MediaAspect), none of which the component
 * renders. The AI page composer sets params verbatim from the recipe
 * contract, so those declared-but-dead params silently corrupted
 * generation. This template declares exactly what `status-list.tsx`
 * consumes: the section surface quartet, the heading layout/size axis,
 * the grid breakpoint columns + gap + lead-tile/pattern rhythm, and the
 * empty-state message.
 *
 * `HeadingLayout` / `HeadingSize` are kept: the section now resolves its
 * heading through the shared `resolveListingHeading` + `SectionHeading`
 * path every sibling listing uses. `OverlapTop` stays filtered out —
 * `status-list.tsx` renders its own section shell and never applies it.
 */
const KEPT_BASE_PARAM_NAMES = new Set([
  "HeadingLayout",
  "HeadingSize",
  "ColorScheme",
  "BackgroundIntensity",
  "PaddingY",
  "MaxWidth",
]);

export const statusListParamsRecipe = {
  kind: "design-parameters-template",
  schemaVersion: "1",
  handle: "status-list-params@1",
  name: "status-list-params",
  displayName: "Status List Parameters",
  description:
    "Rendering-parameters template for the status-list rendering — section surface, heading layout/size, grid columns/gap/pattern, and empty-state message. No card chrome: status tiles are bespoke panels, not ItemCard leaves.",
  section: { handle: "cards-and-lists-section@1" },
  params: [
    ...CARD_LIST_BASE_PARAMS.filter((param) =>
      KEPT_BASE_PARAM_NAMES.has(param.name),
    ),
    ...CARD_LIST_GRID_PARAMS,
    ...CARD_EMPTY_STATE_PARAMS,
  ],
} satisfies DesignParametersTemplateRecipe;

export default statusListParamsRecipe;
