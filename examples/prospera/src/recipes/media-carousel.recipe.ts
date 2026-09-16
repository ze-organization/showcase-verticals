import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  CARD_CAPTION_PARAMS,
  CARD_CAROUSEL_PARAMS,
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
} from "../lib/registry/card-list-shared-params";

/**
 * Recipe for `MediaCarousel` — carousel rendering for the media family.
 * Datasource carries Title, Lead, and SearchConfig. Authors drop
 * `media-item@1` renderings into the `cards-media-carousel-{*}`
 * placeholder (hero-carousel authoring model).
 *
 * Shares the `media-item@1` card recipe with `media-gallery-list-grid`
 * — the search-experience wrapper allows either rendering in its
 * results placeholder.
 *
 * References `card-carousel-params@1` for autoplay, slides per view,
 * navigation, pagination, and the shared base/styling params.
 */
export const mediaCarouselRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "media-carousel@1",
  icon: componentIcons["media-carousel@1"],
  name: "media-carousel",
  displayName: "Media Carousel",
  description:
    "Media carousel (images and videos). Composed, curated (Treelist of media-item), or search-driven. Variants: Default, FullBleed, PreviewBelow, FeaturedImageLeft, FeatureSpotlight.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Media",
        ar: "الوسائط",
        es: "Multimedia",
        fr: "Médias",
        de: "Medien",
        da: "Medier",
        ja: "メディア",
        "zh-CN": "媒体",
        "zh-TW": "媒體",
        it: "Media",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the carousel.",
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
      name: "MediaItems",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick media items. Leave empty to use the placeholder for composed mode, or populate SearchConfig for search mode.",
        source: { kind: "filter", types: ["media-item@1"] },
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "SearchConfig",
      shape: "text",
      sitecore: {
        type: "Plugin",
        hint: "Search-mode config blob. Populated via the sai/search-source Marketplace plugin. Ignored unless this rendering is nested inside a media-carousel-search-experience.",
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
  variants: [
    { name: "Default" },
    { name: "FullBleed" },
    { name: "PreviewBelow" },
    { name: "FeaturedImageLeft" },
    { name: "FeatureSpotlight" },
    { name: "Peek" },
  ],
  dynamicPlaceholders: true,

  placeholders: [
    {
      key: "cards-media-carousel-{*}",
      allowedRenderingHandles: ["media-item@1"],
    },
  ],
  placedIn: ["headless-main-{*}", "search-results-{*}"],



  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create items directly under this rendering's datasource via
  // Insert, then reference them from the curated Treelist.
  insertOptions: ["media-item@1"],

  // Folder template Insert Options so Sitecore Insert surfaces the
  // card/item type under each folder instance.
  children: { allowedHandles: ["media-item@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Media" },
      { scope: "site", subfolder: "Media" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default mediaCarouselRecipe;
