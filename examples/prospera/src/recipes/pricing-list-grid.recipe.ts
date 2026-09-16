import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  CARD_CTA_ICON_TRAILING_PARAM,
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
  CARD_LIST_GRID_PARAMS,
  CARD_MEDIA_ASPECT_PARAMS,
  CARD_STYLING_PARAMS,
} from "../lib/registry/card-list-shared-params";

/**
 * Recipe for `PricingListGrid` — the list/grid layout rendering for
 * the pricing family. References `card-list-grid-params@1` for all
 * styling/layout params. Datasource carries:
 *
 *   - `Title`, `Lead`     — heading copy
 *   - `Plans`             — curated Treelist of pricing-card@1 items
 *   - `SearchConfig`      — Plugin field; populated only in search mode
 *
 * Component dispatches by which is populated. Composed mode uses the
 * `cards-pricing-{*}` placeholder (insertOptions restrict to
 * `pricing-card@1`).
 *
 * Marked as compatible with `pricing-carousel@1` via the shared
 * datasource template — swapping renderings preserves data.
 */
export const pricingListGridRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "pricing-list-grid@1",
  icon: componentIcons["pricing-list-grid@1"],
  name: "pricing-list-grid",
  displayName: "Pricing List / Grid",
  description:
    "Pricing list or grid. Composed (placeholder children), curated (Treelist), or search-driven (when nested in a search-experience). Variants: Grid.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Pricing that scales with you",
        ar: "أسعار تنمو معك",
        es: "Precios que crecen contigo",
        fr: "Des tarifs qui évoluent avec vous",
        de: "Preise, die mit Ihnen wachsen",
        da: "Priser, der vokser med dig",
        ja: "成長に合わせた料金プラン",
        "zh-CN": "随需扩展的定价",
        "zh-TW": "隨需擴展的定價",
        it: "Prezzi che crescono con te",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the pricing plans.",
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
      name: "Plans",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick pricing-card items to list. Leave empty to use the placeholder for composed mode, or populate SearchConfig for search mode.",
        source: { kind: "filter", types: ["pricing-card@1"] },
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "SearchConfig",
      shape: "text",
      sitecore: {
        type: "Plugin",
        hint: "Search-mode config blob. Populated via the sai/search-source Marketplace plugin (filters, sort, personalization). Ignored unless this rendering is nested inside a pricing-search-experience.",
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
    ...CARD_LIST_GRID_PARAMS,
    ...CARD_STYLING_PARAMS,
    ...CARD_MEDIA_ASPECT_PARAMS,
    CARD_CTA_ICON_TRAILING_PARAM,
    ...CARD_EMPTY_STATE_PARAMS,
  ],
  variants: [{ name: "Grid" }],
  dynamicPlaceholders: true,

  placeholders: [
    {
      key: "cards-pricing-{*}",
      allowedRenderingHandles: ["pricing-card@1"],
    },
  ],
  placedIn: ["headless-main-{*}", "search-results-{*}"],



  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create items directly under this rendering's datasource via
  // Insert, then reference them from the curated Treelist.
  insertOptions: ["pricing-card@1"],

  // Folder template Insert Options so Sitecore Insert surfaces the
  // card/item type under each folder instance.
  children: { allowedHandles: ["pricing-card@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Pricing" },
      { scope: "site", subfolder: "Pricing" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default pricingListGridRecipe;
