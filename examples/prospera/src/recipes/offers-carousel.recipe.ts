import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  CARD_CAROUSEL_PARAMS,
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
  CARD_STYLING_PARAMS,
} from "../lib/registry/card-list-shared-params";
import {
  OFFER_ACTION_PARAM,
  OFFER_CARD_VARIANT_PARAM,
  OFFER_COMPACT_SLIDE_VARIANT_PARAM,
} from "./_family-params";

/**
 * Recipe for `OffersCarousel` — carousel layout rendering for the
 * offers family. Same datasource shape as `offers-list-grid@1`, so
 * the two are marked compatible (authors swap layout via the
 * rendering picker without re-binding their offers).
 *
 * References `card-carousel-params@1` for autoplay, slides per view,
 * navigation, pagination, and the shared base/styling params.
 */
export const offersCarouselRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "offers-carousel@1",
  icon: componentIcons["offers-carousel@1"],
  name: "offers-carousel",
  displayName: "Offers Carousel",
  description:
    "Offers carousel. Same datasource as offers-list-grid (composed / curated / search). Variants: Default, FullBleed, WithPreviewBelow, Hero, FeatureSpotlight.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "This week's offers",
        ar: "عروض هذا الأسبوع",
        es: "Ofertas de esta semana",
        fr: "Les offres de la semaine",
        de: "Angebote dieser Woche",
        da: "Denne uges tilbud",
        ja: "今週のお得な情報",
        "zh-CN": "本周优惠",
        "zh-TW": "本週優惠",
        it: "Le offerte di questa settimana",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the offers.",
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
      name: "Offers",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick offer-card items. Leave empty to use the placeholder for composed mode, or populate SearchConfig for search mode.",
        source: { kind: "filter", types: ["offer-card@1"] },
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
  // Inline params (not `parameters: { handle }`): see offers-list-grid —
  // the shared external template can't carry `CardVariant`/`Action`.
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
    OFFER_CARD_VARIANT_PARAM,
    OFFER_COMPACT_SLIDE_VARIANT_PARAM,
    OFFER_ACTION_PARAM,
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
      key: "cards-offers-{*}",
      allowedRenderingHandles: ["offer-card@1"],
    },
  ],
  placedIn: ["headless-main-{*}", "search-results-{*}"],



  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create items directly under this rendering's datasource via
  // Insert, then reference them from the curated Treelist.
  insertOptions: ["offer-card@1"],

  // Folder template Insert Options so Sitecore Insert surfaces the
  // card/item type under each folder instance.
  children: { allowedHandles: ["offer-card@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Offers" },
      { scope: "site", subfolder: "Offers" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default offersCarouselRecipe;
