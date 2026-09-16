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
  DESTINATION_CARD_VARIANT_PARAM,
  DESTINATION_COMPACT_SLIDE_VARIANT_PARAM,
  DESTINATION_PRICE_TREATMENT_PARAM,
} from "./_family-params";

/**
 * Recipe for `DestinationsCarousel` — carousel layout rendering for the
 * destinations family. Same datasource shape as
 * `destinations-list-grid@1`, so the two are marked compatible (authors
 * swap layout via the rendering picker without re-binding their
 * destinations).
 *
 * References `card-carousel-params@1` for autoplay, slides per view,
 * navigation, pagination, and the shared base/styling params.
 */
export const destinationsCarouselRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "destinations-carousel@1",
  icon: componentIcons["destinations-carousel@1"],
  name: "destinations-carousel",
  displayName: "Destinations Carousel",
  description:
    "Destinations carousel. Same datasource as destinations-list-grid (composed / curated / search). Variants: Default, FullBleed, WithPreviewBelow, Hero, FeatureSpotlight.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Eyebrow",
      shape: "text",
      sitecore: {
        type: "single-line-text",
        hint: "Optional kicker line above the title — rendered as a small-caps eyebrow. Populate when the source shows a short label above the section headline (centered small-caps kicker + large title → Eyebrow + HeadingSize xl + HeadingLayout centered).",
        section: "Content",
        sortOrder: 100,
      },
    },
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Featured destinations",
        ar: "وجهات مميّزة",
        es: "Destinos destacados",
        fr: "Destinations à la une",
        de: "Empfohlene Reiseziele",
        da: "Fremhævede destinationer",
        ja: "おすすめの目的地",
        "zh-CN": "精选目的地",
        "zh-TW": "精選目的地",
        it: "Destinazioni in evidenza",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the destinations.",
        section: "Content",
        sortOrder: 110,
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
      name: "Destinations",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick destination-card items. Leave empty to use the placeholder for composed mode, or populate SearchConfig for search mode.",
        source: { kind: "filter", types: ["destination-card@1"] },
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "SearchConfig",
      shape: "text",
      sitecore: {
        type: "Plugin",
        hint: "Search-mode config blob. Populated via the sai/search-source Marketplace plugin.",
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
  // Inline params (not `parameters: { handle }`): see destinations-list-grid
  // — the shared external template can't carry `CardVariant`/`PriceTreatment`.
  params: [
    ...CARD_LIST_BASE_PARAMS,
    ...CARD_CAROUSEL_PARAMS,
    ...CARD_STYLING_PARAMS,
    CARD_TITLE_LINK_ICON_PARAM,
    ...CARD_MEDIA_ASPECT_PARAMS,
    ...CARD_EMPTY_STATE_PARAMS,
    DESTINATION_CARD_VARIANT_PARAM,
    DESTINATION_COMPACT_SLIDE_VARIANT_PARAM,
    DESTINATION_PRICE_TREATMENT_PARAM,
  ],
  variants: [
    { name: "Default" },
    { name: "FullBleed" },
    { name: "WithPreviewBelow" },
    { name: "Hero" },
    { name: "FeatureSpotlight" },
  ],
  dynamicPlaceholders: true,

  placeholders: [
    {
      key: "cards-destinations-{*}",
      allowedRenderingHandles: ["destination-card@1"],
    },
  ],
  placedIn: ["headless-main-{*}", "search-results-{*}"],



  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create items directly under this rendering's datasource via
  // Insert, then reference them from the curated Treelist.
  insertOptions: ["destination-card@1"],

  // Folder template Insert Options so Sitecore Insert surfaces the
  // card/item type under each folder instance.
  children: { allowedHandles: ["destination-card@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Destinations" },
      { scope: "site", subfolder: "Destinations" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default destinationsCarouselRecipe;
