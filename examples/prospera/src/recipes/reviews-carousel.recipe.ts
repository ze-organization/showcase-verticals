import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  CARD_CAROUSEL_PARAMS,
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
  CARD_STYLING_PARAMS,
} from "../lib/registry/card-list-shared-params";
import {
  REVIEW_CARD_VARIANT_PARAM,
  REVIEW_COMPACT_SLIDE_VARIANT_PARAM,
  REVIEW_SHOW_IMAGES_PARAM,
} from "./_family-params";

/**
 * Recipe for `ReviewsCarousel` — carousel layout rendering for the
 * reviews family. Same datasource shape as `reviews-list-grid@1`, so
 * the two are marked compatible (authors swap layout via the
 * rendering picker without re-binding their reviews).
 *
 * References `card-carousel-params@1` for autoplay, slides per view,
 * navigation, pagination, and the shared base/styling params.
 */
export const reviewsCarouselRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "reviews-carousel@1",
  icon: componentIcons["reviews-carousel@1"],
  name: "reviews-carousel",
  displayName: "Reviews Carousel",
  description:
    "Reviews carousel. Same datasource as reviews-list-grid (composed / curated / search). Variants: CarouselCard, CarouselQuote, FullBleed, Hero, FeatureSpotlight.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "What customers are saying",
        ar: "ماذا يقول عملاؤنا",
        es: "Lo que dicen nuestros clientes",
        fr: "Ce que disent nos clients",
        de: "Das sagen unsere Kunden",
        da: "Det siger vores kunder",
        ja: "お客様の声",
        "zh-CN": "客户评价",
        "zh-TW": "客戶評價",
        it: "Cosa dicono i clienti",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the reviews.",
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
      name: "Reviews",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick review-card items. Leave empty to use the placeholder for composed mode, or populate SearchConfig for search mode.",
        source: { kind: "filter", types: ["review-card@1"] },
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
  // Inline params (not `parameters: { handle }`): see reviews-list-grid —
  // the shared external template can't carry `CardVariant`/`ShowImages`.
  params: [
    ...CARD_LIST_BASE_PARAMS,
    ...CARD_CAROUSEL_PARAMS,
    ...CARD_STYLING_PARAMS,
    // `CARD_MEDIA_ASPECT_PARAMS` deliberately NOT spread here. This
    // family's card contains no reference to `mediaAspect` at all, so
    // the value was adapted, folded into the chrome object, spread onto
    // the card as a prop and dropped — an authoring control that could
    // not do anything. Articles and features honour the pair; see the
    // export's own doc comment in card-list-shared-params.ts.
    ...CARD_EMPTY_STATE_PARAMS,
    REVIEW_CARD_VARIANT_PARAM,
    REVIEW_COMPACT_SLIDE_VARIANT_PARAM,
    REVIEW_SHOW_IMAGES_PARAM,
  ],
  variants: [
    { name: "CarouselCard" },
    { name: "CarouselQuote" },
    { name: "FullBleed" },
    { name: "Hero" },
    { name: "FeatureSpotlight" },
  ],
  dynamicPlaceholders: true,

  placeholders: [
    {
      key: "cards-reviews-{*}",
      allowedRenderingHandles: ["review-card@1"],
    },
  ],
  placedIn: ["headless-main-{*}", "search-results-{*}"],



  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create items directly under this rendering's datasource via
  // Insert, then reference them from the curated Treelist.
  insertOptions: ["review-card@1"],

  // Folder template Insert Options so Sitecore Insert surfaces the
  // card/item type under each folder instance.
  children: { allowedHandles: ["review-card@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Reviews" },
      { scope: "site", subfolder: "Reviews" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default reviewsCarouselRecipe;
