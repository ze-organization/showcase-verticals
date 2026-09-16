import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  CARD_CAROUSEL_PARAMS,
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
  CARD_MEDIA_ASPECT_PARAMS,
  CARD_MEDIA_SHAPE_PARAM,
  CARD_STYLING_PARAMS,
  CARD_TITLE_LINK_ICON_PARAM,
} from "../lib/registry/card-list-shared-params";
import {
  PERSON_CARD_VARIANT_PARAM,
  PERSON_COMPACT_SLIDE_VARIANT_PARAM,
} from "./_family-params";

/**
 * Recipe for `PersonCarousel` — carousel layout rendering for the
 * persons family. Same datasource shape as `person-list-grid@1`,
 * so the two are marked compatible (authors swap layout via the
 * rendering picker without re-binding their people).
 *
 * References `card-carousel-params@1` for autoplay, slides per view,
 * navigation, pagination, and the shared base/styling params.
 */
export const personCarouselRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "person-carousel@1",
  icon: componentIcons["person-carousel@1"],
  name: "person-carousel",
  displayName: "Person Carousel",
  description:
    "People carousel (staff bios, doctor rosters, leadership teams). Same datasource as person-list-grid (composed / curated / search). Variants: Default, FullBleed, WithPreviewBelow, Hero, FeatureSpotlight.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Meet the team",
        ar: "تعرّف على الفريق",
        es: "Conoce al equipo",
        fr: "Découvrez l'équipe",
        de: "Das Team",
        da: "Mød teamet",
        ja: "チーム紹介",
        "zh-CN": "团队介绍",
        "zh-TW": "團隊介紹",
        it: "Il nostro team",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the people.",
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
      name: "Persons",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick person-card items. Leave empty to use the placeholder for composed mode, or populate SearchConfig for search mode.",
        source: { kind: "filter", types: ["person-card@1"] },
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
  // Inline params (not `parameters: { handle }`): see person-list-grid —
  // the shared external template can't carry the `CardVariant` axis.
  params: [
    ...CARD_LIST_BASE_PARAMS,
    ...CARD_CAROUSEL_PARAMS,
    ...CARD_STYLING_PARAMS,
    CARD_TITLE_LINK_ICON_PARAM,
    CARD_MEDIA_SHAPE_PARAM,
    ...CARD_MEDIA_ASPECT_PARAMS,
    ...CARD_EMPTY_STATE_PARAMS,
    PERSON_CARD_VARIANT_PARAM,
    PERSON_COMPACT_SLIDE_VARIANT_PARAM,
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
      key: "cards-persons-{*}",
      allowedRenderingHandles: ["person-card@1"],
    },
  ],
  placedIn: ["headless-main-{*}", "search-results-{*}"],



  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create items directly under this rendering's datasource via
  // Insert, then reference them from the curated Treelist.
  insertOptions: ["person-card@1"],

  // Folder template Insert Options so Sitecore Insert surfaces the
  // card/item type under each folder instance.
  children: { allowedHandles: ["person-card@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "People" },
      { scope: "site", subfolder: "People" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default personCarouselRecipe;
