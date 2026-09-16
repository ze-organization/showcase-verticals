import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  CARD_CAROUSEL_PARAMS,
  CARD_CTA_PLACEMENT_PARAM,
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
  CARD_MEDIA_ASPECT_PARAMS,
  CARD_STYLING_PARAMS,
  CARD_TITLE_LINK_ICON_PARAM,
} from "../lib/registry/card-list-shared-params";
import {
  ARTICLE_CARD_VARIANT_PARAM,
  ARTICLE_COMPACT_SLIDE_VARIANT_PARAM,
} from "./_family-params";

/**
 * Recipe for `ArticlesCarousel` — carousel layout rendering for the
 * articles family. Same datasource shape as `articles-list-grid@1`,
 * so the two are marked compatible (authors swap layout via the
 * rendering picker without re-binding their articles).
 *
 * References `card-carousel-params@1` for autoplay, slides per view,
 * navigation, pagination, and the shared base/styling params.
 */
export const articlesCarouselRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "articles-carousel@1",
  icon: componentIcons["articles-carousel@1"],
  name: "articles-carousel",
  displayName: "Articles Carousel",
  description:
    "Articles carousel. Same datasource as articles-list-grid (composed / curated / search). Variants: Default, FullBleed, WithPreviewBelow, Hero, FeatureSpotlight.",
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
        en: "Latest articles",
        ar: "أحدث المقالات",
        es: "Últimos artículos",
        fr: "Derniers articles",
        de: "Neueste Artikel",
        da: "Seneste artikler",
        ja: "最新記事",
        "zh-CN": "最新文章",
        "zh-TW": "最新文章",
        it: "Ultimi articoli",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the articles.",
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
      name: "Articles",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick article-card items. Leave empty to use the placeholder for composed mode, or populate SearchConfig for search mode.",
        source: { kind: "filter", types: ["article-card@1"] },
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
  // Inline params (not `parameters: { handle }`): see articles-list-grid —
  // the shared external `card-carousel-params@1` template can't carry the
  // family-specific `CardVariant` axis.
  params: [
    ...CARD_LIST_BASE_PARAMS,
    ...CARD_CAROUSEL_PARAMS,
    ...CARD_STYLING_PARAMS,
    CARD_TITLE_LINK_ICON_PARAM,
    ...CARD_MEDIA_ASPECT_PARAMS,
    CARD_CTA_PLACEMENT_PARAM,
    ...CARD_EMPTY_STATE_PARAMS,
    ARTICLE_CARD_VARIANT_PARAM,
    ARTICLE_COMPACT_SLIDE_VARIANT_PARAM,
  ],
  variants: [
    { name: "Default" },
    { name: "FullBleed" },
    { name: "WithPreviewBelow" },
    { name: "Hero" },
    { name: "FeatureSpotlight" },
    // Vertical story list beside an editorial split heading, with a
    // stacked up/down control column — pick when the source shows a
    // vertically-scrolling article/story rail (ketelone
    // "Garnished with Good").
    { name: "VerticalSplit" },
  ],
  dynamicPlaceholders: true,

  placeholders: [
    {
      key: "cards-articles-{*}",
      allowedRenderingHandles: ["article-card@1"],
    },
  ],
  placedIn: ["headless-main-{*}", "search-results-{*}"],



  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create items directly under this rendering's datasource via
  // Insert, then reference them from the curated Treelist.
  insertOptions: ["article-card@1"],

  // Folder template Insert Options so Sitecore Insert surfaces the
  // card/item type under each folder instance.
  children: { allowedHandles: ["article-card@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Articles" },
      { scope: "site", subfolder: "Articles" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default articlesCarouselRecipe;
