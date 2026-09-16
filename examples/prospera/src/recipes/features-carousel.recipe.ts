import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  CARD_CAROUSEL_PARAMS,
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
  CARD_MEDIA_ASPECT_PARAMS,
  CARD_STYLING_PARAMS,
} from "../lib/registry/card-list-shared-params";

/**
 * Recipe for `FeaturesCarousel` — carousel layout rendering for the
 * features family. Same datasource shape as `features-list-grid@1`, so
 * the two are marked compatible (authors swap layout via the rendering
 * picker without re-binding their features).
 *
 * Features are less commonly carousel'd than offers/articles, but the
 * shape is supported for parity across the cards-and-lists family.
 *
 * References `card-carousel-params@1` for autoplay, slides per view,
 * navigation, pagination, and the shared base/styling params.
 */
export const featuresCarouselRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "features-carousel@1",
  icon: componentIcons["features-carousel@1"],
  name: "features-carousel",
  displayName: "Features Carousel",
  description:
    "Features carousel. Same datasource as features-list-grid (composed / curated / search). Variants: Default, FullBleed, Hero, FeatureSpotlight.",
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
        en: "Features",
        ar: "الميزات",
        es: "Características",
        fr: "Fonctionnalités",
        de: "Funktionen",
        da: "Funktioner",
        ja: "機能",
        "zh-CN": "功能",
        "zh-TW": "功能",
        it: "Funzionalità",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the features.",
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
      name: "Features",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick feature-card items. Leave empty to use the placeholder for composed mode, or populate SearchConfig for search mode.",
        source: { kind: "filter", types: ["feature-card@1"] },
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
  params: [
    ...CARD_LIST_BASE_PARAMS,
    ...CARD_CAROUSEL_PARAMS,
    ...CARD_STYLING_PARAMS,
    ...CARD_MEDIA_ASPECT_PARAMS,
    ...CARD_EMPTY_STATE_PARAMS,
  ],
  variants: [
    { name: "Default" },
    { name: "FullBleed" },
    { name: "Hero" },
    { name: "FeatureSpotlight" },
  ],
  dynamicPlaceholders: true,

  placeholders: [
    {
      key: "cards-features-{*}",
      allowedRenderingHandles: ["feature-card@1"],
    },
  ],
  placedIn: ["headless-main-{*}", "search-results-{*}"],



  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create items directly under this rendering's datasource via
  // Insert, then reference them from the curated Treelist.
  insertOptions: ["feature-card@1"],

  // Folder template Insert Options so Sitecore Insert surfaces the
  // card/item type under each folder instance.
  children: { allowedHandles: ["feature-card@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Features" },
      { scope: "site", subfolder: "Features" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default featuresCarouselRecipe;
