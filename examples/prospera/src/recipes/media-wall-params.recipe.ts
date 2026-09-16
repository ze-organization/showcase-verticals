import type { DesignParametersTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import {
  CARD_CAPTION_PARAMS,
  CARD_EMPTY_STATE_PARAMS,
  CARD_HEADING_PLACEMENT_PARAM,
  CARD_LIST_BASE_PARAMS,
} from "../lib/registry/card-list-shared-params";

/**
 * Rendering-parameters template for `media-wall@1` (Mosaic + Collage +
 * Arc).
 *
 * Deliberately NOT the shared `card-list-grid-params@1`: photo walls
 * don't use per-breakpoint grid columns, gap-as-grid-gap, or card
 * styling (Appearance/Elevation/Padding), so those would be dead knobs.
 * Instead the wall exposes a single `Columns` count (both variants honor
 * it — Mosaic as the grid track count, Collage as the CSS masonry column
 * count), `Gap`, and `CaptionStyle`, plus the shared heading / color /
 * analytics params.
 */
export const mediaWallParamsRecipe = {
  kind: "design-parameters-template",
  schemaVersion: "1",
  handle: "media-wall-params@1",
  name: "media-wall-params",
  displayName: "Media Wall Parameters",
  description:
    "Rendering-parameters template for the media-wall (Mosaic/Collage/Arc) — column count, gap, caption style, arc placement/spread, plus the shared heading/color/analytics params. No grid-card params, which never applied to photo walls.",
  section: { handle: "cards-and-lists-section@1" },
  params: [
    ...CARD_LIST_BASE_PARAMS,
    CARD_HEADING_PLACEMENT_PARAM,
    {
      name: "Columns",
      shape: "enum",
      default: "4",
      sitecore: {
        enumHandle: "column-count@1",
        hint: "Column count on desktop (mobile stays 2). Mosaic maps it to the grid tracks; Collage to its CSS masonry columns.",
        section: "Layout",
        sortOrder: 100,
      },
    },
    {
      name: "Gap",
      shape: "enum",
      default: "md",
      sitecore: {
        enumHandle: "gap@1",
        hint: "Gap between tiles.",
        section: "Layout",
        sortOrder: 110,
      },
    },
    {
      name: "ContentPlacement",
      shape: "enum",
      default: "above",
      sitecore: {
        enumHandle: "band-content-placement@1",
        hint: "Arc variant only — where the heading sits relative to the photo arch: `above` (default — family's HeadingLayout) or `center` (heading + CTA in the well inside the fan). Mosaic/Collage ignore this; use HeadingLayout for alignment.",
        section: "Layout",
        sortOrder: 120,
      },
    },
    {
      name: "ArcSpread",
      shape: "enum",
      default: "wide",
      sitecore: {
        enumHandle: "arc-spread@1",
        hint: "Arc variant only — how far around the tile fan wraps: `wide` (~180°, default) or `tight` (~120°). Mosaic/Collage ignore this.",
        section: "Layout",
        sortOrder: 130,
      },
    },
    ...CARD_CAPTION_PARAMS,
    {
      name: "Lightbox",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Clicking a tile greys out the page and opens the post in a modal detail view (author, caption, date, view-post link) with previous/next paging — the social/UGC wall pattern. Off by default.",
        section: "Behavior",
        sortOrder: 200,
      },
    },
    {
      name: "LightboxEmbedPost",
      shape: "boolean",
      sitecore: {
        type: "checkbox",
        hint: "Inside the lightbox, swap the media half for the platform's own embed when the item has an Instagram permalink (PostUrl). Requires Lightbox.",
        section: "Behavior",
        sortOrder: 210,
      },
    },
    ...CARD_EMPTY_STATE_PARAMS,
  ],
} satisfies DesignParametersTemplateRecipe;

export default mediaWallParamsRecipe;
