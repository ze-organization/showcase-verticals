import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  CARD_CAROUSEL_PARAMS,
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
  CARD_MEDIA_ASPECT_PARAMS,
  CARD_STYLING_PARAMS,
  CARD_TITLE_LINK_ICON_PARAM,
} from "../lib/registry/card-list-shared-params";
import {
  LOCATION_CARD_VARIANT_PARAM,
  LOCATION_COMPACT_SLIDE_VARIANT_PARAM,
} from "./_family-params";

/**
 * Recipe for `LocationsCarousel` — carousel layout rendering for the
 * locations family. Same datasource shape as `locations-list-grid@1`,
 * so the two are marked compatible (authors swap layout via the
 * rendering picker without re-binding their locations).
 *
 * References `card-carousel-params@1` for autoplay, slides per view,
 * navigation, pagination, and the shared base/styling params.
 *
 * Two variants:
 *   Default   — carousel only (no map slot).
 *   MapAbove  — full-width `locations-map-{*}` placeholder above the
 *               carousel. Authors drop any map block into that slot.
 */
export const locationsCarouselRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "locations-carousel@1",
  icon: componentIcons["locations-carousel@1"],
  name: "locations-carousel",
  displayName: "Locations Carousel",
  description:
    "Locations carousel. Same datasource as locations-list-grid (composed / curated / search). Variants: Default, MapAbove (full-width map placeholder above), FullBleed, Hero, WithPreviewBelow, FeatureSpotlight.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Nearby locations",
        ar: "المواقع القريبة",
        es: "Ubicaciones cercanas",
        fr: "Emplacements à proximité",
        de: "Standorte in der Nähe",
        da: "Steder i nærheden",
        ja: "近くの場所",
        "zh-CN": "附近地点",
        "zh-TW": "附近地點",
        it: "Sedi nelle vicinanze",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the locations.",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Lead",
      shape: "richText",
      sitecore: {
        type: "rich-text",
        hint: "Supporting copy under the title.",
        section: "Content",
        sortOrder: 200,
      },
    },
    {
      name: "Locations",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick location-card items. Leave empty to use the placeholder for composed mode, or populate SearchConfig for search mode.",
        source: { kind: "filter", types: ["location-card@1"] },
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "SearchConfig",
      shape: "text",
      sitecore: {
        type: "Plugin",
        hint: "Search-mode config blob. Populated via the sai/list-source Marketplace plugin.",
        source: {
          kind: "plugin",
          id: "sai/list-source",
          defaultAppId: "a559eb70-e5c3-4b3c-a0de-84def425a9c4",
        },
        section: "Search",
        sortOrder: 100,
      },
    },
  ],
  // Inline (not `parameters: { handle }`) so the synthesised per-recipe
  // parameters template can carry the `_IDynamicPlaceholder` base
  // template required by `dynamicPlaceholders: true` below. scai forbids
  // adding `_IDynamicPlaceholder` to a shared external params template
  // since that would silently affect every other consumer.
  params: [
    ...CARD_LIST_BASE_PARAMS,
    ...CARD_CAROUSEL_PARAMS,
    ...CARD_STYLING_PARAMS,
    CARD_TITLE_LINK_ICON_PARAM,
    ...CARD_MEDIA_ASPECT_PARAMS,
    ...CARD_EMPTY_STATE_PARAMS,
    // Carousel-only card-shape axis — the locations list-grid adapter
    // does not read CardVariant, so it stays off that rendering.
    LOCATION_CARD_VARIANT_PARAM,
    LOCATION_COMPACT_SLIDE_VARIANT_PARAM,
  ],
  variants: [
    { name: "Default" },
    { name: "MapAbove" },
    { name: "FullBleed" },
    { name: "Hero" },
    { name: "WithPreviewBelow" },
    { name: "FeatureSpotlight" },
  ],
  dynamicPlaceholders: true,
  placeholders: [
    {
      key: "cards-locations-{*}",
      allowedRenderingHandles: ["location-card@1"],
    },
    {
      key: "locations-map-{*}",
    },
  ],
  placedIn: ["headless-main-{*}", "search-results-{*}"],



  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create items directly under this rendering's datasource via
  // Insert, then reference them from the curated Treelist.
  insertOptions: ["location-card@1"],

  // Folder template Insert Options so Sitecore Insert surfaces the
  // card/item type under each folder instance.
  children: { allowedHandles: ["location-card@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Locations" },
      { scope: "site", subfolder: "Locations" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default locationsCarouselRecipe;
