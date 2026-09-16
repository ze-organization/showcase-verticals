import type { ComponentTemplateRecipe } from "@sitecoreai-labs/sitecoreai-cli/recipe";
import { componentIcons } from "./_component-icons";
import {
  CARD_EMPTY_STATE_PARAMS,
  CARD_LIST_BASE_PARAMS,
  CARD_LIST_GRID_PARAMS,
  CARD_MEDIA_ASPECT_PARAMS,
  CARD_STYLING_PARAMS,
  CARD_TITLE_LINK_ICON_PARAM,
} from "../lib/registry/card-list-shared-params";
import { PRODUCT_CARD_VARIANT_PARAM } from "./_family-params";

/**
 * Recipe for `ProductsListGrid` — the list/grid layout rendering for
 * the products family. References `card-list-grid-params@1` for all
 * styling/layout params. Datasource carries:
 *
 *   - `Title`, `Lead`     — heading copy
 *   - `Products`          — curated Treelist of product-card@1 items
 *   - `SearchConfig`      — Plugin field; populated only in search mode
 *
 * Component dispatches by which is populated. Composed mode uses the
 * `cards-products-{*}` placeholder (insertOptions restrict to
 * `product-card@1`).
 *
 * Marked as compatible with `products-carousel@1` via the shared
 * datasource template — swapping renderings preserves data.
 */
export const productsListGridRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "products-list-grid@1",
  icon: componentIcons["products-list-grid@1"],
  name: "products-list-grid",
  displayName: "Products List / Grid",
  description:
    "Products list or grid. Composed (placeholder children), curated (Treelist), or search-driven (when nested in a search-experience). Variants: Grid, Featured, FiftyFifty, NoSpacing.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Featured products",
        ar: "منتجات مميّزة",
        es: "Productos destacados",
        fr: "Produits à la une",
        de: "Empfohlene Produkte",
        da: "Fremhævede produkter",
        ja: "おすすめ商品",
        "zh-CN": "精选商品",
        "zh-TW": "精選商品",
        it: "Prodotti in evidenza",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the products.",
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
      name: "Products",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick product-card items to list. Leave empty to use the placeholder for composed mode, or populate SearchConfig for search mode.",
        source: { kind: "filter", types: ["product-card@1"] },
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "SearchConfig",
      shape: "text",
      sitecore: {
        type: "Plugin",
        hint: "Search-mode config blob. Populated via the sai/search-source Marketplace plugin (filters, sort, personalization). Ignored unless this rendering is nested inside a products-search-experience.",
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
  // template can't carry the family-specific `CardVariant` axis.
  params: [
    ...CARD_LIST_BASE_PARAMS,
    ...CARD_LIST_GRID_PARAMS,
    ...CARD_STYLING_PARAMS,
    CARD_TITLE_LINK_ICON_PARAM,
    ...CARD_MEDIA_ASPECT_PARAMS,
    ...CARD_EMPTY_STATE_PARAMS,
    PRODUCT_CARD_VARIANT_PARAM,
  ],
  variants: [
    { name: "Grid" },
    { name: "Featured" },
    { name: "FiftyFifty" },
    { name: "NoSpacing" },
  ],
  dynamicPlaceholders: true,

  placeholders: [
    {
      key: "cards-products-{*}",
      allowedRenderingHandles: ["product-card@1"],
    },
  ],
  placedIn: ["headless-main-{*}", "search-results-{*}"],



  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create items directly under this rendering's datasource via
  // Insert, then reference them from the curated Treelist.
  insertOptions: ["product-card@1"],

  // Folder template Insert Options so Sitecore Insert surfaces the
  // card/item type under each folder instance.
  children: { allowedHandles: ["product-card@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Products" },
      { scope: "site", subfolder: "Products" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default productsListGridRecipe;
