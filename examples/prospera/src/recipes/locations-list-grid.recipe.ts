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

/**
 * Recipe for `LocationsListGrid` — the map-aware list/grid rendering
 * for the locations family. References `card-list-grid-params@1` for
 * all styling/layout params. Datasource carries:
 *
 *   - `Title`, `Lead`    — heading copy
 *   - `Locations`        — curated Treelist of location-card@1 items
 *   - `SearchConfig`     — Plugin field; populated only in search mode
 *
 * Component dispatches by which is populated. Composed mode uses the
 * `cards-locations-{*}` placeholder (insertOptions restrict to
 * `location-card@1`).
 *
 * Two placeholders, not one. The cards slot is restricted to
 * `location-card@1`. The map slot (`locations-map-{*}`) is
 * intentionally unrestricted — tenants drop in their own Mapbox /
 * Google / Leaflet implementation; no insertOptions because each
 * tenant builds + registers their own map rendering. When no map
 * rendering is composed, the React side renders a dashed placard.
 *
 * Variants:
 *   - `Grid` / `List`                — no map slot
 *   - `MapAndList`                   — map left, results right
 *   - `MapAbove`                     — map full-width on top, grid below
 *   - `MapWithSidebar`               — sticky map; cards scroll alongside
 */
export const locationsListGridRecipe = {
  kind: "component-template",
  schemaVersion: "1",
  handle: "locations-list-grid@1",
  icon: componentIcons["locations-list-grid@1"],
  name: "locations-list-grid",
  displayName: "Locations List / Grid",
  description:
    "Locations list or grid, with map-aware layout variants. Composed (placeholder children), curated (Treelist), or search-driven (when nested in a search-experience). Variants: Grid, List, MapAndList, MapAbove, MapWithSidebar.",
  section: { handle: "cards-and-lists-section@1" },
  fields: [
    {
      name: "Title",
      shape: "text",
      default: {
        en: "Find a location",
        ar: "البحث عن موقع",
        es: "Buscar una ubicación",
        fr: "Trouver un point de vente",
        de: "Standort finden",
        da: "Find en lokation",
        ja: "店舗を探す",
        "zh-CN": "查找门店",
        "zh-TW": "尋找門市",
        it: "Trova una sede",
      },
      sitecore: {
        type: "single-line-text",
        hint: "Section heading shown above the locations.",
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
      name: "Locations",
      shape: "reference",
      multiple: true,
      sitecore: {
        type: "treelist",
        hint: "Curated mode — pick location-card items to list. Leave empty to use the placeholder for composed mode, or populate SearchConfig for search mode.",
        source: { kind: "filter", types: ["location-card@1"] },
        section: "Content",
        sortOrder: 300,
      },
    },
    {
      name: "SearchConfig",
      shape: "text",
      sitecore: {
        type: "Plugin",
        hint: "Search-mode config blob. Populated via the sai/search-source Marketplace plugin (filters, sort, location query, personalization). Ignored unless this rendering is nested inside a locations-search-experience.",
        source: {
          kind: "plugin",
          id: "sai/search-source",
          defaultAppId: "a559eb70-e5c3-4b3c-a0de-84def425a9c4",
        },
        section: "Search",
        sortOrder: 100,
      },
    },
  ],
  // Inline (not `parameters: { handle }`) so the synthesised per-recipe
  // parameters template can carry the `_IDynamicPlaceholder` base
  // template required by `dynamicPlaceholders: true` below. scai forbids
  // adding `_IDynamicPlaceholder` to a shared external params template
  // since that would silently affect every other consumer.
  params: [
    ...CARD_LIST_BASE_PARAMS,
    ...CARD_LIST_GRID_PARAMS,
    ...CARD_STYLING_PARAMS,
    CARD_TITLE_LINK_ICON_PARAM,
    ...CARD_MEDIA_ASPECT_PARAMS,
    ...CARD_EMPTY_STATE_PARAMS,
  ],
  variants: [
    { name: "Default" },
    { name: "Grid" },
    { name: "List" },
    { name: "MapAndList" },
    { name: "MapAbove" },
    { name: "MapWithSidebar" },
  ],
  placeholders: [
    {
      key: "cards-locations-{*}",
      allowedRenderingHandles: ["location-card@1"],
    },
    {
      // No `allowedRenderingHandles` — tenants ship their own map
      // implementation (Mapbox / Google / Leaflet) and register it as
      // a rendering in their site. We deliberately don't constrain it
      // so the slot stays bring-your-own-map.
      key: "locations-map-{*}",
    },
  ],
  dynamicPlaceholders: true,
  placedIn: ["headless-main-{*}", "search-results-{*}"],



  // Child-items authoring pattern (mirrors accordion-block): authors
  // can create items directly under this rendering's datasource via
  // Insert, then reference them from the curated Treelist.
  insertOptions: ["location-card@1"],

  // Folder template Insert Options so Sitecore Insert surfaces the
  // card/item type under each folder instance.
  children: { allowedHandles: ["location-card@1"] },

  datasource: {
    autoCreate: true,
    openPropertiesAfterAdd: false,
    locations: [
      { scope: "page", subfolder: "Locations" },
      { scope: "site", subfolder: "Locations" },
    ],
  },
} satisfies ComponentTemplateRecipe;

export default locationsListGridRecipe;
