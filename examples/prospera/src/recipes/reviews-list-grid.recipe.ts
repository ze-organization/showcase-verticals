import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
  CARD_LIST_GRID_PARAMS,
  CARD_STYLING_PARAMS,
} from "../lib/registry/card-list-shared-params";
import {
  REVIEW_CARD_VARIANT_PARAM,
  REVIEW_SHOW_IMAGES_PARAM,
} from "./_family-params";

/**
 * Recipe for `ReviewsListGrid` — the list/grid layout rendering for
 * the reviews family. References `card-list-grid-params@1` for all
 * styling/layout params. Datasource carries:
 *
 *   - `Title`, `Lead`     — heading copy
 *   - `Reviews`           — curated Treelist of review-card@1 items
 *   - `SearchConfig`      — Plugin field; populated only in search mode
 *
 * Component dispatches by which is populated. Composed mode uses the
 * `cards-reviews-{*}` placeholder (insertOptions restrict to
 * `review-card@1`).
 *
 * Marked as compatible with `reviews-carousel@1` via the shared
 * datasource template — swapping renderings preserves data.
 */
export const reviewsListGridRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "reviews-list-grid@1",
  icon: componentIcons["reviews-list-grid@1"],
  name: "reviews-list-grid",
  displayName: "Reviews List / Grid",
  description:
    "Reviews list or grid. Composed (placeholder children), curated (Treelist), or search-driven (when nested in a search-experience). Variants: GridCard, GridQuote, ListQuote.",
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
        hint: "Curated mode — pick review-card items to list. Leave empty to use the placeholder for composed mode, or populate SearchConfig for search mode.",
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
        hint: "Search-mode config blob. Populated via the sai/search-source Marketplace plugin (filters, sort, personalization). Ignored unless this rendering is nested inside a reviews-search-experience.",
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
  // Inline params (not `parameters: { handle }`): the shared external
  // template can't carry the family-specific `CardVariant`/`ShowImages`
  // axes. Spread the shared groups + family params.
  params: [
    ...CARD_LIST_BASE_PARAMS,
    ...CARD_LIST_GRID_PARAMS,
    ...CARD_STYLING_PARAMS,
    // `CARD_MEDIA_ASPECT_PARAMS` deliberately NOT spread here. This
    // family's card contains no reference to `mediaAspect` at all, so
    // the value was adapted, folded into the chrome object, spread onto
    // the card as a prop and dropped — an authoring control that could
    // not do anything. Articles and features honour the pair; see the
    // export's own doc comment in card-list-shared-params.ts.
    ...CARD_EMPTY_STATE_PARAMS,
    REVIEW_CARD_VARIANT_PARAM,
    REVIEW_SHOW_IMAGES_PARAM,
  ],
  variants: [
    { name: "GridCard" },
    { name: "GridQuote" },
    { name: "ListQuote" },
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

export default reviewsListGridRecipe;
